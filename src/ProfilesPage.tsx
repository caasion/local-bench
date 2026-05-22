import { useEffect, useState } from "react";
import type { Profile } from "./types";
import { getAllProfiles, createProfile, updateProfile, deleteProfile } from "./api";
import { ProfileCard } from "./ProfileCard";

export function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTag, setNewTag] = useState("");

  const load = async () => {
    try {
      const data = await getAllProfiles();
      setProfiles(data);
      if (selectedId === null && data.length > 0) setSelectedId(data[0].id);
    } catch (e) {
      setError(`Failed to load profiles: ${e}`);
    }
  };

  useEffect(() => { load(); }, []);

  const selected = profiles.find((p) => p.id === selectedId);

  const handleFieldChange = async (updated: Profile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    try {
      await updateProfile(updated);
    } catch (e) {
      setError(`Failed to save: ${e}`);
      await load();
    }
  };

  const handleDelete = async (id: number) => {
    setError("");
    try {
      await deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      if (selectedId === id) {
        const remaining = profiles.filter((p) => p.id !== id);
        setSelectedId(remaining[0]?.id ?? null);
      }
    } catch (e) {
      setError(`Failed to delete: ${e}`);
    }
  };

  const handleCreate = async () => {
    setError("");
    if (!newName.trim() || !newTag.trim()) {
      setError("Name and use case tag are required.");
      return;
    }
    try {
      const id = await createProfile(newName.trim(), newTag.trim());
      const newProfile: Profile = { id, name: newName.trim(), use_case_tag: newTag.trim() };
      setProfiles((prev) => [...prev, newProfile]);
      setSelectedId(id);
      setCreating(false);
      setNewName("");
      setNewTag("");
    } catch (e) {
      setError(`Failed to create: ${e}`);
    }
  };

  return (
    <div className="page">
      <h1 className="page__title">Profiles</h1>

      {error && <div className="text-[var(--danger)] mb-4 text-[0.875rem]">{error}</div>}

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
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary">{p.name}</h3>
                  <p className="text-[0.8rem] text-text-secondary mt-0.5">{p.use_case_tag}</p>
                </div>
                <button
                  className="w-6 h-6 flex items-center justify-center border-0 bg-transparent text-[var(--text-muted)] cursor-pointer rounded opacity-0 group-hover:opacity-100 transition-all duration-150 hover:text-[var(--danger)] hover:bg-[var(--danger-muted)]"
                  onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                  title="Delete profile"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {creating ? (
            <div className="border border-[var(--border)] rounded-[var(--radius-sm)] px-4 py-3 bg-[var(--bg-card)]">
              <input
                className="form-input mb-2"
                type="text"
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <input
                className="form-input mb-3"
                type="text"
                placeholder="Use case tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              <div className="flex gap-2">
                <button className="btn btn--primary btn--sm" onClick={handleCreate}>Save</button>
                <button className="btn btn--ghost btn--sm" onClick={() => { setCreating(false); setError(""); }}>Cancel</button>
              </div>
            </div>
          ) : (
            <button className="btn btn--ghost btn--sm mt-1" onClick={() => setCreating(true)}>+ New Profile</button>
          )}
        </div>

        <div className="min-h-0 overflow-y-auto max-h-[calc(100vh-140px)]">
          {selected ? (
            <>
              <h1 className="page__title" style={{ marginBottom: 0 }}>{selected.name}</h1>
              <ProfileCard
                profile={selected}
                onFieldChange={handleFieldChange}
              />
            </>
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
