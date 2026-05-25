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

/** Result for a single prompt (aggregated across N runs) */
export interface PromptResult {
  prompt: string;
  total_tokens: number;
  tps_mean: number;
  tps_std_dev: number;
  ttft_ns_mean: number;
  ttft_ns_std_dev: number;
  response_time_ns_mean: number;
  response_time_ns_std_dev: number;
  vram_peak_mb: number;
  vram_avg_mb: number;
  cpu_peak_percent: number;
  cpu_avg_percent: number;
  gpu_peak_percent: number;
  gpu_avg_percent: number;
}

// benchmarking
export interface BenchmarkInput {
  model: string;
  num_ctx: number;
  prompts: string[];
  runs: number;
}

/** Final benchmark result for one model */
export interface BenchmarkResult {
  model: string;
  likely_ram_spillover: boolean;
  model_load_time_ns: number;
  tps: number;
  tps_std_dev: number;
  ttft_ns_mean: number;
  ttft_ns_std_dev: number;
  vram_peak_mb: number;
  vram_avg_mb: number;
  cpu_peak_percent: number;
  cpu_avg_percent: number;
  gpu_peak_percent: number;
  gpu_avg_percent: number;
  per_prompt: PromptResult[];
}

/** Emitted during benchmark for live updates */
export interface BenchmarkRunProgress {
  current_prompt_number: number;
  current_run_number: number;
  total_prompts: number;
  total_runs: number;
  // Time-series for live graphs
  vram_values_mb: number[];
  cpu_values_percent: number[];
  gpu_values_percent: number[];
  tps_values: number[];
  // Indices where prompt boundaries occurred
  prompt_boundaries: number[];
  // Running values
  likely_ram_spillover: boolean;
  total_tokens: number;
}

// database schemas
export interface BenchmarkRunRecord {
  id: number;
  model_name: string;
  run_at: string;
  tps: number;
  tps_std_dev: number;
  ttft_ns_mean: number;
  ttft_ns_std_dev: number;
  model_load_time_ns: number;
  vram_peak_mb: number;
  vram_avg_mb: number;
  cpu_peak_percent: number;
  cpu_avg_percent: number;
  gpu_peak_percent: number;
  gpu_avg_percent: number;
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
