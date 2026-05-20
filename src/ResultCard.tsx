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
    <div className={`result-card${compact ? " result-card--compact" : ""}`}>
      <div className="result-card__header">
        <div className="result-card__header-left">
          <span className="result-card__icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M9 9h6M9 13h6M9 17h4" />
            </svg>
          </span>
          <span className="result-card__model-name">{run.model_name}</span>
        </div>
        {onClose && (
          <button className="result-card__close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="result-card__body">
        <div className="result-card__scores">
          <h4 className="result-card__section-title">Score Breakdown</h4>
          <p className="result-card__section-subtitle">Score per comparison over all runs</p>
          <div className="score-bars">
            {scoreEntries.map((entry) => (
              <div key={entry.label} className="score-bar">
                <div className="score-bar__label">{entry.label}</div>
                <div className="score-bar__track">
                  <div
                    className="score-bar__fill"
                    style={{ width: `${entry.value}%` }}
                  />
                </div>
                <div className="score-bar__value">{entry.value}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="result-card__model-details">
          <h4 className="result-card__section-title">Model Details</h4>
          <div className="model-details-list">
            <div className="model-detail-row">
              <span className="model-detail-key">Model</span>
              <span className="model-detail-value">{run.model_name}</span>
            </div>
            <div className="model-detail-row">
              <span className="model-detail-key">Parameters</span>
              <span className="model-detail-value">{model?.parameters ?? "N/A"}</span>
            </div>
            <div className="model-detail-row">
              <span className="model-detail-key">Quantization</span>
              <span className="model-detail-value">{model?.quantization ?? "N/A"}</span>
            </div>
            <div className="model-detail-row">
              <span className="model-detail-key">Family</span>
              <span className="model-detail-value">{model?.family ?? "N/A"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="result-card__details">
        <h4 className="result-card__section-title">Details</h4>
        <div className="result-card__metrics-grid">
          <div className="metric-item">
            <span className="metric-label">Total token count</span>
            <span className="metric-value">{run.total_tokens.toLocaleString()}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Throughput/per second</span>
            <span className="metric-value">{run.tokens_per_second.toFixed(1)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Time to first token</span>
            <span className="metric-value">{formatTime(run.ttft_ns_mean)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Total time</span>
            <span className="metric-value">{formatTime(run.total_time_ns_mean)}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">VRAM peak</span>
            <span className="metric-value">{run.vram_peak_mb} MB</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">CPU usage %</span>
            <span className="metric-value">{run.cpu_peak_percent.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
