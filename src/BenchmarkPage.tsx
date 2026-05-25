import { useEffect, useRef, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import type { BenchmarkResult, BenchmarkRunProgress, Model, Profile, Prompt } from "./types";
import { getModels, getAllProfiles, getAllPrompts, runBenchmark } from "./api";
import { ActionCard } from "./ActionCard";
import { CustomSelect } from "./CustomSelect";
import { FaUser } from "react-icons/fa6";
import { TbBoxModel } from "react-icons/tb";
import { HiLightningBolt } from "react-icons/hi";
import { IoDocumentText } from "react-icons/io5";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from "recharts";
import { MdStackedBarChart } from "react-icons/md";
import { GiProgression } from "react-icons/gi";

export function BenchmarkPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<BenchmarkRunProgress | null>(null);
  const unlistenRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    Promise.all([getModels(), getAllProfiles(), getAllPrompts()])
      .then(([modelData, profileData, promptData]) => {
        setModels(modelData);
        setProfiles(profileData);
        setPrompts(promptData);
        if (profileData.length > 0) setSelectedProfileId(profileData[0].id);
        if (modelData.length > 0) setSelectedModels(new Set([modelData[0].name]));
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
    setProgress(null);

    // Listen for progress events
    unlistenRef.current = await listen<BenchmarkRunProgress>("benchmark-progress", (event) => {
      setProgress(event.payload);
    });

    try {
      const promptContents = profilePrompts.map((p) => p.content);
      const newResults: BenchmarkResult[] = [];

      for (const modelName of selectedModels) {
        const result = await runBenchmark({
          model: modelName,
          num_ctx: selectedProfile.min_context_window ?? 4096,
          prompts: promptContents,
          runs: 3,
        });
        newResults.push(result);
        setResults([...newResults]);
      }
    } catch (e) {
      setError(`Benchmark failed: ${e}`);
    } finally {
      setIsRunning(false);
      if (unlistenRef.current) {
        unlistenRef.current();
        unlistenRef.current = null;
      }
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

      <ActionCard
        icon={<MdStackedBarChart />}
        title="Benchmark"
        description="Run a benchmark"
        actions={
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
        }
      />

      {/* Progress section - shown during run */}
      {isRunning && progress && (
        <>
          <h2 className="section-heading">Live Progress</h2>

          <div className="flex flex-col gap-2">
            <ActionCard
              icon={<HiLightningBolt />}
              title="Benchmark"
              description="Status of current benchmark"
              actions={
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full flex-shrink-0 bg-[var(--success)]`} />
                  <span className=" font-medium text-[var(--text-primary)]">
                    Running
                  </span>
                </div>
              }
            />

            <ActionCard
              icon={<GiProgression />}
              title="Progress"
              description={`Prompt ${progress.current_prompt_number}/${progress.total_prompts} — Run ${progress.current_run_number}/${progress.total_runs}`}
              actions={
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                  <span className="text-[0.875rem] text-[var(--text-primary)]">
                    {progress.total_tokens} tokens
                  </span>
                </div>
              }
            />
          </div>

          {/* Live graphs */}
          <div className="grid grid-cols-2 gap-4 my-4">
            <LiveGraph
              title="VRAM (MB)"
              data={progress.vram_values_mb}
              color="#8b5cf6"
              boundaries={progress.prompt_boundaries}
            />
            <LiveGraph
              title="GPU %"
              data={progress.gpu_values_percent}
              color="#10b981"
              boundaries={progress.prompt_boundaries}
            />
            <LiveGraph
              title="CPU %"
              data={progress.cpu_values_percent}
              color="#f59e0b"
              boundaries={progress.prompt_boundaries}
            />
            <LiveGraph
              title="Tokens/s"
              data={progress.tps_values}
              color="#3b82f6"
              boundaries={[]}
            />
          </div>
        </>
      )}

      {/* Results section - shown after run completes */}
      {latestResult && !isRunning && (
        <>
          <h2 className="section-heading">Results</h2>

          <ActionCard
            icon={<HiLightningBolt />}
            title="Benchmark"
            description="Status of current benchmark"
            actions={
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex-shrink-0 bg-[var(--success)]`} />
                <span className=" font-medium text-[var(--text-primary)]">
                  Finished
                </span>
              </div>
            }
          />

          <ActionCard
            icon={<HiLightningBolt />}
            title="Benchmark"
            description="Status of current benchmark"
            actions={
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex-shrink-0 bg-[var(--success)]`} />
                <span className=" font-medium text-[var(--text-primary)]">
                  Finished
                </span>
              </div>
            }
          />

          {/* Summary metrics */}
          <div className="grid grid-cols-4 gap-4 my-4">
            <MetricCard title="TPS" value={`${latestResult.tps.toFixed(1)}`} subtitle={`± ${latestResult.tps_std_dev.toFixed(1)}`} />
            <MetricCard title="TTFT" value={formatNs(latestResult.ttft_ns_mean)} subtitle={`± ${formatNs(latestResult.ttft_ns_std_dev)}`} />
            <MetricCard title="Model Load" value={formatNs(latestResult.model_load_time_ns)} />
            <MetricCard title="RAM Spillover" value={latestResult.likely_ram_spillover ? "Yes" : "No"} />
          </div>

          {/* Hardware metrics */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <MetricCard
              title="VRAM"
              value={`${latestResult.vram_peak_mb} MB peak`}
              subtitle={`${latestResult.vram_avg_mb.toFixed(0)} MB avg`}
            />
            <MetricCard
              title="GPU"
              value={`${latestResult.gpu_peak_percent.toFixed(1)}% peak`}
              subtitle={`${latestResult.gpu_avg_percent.toFixed(1)}% avg`}
            />
            <MetricCard
              title="CPU"
              value={`${latestResult.cpu_peak_percent.toFixed(1)}% peak`}
              subtitle={`${latestResult.cpu_avg_percent.toFixed(1)}% avg`}
            />
          </div>

          {/* Per-prompt breakdown */}
          <h3 className="text-[0.875rem] font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-3">Per Prompt</h3>
          <div className="flex flex-col gap-3 mb-6">
            {latestResult.per_prompt.map((pr, i) => (
              <PromptResultCard key={i} index={i + 1} result={pr} />
            ))}
          </div>
        </>
      )}

      {/* Idle state */}
      {!isRunning && !latestResult && (
        <>
          <h2 className="section-heading">Details</h2>
          <ActionCard
            icon={<HiLightningBolt />}
            title="No Result Yet"
            description="Run a benchmark to see results here."
            actions={
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex-shrink-0 ${isRunning ? "bg-[var(--success)]" : "bg-[var(--danger)]"}`} />
                <span className=" font-medium text-[var(--text-primary)]">
                  {isRunning ? "Running" : "Inactive"}
                </span>
              </div>
            }
          />
        </>
      )}
    </div>
  );
}

