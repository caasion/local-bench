import { useState } from "react";
import type { MockBenchmarkRun } from "./mockData";
import { ResultCard } from "./ResultCard";

interface ModelResultItemProps {
  run: MockBenchmarkRun;
  score: number;
  timeAgo: string;
}

export function ModelResultItem({ run, score, timeAgo }: ModelResultItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden">
      <button
        className="flex items-center gap-4 px-[18px] py-[14px] w-full bg-transparent border-0 text-inherit font-[inherit] cursor-pointer transition-[background] duration-150 hover:bg-[var(--bg-hover)]"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex items-center justify-center px-2 p-1 rounded-[var(--radius-sm)] border-2 border-[var(--success)] text-white text-[0.85rem] font-bold shrink-0">
          {score}
        </span>
        <div className="flex-1 flex flex-col text-left">
          <span className="text-[0.9rem] font-semibold text-[var(--text-primary)]">{run.model_name}</span>
          <span className="text-[0.75rem] text-[var(--text-muted)] mt-0.5">Last benchmarked: {timeAgo}</span>
        </div>
        <svg
          className={`text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-[var(--border)]">
          <ResultCard run={run} embedded />
        </div>
      )}
    </div>
  );
}
