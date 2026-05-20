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
    <div className="page benchmark-page">
      <div className="benchmark-page__header">
        <h1 className="page__title">Benchmark</h1>
        <button
          className="btn btn--primary"
          onClick={handleRun}
          disabled={isRunning}
        >
          {isRunning ? "Running..." : "Run Benchmark"}
        </button>
      </div>

      <div className="benchmark-selectors">
        <div className="benchmark-selector-col">
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
        <div className="benchmark-selector-col">
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

      <div className="benchmark-status-row">
        <span className="benchmark-status-label">Benchmark Status</span>
        <span className={`benchmark-status-badge${isRunning ? " benchmark-status-badge--active" : " benchmark-status-badge--inactive"}`}>
          <span className="status-dot" />
          {isRunning ? "Running" : "Inactive"}
        </span>
      </div>

      <div className="benchmark-prompt-section">
        <h3 className="subsection-heading">Active Prompt</h3>
        <div className="benchmark-prompt-box">
          This is a placeholder for the prompt(s) sent during benchmarking. Currently showing the prompts associated with the "{selectedProfile?.name}" profile ({selectedProfile?.use_case_tag} use case). These prompts will be sent to the model during the benchmark run to measure performance metrics.
        </div>
      </div>

      <div className="benchmark-metrics-row">
        <div className="benchmark-metric-card">
          <h4 className="benchmark-metric-card__title">GPU</h4>
          <div className="benchmark-metric-card__placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-8" />
            </svg>
            <span>Graph of utilization</span>
          </div>
        </div>
        <div className="benchmark-metric-card">
          <h4 className="benchmark-metric-card__title">vRAM</h4>
          <div className="benchmark-metric-card__placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-8" />
            </svg>
            <span>Graph of utilization</span>
          </div>
        </div>
        <div className="benchmark-metric-card">
          <h4 className="benchmark-metric-card__title">CPU</h4>
          <div className="benchmark-metric-card__placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-8" />
            </svg>
            <span>Graph of utilization</span>
          </div>
        </div>
      </div>

      <div className="benchmark-metrics-row benchmark-metrics-row--2col">
        <div className="benchmark-metric-card">
          <h4 className="benchmark-metric-card__title">Total tokens</h4>
          <div className="benchmark-metric-card__placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-8" />
            </svg>
            <span>Graph of utilization</span>
          </div>
        </div>
        <div className="benchmark-metric-card">
          <h4 className="benchmark-metric-card__title">Tokens per second</h4>
          <div className="benchmark-metric-card__placeholder">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
              <path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-8" />
            </svg>
            <span>Graph of utilization</span>
          </div>
        </div>
      </div>
    </div>
  );
}
