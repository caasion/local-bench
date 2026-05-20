import { useState } from "react";
import { MOCK_PROFILES, MOCK_HISTORY, type MockProfile } from "./mockData";
import { ResultCard } from "./ResultCard";

export function ProfilesPage() {
  const [profiles, setProfiles] = useState<MockProfile[]>([...MOCK_PROFILES]);
  const [selectedId, setSelectedId] = useState<number>(MOCK_PROFILES[0]?.id ?? 0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<MockProfile | null>(null);

  const selected = profiles.find((p) => p.id === selectedId);
  const latestRun = MOCK_HISTORY[0];

  const startEdit = (p: MockProfile) => {
    setEditingId(p.id);
    setEditDraft({ ...p });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = () => {
    if (!editDraft) return;
    setProfiles((prev) => prev.map((p) => (p.id === editDraft.id ? editDraft : p)));
    cancelEdit();
  };

  const isEditing = editingId === selectedId && editDraft;

  return (
    <div className="page profiles-page">
      <h1 className="page__title">Profiles</h1>

      <div className="profiles-layout">
        <div className="profiles-form-panel">
          <div className="profiles-list-tabs">
            {profiles.map((p) => (
              <button
                key={p.id}
                className={`profiles-tab${selectedId === p.id ? " profiles-tab--active" : ""}`}
                onClick={() => { setSelectedId(p.id); cancelEdit(); }}
              >
                {p.name}
              </button>
            ))}
          </div>

          {selected && !isEditing && (
            <div className="profile-detail-form">
              <div className="form-group">
                <label className="form-label">Profile Name</label>
                <div className="form-value-display">{selected.name}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Use Case Tag</label>
                <div className="form-value-display">{selected.use_case_tag}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <div className="form-value-display">{selected.description || "—"}</div>
              </div>
              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Max TTFT (seconds)</label>
                  <div className="form-value-display">{selected.max_ttft_seconds ?? "—"}</div>
                </div>
                <div className="form-group">
                  <label className="form-label">Min Context Window</label>
                  <div className="form-value-display">{selected.min_context_window ?? "—"}</div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Accuracy Weight</label>
                <div className="form-value-display">{selected.accuracy_weight ?? "—"}</div>
              </div>
              <div className="profile-form-actions">
                <button className="btn btn--primary btn--sm" onClick={() => startEdit(selected)}>Edit</button>
              </div>
            </div>
          )}

          {isEditing && editDraft && (
            <div className="profile-detail-form">
              <div className="form-group">
                <label className="form-label">Profile Name</label>
                <input
                  className="form-input"
                  type="text"
                  value={editDraft.name}
                  onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Use Case Tag</label>
                <input
                  className="form-input"
                  type="text"
                  value={editDraft.use_case_tag}
                  onChange={(e) => setEditDraft({ ...editDraft, use_case_tag: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  className="form-input"
                  type="text"
                  value={editDraft.description ?? ""}
                  onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value || null })}
                />
              </div>
              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label">Max TTFT (seconds)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={editDraft.max_ttft_seconds ?? ""}
                    onChange={(e) => setEditDraft({ ...editDraft, max_ttft_seconds: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Context Window</label>
                  <input
                    className="form-input"
                    type="number"
                    value={editDraft.min_context_window ?? ""}
                    onChange={(e) => setEditDraft({ ...editDraft, min_context_window: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Accuracy Weight</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.1"
                  value={editDraft.accuracy_weight ?? ""}
                  onChange={(e) => setEditDraft({ ...editDraft, accuracy_weight: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
              <div className="profile-form-actions">
                <button className="btn btn--primary btn--sm" onClick={saveEdit}>Save</button>
                <button className="btn btn--ghost btn--sm" onClick={cancelEdit}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="profiles-result-panel">
          {latestRun && <ResultCard run={latestRun} compact />}
        </div>
      </div>
    </div>
  );
}
