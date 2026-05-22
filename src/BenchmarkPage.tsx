import { useEffect, useState } from "react";
import type { BenchmarkResult, Model, Profile, Prompt } from "./types";
import { getModels, getAllProfiles, getAllPrompts, runBenchmark } from "./api";
import { ActionCard } from "./ActionCard";
import { CustomSelect } from "./CustomSelect";
import { FaUser } from "react-icons/fa6";
import { TbBoxModel } from "react-icons/tb";
import { HiLightningBolt } from "react-icons/hi";
import { IoDocumentText } from "react-icons/io5";

export function BenchmarkPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getModels(), getAllProfiles(), getAllPrompts()])
      .then(([tagsResp, profileData, promptData]) => {
        setModels(tagsResp.models);
        setProfiles(profileData);
        setPrompts(promptData);
        if (profileData.length > 0) setSelectedProfileId(profileData[0].id);
        if (tagsResp.models.length > 0) setSelectedModels(new Set([tagsResp.models[0].name]));
      })
      .catch((e) => setError(`Failed to load: ${e}`));
  }, []);

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
  const profilePrompts = prompts.filter((p) => p.use_case_tag === selectedProfile?.use_case_tag);

  const handleRun = async () => {
    if (selectedModels.size === 0 || !selectedProfile) return;
    setError("");
    setIsRunning(true);
    setResults([]);

    try {
      const promptContents = profilePrompts.map((p) => p.content);
      const newResults: BenchmarkResult[] = [];
      for (const modelName of selectedModels) {
        const result = await runBenchmark({
          model: modelName,
          num_ctx: selectedProfile.min_context_window ?? 4096,
          prompts: promptContents,
          times: 3,
        });
        newResults.push(result);
        setResults([...newResults]);
      }
    } catch (e) {
      setError(`Benchmark failed: ${e}`);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleModel = (name: string) => {
    setSelectedModels((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const latestResult = results[results.length - 1];

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="page__title" style={{ marginBottom: 0 }}>Benchmark</h1>
        <button
          className="btn btn--primary"
          style={{ color: "#000" }}
          onClick={handleRun}
          disabled={isRunning || selectedModels.size === 0 || !selectedProfile}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          {isRunning ? "Running..." : "Run Benchmark"}
        </button>
      </div>

      {error && <div className="text-[var(--danger)] mb-4 text-[0.875rem]">{error}</div>}

      {/* Profile + Models cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Profile card */}
        <div className="bg-[var(--bg-card)] rounded-sm overflow-hidden px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-4">
              <div className="flex text-[24px]">
                <FaUser />
              </div>
              <div>
                <div className="text-[1.125rem] font-semibold text-[var(--text-primary)]">Profile</div>
                <div className="text-[0.8rem] text-[var(--text-secondary)] font-normal">Change benchmark profile.</div>
              </div>
            </div>
            <CustomSelect
              options={profiles.map((p) => ({ label: p.name, value: String(p.id) }))}
              value={String(selectedProfileId ?? "")}
              onChange={(v) => setSelectedProfileId(Number(v))}
              disabled={isRunning}
            />
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <ProfileRow
              label="Maximum time until first token"
              value={selectedProfile?.max_ttft_seconds != null ? `${selectedProfile.max_ttft_seconds}s` : "—"}
            />
            <ProfileRow
              label="Minimum context window"
              value={selectedProfile?.min_context_window?.toLocaleString() ?? "—"}
            />
            <ProfileRow
              label="Test Thinking"
              value={selectedProfile?.use_case_tag === "reasoning" ? "Yes" : "No"}
            />
          </div>

          <div className="flex justify-end">
            <button className="btn btn--secondary btn--sm">Edit Profile</button>
          </div>
        </div>

        {/* Models card */}
        <div className="bg-[var(--bg-card)] rounded-[var(--radius-md)] overflow-hidden px-6 py-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="text-[24px]">
              <TbBoxModel />
            </div>
            <div>
              <div className="text-[1.125rem] font-semibold text-[var(--text-primary)]">Models</div>
              <div className="text-[0.75rem] text-[var(--text-secondary)]">Select models to benchmark.</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {models.length === 0 && (
              <p className="text-[0.875rem] text-[var(--text-muted)]">No models found. Is Ollama running?</p>
            )}
            {models.map((m) => {
              const checked = selectedModels.has(m.name);
              return (
                <label
                  key={m.name}
                  className="flex items-center justify-between px-3 py-2 rounded-[4px] bg-[#454545] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[0.875rem] text-[var(--text-primary)] capitalize">{m.name}</span>
                    <span className="text-[0.75rem] text-[var(--text-secondary)]">{m.details.quantization_level}</span>
                    <span className="text-[0.75rem] text-[var(--text-secondary)]">{m.details.parameter_size}</span>
                  </div>
                  <div
                    className={[
                      "w-3 h-3 rounded-[2px] flex items-center justify-center flex-shrink-0 transition-colors",
                      checked ? "bg-[var(--accent)]" : "border border-white",
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
        <ActionCard
          icon={<HiLightningBolt />}
          title="Benchmark Status"
          description={latestResult ? `Last: ${latestResult.model}` : "Not yet run"}
          actions={
            <div>
              <span className={[
                "w-4 h-4 rounded-full flex-shrink-0",
                isRunning ? "bg-[var(--success)]" : "bg-[var(--danger)]",
              ].join(" ")} />
              <span className="text-[1.125rem] font-medium text-[var(--text-primary)]">
                {isRunning ? "Running" : "Inactive"}
              </span>
            </div>
          }
        />

        <ActionCard
          icon={<IoDocumentText />}
          title="Active Prompt"
          description="Currently active prompt that is being used for benchmarking"
          actions={
            <div className="flex items-center justify-center gap-2">
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
          }
        />
      </div>

      {/* Metric cards - top row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <MetricCard title="VRAM peak" value={latestResult ? `${latestResult.vram_peak_mb} MB` : null} />
        <MetricCard title="CPU peak" value={latestResult ? `${latestResult.cpu_peak_percent.toFixed(1)}%` : null} />
        <MetricCard title="RAM spillover" value={latestResult ? (latestResult.likely_ram_spillover ? "Yes" : "No") : null} />
      </div>

      {/* Metric cards - bottom row */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard title="Total tokens" value={latestResult ? String(latestResult.total_tokens) : null} />
        <MetricCard title="Tokens per second" value={latestResult ? `${latestResult.tokens_per_second.toFixed(1)}/s` : null} />
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[0.875rem] text-[var(--text-secondary)]">{label}</span>
      <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: string | null }) {
  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-md)] p-4">
      <h4 className="text-[1.125rem] font-semibold text-[var(--text-primary)] mb-4">{title}</h4>
      <div className="h-32 flex items-center justify-center text-[var(--text-secondary)] text-[0.875rem] font-semibold">
        {value ?? "—"}
      </div>
    </div>
  );
}
