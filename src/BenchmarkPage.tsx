import { useState } from "react";
import { MOCK_MODELS, MOCK_PROFILES, MOCK_PROMPTS } from "./mockData";

export function BenchmarkPage() {
  const [selectedProfileId, setSelectedProfileId] = useState<number>(MOCK_PROFILES[0].id);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set([MOCK_MODELS[0].name]));
  const [isRunning, setIsRunning] = useState(false);

  const selectedProfile = MOCK_PROFILES.find((p) => p.id === selectedProfileId)!;
  const profilePrompts = MOCK_PROMPTS.filter((p) => p.use_case_tag === selectedProfile.use_case_tag);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 3000);
  };

  const toggleModel = (name: string) => {
    setSelectedModels((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="page__title" style={{ marginBottom: 0 }}>Benchmark</h1>
        <button
          className="btn btn--primary"
          style={{ color: "#000" }}
          onClick={handleRun}
          disabled={isRunning}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          {isRunning ? "Running..." : "Run Benchmark"}
        </button>
      </div>

      {/* Profile + Models cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Profile card */}
        <div className="bg-[var(--bg-card)] rounded-[var(--radius-md)] overflow-hidden p-5">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 8a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM18 21c-6.667 0-10 3.333-10 5v2h20v-2c0-1.667-3.333-5-10-5z"/>
              </svg>
              <div>
                <div className="text-[1.125rem] font-semibold text-[var(--text-primary)]">Profile</div>
                <div className="text-[0.75rem] text-[var(--text-secondary)]">Change benchmark profile.</div>
              </div>
            </div>
            <select
              className="selector-dropdown"
              style={{ width: "auto", minWidth: 140 }}
              value={selectedProfileId}
              onChange={(e) => setSelectedProfileId(Number(e.target.value))}
              disabled={isRunning}
            >
              {MOCK_PROFILES.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 mb-6">
            <ProfileRow
              label="Maximum time until first token"
              value={selectedProfile.max_ttft_seconds != null ? `${selectedProfile.max_ttft_seconds}s` : "—"}
            />
            <ProfileRow
              label="Minimum context window"
              value={selectedProfile.min_context_window?.toLocaleString() ?? "—"}
            />
            <ProfileRow
              label="Test Thinking"
              value={selectedProfile.use_case_tag === "reasoning" ? "Yes" : "No"}
            />
          </div>

          <div className="flex justify-end">
            <button className="btn btn--secondary btn--sm">Edit Profile</button>
          </div>
        </div>

        {/* Models card */}
        <div className="bg-[var(--bg-card)] rounded-[var(--radius-md)] overflow-hidden p-5">
          <div className="flex items-center gap-3 mb-5">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="white" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="11" height="11" rx="2" />
              <rect x="21" y="4" width="11" height="11" rx="2" />
              <rect x="4" y="21" width="11" height="11" rx="2" />
              <rect x="21" y="21" width="11" height="11" rx="2" />
            </svg>
            <div>
              <div className="text-[1.125rem] font-semibold text-[var(--text-primary)]">Models</div>
              <div className="text-[0.75rem] text-[var(--text-secondary)]">Select models to benchmark.</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {MOCK_MODELS.map((m) => {
              const checked = selectedModels.has(m.name);
              return (
                <label
                  key={m.name}
                  className="flex items-center justify-between px-3 py-2 rounded-[4px] bg-[#454545] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[0.875rem] text-[var(--text-primary)] capitalize">{m.name}</span>
                    <span className="text-[0.75rem] text-[var(--text-secondary)]">{m.quantization}</span>
                    <span className="text-[0.75rem] text-[var(--text-secondary)]">120k context</span>
                  </div>
                  <div
                    className={[
                      "w-3 h-3 rounded-[2px] flex items-center justify-center flex-shrink-0 transition-colors",
                      checked
                        ? "bg-[var(--accent)]"
                        : "border border-white",
                    ].join(" ")}
                    onClick={() => !isRunning && toggleModel(m.name)}
                  >
                    {checked && (
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1.5 5l2.5 2.5 4.5-5" />
                      </svg>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details section */}
      <h2 className="section-heading">Details</h2>

      <div className="flex flex-col gap-2 mb-6">
        {/* Benchmark Status */}
        <div className="flex items-center justify-between px-5 py-4 bg-[var(--bg-card)] rounded-[var(--radius-md)]">
          <div>
            <div className="text-[1.125rem] font-semibold text-[var(--text-primary)]">Benchmark Status</div>
            <div className="text-[0.75rem] text-[var(--text-secondary)] mt-0.5">Last benchmarked: 2 hours ago</div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className={[
              "w-4 h-4 rounded-full flex-shrink-0",
              isRunning ? "bg-[var(--success)]" : "bg-[var(--danger)]",
            ].join(" ")} />
            <span className="text-[1.125rem] font-medium text-[var(--text-primary)]">
              {isRunning ? "Running" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Active Prompt */}
        <div className="flex items-center justify-between px-5 py-4 bg-[var(--bg-card)] rounded-[var(--radius-md)]">
          <div>
            <div className="text-[1.125rem] font-semibold text-[var(--text-primary)]">Active Prompt</div>
            <div className="text-[0.75rem] text-[var(--text-secondary)] mt-0.5">Currently active prompt that is being used for benchmarking</div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[1.125rem] font-medium text-[var(--text-primary)]">
              Prompt 1/{profilePrompts.length || 1}
            </span>
            <button className="w-9 h-9 rounded-[8px] bg-[#555555] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4m0-4h.01" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Metric cards - top row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {["GPU", "vRAM", "CPU"].map((title) => (
          <MetricCard key={title} title={title} />
        ))}
      </div>

      {/* Metric cards - bottom row */}
      <div className="grid grid-cols-2 gap-4">
        {["Total tokens", "Tokens per second"].map((title) => (
          <MetricCard key={title} title={title} />
        ))}
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[0.875rem]">
      <span className="text-[var(--text-primary)]">{label}</span>
      <span className="text-[var(--text-primary)] font-medium">{value}</span>
    </div>
  );
}

function MetricCard({ title }: { title: string }) {
  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-md)] p-4">
      <h4 className="text-[1.125rem] font-semibold text-[var(--text-primary)] mb-4">{title}</h4>
      <div className="h-32 flex items-center justify-center text-[var(--text-secondary)] text-[0.875rem] font-semibold">
        Graph of utilization
      </div>
    </div>
  );
}
