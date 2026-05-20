import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Profile {
  id: number;
  name: string;
  description: string | null;
  max_ttft_seconds: number | null;
  min_context_window: number | null;
  accuracy_weight: number | null;
  use_case_tag: string;
}

const EMPTY_DRAFT: Omit<Profile, "id"> = {
  name: "",
  description: null,
  max_ttft_seconds: null,
  min_context_window: null,
  accuracy_weight: null,
  use_case_tag: "",
};

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
      const data = await invoke<Profile[]>("get_all_profiles");
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
      await invoke("update_profile", { profile: editDraft });
      cancelEdit();
      await load();
    } catch (e) {
      setError(`Failed to update: ${e}`);
    }
  };

  const handleDelete = async (id: number) => {
    setError("");
    try {
      await invoke("delete_profile", { id });
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
      await invoke("create_profile", { name: newName.trim(), useCaseTag: newUseCaseTag.trim() });
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
      setEditDraft({ ...editDraft, [field]: raw === "" ? null : Number(raw) });
    } else {
      setEditDraft({ ...editDraft, [field]: raw === "" ? null : raw });
    }
  };

  return (
    <main className="container prompts-container">
      <h1>Profiles</h1>

      {error && <div className="error">{error}</div>}

      {creating ? (
        <div className="prompt-form-card">
          <h3>New Profile</h3>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Daily Driver"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Use Case Tag</label>
            <input
              type="text"
              value={newUseCaseTag}
              onChange={(e) => setNewUseCaseTag(e.target.value)}
              placeholder="e.g. coding, reasoning, chat..."
            />
          </div>
          <div className="form-actions">
            <button className="primary-btn action-btn" onClick={handleCreate}>Save</button>
            <button className="secondary-btn action-btn" onClick={() => { setCreating(false); setError(""); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="primary-btn action-btn new-prompt-btn" onClick={() => setCreating(true)}>
          + New Profile
        </button>
      )}

      <div className="prompts-list">
        {profiles.length === 0 && (
          <p className="empty-state">No profiles yet.</p>
        )}
        {profiles.map((p) => (
          <div key={p.id} className="prompt-card">
            <div className="prompt-card-header">
              <span className="prompt-tag-badge">{p.use_case_tag}</span>
              <div className="prompt-card-actions">
                {editingId !== p.id && (
                  <>
                    <button className="secondary-btn action-btn" onClick={() => startEdit(p)}>Edit</button>
                    <button className="secondary-btn action-btn danger-btn" onClick={() => handleDelete(p.id)}>Delete</button>
                  </>
                )}
              </div>
            </div>

            {editingId === p.id && editDraft ? (
              <>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" value={editDraft.name} onChange={(e) => patchDraft("name", e.target.value)} autoFocus />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input type="text" value={editDraft.description ?? ""} onChange={(e) => patchDraft("description", e.target.value)} placeholder="Optional" />
                </div>
                <div className="form-group">
                  <label>Use Case Tag</label>
                  <input type="text" value={editDraft.use_case_tag} onChange={(e) => patchDraft("use_case_tag", e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Max TTFT (seconds)</label>
                  <input type="number" value={editDraft.max_ttft_seconds ?? ""} onChange={(e) => patchDraft("max_ttft_seconds", e.target.value)} placeholder="Optional" />
                </div>
                <div className="form-group">
                  <label>Min Context Window</label>
                  <input type="number" value={editDraft.min_context_window ?? ""} onChange={(e) => patchDraft("min_context_window", e.target.value)} placeholder="Optional" />
                </div>
                <div className="form-group">
                  <label>Accuracy Weight</label>
                  <input type="number" value={editDraft.accuracy_weight ?? ""} onChange={(e) => patchDraft("accuracy_weight", e.target.value)} placeholder="Optional" />
                </div>
                <div className="form-actions">
                  <button className="primary-btn action-btn" onClick={saveEdit}>Save</button>
                  <button className="secondary-btn action-btn" onClick={cancelEdit}>Cancel</button>
                </div>
              </>
            ) : (
              <div className="prompt-content">
                <strong>{p.name}</strong>
                {p.description && <p>{p.description}</p>}
                <p>
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
    </main>
  );
}
