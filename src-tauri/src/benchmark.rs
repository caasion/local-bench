use std::sync::{Arc, Mutex};
use sysinfo::{System, ProcessesToUpdate, ProcessRefreshKind};
use tauri::Emitter;
use crate::database::{DbState, save_benchmark_result};
use crate::metrics::get_gpu_metrics;
use crate::ollama::{get_all_running_models, generate};
use crate::types::{
    BenchmarkInput, BenchmarkResult, BenchmarkRunProgress, GenerateOptions, GenerateRequest, GenerationResponse, PromptResult
};

async fn check_ram_spillover(model: &str) -> Result<bool, String> {
    let current_model = get_all_running_models().await?
        .models
        .into_iter()
        .find(|m| m.name == *model)
        .ok_or_else(|| format!("Model '{}' not running", model))?;

    let threshold = current_model.size - (current_model.size as f64 * 0.05) as u64;
    Ok(threshold > current_model.size_vram)
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

/// Shared state between the poller task and the main benchmark loop
struct HardwareSamples {
    vram_mb: Vec<u64>,
    cpu_percent: Vec<f32>,
    gpu_percent: Vec<f32>,
}

pub async fn run_benchmark(app: tauri::AppHandle, input: BenchmarkInput) -> Result<BenchmarkResult, String> {
    let BenchmarkInput { model, num_ctx, prompts, runs } = input;
    let total_prompts = prompts.len() as u32;
    let total_runs = runs;

    // Shared hardware samples (poller writes, main loop reads for per-prompt slicing)
    let samples = Arc::new(Mutex::new(HardwareSamples {
        vram_mb: Vec::new(),
        cpu_percent: Vec::new(),
        gpu_percent: Vec::new(),
    }));

    // Progress state shared with poller for live emission
    let progress = Arc::new(Mutex::new(BenchmarkRunProgress {
        current_prompt_number: 1,
        current_run_number: 0,
        total_prompts,
        total_runs,
        vram_values_mb: Vec::new(),
        cpu_values_percent: Vec::new(),
        gpu_values_percent: Vec::new(),
        tps_values: Vec::new(),
        prompt_boundaries: Vec::new(),
        likely_ram_spillover: false,
        total_tokens: 0,
    }));

    let samples_clone = Arc::clone(&samples);
    let progress_clone = Arc::clone(&progress);
    let app_clone = app.clone();

    // Hardware poller - samples every 200ms, emits progress to frontend
    let poller = tokio::spawn(async move {
        let mut sys = System::new();
        sys.refresh_processes_specifics(ProcessesToUpdate::All, true, ProcessRefreshKind::nothing().with_cpu());

        loop {
            tokio::time::sleep(tokio::time::Duration::from_millis(200)).await;
            sys.refresh_processes_specifics(ProcessesToUpdate::All, true, ProcessRefreshKind::nothing().with_cpu());

            // CPU: sum across all ollama processes
            let cpu: f32 = sys.processes()
                .values()
                .filter(|p| p.name().to_string_lossy().to_lowercase().contains("ollama"))
                .map(|p| p.cpu_usage())
                .sum();

            // GPU + VRAM
            let (vram_mb, gpu_util) = match get_gpu_metrics() {
                Ok(m) => (m.vram_used_mb, m.gpu_utilization),
                Err(_) => (0, 0.0),
            };

            // Store samples
            {
                let mut s = samples_clone.lock().unwrap();
                s.vram_mb.push(vram_mb);
                s.cpu_percent.push(cpu);
                s.gpu_percent.push(gpu_util);
            }

            // Update and emit progress
            {
                let mut p = progress_clone.lock().unwrap();
                p.vram_values_mb.push(vram_mb);
                p.cpu_values_percent.push(cpu);
                p.gpu_values_percent.push(gpu_util);

                let _ = app_clone.emit("benchmark-progress", p.clone());
            }
        }
    });

    let gen_options = Some(GenerateOptions {
        logprobs: None,
        top_logprobs: None,
        num_ctx: Some(num_ctx),
        extra: None,
    });

    // Warm up: first generation loads the model, gives us load time
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
    let first_resp = generate(first_req).await?;
    let model_load_time_ns = first_resp.load_duration.unwrap_or(0);
    let likely_ram_spillover = check_ram_spillover(&model).await.unwrap_or(false);

    {
        let mut p = progress.lock().unwrap();
        p.likely_ram_spillover = likely_ram_spillover;
    }

    // Global accumulators
    let mut all_tps: Vec<f64> = Vec::new();
    let mut all_ttft: Vec<f64> = Vec::new();
    let mut per_prompt_results: Vec<PromptResult> = Vec::new();

    // Process first response as part of prompt 0, run 0
    let mut prefetched: Option<GenerationResponse> = Some(first_resp);

    for (pi, prompt) in prompts.iter().enumerate() {
        // Mark where this prompt starts in the hardware sample timeline
        let prompt_start_idx = {
            let s = samples.lock().unwrap();
            s.vram_mb.len()
        };

        let mut p_tps: Vec<f64> = Vec::new();
        let mut p_ttft: Vec<f64> = Vec::new();
        let mut p_response_time: Vec<f64> = Vec::new();
        let mut p_tokens: u64 = 0;

        for run in 0..runs {
            // Update progress
            {
                let mut p = progress.lock().unwrap();
                p.current_prompt_number = (pi + 1) as u32;
                p.current_run_number = run + 1;
            }

            let resp = if pi == 0 && run == 0 {
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

            let eval_count = resp.eval_count.unwrap_or(0);
            let eval_duration = resp.eval_duration.unwrap_or(1); // ns
            let load_duration = resp.load_duration.unwrap_or(0);
            let prompt_eval_duration = resp.prompt_eval_duration.unwrap_or(0);
            let total_duration = resp.total_duration.unwrap_or(0);

            let tps = if eval_duration > 0 {
                (eval_count as f64) / (eval_duration as f64 / 1e9)
            } else {
                0.0
            };
            let ttft = (load_duration + prompt_eval_duration) as f64;
            let response_time = total_duration as f64;

            p_tps.push(tps);
            p_ttft.push(ttft);
            p_response_time.push(response_time);
            p_tokens += eval_count;

            all_tps.push(tps);
            all_ttft.push(ttft);

            // Update progress with TPS sample
            {
                let mut p = progress.lock().unwrap();
                p.tps_values.push(tps);
                p.total_tokens += eval_count;
            }
        }

        // Slice hardware samples for this prompt
        let (vram_peak, vram_avg, cpu_peak, cpu_avg, gpu_peak, gpu_avg) = {
            let s = samples.lock().unwrap();
            let prompt_end_idx = s.vram_mb.len();
            let vram_slice = &s.vram_mb[prompt_start_idx..prompt_end_idx];
            let cpu_slice = &s.cpu_percent[prompt_start_idx..prompt_end_idx];
            let gpu_slice = &s.gpu_percent[prompt_start_idx..prompt_end_idx];

            (
                vram_slice.iter().copied().max().unwrap_or(0),
                if vram_slice.is_empty() { 0.0 } else { vram_slice.iter().sum::<u64>() as f64 / vram_slice.len() as f64 },
                cpu_slice.iter().copied().fold(0.0_f32, f32::max),
                if cpu_slice.is_empty() { 0.0 } else { cpu_slice.iter().sum::<f32>() / cpu_slice.len() as f32 },
                gpu_slice.iter().copied().fold(0.0_f32, f32::max),
                if gpu_slice.is_empty() { 0.0 } else { gpu_slice.iter().sum::<f32>() / gpu_slice.len() as f32 },
            )
        };

        // Record prompt boundary in progress
        {
            let mut p = progress.lock().unwrap();
            let boundary = p.vram_values_mb.len() as u32;
            p.prompt_boundaries.push(boundary);
        }

        per_prompt_results.push(PromptResult {
            prompt: prompt.clone(),
            total_tokens: p_tokens,
            tps_mean: calc_mean(&p_tps),
            tps_std_dev: calc_std_dev(&p_tps),
            ttft_ns_mean: calc_mean(&p_ttft),
            ttft_ns_std_dev: calc_std_dev(&p_ttft),
            response_time_ns_mean: calc_mean(&p_response_time),
            response_time_ns_std_dev: calc_std_dev(&p_response_time),
            vram_peak_mb: vram_peak,
            vram_avg_mb: vram_avg,
            cpu_peak_percent: cpu_peak,
            cpu_avg_percent: cpu_avg,
            gpu_peak_percent: gpu_peak,
            gpu_avg_percent: gpu_avg,
        });
    }

    poller.abort();

    // Benchmark-level hardware stats (all samples)
    let (bm_vram_peak, bm_vram_avg, bm_cpu_peak, bm_cpu_avg, bm_gpu_peak, bm_gpu_avg) = {
        let s = samples.lock().unwrap();
        (
            s.vram_mb.iter().copied().max().unwrap_or(0),
            if s.vram_mb.is_empty() { 0.0 } else { s.vram_mb.iter().sum::<u64>() as f64 / s.vram_mb.len() as f64 },
            s.cpu_percent.iter().copied().fold(0.0_f32, f32::max),
            if s.cpu_percent.is_empty() { 0.0 } else { s.cpu_percent.iter().sum::<f32>() / s.cpu_percent.len() as f32 },
            s.gpu_percent.iter().copied().fold(0.0_f32, f32::max),
            if s.gpu_percent.is_empty() { 0.0 } else { s.gpu_percent.iter().sum::<f32>() / s.gpu_percent.len() as f32 },
        )
    };

    let tps = calc_mean(&all_tps);
    let tps_std_dev = calc_std_dev(&all_tps);

    Ok(BenchmarkResult {
        model,
        likely_ram_spillover,
        model_load_time_ns,
        tps,
        tps_std_dev,
        ttft_ns_mean: calc_mean(&all_ttft),
        ttft_ns_std_dev: calc_std_dev(&all_ttft),
        vram_peak_mb: bm_vram_peak,
        vram_avg_mb: bm_vram_avg,
        cpu_peak_percent: bm_cpu_peak,
        cpu_avg_percent: bm_cpu_avg,
        gpu_peak_percent: bm_gpu_peak,
        gpu_avg_percent: bm_gpu_avg,
        per_prompt: per_prompt_results,
    })
}

#[tauri::command]
pub async fn benchmark(app: tauri::AppHandle, state: tauri::State<'_, DbState>, input: BenchmarkInput) -> Result<BenchmarkResult, String> {
    let result = run_benchmark(app, input).await?;
    {
        let conn = state.0.lock().map_err(|e| e.to_string())?;
        save_benchmark_result(&conn, &result).map_err(|e| e.to_string())?;
    }
    Ok(result)
}
