import type { MockProfile } from "./mockData";

interface ProfileCardProps {
  profile: MockProfile;
  isEditing: boolean;
  editDraft: MockProfile | null;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDraftChange: (draft: MockProfile) => void;
}

export function ProfileCard({
  profile,
  isEditing,
  editDraft,
  onEdit,
  onSave,
  onCancel,
  onDraftChange,
}: ProfileCardProps) {
  if (isEditing && editDraft) {
    return (
      <div className="profile-card">
        <div className="form-row">
          <label className="form-label">Profile Name</label>
          <input
            className="form-input"
            type="text"
            value={editDraft.name}
            onChange={(e) => onDraftChange({ ...editDraft, name: e.target.value })}
          />
        </div>
        <div className="form-row">
          <label className="form-label">Use Case Tag</label>
          <input
            className="form-input"
            type="text"
            value={editDraft.use_case_tag}
            onChange={(e) => onDraftChange({ ...editDraft, use_case_tag: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input form-textarea"
            value={editDraft.description ?? ""}
            onChange={(e) => onDraftChange({ ...editDraft, description: e.target.value || null })}
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="form-row">
            <label className="form-label">Max TTFT (s)</label>
            <input
              className="form-input"
              type="number"
              value={editDraft.max_ttft_seconds ?? ""}
              onChange={(e) => onDraftChange({ ...editDraft, max_ttft_seconds: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
          <div className="form-row">
            <label className="form-label">Min Context</label>
            <input
              className="form-input"
              type="number"
              value={editDraft.min_context_window ?? ""}
              onChange={(e) => onDraftChange({ ...editDraft, min_context_window: e.target.value ? Number(e.target.value) : null })}
            />
          </div>
        </div>
        <div className="form-row">
          <label className="form-label">Accuracy Weight</label>
          <input
            className="form-input"
            type="number"
            step="0.1"
            value={editDraft.accuracy_weight ?? ""}
            onChange={(e) => onDraftChange({ ...editDraft, accuracy_weight: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
        <div className="flex gap-2 mt-2">
          <button className="btn btn--primary btn--sm" onClick={onSave}>Save</button>
          <button className="btn btn--ghost btn--sm" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-card">
      <div className="form-row">
        <label className="form-label">Profile Name</label>
        <div className="form-value-display">{profile.name}</div>
      </div>
      <div className="form-row">
        <label className="form-label">Use Case Tag</label>
        <div className="form-value-display">{profile.use_case_tag}</div>
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <div className="form-value-display">{profile.description || "—"}</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="form-row">
          <label className="form-label">Max TTFT (s)</label>
          <div className="form-value-display">{profile.max_ttft_seconds ?? "—"}</div>
        </div>
        <div className="form-row">
          <label className="form-label">Min Context</label>
          <div className="form-value-display">{profile.min_context_window ?? "—"}</div>
        </div>
      </div>
      <div className="form-row">
        <label className="form-label">Accuracy Weight</label>
        <div className="form-value-display">{profile.accuracy_weight ?? "—"}</div>
      </div>
      <div className="flex gap-2 mt-2">
        <button className="btn btn--primary btn--sm" onClick={onEdit}>Edit</button>
      </div>
    </div>
  );
}
