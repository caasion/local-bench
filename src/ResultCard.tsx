import type { MockBenchmarkRun } from "./mockData";
import { MOCK_MODELS, formatTimeShort } from "./mockData";

interface ResultCardProps {
  run: MockBenchmarkRun;
  onClose?: () => void;
  compact?: boolean;
  embedded?: boolean;
}

export function ResultCard({ run, onClose, compact, embedded }: ResultCardProps) {
  const model = MOCK_MODELS.find((m) => m.name === run.model_name);

  const scoreEntries = [
    { label: "Speed", value: run.scores.throughput, max: 40 },
    { label: "Fit", value: run.scores.vram, max: 25 },
    { label: "Accuracy", value: run.scores.cpu, max: 25 },
    { label: "Stability", value: run.scores.consistency, max: 10 },
  ];

  return (
    <div className={embedded ? "p-8" : "bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-8"}>
      <div className="grid grid-cols-2 gap-x-16 gap-y-10">
        {/* Model Details */}
        <div>
          <h3 className="text-[1rem] font-semibold text-[var(--text-primary)] mb-5">Model Details</h3>
          <div className="flex flex-col gap-2">
            {[
              { key: "Family", value: model?.family ?? "N/A" },
              { key: "Parameters", value: model?.parameters ?? "N/A" },
              { key: "Quantization", value: model?.quantization ?? "N/A" },
            ].map(({ key, value }) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-[0.875rem] text-[var(--text-secondary)]">{key}</span>
                <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Score Breakdown */}
        <div>
          <h3 className="text-[1rem] font-semibold text-[var(--text-primary)] mb-5">Score Breakdown</h3>
          <div className="flex flex-col gap-2">
            {scoreEntries.map((entry) => {
              const pct = Math.round((entry.value / 100) * 100);
              const display = Math.round((entry.value / 100) * entry.max);
              return (
                <div key={entry.label} className="grid grid-cols-[80px_1fr_45px] items-center gap-4">
                  <span className="text-[0.875rem] text-[var(--text-secondary)]">{entry.label}</span>
                  <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-right text-[0.75rem] text-[var(--text-secondary)]">{display}/{entry.max}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Profile Criteria */}
        <div>
          <h3 className="text-[1rem] font-semibold text-[var(--text-primary)] mb-5">Profile Criteria</h3>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-[0.875rem] text-[var(--text-secondary)]">Maximum time until first token</span>
              <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">10s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[0.875rem] text-[var(--text-secondary)]">Minimum context window</span>
              <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">4096</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[0.875rem] text-[var(--text-secondary)]">Test Thinking</span>
              <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">yes</span>
            </div>
          </div>
        </div>

        {/* Result Details */}
        <div>
          <h3 className="text-[1rem] font-semibold text-[var(--text-primary)] mb-5">Result Details</h3>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[0.875rem] text-[var(--text-secondary)]">Tokens per second</span>
              <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{run.tokens_per_second.toFixed(1)}/s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[0.875rem] text-[var(--text-secondary)]">Time until first token</span>
              <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{formatTimeShort(run.ttft_ns_mean)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[0.875rem] text-[var(--text-secondary)]">Total tokens</span>
              <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{run.total_tokens}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[0.875rem] text-[var(--text-secondary)]">VRam peak</span>
              <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{run.vram_peak_mb}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[0.875rem] text-[var(--text-secondary)]">CPU peak %</span>
              <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{run.cpu_peak_percent.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  );
}
