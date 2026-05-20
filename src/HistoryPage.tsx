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
    <div className="page">
      <h1 className="page__title">History</h1>

      <div className="grid grid-cols-[320px_1fr] gap-6 min-h-0">
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
          {runs.length === 0 && (
            <p className="empty-state">No benchmark runs yet.</p>
          )}
          {runs.map((run) => {
            const isActive = selectedId === run.id;
            return (
              <div
                key={run.id}
                className={[
                  "group flex items-center gap-2.5 px-3.5 py-3 border rounded-[var(--radius-md)] cursor-pointer transition-all duration-150",
                  isActive
                    ? "border-[var(--accent)] bg-[var(--accent-muted)]"
                    : "bg-[var(--bg-card)] border-[var(--border)] hover:bg-[var(--bg-hover)]",
                ].join(" ")}
                onClick={() => setSelectedId(run.id)}
              >
                <div className={`flex shrink-0 ${isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]"}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3v18h18" />
                    <path d="M7 16l4-8 4 4 4-8" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-[0.85rem] font-medium text-[var(--text-primary)] overflow-hidden text-ellipsis whitespace-nowrap">
                    {run.model_name}
                  </span>
                  <span className="text-[0.7rem] text-[var(--text-muted)]">
                    {new Date(run.run_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" · "}
                    {run.tokens_per_second.toFixed(1)} tok/s
                  </span>
                </div>
                <span className="text-[0.65rem] font-semibold text-[var(--text-secondary)] bg-[var(--bg-surface)] px-2 py-0.5 rounded-full whitespace-nowrap">
                  {run.mode}
                </span>
                <button
                  className="w-6 h-6 flex items-center justify-center border-0 bg-transparent text-[var(--text-muted)] cursor-pointer rounded opacity-0 group-hover:opacity-100 transition-all duration-150 hover:text-[var(--danger)] hover:bg-[var(--danger-muted)]"
                  onClick={(e) => { e.stopPropagation(); deleteRun(run.id); }}
                  title="Delete run"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>

        <div className="min-h-0 overflow-y-auto max-h-[calc(100vh-140px)]">
          {selectedRun ? (
            <ResultCard run={selectedRun} />
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="empty-state">Select a benchmark run to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
