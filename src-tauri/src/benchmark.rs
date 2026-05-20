use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use sysinfo::{System, ProcessesToUpdate, ProcessRefreshKind};
use crate::database::{DbState, save_benchmark_result};
use crate::metrics::get_gpu_vram;
use crate::ollama::{get_all_running_models, generate};
use crate::types::{
    BenchmarkInput, BenchmarkResult, PromptResult,
    GenerateRequest, GenerateOptions, GenerationResponse,
};

async fn check_ram_spillover(model: &String) -> Result<bool, String> {
    let current_model = get_all_running_models().await?
        .models
        .into_iter()
        .find(|m| m.name == *model)
        .ok_or_else(|| format!("Model '{}' not running", model))?;

    let likely_ram_spillover = current_model.size - (current_model.size as f64 * 0.05) as u64 > current_model.size_vram;

    Ok(likely_ram_spillover)
}

fn calc_mean(values: &[f64]) -> f64 {
    if values.is_empty() { return 0.0; }
    values.iter().sum::<f64>() / values.len() as f64
}

fn calc_std_dev(values: &[f64]) -> f64 {
    if values.len() < 2 { return 0.0; }
    let m = calc_mean(values);
    let variance = values.iter().map(|v| (v - m).powi(2)).sum::<f64>() / (values.len() - 1) as f64;
    variance.sqrt()
}

