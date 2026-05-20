import type { MockBenchmarkRun } from "./mockData";
import { formatTime } from "./mockData";
import { MOCK_MODELS } from "./mockData";

interface ResultCardProps {
  run: MockBenchmarkRun;
  onClose?: () => void;
  compact?: boolean;
}

export function ResultCard({ run, onClose, compact }: ResultCardProps) {
  const model = MOCK_MODELS.find((m) => m.name === run.model_name);

  const scoreEntries: { label: string; value: number }[] = [
    { label: "TTFT", value: run.scores.ttft },
    { label: "Throughput", value: run.scores.throughput },
    { label: "VRAM", value: run.scores.vram },
    { label: "CPU", value: run.scores.cpu },
    { label: "Consistency", value: run.scores.consistency },
  ];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-sm)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="flex text-[var(--accent)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M9 9h6M9 13h6M9 17h4" />
            </svg>
          </span>
          <span className="text-[0.95rem] font-semibold text-[var(--text-primary)]">{run.model_name}</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center border-0 bg-transparent text-[var(--text-muted)] cursor-pointer rounded hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors duration-150"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Body */}
      <div className={`grid grid-cols-2 p-5 ${compact ? "gap-4" : "gap-6"}`}>
        {/* Score Breakdown */}
        <div>
          <h4 className="text-[0.85rem] font-semibold text-[var(--text-primary)] mb-1">Score Breakdown</h4>
          <p className="text-[0.7rem] text-[var(--text-muted)] mb-4">Score per comparison over all runs</p>
          <div className="flex flex-col gap-2">
            {scoreEntries.map((entry) => (
              <div key={entry.label} className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
                <span className="text-[0.75rem] font-medium text-[var(--text-secondary)]">{entry.label}</span>
                <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--accent)] rounded-full transition-[width] duration-[600ms] ease-out"
                    style={{ width: `${entry.value}%` }}
                  />
                </div>
                <span className="text-[0.7rem] font-semibold text-[var(--text-primary)] text-right">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Model Details */}
        <div>
          <h4 className="text-[0.85rem] font-semibold text-[var(--text-primary)] mb-1">Model Details</h4>
          <p className="text-[0.7rem] text-[var(--text-muted)] mb-4"> </p>
          <div className="flex flex-col gap-2">
            {[
              { key: "Model", value: run.model_name },
              { key: "Parameters", value: model?.parameters ?? "N/A" },
              { key: "Quantization", value: model?.quantization ?? "N/A" },
              { key: "Family", value: model?.family ?? "N/A" },
            ].map(({ key, value }) => (
              <div key={key} className="flex justify-between py-1">
                <span className="text-[0.75rem] text-[var(--text-muted)]">{key}</span>
                <span className="text-[0.75rem] font-medium text-[var(--text-primary)]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-5 pb-5">
        <h4 className="text-[0.85rem] font-semibold text-[var(--text-primary)] mb-1">Details</h4>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {[
            { label: "Total token count", value: run.total_tokens.toLocaleString() },
            { label: "Throughput/per second", value: run.tokens_per_second.toFixed(1) },
            { label: "Time to first token", value: formatTime(run.ttft_ns_mean) },
            { label: "Total time", value: formatTime(run.total_time_ns_mean) },
            { label: "VRAM peak", value: `${run.vram_peak_mb} MB` },
            { label: "CPU usage %", value: `${run.cpu_peak_percent.toFixed(1)}%` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-3 py-2 bg-[var(--bg-surface)] rounded-[var(--radius-sm)]">
              <span className="text-[0.75rem] text-[var(--text-muted)]">{label}</span>
              <span className="text-[0.75rem] font-semibold text-[var(--text-primary)] font-['Courier_New',monospace]">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
