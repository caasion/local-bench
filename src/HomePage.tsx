import { useState } from "react";
import { MOCK_MODELS, MOCK_PROFILES, MOCK_HISTORY } from "./mockData";
import type { MockBenchmarkRun } from "./mockData";
import { ActionCard } from "./ActionCard";
import { ModelResultItem } from "./ModelResultItem";
import { CustomSelect } from "./CustomSelect";
import { TbBoxModel } from "react-icons/tb";
import { FaUser, FaPlay } from "react-icons/fa6";

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
            <FaUser />
          }
          title="Profile"
          description="Change benchmark profile."
          actions={
            <CustomSelect
              options={MOCK_PROFILES.map((p) => ({ label: p.name, value: String(p.id) }))}
              value={String(selectedProfileId)}
              onChange={(v) => setSelectedProfileId(Number(v))}
            />
          }
        />
        <ActionCard
          icon={
            <TbBoxModel />
          }
          title="Models"
          description="Select a model to benchmark."
          actions={
            <CustomSelect
              options={MOCK_MODELS.map((m) => ({ label: m.name, value: m.name }))}
              value={selectedModel}
              onChange={setSelectedModel}
            />
          }
        />
      </div>

      <div className="mb-7">
        <ActionCard
          icon={
            <FaPlay />
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