pub async fn run_benchmark(input: BenchmarkInput) -> Result<BenchmarkResult, String> {
    let BenchmarkInput { model, num_ctx, prompts, times } = input;

    let vram_peak_mb = Arc::new(AtomicU64::new(
        get_gpu_vram().map(|m| m.vram_used_mb).unwrap_or(0),
    ));
    let cpu_peak = Arc::new(AtomicU64::new(0));
    let vram_peak_clone = Arc::clone(&vram_peak_mb);
    let cpu_peak_clone = Arc::clone(&cpu_peak);
    let poller = tokio::spawn(async move {
        let mut sys = System::new();
        // Initial refresh establishes a baseline so the first cpu_usage() delta is valid
        sys.refresh_processes_specifics(ProcessesToUpdate::All, true, ProcessRefreshKind::nothing().with_cpu());
        loop {
            tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
            sys.refresh_processes_specifics(ProcessesToUpdate::All, true, ProcessRefreshKind::nothing().with_cpu());
            // Sum CPU usage across all ollama processes (main + any runner subprocesses)
            let cpu: f32 = sys.processes()
                .values()
                .filter(|p| p.name().to_string_lossy().to_lowercase().contains("ollama"))
                .map(|p| p.cpu_usage())
                .sum();
            cpu_peak_clone.fetch_max((cpu * 100.0) as u64, Ordering::Relaxed);
            if let Ok(metrics) = get_gpu_vram() {
                vram_peak_clone.fetch_max(metrics.vram_used_mb, Ordering::Relaxed);
            }
        }
    });

    // Accumulators for pooled TPS: sum(eval_tokens) / sum(eval_duration)
    let mut eval_count_sum: u64 = 0;
    let mut eval_duration_sum: u64 = 0;

    // Per-run samples for mean/std-dev of TTFT, total time, and TPS
    let mut ttft_samples: Vec<f64> = Vec::new();
    let mut total_time_samples: Vec<f64> = Vec::new();
    let mut tps_samples: Vec<f64> = Vec::new();

    let mut per_prompt: Vec<PromptResult> = Vec::new();

    let gen_options = Some(GenerateOptions {
        logprobs: None,
        top_logprobs: None,
        num_ctx: Some(num_ctx),
        extra: None,
    });

    // Pull first generation out so the model is loaded before we check spillover
    let first_req = GenerateRequest {
        model: model.clone(),
        prompt: Some(prompts[0].clone()),
        suffix: None,
        images: None,
        format: None,
        system: None,
        stream: false,
        think: None,
        raw: None,
        keep_alive: None,
        options: gen_options.clone(),
    };
    let mut prefetched = Some(generate(first_req).await?);
    let likely_ram_spillover = check_ram_spillover(&model).await.unwrap_or(false);

    for (pi, prompt) in prompts.iter().enumerate() {
        let mut p_tps: Vec<f64> = Vec::new();
        let mut p_ttft: Vec<f64> = Vec::new();
        let mut p_total_time: Vec<f64> = Vec::new();
        let mut p_tokens: u64 = 0;

        for iter in 0..(times as i32) {
            let resp = if pi == 0 && iter == 0 {
                prefetched.take().unwrap()
            } else {
                let req = GenerateRequest {
                    model: model.clone(),
                    prompt: Some(prompt.clone()),
                    suffix: None,
                    images: None,
                    format: None,
                    system: None,
                    stream: false,
                    think: None,
                    raw: None,
                    keep_alive: None,
                    options: gen_options.clone(),
                };
                generate(req).await?
            };

            let GenerationResponse {
                total_duration,
                load_duration,
                prompt_eval_duration,
                eval_count,
                eval_duration,
                ..
            } = resp;

            let td = total_duration.unwrap_or(0);
            let ld = load_duration.unwrap_or(0);
            let ped = prompt_eval_duration.unwrap_or(0);
            let ec = eval_count.unwrap_or(0);
            let ed = eval_duration.unwrap_or(1);

            eval_count_sum += ec;
            eval_duration_sum += ed;
            p_tokens += ec;

            // tps = eval_tokens / (eval_duration_ns / 1e9) -- per run
            let tps = if ed > 0 { (ec as f64) / (ed as f64 / 10e6) } else { 0.0 };
            // ttft = load_duration + prompt_eval_duration (ns)
            let ttft = (ld + ped) as f64;
            let total_time = td as f64;

            p_tps.push(tps);
            p_ttft.push(ttft);
            p_total_time.push(total_time);

            tps_samples.push(tps);
            ttft_samples.push(ttft);
            total_time_samples.push(total_time);
        }

        per_prompt.push(PromptResult {
            prompt: prompt.clone(),
            tokens_per_second_mean: calc_mean(&p_tps),
            tokens_per_second_std_dev: calc_std_dev(&p_tps),
            ttft_ns_mean: calc_mean(&p_ttft),
            ttft_ns_std_dev: calc_std_dev(&p_ttft),
            total_time_ns_mean: calc_mean(&p_total_time),
            total_time_ns_std_dev: calc_std_dev(&p_total_time),
            total_tokens: p_tokens,
        });
    }

    poller.abort();

    // Pooled TPS: sum(eval_tokens) / sum(eval_duration_ns / 1e9)
    let tokens_per_second = if eval_duration_sum == 0 {
        0.0
    } else {
        (eval_count_sum as f32) / (eval_duration_sum as f32 / 10e6)
    };

    Ok(BenchmarkResult {
        model,
        likely_ram_spillover,
        tokens_per_second,
        tokens_per_second_mean: calc_mean(&tps_samples),
        tokens_per_second_std_dev: calc_std_dev(&tps_samples),
        total_tokens: eval_count_sum as i32,
        vram_peak_mb: vram_peak_mb.load(Ordering::Relaxed),
        cpu_peak_percent: cpu_peak.load(Ordering::Relaxed) as f32 / 100.0,
        ttft_ns_mean: calc_mean(&ttft_samples),
        ttft_ns_std_dev: calc_std_dev(&ttft_samples),
        total_time_ns_mean: calc_mean(&total_time_samples),
        total_time_ns_std_dev: calc_std_dev(&total_time_samples),
        per_prompt,
    })
}

#[tauri::command]
pub async fn benchmark(state: tauri::State<'_, DbState>, input: BenchmarkInput) -> Result<BenchmarkResult, String> {
    let result = run_benchmark(input).await?;
    {
        let conn = state.0.lock().map_err(|e| e.to_string())?;
        save_benchmark_result(&conn, &result).map_err(|e| e.to_string())?;
    }
    Ok(result)
}

#[cfg(test)]
mod tests {
    use crate::types::BenchmarkInput;
    use super::run_benchmark;

    #[tokio::test]
    async fn test_benchmark() {
        let model = "llama3.2:3b".to_string();
        let prompts: Vec<String> = vec!["Hello. How are you?".to_string(), "Generate the fibonnaci sequence for me.".to_string()];
        let times: i16 = 5;

        let input = BenchmarkInput {
            model: model.clone(),
            num_ctx: 2048,
            prompts,
            times,
        };

        let result = run_benchmark(input).await;
        match result {
            Ok(result) => println!("{}: {} {} {}", model, result.tokens_per_second, result.ttft_ns_mean, result.total_time_ns_mean),
            Err(e) => println!("Error: {}", e)
        }
    }
}
