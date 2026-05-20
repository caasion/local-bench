import { useState } from "react";
import { MOCK_HISTORY, type MockBenchmarkRun } from "./mockData";
import { ResultCard } from "./ResultCard";

export function HistoryPage() {
  const [runs, setRuns] = useState<MockBenchmarkRun[]>([...MOCK_HISTORY]);
  const [selectedId, setSelectedId] = useState<number | null>(MOCK_HISTORY[0]?.id ?? null);

  const selectedRun = runs.find((r) => r.id === selectedId) ?? null;

  const deleteRun = (id: number) => {
    setRuns((prev) => prev.filter((r) => r.id !== id));
    if (selectedId === id) {
      setSelectedId(runs.find((r) => r.id !== id)?.id ?? null);
    }
  };

  return (
    <div className="page history-page">
      <h1 className="page__title">History</h1>

      <div className="history-layout">
        <div className="history-list">
          {runs.length === 0 && (
            <p className="empty-state">No benchmark runs yet.</p>
          )}
          {runs.map((run) => (
            <div
              key={run.id}
              className={`history-list-item${selectedId === run.id ? " history-list-item--active" : ""}`}
              onClick={() => setSelectedId(run.id)}
            >
              <div className="history-list-item__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 3v18h18" />
                  <path d="M7 16l4-8 4 4 4-8" />
                </svg>
              </div>
              <div className="history-list-item__info">
                <span className="history-list-item__name">{run.model_name}</span>
                <span className="history-list-item__date">
                  {new Date(run.run_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {" · "}
                  {run.tokens_per_second.toFixed(1)} tok/s
                </span>
              </div>
              <span className="history-list-item__tag">{run.mode}</span>
              <button
                className="history-list-item__delete"
                onClick={(e) => { e.stopPropagation(); deleteRun(run.id); }}
                title="Delete run"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="history-detail">
          {selectedRun ? (
            <ResultCard run={selectedRun} />
          ) : (
            <div className="history-detail-empty">
              <p className="empty-state">Select a benchmark run to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
