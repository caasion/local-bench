import type { BenchmarkRunRecord } from "./types";

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
}

export function formatTime(ns: number): string {
  const ms = ns / 1e6;
  return ms.toFixed(2) + " ms";
}

export function formatTimeShort(ns: number): string {
  const ms = ns / 1e6;
  if (ms > 1000) return (ms / 1000).toFixed(2) + "s";
  return ms.toFixed(0) + "ms";
}

export interface Scores {
  ttft: number;       // 0-100
  throughput: number; // 0-100
  vram: number;       // 0-100
  cpu: number;        // 0-100
  consistency: number;// 0-100
}

/**
 * Derive 0-100 scores from raw benchmark metrics.
 * Thresholds are heuristic — tune to your hardware.
 */
export function computeScores(run: BenchmarkRunRecord): Scores {
  // TTFT: 100ms = 100pts, 2000ms = 0pts (linear)
  const ttftMs = run.ttft_ns_mean / 1e6;
  const ttft = Math.max(0, Math.min(100, Math.round(100 - (ttftMs - 100) / 19)));

  // Throughput: 80 tok/s = 100pts, 0 tok/s = 0pts (linear)
  const throughput = Math.max(0, Math.min(100, Math.round((run.tps / 80) * 100)));

  // VRAM: <4GB = 100pts, 16GB+ = 0pts (linear)
  const vramGB = run.vram_peak_mb / 1024;
  const vram = Math.max(0, Math.min(100, Math.round(100 - ((vramGB - 4) / 12) * 100)));

  // CPU: <20% = 100pts, 100% = 0pts (linear)
  const cpu = Math.max(0, Math.min(100, Math.round(100 - run.cpu_peak_percent)));

  // Consistency: coefficient of variation of TTFT — lower std dev = more consistent
  const cv = run.ttft_ns_mean > 0 ? run.ttft_ns_std_dev / run.ttft_ns_mean : 1;
  const consistency = Math.max(0, Math.min(100, Math.round(100 - cv * 200)));

  return { ttft, throughput, vram, cpu, consistency };
}
