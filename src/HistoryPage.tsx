import { useState } from "react";
import { MOCK_HISTORY, type MockBenchmarkRun } from "./mockData";
import { HistoryItem } from "./HistoryItem";
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
          {runs.map((run) => (
            <HistoryItem
              key={run.id}
              run={run}
              isActive={selectedId === run.id}
              onClick={() => setSelectedId(run.id)}
              onDelete={deleteRun}
            />
          ))}
        </div>

        <div className="min-h-0 overflow-y-auto max-h-[calc(100vh-140px)]">
          {selectedRun ? (
            <>
              <h1 className="page__title" style={{ marginBottom: 0 }}>{selectedRun.model_name}</h1>
              <p className="text-secondary mb-2">{new Date(selectedRun.run_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
              <ResultCard run={selectedRun} />
            </>
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
