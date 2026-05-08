mod metrics;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use metrics::get_gpu_vram;

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
pub struct TestInput {
    pub model: String,
    pub prompts: Vec<String>,
    pub times: i16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestResult {
    pub model: String,
    pub tokens_per_second: f32,
    pub ttft_ns: u32,
    pub total_time_ns: u64,
    pub total_tokens: i32,
}

#[tauri::command]
async fn test_model(input: TestInput) -> Result<TestResult, String> {
    let TestInput { model, prompts, times } = input;

    // Accumulate metrics over all prompts and iterations
    let mut total_duration_sum: u64 = 0;
    let mut load_duration_sum: u64 = 0;
    let mut prompt_eval_duration_sum: u64 = 0;
    let mut eval_count_sum: u64 = 0;
    let mut eval_duration_sum: u64 = 0;

    for prompt in &prompts {
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

            total_duration_sum += total_duration.unwrap_or(0);
            load_duration_sum += load_duration.unwrap_or(0);
            prompt_eval_duration_sum += prompt_eval_duration.unwrap_or(0);
            eval_count_sum += eval_count.unwrap_or(0) as u64;
            eval_duration_sum += eval_duration.unwrap_or(1);
        }
    }

    // Compute aggregated result (preserve original tokens/sec formula)
    let tokens_per_second = if eval_duration_sum == 0 {
        0.0
    } else {
        (eval_count_sum as f32) / ((eval_duration_sum as f32 / 10e6) as f32)
    };

    let result = TestResult {
        model,
        tokens_per_second,
        ttft_ns: (load_duration_sum + prompt_eval_duration_sum) as u32,
        total_time_ns: total_duration_sum,
        total_tokens: eval_count_sum as i32,
    };

    Ok(result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_models, get_vram, test_model])
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
    async fn test_test_models() {
        let model = "llama3.2:3b".to_string();
        let prompts: Vec<String> = vec!["Hello. How are you?".to_string(), "Generate the fibonnaci sequence for me.".to_string()];
        let times: i16 = 5;

        let input = TestInput {
            model: model.clone(),
            prompts,
            times,
        };

        let result = test_model(input).await;
        match result {
            Ok(result) => println!("{}: {} {} {}", model, result.tokens_per_second, result.ttft_ns, result.total_time_ns),
            Err(e) => println!("Error: {}", e)
        }

        
    }
}