import { Scores } from "./mockData";

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
};


export function formatTime(ns: number): string {
  const ms = ns / 1e6;
  return ms.toFixed(2) + " ms";
};

export function formatTimeShort(ns: number): string {
  const ms = ns / 1e6;
  if (ms > 1000) return (ms / 1000).toFixed(2) + "s";
  return ms.toFixed(0) + "ms";
};

export function computeScore(scores: Scores) {
    // TODO: implement
}