import type { MockBenchmarkRun } from "./mockData";
import { formatTimeShort } from "./mockData";

interface ResultCardProps {
  run: MockBenchmarkRun;
  onClose?: () => void;
  compact?: boolean;
}

export function ResultCard({ run, onClose, compact }: ResultCardProps) {
  const date = new Date(run.run_at);
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-8 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 pb-4">
        <h2 className="text-[1.35rem] font-semibold text-[var(--text-primary)]">{run.model_name} Profile</h2>
        <span className="text-[var(--text-muted)] text-[0.8rem]">{formattedDate}</span>
      </div>

      <div className="grid grid-cols-2 gap-x-12 gap-y-10">
        {/* Profile */}
        <div>
          <h3 className="text-[1rem] font-semibold text-[var(--text-primary)] mb-1">Profile</h3>
          <p className="text-[0.75rem] text-[var(--text-muted)] mb-5">Profile criteria</p>
          <div className="flex flex-col gap-4">
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

        {/* Score Breakdown */}
        <div>
          <h3 className="text-[1rem] font-semibold text-[var(--text-primary)] mb-1">Score Breakdown</h3>
          <p className="text-[0.75rem] text-[var(--text-muted)] mb-5">Model score based on profile criteria</p>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-[80px_1fr_45px] items-center gap-4">
              <span className="text-[0.875rem] text-[var(--text-secondary)]">Speed</span>
              <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: '80%' }}></div>
              </div>
              <span className="text-right text-[0.75rem] text-[var(--text-secondary)]">32/40</span>
            </div>
            <div className="grid grid-cols-[80px_1fr_45px] items-center gap-4">
              <span className="text-[0.875rem] text-[var(--text-secondary)]">Fit</span>
              <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: '52%' }}></div>
              </div>
              <span className="text-right text-[0.75rem] text-[var(--text-secondary)]">13/25</span>
            </div>
            <div className="grid grid-cols-[80px_1fr_45px] items-center gap-4">
              <span className="text-[0.875rem] text-[var(--text-secondary)]">Accuracy</span>
              <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: '80%' }}></div>
              </div>
              <span className="text-right text-[0.75rem] text-[var(--text-secondary)]">20/25</span>
            </div>
            <div className="grid grid-cols-[80px_1fr_45px] items-center gap-4">
              <span className="text-[0.875rem] text-[var(--text-secondary)]">Stability</span>
              <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: '90%' }}></div>
              </div>
              <span className="text-right text-[0.75rem] text-[var(--text-secondary)]">9/10</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div>
          <h3 className="text-[1rem] font-semibold text-[var(--text-primary)] mb-1">Details</h3>
          <p className="text-[0.75rem] text-[var(--text-muted)] mb-5">Benchmark result details</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
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
              <span className="text-[0.875rem] text-[var(--text-secondary)]">Total tokens</span>
              <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{run.total_tokens}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[0.875rem] text-[var(--text-secondary)]">VRam peak</span>
              <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{run.vram_peak_mb}</span>
            </div>
            <div />
            <div className="flex justify-between items-center">
              <span className="text-[0.875rem] text-[var(--text-secondary)]">CPU peak %</span>
              <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{run.cpu_peak_percent.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Model Details */}
        <div>
          <h3 className="text-[1rem] font-semibold text-[var(--text-primary)] mb-1">Model Details</h3>
          <p className="text-[0.75rem] text-[var(--text-muted)]">Huggingface data</p>
        </div>
      </div>
    </div>
  );
}
