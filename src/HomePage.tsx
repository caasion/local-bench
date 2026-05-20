import { useState } from "react";
import { MOCK_MODELS, MOCK_PROFILES, MOCK_HISTORY, formatBytes } from "./mockData";
import { ResultCard } from "./ResultCard";

interface HomePageProps {
  onNavigate: (view: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [selectedProfileId, setSelectedProfileId] = useState<number>(MOCK_PROFILES[0].id);
  const [selectedModel, setSelectedModel] = useState<string>(MOCK_MODELS[0].name);
  const [showResult, setShowResult] = useState(false);

  const latestRun = MOCK_HISTORY[0];

  return (
    <div className="page home-page">
      <h1 className="page__title">Home</h1>

      <div className="home-selectors">
        <div className="home-selector-group">
          <label className="selector-label">Profile</label>
          <select
            className="selector-dropdown"
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(Number(e.target.value))}
          >
            {MOCK_PROFILES.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="home-selector-group">
          <label className="selector-label">Models</label>
          <select
            className="selector-dropdown"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {MOCK_MODELS.map((m) => (
              <option key={m.name} value={m.name}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="home-benchmark-card">
        <div className="home-benchmark-card__info">
          <span className="home-benchmark-card__icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 3v18h18" />
              <path d="M7 16l4-8 4 4 4-8" />
            </svg>
          </span>
          <div>
            <h3 className="home-benchmark-card__title">Benchmark</h3>
            <p className="home-benchmark-card__subtitle">{selectedModel}</p>
          </div>
        </div>
        <div className="home-benchmark-card__actions">
          <button className="btn btn--primary" onClick={() => onNavigate("benchmark")}>
            Run Benchmark
          </button>
          <button className="btn btn--secondary" onClick={() => setShowResult(true)}>
            View Details
          </button>
        </div>
      </div>

      <div className="home-models-section">
        <h2 className="section-heading">Models</h2>
        <div className="home-models-list">
          {MOCK_MODELS.map((model) => (
            <div
              key={model.name}
              className={`home-model-item${selectedModel === model.name ? " home-model-item--active" : ""}`}
              onClick={() => setSelectedModel(model.name)}
            >
              <span className="home-model-item__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <path d="M9 9h6M9 13h6M9 17h4" />
                </svg>
              </span>
              <div className="home-model-item__info">
                <span className="home-model-item__name">{model.name}</span>
                <span className="home-model-item__meta">{model.parameters} · {model.quantization} · {formatBytes(model.size)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showResult && latestRun && (
        <div className="modal-overlay" onClick={() => setShowResult(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ResultCard run={latestRun} onClose={() => setShowResult(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
