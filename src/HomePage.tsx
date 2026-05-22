import { useState } from "react";
import { MOCK_MODELS, MOCK_PROFILES, MOCK_HISTORY } from "./mockData";
import type { MockBenchmarkRun } from "./mockData";
import { ActionCard } from "./ActionCard";
import { ModelResultItem } from "./ModelResultItem";

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

  const latestByModel = MOCK_HISTORY.reduce<Record<string, MockBenchmarkRun>>((acc, run) => {
    if (!acc[run.model_name] || run.run_at > acc[run.model_name].run_at) {
      acc[run.model_name] = run;
    }
    return acc;
  }, {});

  const benchmarkedModels = Object.values(latestByModel).sort(
    (a, b) => overallScore(b) - overallScore(a)
  );

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
          {benchmarkedModels.map((run) => (
            <ModelResultItem
              key={run.model_name}
              run={run}
              score={overallScore(run)}
              timeAgo={timeAgo(run.run_at)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
