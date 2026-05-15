use serde::{Deserialize, Serialize};
use serde_json::Value;

// get_models() - api/tags
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

// get_all_running_models() - api/ps
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

// generate() -- api/generate
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
    pub num_ctx: Option<u32>,
    #[serde(flatten)]
    pub extra: Option<Value>,
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

// benchmarking

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkInput {
    pub model: String,
    pub num_ctx: u32,
    pub prompts: Vec<String>,
    pub times: i16,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkResult {
    pub model: String,
    pub likely_ram_spillover: bool,
    /// Pooled throughput: sum(eval_tokens) / sum(eval_duration)
    pub tokens_per_second: f32,
    pub tokens_per_second_mean: f64,
    pub tokens_per_second_std_dev: f64,
    pub total_tokens: i32,
    pub vram_peak_mb: u64,
    pub cpu_peak_percent: f32,
    /// Arithmetic mean of per-run TTFT (load_duration + prompt_eval_duration) in nanoseconds
    pub ttft_ns_mean: f64,
    pub ttft_ns_std_dev: f64,
    /// Arithmetic mean of per-run total_duration in nanoseconds
    pub total_time_ns_mean: f64,
    pub total_time_ns_std_dev: f64,
    pub per_prompt: Vec<PromptResult>,
}

// database schemas
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkRunRecord {
    pub id: i64,
    pub model_name: String,
    pub run_at: String,
    pub tokens_per_second: f64,
    pub total_tokens: i64,
    pub vram_peak_mb: f64,
    pub cpu_peak_percent: f64,
    pub ttft_ns_mean: f64,
    pub ttft_ns_std_dev: f64,
    pub total_time_ns_mean: f64,
    pub total_time_ns_std_dev: f64,
    pub likely_ram_spillover: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Prompt {
    pub id: i64,
    pub use_case_tag: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Profile {
    pub id: Option<i64>,
    pub name: String,
    pub description: String,
    pub max_ttft_seconds: Option<f64>,
    pub min_context_window: Option<f64>,
    pub accuracy_weight: Option<f64>,
    pub use_case_tag: String,
}