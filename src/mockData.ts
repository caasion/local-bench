// Mock data for the interactive prototype (no backend connection)

export interface MockModel {
  name: string;
  size: number;
  parameters: string;
  quantization: string;
  family: string;
}

export interface MockProfile {
  id: number;
  name: string;
  description: string | null;
  use_case_tag: string;
  max_ttft_seconds: number | null;
  min_context_window: number | null;
  accuracy_weight: number | null;
}

export interface MockPrompt {
  id: number;
  use_case_tag: string;
  content: string;
}

export interface Scores {
    ttft: number;
    throughput: number;
    vram: number;
    cpu: number;
    consistency: number;
  }

export interface MockBenchmarkRun {
  id: number;
  model_name: string;
  run_at: string;
  mode: string;
  tokens_per_second: number;
  total_tokens: number;
  vram_peak_mb: number;
  cpu_peak_percent: number;
  ttft_ns_mean: number;
  ttft_ns_std_dev: number;
  total_time_ns_mean: number;
  total_time_ns_std_dev: number;
  likely_ram_spillover: boolean;
  scores: Scores;
}

export const MOCK_MODELS: MockModel[] = [
  { name: "speed 2.5 coder 14b", size: 8_500_000_000, parameters: "14B", quantization: "Q4_K_M", family: "CodeLlama" },
  { name: "llama3.1 8b", size: 4_700_000_000, parameters: "8B", quantization: "Q4_0", family: "Llama" },
  { name: "deepseek-r1 7b", size: 4_100_000_000, parameters: "7B", quantization: "Q4_K_S", family: "DeepSeek" },
  { name: "mistral 7b", size: 4_400_000_000, parameters: "7B", quantization: "Q5_K_M", family: "Mistral" },
];

export const MOCK_PROFILES: MockProfile[] = [
  { id: 1, name: "Daily Driver", description: "General coding tasks and code completion", use_case_tag: "coding", max_ttft_seconds: 2, min_context_window: 4096, accuracy_weight: 0.7 },
  { id: 2, name: "Reasoning Heavy", description: "Complex reasoning and analysis tasks", use_case_tag: "reasoning", max_ttft_seconds: 5, min_context_window: 8192, accuracy_weight: 0.9 },
  { id: 3, name: "Creative Writing", description: "Story writing and content generation", use_case_tag: "writing", max_ttft_seconds: 3, min_context_window: 4096, accuracy_weight: 0.6 },
];

export const MOCK_PROMPTS: MockPrompt[] = [
  { id: 1, use_case_tag: "coding", content: "Write a Python function that takes a list of integers and returns the two numbers that add up to a specific target. Include error handling for edge cases." },
  { id: 2, use_case_tag: "coding", content: "Implement a binary search tree in TypeScript with insert, delete, and search operations. Include proper typing." },
  { id: 3, use_case_tag: "coding", content: "Create a REST API endpoint in Express.js that handles pagination, filtering, and sorting for a products collection." },
  { id: 4, use_case_tag: "reasoning", content: "A farmer has 100 meters of fencing. What dimensions should he use to maximize the enclosed rectangular area? Explain step by step." },
  { id: 5, use_case_tag: "reasoning", content: "Analyze the time complexity of merge sort and explain why it outperforms bubble sort for large datasets. Provide concrete examples." },
  { id: 6, use_case_tag: "writing", content: "Write a short story about a robot that discovers it can dream. Focus on sensory details and emotional depth." },
  { id: 7, use_case_tag: "writing", content: "Draft a technical blog post introduction about the future of WebAssembly in modern web development." },
  { id: 8, use_case_tag: "image_analysis", content: "Describe what you see in this image in detail, including objects, colors, spatial relationships, and any text visible." },
];

export const MOCK_HISTORY: MockBenchmarkRun[] = [
  {
    id: 1,
    model_name: "speed 2.5 coder 14b",
    run_at: "2026-05-19T14:32:00Z",
    mode: "test thinking",
    tokens_per_second: 42.5,
    total_tokens: 2450,
    vram_peak_mb: 8942,
    cpu_peak_percent: 67.3,
    ttft_ns_mean: 185_000_000,
    ttft_ns_std_dev: 12_000_000,
    total_time_ns_mean: 4_200_000_000,
    total_time_ns_std_dev: 350_000_000,
    likely_ram_spillover: false,
    scores: { ttft: 92, throughput: 85, vram: 70, cpu: 78, consistency: 88 },
  },
  {
    id: 2,
    model_name: "speed 2.5 coder 14b",
    run_at: "2026-05-18T10:15:00Z",
    mode: "test thinking",
    tokens_per_second: 38.2,
    total_tokens: 1980,
    vram_peak_mb: 8850,
    cpu_peak_percent: 72.1,
    ttft_ns_mean: 210_000_000,
    ttft_ns_std_dev: 18_000_000,
    total_time_ns_mean: 4_800_000_000,
    total_time_ns_std_dev: 420_000_000,
    likely_ram_spillover: false,
    scores: { ttft: 86, throughput: 78, vram: 72, cpu: 71, consistency: 82 },
  },
  {
    id: 3,
    model_name: "llama3.1 8b",
    run_at: "2026-05-17T16:45:00Z",
    mode: "test thinking",
    tokens_per_second: 55.8,
    total_tokens: 3200,
    vram_peak_mb: 5200,
    cpu_peak_percent: 45.6,
    ttft_ns_mean: 120_000_000,
    ttft_ns_std_dev: 8_000_000,
    total_time_ns_mean: 3_100_000_000,
    total_time_ns_std_dev: 250_000_000,
    likely_ram_spillover: false,
    scores: { ttft: 95, throughput: 92, vram: 88, cpu: 90, consistency: 91 },
  },
  {
    id: 4,
    model_name: "deepseek-r1 7b",
    run_at: "2026-05-16T09:20:00Z",
    mode: "test thinking",
    tokens_per_second: 48.1,
    total_tokens: 2800,
    vram_peak_mb: 4800,
    cpu_peak_percent: 52.3,
    ttft_ns_mean: 155_000_000,
    ttft_ns_std_dev: 10_000_000,
    total_time_ns_mean: 3_600_000_000,
    total_time_ns_std_dev: 300_000_000,
    likely_ram_spillover: false,
    scores: { ttft: 90, throughput: 88, vram: 85, cpu: 82, consistency: 86 },
  },
];


