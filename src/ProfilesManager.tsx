import { useEffect, useState } from "react";
import type { Profile } from "./types";
import { getAllProfiles, createProfile, updateProfile, deleteProfile } from "./api";


export function ProfilesManager() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Profile | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUseCaseTag, setNewUseCaseTag] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await getAllProfiles();
      setProfiles(data);
    } catch (e) {
      setError(`Failed to load profiles: ${e}`);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p: Profile) => {
    setEditingId(p.id);
    setEditDraft({ ...p });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = async () => {
    if (!editDraft) return;
    setError("");
    try {
      await updateProfile(editDraft);
      cancelEdit();
      await load();
    } catch (e) {
      setError(`Failed to update: ${e}`);
    }
  };

  const handleDelete = async (id: number) => {
    setError("");
    try {
      await deleteProfile(id);
      if (editingId === id) cancelEdit();
      await load();
    } catch (e) {
      setError(`Failed to delete: ${e}`);
    }
  };

  const handleCreate = async () => {
    setError("");
    if (!newName.trim() || !newUseCaseTag.trim()) {
      setError("Name and use case tag are required.");
      return;
    }
    try {
      await createProfile(newName.trim(), newUseCaseTag.trim());
      setCreating(false);
      setNewName("");
      setNewUseCaseTag("");
      await load();
    } catch (e) {
      setError(`Failed to create: ${e}`);
    }
  };

  const patchDraft = (field: keyof Profile, raw: string) => {
    if (!editDraft) return;
    const numericFields: (keyof Profile)[] = ["max_ttft_seconds", "min_context_window", "accuracy_weight"];
    if (numericFields.includes(field)) {
      setEditDraft({ ...editDraft, [field]: raw === "" ? undefined : Number(raw) });
    } else {
      setEditDraft({ ...editDraft, [field]: raw === "" ? undefined : raw });
    }
  };

  return (
    <div className="page">
      <h1 className="page__title">Profiles</h1>

      {error && <div className="text-[var(--danger)] mb-4 text-[0.875rem]">{error}</div>}

      {creating ? (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-5 mb-4">
          <h3 className="text-[1rem] font-semibold text-[var(--text-primary)] mb-4">New Profile</h3>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Daily Driver"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Use Case Tag</label>
            <input
              className="form-input"
              type="text"
              value={newUseCaseTag}
              onChange={(e) => setNewUseCaseTag(e.target.value)}
              placeholder="e.g. coding, reasoning, chat..."
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button className="btn btn--primary btn--sm" onClick={handleCreate}>Save</button>
            <button className="btn btn--ghost btn--sm" onClick={() => { setCreating(false); setError(""); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="btn btn--primary mb-4" onClick={() => setCreating(true)}>
          + New Profile
        </button>
      )}

      <div className="flex flex-col gap-2">
        {profiles.length === 0 && (
          <p className="empty-state">No profiles yet.</p>
        )}
        {profiles.map((p) => (
          <div key={p.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 text-[0.75rem] font-medium rounded-[var(--radius-sm)] bg-[var(--accent-muted)] text-[var(--accent)]">
                {p.use_case_tag}
              </span>
              <div className="flex gap-2">
                {editingId !== p.id && (
                  <>
                    <button className="btn btn--ghost btn--sm" onClick={() => startEdit(p)}>Edit</button>
                    <button className="btn btn--danger btn--sm" onClick={() => handleDelete(p.id)}>Delete</button>
                  </>
                )}
              </div>
            </div>

            {editingId === p.id && editDraft ? (
              <>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" type="text" value={editDraft.name} onChange={(e) => patchDraft("name", e.target.value)} autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" type="text" value={editDraft.description ?? ""} onChange={(e) => patchDraft("description", e.target.value)} placeholder="Optional" />
                </div>
                <div className="form-group">
                  <label className="form-label">Use Case Tag</label>
                  <input className="form-input" type="text" value={editDraft.use_case_tag} onChange={(e) => patchDraft("use_case_tag", e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Max TTFT (seconds)</label>
                  <input className="form-input" type="number" value={editDraft.max_ttft_seconds ?? ""} onChange={(e) => patchDraft("max_ttft_seconds", e.target.value)} placeholder="Optional" />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Context Window</label>
                  <input className="form-input" type="number" value={editDraft.min_context_window ?? ""} onChange={(e) => patchDraft("min_context_window", e.target.value)} placeholder="Optional" />
                </div>
                <div className="form-group">
                  <label className="form-label">Accuracy Weight</label>
                  <input className="form-input" type="number" value={editDraft.accuracy_weight ?? ""} onChange={(e) => patchDraft("accuracy_weight", e.target.value)} placeholder="Optional" />
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="btn btn--primary btn--sm" onClick={saveEdit}>Save</button>
                  <button className="btn btn--ghost btn--sm" onClick={cancelEdit}>Cancel</button>
                </div>
              </>
            ) : (
              <div>
                <p className="text-[0.875rem] font-semibold text-[var(--text-primary)] mb-1">{p.name}</p>
                {p.description && <p className="text-[0.8rem] text-[var(--text-secondary)] mb-1">{p.description}</p>}
                <p className="text-[0.75rem] text-[var(--text-muted)]">
                  {[
                    p.max_ttft_seconds != null && `Max TTFT: ${p.max_ttft_seconds}s`,
                    p.min_context_window != null && `Min ctx: ${p.min_context_window}`,
                    p.accuracy_weight != null && `Accuracy weight: ${p.accuracy_weight}`,
                  ].filter(Boolean).join("  ·  ") || "No constraints set"}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
