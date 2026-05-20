import { useState } from "react";
import { MOCK_MODELS, MOCK_PROFILES, MOCK_HISTORY, formatTime } from "./mockData";
import type { MockBenchmarkRun } from "./mockData";
import { ActionCard } from "./ActionCard";

interface HomePageProps {
  onNavigate: (view: string) => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function overallScore(run: MockBenchmarkRun): number {
  const s = run.scores;
  return Math.round((s.ttft + s.throughput + s.vram + s.cpu + s.consistency) / 5);
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<number>(MOCK_PROFILES[0].id);
  const [selectedModel, setSelectedModel] = useState<string>(MOCK_MODELS[0].name);
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  // Group history by model, keeping only the latest run per model
  const latestByModel = MOCK_HISTORY.reduce<Record<string, MockBenchmarkRun>>((acc, run) => {
    if (!acc[run.model_name] || run.run_at > acc[run.model_name].run_at) {
      acc[run.model_name] = run;
    }
    return acc;
  }, {});

  const benchmarkedModels = Object.values(latestByModel).sort(
    (a, b) => overallScore(b) - overallScore(a)
  );

  const scoreEntries = (run: MockBenchmarkRun) => [
    { label: "Speed", value: run.scores.throughput },
    { label: "TtI", value: run.scores.ttft },
    { label: "Accuracy", value: run.scores.vram },
    { label: "Stability", value: run.scores.consistency },
  ];

  return (
    <div className="page">
      <h1 className="page__title">Home</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <ActionCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
            </svg>
          }
          title="Profile"
          description="Change benchmark profile."
          actions={
            <select
              className="selector-dropdown"
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(Number(e.target.value))}
            >
              {MOCK_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          }
        />
        <ActionCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M9 9h6M9 13h6M9 17h4" />
            </svg>
          }
          title="Models"
          description="Select a model to benchmark."
          actions={
            <select
              className="selector-dropdown"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {MOCK_MODELS.map((m) => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
          }
        />
      </div>

      <div className="mb-7">
        <ActionCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3v18h18" />
              <path d="M7 16l4-8 4 4 4-8" />
            </svg>
          }
          title="Benchmark"
          description="Run a benchmark."
          actions={
            <>
              <button className="btn btn--primary" onClick={() => onNavigate("benchmark")}>
                Run Benchmark
              </button>
              <button className="btn btn--secondary" onClick={() => onNavigate("history")}>
                View Details
              </button>
            </>
          }
        />
      </div>

      <h2 className="section-heading">Models</h2>

      {benchmarkedModels.length === 0 ? (
        <p className="empty-state">No models benchmarked.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {benchmarkedModels.map((run) => {
            const model = MOCK_MODELS.find((m) => m.name === run.model_name);
            const score = overallScore(run);
            const isExpanded = expandedModel === run.model_name;

            return (
              <div key={run.model_name} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden">
                <button
                  className={[
                    "flex items-center gap-4 px-[18px] py-[14px] w-full bg-transparent border-0 text-inherit font-[inherit] cursor-pointer transition-[background] duration-150 hover:bg-[var(--bg-hover)]",
                    isExpanded ? "border-b border-[var(--border)]" : "",
                  ].join(" ")}
                  onClick={() => setExpandedModel(isExpanded ? null : run.model_name)}
                >
                  <span className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--success)] text-white text-[0.85rem] font-bold shrink-0">
                    {score}
                  </span>
                  <div className="flex-1 flex flex-col text-left">
                    <span className="text-[0.9rem] font-semibold text-[var(--text-primary)]">{run.model_name}</span>
                    <span className="text-[0.75rem] text-[var(--text-muted)] mt-0.5">Last benchmarked: {timeAgo(run.run_at)}</span>
                  </div>
                  <svg
                    className={`text-[var(--text-muted)] shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-6 py-5">
                    <div className="grid grid-cols-2 gap-6 mb-5">
                      <div>
                        <h4 className="text-[0.85rem] font-semibold text-[var(--text-primary)] mb-1">Score Breakdown</h4>
                        <p className="text-[0.7rem] text-[var(--text-muted)] mb-4">Model score based on profile criteria</p>
                        <div className="flex flex-col gap-2">
                          {scoreEntries(run).map((entry) => (
                            <div key={entry.label} className="grid grid-cols-[80px_1fr_40px] items-center gap-2">
                              <span className="text-[0.75rem] font-medium text-[var(--text-secondary)]">{entry.label}</span>
                              <div className="h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                                <div className="h-full bg-[var(--accent)] rounded-full transition-[width] duration-[600ms] ease-out" style={{ width: `${entry.value}%` }} />
                              </div>
                              <span className="text-[0.7rem] font-semibold text-[var(--text-primary)] text-right">{entry.value}/100</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[0.85rem] font-semibold text-[var(--text-primary)] mb-1">Model Details</h4>
                        <p className="text-[0.7rem] text-[var(--text-muted)] mb-4">Model configuration and HuggingFace data</p>
                        <div className="flex flex-col gap-2">
                          {[
                            { key: "Effort", value: model?.quantization ?? "N/A" },
                            { key: "Thinking", value: "yes" },
                            { key: "Context Window", value: "100k" },
                          ].map(({ key, value }) => (
                            <div key={key} className="flex justify-between py-1">
                              <span className="text-[0.75rem] text-[var(--text-muted)]">{key}</span>
                              <span className="text-[0.75rem] font-medium text-[var(--text-primary)]">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-[var(--border)] pt-4">
                      <h4 className="text-[0.85rem] font-semibold text-[var(--text-primary)] mb-1">Details</h4>
                      <p className="text-[0.7rem] text-[var(--text-muted)] mb-3">Benchmark result details</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Tokens per second", value: <>{run.tokens_per_second.toFixed(1)} <span className="text-[0.65rem] text-[var(--text-muted)] font-normal">+/- 0.23</span></> },
                          { label: "Time until first token", value: formatTime(run.ttft_ns_mean) },
                          { label: "Total tokens", value: run.total_tokens.toLocaleString() },
                          { label: "VRam peak", value: run.vram_peak_mb.toLocaleString() },
                          { label: "CPU peak %", value: run.cpu_peak_percent.toFixed(1) },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between items-center px-3 py-2 bg-[var(--bg-surface)] rounded-[var(--radius-sm)]">
                            <span className="text-[0.75rem] text-[var(--text-muted)]">{label}</span>
                            <span className="text-[0.75rem] font-semibold text-[var(--text-primary)] font-['Courier_New',monospace]">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
