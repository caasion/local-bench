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

#[derive(Debug, Clone)]
pub struct TestResult {
    pub model: String,
    pub tokens_per_second: f32,
    pub ttft_ns: u32,
    pub total_time_ns: u64,
    pub total_tokens: i32,
}

async fn test_model(model: String) -> Result<TestResult, String> {
    let req = GenerateRequest {
        model: model.clone(),
        prompt: Some("hello. how is the weather today? It seems quite bad in my eyes, but I'm not sure if it is actually that bad.".to_string()),
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

    let total_duration = total_duration.unwrap_or(0);
    let load_duration = load_duration.unwrap_or(0);
    let prompt_eval_duration = prompt_eval_duration.unwrap_or(0);
    let eval_count = eval_count.unwrap_or(0) as i32;
    let eval_duration = eval_duration.unwrap_or(1); // avoid div by zero

    let result: TestResult = TestResult {
        model,
        tokens_per_second: (eval_count as f32) / ((eval_duration as f32 / 10e6) as f32),
        ttft_ns: (load_duration + prompt_eval_duration) as u32,
        total_time_ns: total_duration,
        total_tokens: eval_count,
    };

    Ok(result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![get_models, get_vram])
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

        let result = test_model(model.clone()).await;
        match result {
            Ok(result) => println!("{}: {} {} {}", model, result.tokens_per_second, result.ttft_ns, result.total_time_ns),
            Err(e) => println!("Error: {}", e)
        }

        
    }
}