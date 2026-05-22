import { useState } from "react";
import { MOCK_PROFILES, type MockProfile } from "./mockData";
import { ProfileCard } from "./ProfileCard";

export function ProfilesPage() {
  const [profiles, setProfiles] = useState<MockProfile[]>([...MOCK_PROFILES]);
  const [selectedId, setSelectedId] = useState<number>(MOCK_PROFILES[0]?.id ?? 0);

  const selected = profiles.find((p) => p.id === selectedId);

  const handleFieldChange = (updated: MockProfile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  return (
    <div className="page">
      <h1 className="page__title">Profiles</h1>

      <div className="grid grid-cols-[280px_1fr] gap-6 min-h-0">
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[calc(100vh-140px)] pr-1">
          {profiles.map((p) => (
            <div
              key={p.id}
              className={`group border rounded-[var(--radius-sm)] px-6 py-4 cursor-pointer transition-all duration-150 ${
                selectedId === p.id
                  ? "bg-accent/20 hover:bg-accent/25 border-accent"
                  : "bg-white/10 hover:bg-white/15 border-border"
              }`}
              onClick={() => setSelectedId(p.id)}
            >
              <h3 className="font-semibold text-text-primary">{p.name}</h3>
              <p className="text-[0.8rem] text-text-secondary mt-0.5">{p.use_case_tag}</p>
            </div>
          ))}
        </div>

        <div className="min-h-0 overflow-y-auto max-h-[calc(100vh-140px)]">
          {selected ? (
            <ProfileCard
              profile={selected}
              onFieldChange={handleFieldChange}
            />
          ) : (
            <div className="flex items-center justify-center h-[200px]">
              <p className="empty-state">Select a profile to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