// --- Helper Components ---

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[0.875rem] text-[var(--text-secondary)]">{label}</span>
      <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function MetricCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-md)] p-4">
      <h4 className="text-[0.75rem] font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-2">{title}</h4>
      <div className="text-[1.25rem] font-semibold text-[var(--text-primary)]">{value}</div>
      {subtitle && <div className="text-[0.75rem] text-[var(--text-secondary)] mt-1">{subtitle}</div>}
    </div>
  );
}

function LiveGraph({ title, data, color, boundaries }: {
  title: string;
  data: number[];
  color: string;
  boundaries: number[];
}) {
  const chartData = data.map((value, i) => ({ i, value }));

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-md)] p-4">
      <h4 className="text-[0.75rem] font-medium text-[var(--text-secondary)] uppercase tracking-wide mb-2">{title}</h4>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="i" hide />
          <YAxis width={40} tick={{ fontSize: 10, fill: "#888" }} />
          <Tooltip
            contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 4 }}
            labelStyle={{ color: "#888" }}
          />
          <Line type="monotone" dataKey="value" stroke={color} dot={false} strokeWidth={1.5} />
          {boundaries.map((idx) => (
            <ReferenceLine key={idx} x={idx} stroke="#666" strokeDasharray="4 2" />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function PromptResultCard({ index, result }: { index: number; result: import("./types").PromptResult }) {
  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-md)] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[0.875rem] font-semibold text-[var(--text-primary)]">Prompt {index}</span>
        <span className="text-[0.75rem] text-[var(--text-secondary)]">{result.total_tokens} tokens</span>
      </div>
      <p className="text-[0.75rem] text-[var(--text-secondary)] mb-3 truncate">{result.prompt}</p>
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="TPS" value={`${result.tps_mean.toFixed(1)} ± ${result.tps_std_dev.toFixed(1)}`} />
        <MiniStat label="TTFT" value={`${formatNs(result.ttft_ns_mean)} ± ${formatNs(result.ttft_ns_std_dev)}`} />
        <MiniStat label="Response" value={`${formatNs(result.response_time_ns_mean)} ± ${formatNs(result.response_time_ns_std_dev)}`} />
        <MiniStat label="VRAM" value={`${result.vram_peak_mb} / ${result.vram_avg_mb.toFixed(0)} MB`} />
        <MiniStat label="GPU" value={`${result.gpu_peak_percent.toFixed(0)}% / ${result.gpu_avg_percent.toFixed(0)}%`} />
        <MiniStat label="CPU" value={`${result.cpu_peak_percent.toFixed(0)}% / ${result.cpu_avg_percent.toFixed(0)}%`} />
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[0.625rem] text-[var(--text-secondary)] uppercase tracking-wide">{label}</div>
      <div className="text-[0.75rem] font-medium text-[var(--text-primary)]">{value}</div>
    </div>
  );
}

// --- Utilities ---

function formatNs(ns: number): string {
  if (ns >= 1e9) return `${(ns / 1e9).toFixed(2)}s`;
  if (ns >= 1e6) return `${(ns / 1e6).toFixed(0)}ms`;
  if (ns >= 1e3) return `${(ns / 1e3).toFixed(0)}μs`;
  return `${ns.toFixed(0)}ns`;
}
