import { useEffect, useState } from "react";
import type { BenchmarkRunRecord, Model, Profile } from "./types";
import { getModels, getAllProfiles, getBenchmarkHistory } from "./api";
import { ActionCard } from "./ActionCard";
import { ModelResultItem } from "./ModelResultItem";
import { CustomSelect } from "./CustomSelect";
import { TbBoxModel } from "react-icons/tb";
import { FaUser, FaPlay } from "react-icons/fa6";
import { timeAgo, computeScores } from "./utils";

interface HomePageProps {
  onNavigate: (view: string) => void;
}

function overallScore(run: BenchmarkRunRecord): number {
  const s = computeScores(run);
  return Math.round((s.ttft + s.throughput + s.vram + s.cpu + s.consistency) / 5);
}

export function HomePage({ onNavigate }: HomePageProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [history, setHistory] = useState<BenchmarkRunRecord[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getModels(), getAllProfiles(), getBenchmarkHistory()])
      .then(([modelData, profileData, historyData]) => {
        setModels(modelData);
        setProfiles(profileData);
        setHistory(historyData);
        if (profileData.length > 0) setSelectedProfileId(profileData[0].id);
        if (modelData.length > 0) setSelectedModel(modelData[0].name);
      })
      .catch((e) => setError(`Failed to load: ${e}`));
  }, []);

  const latestByModel = history.reduce<Record<string, BenchmarkRunRecord>>((acc, run) => {
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

      {error && <div className="text-[var(--danger)] mb-4 text-[0.875rem]">{error}</div>}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <ActionCard
          icon={<FaUser />}
          title="Profile"
          description="Change benchmark profile."
          actions={
            <CustomSelect
              options={profiles.map((p) => ({ label: p.name, value: String(p.id) }))}
              value={String(selectedProfileId ?? "")}
              onChange={(v) => setSelectedProfileId(Number(v))}
            />
          }
        />
        <ActionCard
          icon={<TbBoxModel />}
          title="Models"
          description="Select a model to benchmark."
          actions={
            <CustomSelect
              options={models.map((m) => ({ label: m.name, value: m.name }))}
              value={selectedModel}
              onChange={setSelectedModel}
            />
          }
        />
      </div>

      <div className="mb-7">
        <ActionCard
          icon={<FaPlay />}
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
