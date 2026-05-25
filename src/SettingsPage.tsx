import { useEffect, useState } from "react";
import type { Profile } from "./types";
import { getAllProfiles } from "./api";
import { CustomSelect } from "./CustomSelect";

export function SettingsPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<number | null>(null);
  const [iterations, setIterations] = useState("5");
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    getAllProfiles().then((data) => {
      setProfiles(data);
      if (data.length > 0) setSelectedProfile(data[0].id);
    });
  }, []);

  return (
    <div className="page">
      <h1 className="page__title">Settings</h1>

      <div className="flex flex-col gap-2 max-w-[500px]">
        <div className="flex items-center justify-between px-[18px] py-[14px] bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)]">
          <div className="flex items-center gap-3 text-[var(--text-secondary)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">Default Profile</span>
          </div>
          <CustomSelect
            options={profiles.map((p) => ({ label: p.name, value: String(p.id) }))}
            value={String(selectedProfile ?? "")}
            onChange={(v) => setSelectedProfile(Number(v))}
          />
        </div>

        <div className="flex items-center justify-between px-[18px] py-[14px] bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)]">
          <div className="flex items-center gap-3 text-[var(--text-secondary)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">Benchmark Iterations</span>
          </div>
          <CustomSelect
            options={[
              { label: "3 iterations", value: "3" },
              { label: "5 iterations", value: "5" },
              { label: "10 iterations", value: "10" },
            ]}
            value={iterations}
            onChange={setIterations}
          />
        </div>

        <div className="flex items-center justify-between px-[18px] py-[14px] bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)]">
          <div className="flex items-center gap-3 text-[var(--text-secondary)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span className="text-[0.875rem] font-medium text-[var(--text-primary)]">Auto-save Results</span>
          </div>
          <button
            className={`toggle-switch${autoSave ? " toggle-switch--on" : ""}`}
            onClick={() => setAutoSave(!autoSave)}
          >
            <span className="toggle-switch__thumb" />
          </button>
        </div>
      </div>
    </div>
  );
}
