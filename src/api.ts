import { invoke } from "@tauri-apps/api/core";
import type {
  BenchmarkInput,
  BenchmarkResult,
  BenchmarkRunRecord,
  Model,
  Profile,
  Prompt,
} from "./types";

// --- Ollama ---
export const getModels = (): Promise<Model[]> =>
  invoke("get_models");

// --- Benchmark ---
export const runBenchmark = (input: BenchmarkInput): Promise<BenchmarkResult> =>
  invoke("benchmark", { input });

// --- History ---
export const getBenchmarkHistory = (): Promise<BenchmarkRunRecord[]> =>
  invoke("get_benchmark_history");

export const deleteBenchmarkRun = (id: number): Promise<void> =>
  invoke("delete_benchmark_run", { id });

// --- Prompts ---
export const getAllPrompts = (): Promise<Prompt[]> =>
  invoke("get_all_prompts");

export const getPromptsByUseCase = (useCaseTag: string): Promise<Prompt[]> =>
  invoke("get_prompt_by_use_case", { useCaseTag });

export const createPrompt = (useCaseTag: string, content: string): Promise<number> =>
  invoke("create_prompt", { useCaseTag, content });

// Gotcha: prompts.rs takes id: String, not i64 — must pass String(id)
export const updatePromptContent = (id: number, newContent: string): Promise<void> =>
  invoke("update_prompt_content", { id: String(id), newContent });

export const deletePrompt = (id: number): Promise<void> =>
  invoke("delete_prompt", { id: String(id) });

// --- Profiles ---
export const getAllProfiles = (): Promise<Profile[]> =>
  invoke("get_all_profiles");

export const createProfile = (name: string, useCaseTag: string): Promise<number> =>
  invoke("create_profile", { name, useCaseTag });

export const updateProfile = (profile: Profile): Promise<void> =>
  invoke("update_profile", { profile });

export const deleteProfile = (id: number): Promise<void> =>
  invoke("delete_profile", { id });
