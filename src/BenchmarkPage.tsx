import { useState } from "react";
import { MOCK_MODELS, MOCK_PROFILES } from "./mockData";

export function BenchmarkPage() {
  const [selectedProfileId, setSelectedProfileId] = useState<number>(MOCK_PROFILES[0].id);
  const [selectedModel, setSelectedModel] = useState<string>(MOCK_MODELS[0].name);
  const [isRunning, setIsRunning] = useState(false);

  const selectedProfile = MOCK_PROFILES.find((p) => p.id === selectedProfileId);
  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 3000);
  };

  return (
    <div className="page">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page__title" style={{ marginBottom: 0 }}>Benchmark</h1>
        <button
          className="btn btn--primary"
          onClick={handleRun}
          disabled={isRunning}
        >
          {isRunning ? "Running..." : "Run Benchmark"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-2">
        <div className="flex flex-col gap-2">
          <label className="selector-label">Profile</label>
          <select
            className="selector-dropdown"
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(Number(e.target.value))}
            disabled={isRunning}
          >
            {MOCK_PROFILES.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button className="btn btn--ghost btn--sm">Edit Profile</button>
        </div>
        <div className="flex flex-col gap-2">
          <label className="selector-label">Models</label>
          <select
            className="selector-dropdown"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isRunning}
          >
            {MOCK_MODELS.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name} · {m.parameters} · {m.quantization}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h2 className="section-heading">Details</h2>

      <div className="flex items-center gap-3 mb-5 px-[18px] py-[14px] bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)]">
        <span className="text-[0.85rem] font-medium text-[var(--text-secondary)] flex-1">Benchmark Status</span>
        <span className={[
          "inline-flex items-center gap-1.5 text-[0.8rem] font-semibold px-3 py-1 rounded-full",
          isRunning
            ? "bg-[rgba(34,197,94,0.12)] text-[var(--success)]"
            : "bg-[var(--danger-muted)] text-[var(--danger)]",
        ].join(" ")}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {isRunning ? "Running" : "Inactive"}
        </span>
      </div>

      <div className="mb-6">
        <h3 className="subsection-heading">Active Prompt</h3>
        <div className="p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] text-[var(--text-secondary)] text-[0.85rem] leading-relaxed">
          This is a placeholder for the prompt(s) sent during benchmarking. Currently showing the prompts associated with the "{selectedProfile?.name}" profile ({selectedProfile?.use_case_tag} use case). These prompts will be sent to the model during the benchmark run to measure performance metrics.
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {["GPU", "vRAM", "CPU"].map((title) => (
          <MetricCard key={title} title={title} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {["Total tokens", "Tokens per second"].map((title) => (
          <MetricCard key={title} title={title} />
        ))}
      </div>
    </div>
  );
}

function MetricCard({ title }: { title: string }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
      <h4 className="text-[0.85rem] font-semibold text-[var(--text-primary)] mb-4">{title}</h4>
      <div className="h-20 flex flex-col items-center justify-center gap-2 text-[var(--text-muted)] text-[0.75rem] border border-dashed border-[var(--border)] rounded-[var(--radius-sm)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
          <path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-8" />
        </svg>
        <span>Graph of utilization</span>
      </div>
    </div>
  );
}
