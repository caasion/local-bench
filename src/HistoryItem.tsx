import type { MockBenchmarkRun } from "./mockData";

interface HistoryItemProps {
  run: MockBenchmarkRun;
  isActive: boolean;
  onClick: () => void;
  onDelete: (id: number) => void;
}

export function HistoryItem({ run, isActive, onClick, onDelete }: HistoryItemProps) {
  const totalScore = Math.round(
    Object.values(run.scores).reduce((sum, s) => sum + s, 0) / Object.values(run.scores).length
  );
  return (
    <div
      className={`group border rounded-[var(--radius-sm)] px-6 py-5 cursor-pointer transition-all duration-150 ${isActive ? 'bg-accent/20 hover:bg-accent/25 border-accent' : 'bg-white/10 hover:bg-white/15 border-border'}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">{run.model_name}</h3>
        </div>
        <button
          className="w-6 h-6 flex items-center justify-center border-0 bg-transparent text-[var(--text-muted)] cursor-pointer rounded opacity-0 group-hover:opacity-100 transition-all duration-150 hover:text-[var(--danger)] hover:bg-[var(--danger-muted)]"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(run.id);
          }}
          title="Delete run"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <p className="text-[0.8rem] text-[var(--text-secondary)] font-normal">
        {new Date(run.run_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        {" · "}
        Score <span className="font-semibold text-[var(--text-primary)]">{totalScore}</span>
      </p>
    </div>
  );
}
