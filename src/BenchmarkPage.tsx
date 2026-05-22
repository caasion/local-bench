import { useState } from "react";
import { MOCK_MODELS, MOCK_PROFILES, MOCK_PROMPTS } from "./mockData";
import { ActionCard } from "./ActionCard";
import { CustomSelect } from "./CustomSelect";
import { FaPlay, FaUser } from "react-icons/fa6";
import { TbBoxModel } from "react-icons/tb";
import { HiLightningBolt } from "react-icons/hi";
import { IoDocumentText } from "react-icons/io5";

export function BenchmarkPage() {
  const [selectedProfileId, setSelectedProfileId] = useState<number>(MOCK_PROFILES[0].id);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set([MOCK_MODELS[0].name]));
  const [isRunning, setIsRunning] = useState(false);

  const selectedProfile = MOCK_PROFILES.find((p) => p.id === selectedProfileId)!;
  const profilePrompts = MOCK_PROMPTS.filter((p) => p.use_case_tag === selectedProfile.use_case_tag);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 3000);
  };

  const toggleModel = (name: string) => {
    setSelectedModels((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="page__title" style={{ marginBottom: 0 }}>Benchmark</h1>
        <button
          className="btn btn--primary"
          style={{ color: "#000" }}
          onClick={handleRun}
          disabled={isRunning}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          {isRunning ? "Running..." : "Run Benchmark"}
        </button>
      </div>

      {/* Profile + Models cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Profile card */}
        <div className="bg-[var(--bg-card)] rounded-sm overflow-hidden p-5">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex text-[24px]">
                <FaUser />
              </div>
              
              <div>
                <div className="text-[1.125rem] font-semibold text-[var(--text-primary)]">Profile</div>
                <div className="text-[0.8rem] text-[var(--text-secondary)] font-normal">Change benchmark profile.</div>
              </div>
            </div>
            <CustomSelect
              options={MOCK_PROFILES.map((p) => ({ label: p.name, value: String(p.id) }))}
              value={String(selectedProfileId)}
              onChange={(v) => setSelectedProfileId(Number(v))}
              disabled={isRunning}
            />
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <ProfileRow
              label="Maximum time until first token"
              value={selectedProfile.max_ttft_seconds != null ? `${selectedProfile.max_ttft_seconds}s` : "—"}
            />
            <ProfileRow
              label="Minimum context window"
              value={selectedProfile.min_context_window?.toLocaleString() ?? "—"}
            />
            <ProfileRow
              label="Test Thinking"
              value={selectedProfile.use_case_tag === "reasoning" ? "Yes" : "No"}
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
            {MOCK_MODELS.map((m) => {
              const checked = selectedModels.has(m.name);
              return (
                <label
                  key={m.name}
                  className="flex items-center justify-between px-3 py-2 rounded-[4px] bg-[#454545] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[0.875rem] text-[var(--text-primary)] capitalize">{m.name}</span>
                    <span className="text-[0.75rem] text-[var(--text-secondary)]">{m.quantization}</span>
                    <span className="text-[0.75rem] text-[var(--text-secondary)]">120k context</span>
                  </div>
                  <div
                    className={[
                      "w-3 h-3 rounded-[2px] flex items-center justify-center flex-shrink-0 transition-colors",
                      checked
                        ? "bg-[var(--accent)]"
                        : "border border-white",
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
          description="Last benchmarked: 2 hours ago"
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
          icon={
            <IoDocumentText />
          }
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
        {["GPU", "vRAM", "CPU"].map((title) => (
          <MetricCard key={title} title={title} />
        ))}
      </div>

      {/* Metric cards - bottom row */}
      <div className="grid grid-cols-2 gap-4">
        {["Total tokens", "Tokens per second"].map((title) => (
          <MetricCard key={title} title={title} />
        ))}
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

function MetricCard({ title }: { title: string }) {
  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-md)] p-4">
      <h4 className="text-[1.125rem] font-semibold text-[var(--text-primary)] mb-4">{title}</h4>
      <div className="h-32 flex items-center justify-center text-[var(--text-secondary)] text-[0.875rem] font-semibold">
        Graph of utilization
      </div>
    </div>
  );
}
