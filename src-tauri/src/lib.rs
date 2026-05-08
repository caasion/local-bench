mod metrics;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use metrics::get_gpu_vram;
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use sysinfo::{System, ProcessesToUpdate, ProcessRefreshKind};

#[tauri::command]
fn get_vram() -> Result<metrics::GpuMetrics, String> {
    get_gpu_vram()
        .map_err(|e| format!("GPU metrics error: {}", e))
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagsResponse {
    pub models: Vec<Model>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Model {
    pub name: String,
    pub model: String,
    pub modified_at: String,
    pub size: u64,
    pub digest: String,
    pub details: ModelDetails,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelDetails {
    pub format: String,
    pub family: String,
    pub families: Vec<String>,
    pub parameter_size: String,
    pub quantization_level: String,
}

#[tauri::command]
async fn get_models() -> Result<Vec<Model>, String> {
    let client = reqwest::Client::new();

    let resp = client
        .get("http://localhost:11434/api/tags")
        .send()
        .await
        .map_err(|e| format!("Request error: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("HTTP error: {}", resp.status()));
    }

    let tags: TagsResponse = resp
        .json()
        .await
        .map_err(|e| format!("Failed to deserialize response: {}", e))?;

    for model in &tags.models {
        println!("{}: {} ({} bytes)", model.name, model.details.quantization_level, model.size);
    }

    Ok(tags.models)
}


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PsResponse {
    pub models: Vec<RunningModel>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RunningModel {
    pub name: String,
    pub model: String,
    pub size: u64,
    pub digest: String,
    pub details: ModelDetails,
    pub expires_at: String,
    pub size_vram: u64,
    pub context_length: u64,
}

async fn get_all_running_models() -> Result<PsResponse, String> {
    let client = reqwest::Client::new();

    let resp = client
        .get("http://localhost:11434/api/ps")
        .send()
        .await
        .map_err(|e| format!("Request error: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("HTTP error: {}", resp.status()));
    }

    let result = resp
        .json()
        .await
        .map_err(|e| format!("Failed to deserialize response: {}", e))?;

    Ok(result)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerationResponse {
    pub model: String,
    pub created_at: Option<String>,
    pub response: Option<String>,
    pub thinking: Option<String>,
    pub done: Option<bool>,
    pub done_reason: Option<String>,
    pub total_duration: Option<u64>,
    pub load_duration: Option<u64>,
    pub prompt_eval_count: Option<u64>,
    pub prompt_eval_duration: Option<u64>,
    pub eval_count: Option<u64>,
    pub eval_duration: Option<u64>,
    pub logprobs: Option<Vec<Value>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateRequest {
    pub model: String,
    pub prompt: Option<String>,
    pub suffix: Option<String>,
    pub images: Option<Vec<String>>,
    pub format: Option<Value>,
    pub system: Option<String>,
    #[serde(default)]
    pub stream: bool,
    #[serde(default)]
    pub think: Option<ThinkingOption>,
    #[serde(default)]
    pub raw: Option<bool>,
    pub keep_alive: Option<String>,
    pub options: Option<GenerateOptions>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ThinkingOption {
    Bool(bool),
    Level(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GenerateOptions {
    pub logprobs: Option<bool>,
    pub top_logprobs: Option<u32>,
    #[serde(flatten)]
    pub extra: Option<Value>,
}

async fn generate(body: GenerateRequest) -> Result<GenerationResponse, String> {
    let client = reqwest::Client::new();

    let resp = client
        .post("http://localhost:11434/api/generate")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Request error: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("HTTP error: {}", resp.status()));
    }

    let result: GenerationResponse = resp
        .json()
        .await
        .map_err(|e| format!("Failed to deserialize response: {}", e))?;

    Ok(result)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkInput {
    pub model: String,
    pub prompts: Vec<String>,
    pub times: i16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PromptResult {
    pub prompt: String,
    pub tokens_per_second_mean: f64,
    pub tokens_per_second_std_dev: f64,
    pub ttft_ns_mean: f64,
    pub ttft_ns_std_dev: f64,
    pub total_time_ns_mean: f64,
    pub total_time_ns_std_dev: f64,
    pub total_tokens: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkResult {
    pub model: String,
    pub tokens_per_second: f32,
    pub ttft_ns: u32,
    pub total_time_ns: u64,
    pub total_tokens: i32,
    pub vram_peak_mb: u64,
    pub cpu_peak_percent: f32,
    pub tokens_per_second_mean: f64,
    pub tokens_per_second_std_dev: f64,
    pub ttft_ns_mean: f64,
    pub ttft_ns_std_dev: f64,
    pub total_time_ns_mean: f64,
    pub total_time_ns_std_dev: f64,
    pub per_prompt: Vec<PromptResult>,
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

#[tauri::command]
async fn benchmark(input: BenchmarkInput) -> Result<BenchmarkResult, String> {
    let BenchmarkInput { model, prompts, times } = input;

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

    // Accumulate metrics over all prompts and iterations
    let mut load_duration_sum: u64 = 0;
    let mut prompt_eval_duration_sum: u64 = 0;
    let mut eval_count_sum: u64 = 0;
    let mut eval_duration_sum: u64 = 0;
    let mut total_duration_sum: u64 = 0;

    // Global samples across all prompts (for aggregate stats)
    let mut tps_samples: Vec<f64> = Vec::new();
    let mut ttft_samples: Vec<f64> = Vec::new();
    let mut total_time_samples: Vec<f64> = Vec::new();

    let mut per_prompt: Vec<PromptResult> = Vec::new();

    for prompt in &prompts {
        let mut p_tps: Vec<f64> = Vec::new();
        let mut p_ttft: Vec<f64> = Vec::new();
        let mut p_total_time: Vec<f64> = Vec::new();
        let mut p_tokens: u64 = 0;

        for _ in 0..(times as i32) {
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
                options: None,
            };

            let resp = generate(req).await?;

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

            total_duration_sum += td;
            load_duration_sum += ld;
            prompt_eval_duration_sum += ped;
            eval_count_sum += ec;
            eval_duration_sum += ed;
            p_tokens += ec;

            let tps = if ed > 0 { (ec as f64) / (ed as f64 / 10e6) } else { 0.0 };
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

    // Compute aggregated result (preserve original tokens/sec formula)
    let tokens_per_second = if eval_duration_sum == 0 {
        0.0
    } else {
        (eval_count_sum as f32) / ((eval_duration_sum as f32 / 10e6) as f32)
    };

    let result = BenchmarkResult {
        model,
        tokens_per_second,
        ttft_ns: (load_duration_sum + prompt_eval_duration_sum) as u32,
        total_time_ns: total_duration_sum,
        total_tokens: eval_count_sum as i32,
        vram_peak_mb: vram_peak_mb.load(Ordering::Relaxed),
        cpu_peak_percent: cpu_peak.load(Ordering::Relaxed) as f32 / 100.0,
        tokens_per_second_mean: calc_mean(&tps_samples),
        tokens_per_second_std_dev: calc_std_dev(&tps_samples),
        ttft_ns_mean: calc_mean(&ttft_samples),
        ttft_ns_std_dev: calc_std_dev(&ttft_samples),
        total_time_ns_mean: calc_mean(&total_time_samples),
        total_time_ns_std_dev: calc_std_dev(&total_time_samples),
        per_prompt,
    };

    Ok(result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_models, get_vram, benchmark])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_models() {
        
        let result = get_models().await;
        match result {
            Ok(models) => println!("Got {} models", models.len()),
            Err(e) => println!("Error: {}", e),
        }
    }

    #[tokio::test]
    async fn test_generate() {
        let req = GenerateRequest {
            model: "llama3.2:3b".to_string(),
            prompt: Some("hello".to_string()),
            suffix: None,
            images: None,
            format: None,
            system: None,
            stream: false,
            think: None,
            raw: None,
            keep_alive: None,
            options: None,
        };

        let result = generate(req).await;
        match result {
            Ok(response) => println!("{}", response.response.as_deref().unwrap_or("<no response>")),
            Err(e) => println!("Error: {}", e),
        }
    }

    #[tokio::test]
    async fn test_benchmark() {
        let model = "llama3.2:3b".to_string();
        let prompts: Vec<String> = vec!["Hello. How are you?".to_string(), "Generate the fibonnaci sequence for me.".to_string()];
        let times: i16 = 5;

        let input = BenchmarkInput {
            model: model.clone(),
            prompts,
            times,
        };

        let result = benchmark(input).await;
        match result {
            Ok(result) => println!("{}: {} {} {}", model, result.tokens_per_second, result.ttft_ns, result.total_time_ns),
            Err(e) => println!("Error: {}", e)
        }
    }

    #[tokio::test]
    async fn test_get_all_running_models() {
        let result = get_all_running_models().await;
        match result {
            Ok(result) => println!("{:#?}", result),
            Err(e) => println!("Error: {}", e)
        }
    }
}