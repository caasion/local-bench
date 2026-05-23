// get_models() - api/tags
export interface TagsResponse {
  models: Model[];
}

export interface Model {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: ModelDetails;
}

export interface ModelDetails {
  format: string;
  family: string;
  families: string[];
  parameter_size: string;
  quantization_level: string;
}

// get_all_running_models() - api/ps
export interface PsResponse {
  models: RunningModel[];
}

export interface RunningModel {
  name: string;
  model: string;
  size: number;
  digest: string;
  details: ModelDetails;
  expires_at: string;
  size_vram: number;
  context_length: number;
}

export interface GenerationResponse {
  model: string;
  created_at?: string;
  response?: string;
  thinking?: string;
  done?: boolean;
  done_reason?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
  logprobs?: unknown[];
}

// generate() -- api/generate
export interface GenerateRequest {
  model: string;
  prompt?: string;
  suffix?: string;
  images?: string[];
  format?: unknown;
  system?: string;
  stream: boolean;
  think?: ThinkingOption;
  raw?: boolean;
  keep_alive?: string;
  options?: GenerateOptions;
}

export type ThinkingOption = boolean | string;

export interface GenerateOptions {
  logprobs?: boolean;
  top_logprobs?: number;
  num_ctx?: number;
  [key: string]: unknown;
}

export interface PromptResult {
  prompt: string;
  tokens_per_second_mean: number;
  tokens_per_second_std_dev: number;
  ttft_ns_mean: number;
  ttft_ns_std_dev: number;
  total_time_ns_mean: number;
  total_time_ns_std_dev: number;
  total_tokens: number;
}

// benchmarking
export interface BenchmarkInput {
  model: string;
  num_ctx: number;
  prompts: string[];
  times: number;
}

export interface BenchmarkResult {
  model: string;
  likely_ram_spillover: boolean;
  /** Pooled throughput: sum(eval_tokens) / sum(eval_duration) */
  tokens_per_second: number;
  tokens_per_second_mean: number;
  tokens_per_second_std_dev: number;
  total_tokens: number;
  vram_peak_mb: number;
  cpu_peak_percent: number;
  /** Arithmetic mean of per-run TTFT (load_duration + prompt_eval_duration) in nanoseconds */
  ttft_ns_mean: number;
  ttft_ns_std_dev: number;
  /** Arithmetic mean of per-run total_duration in nanoseconds */
  total_time_ns_mean: number;
  total_time_ns_std_dev: number;
  per_prompt: PromptResult[];
}

export interface BenchmarkRunProgress {
  current_model: string;
  current_prompt: string;

  likely_ram_spillover: boolean;
  total_tokens: number;
  ttft_ns_mean: number;
  ttft_ns_std_dev: number;

  vram_values_mb: number[];
  cpu_values_percent: number[];
  tokens_per_second_values: number[];
}

// database schemas
export interface BenchmarkRunRecord {
  id: number;
  model_name: string;
  run_at: string;
  tokens_per_second: number;
  total_tokens: number;
  vram_peak_mb: number;
  cpu_peak_percent: number;
  ttft_ns_mean: number;
  ttft_ns_std_dev: number;
  total_time_ns_mean: number;
  total_time_ns_std_dev: number;
  likely_ram_spillover: boolean;
}

export interface Prompt {
  id: number;
  use_case_tag: string;
  content: string;
}

export interface Profile {
  id: number;
  name: string;
  description?: string;
  max_ttft_seconds?: number;
  min_context_window?: number;
  accuracy_weight?: number;
  use_case_tag: string;
}
