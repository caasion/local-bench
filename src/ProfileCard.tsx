import type { MockProfile } from "./mockData";

interface ProfileCardProps {
  profile: MockProfile;
  onFieldChange: (updated: MockProfile) => void;
}

export function ProfileCard({ profile, onFieldChange }: ProfileCardProps) {
  const update = (patch: Partial<MockProfile>) => {
    onFieldChange({ ...profile, ...patch });
  };

  return (
    <div className="profile-card">
      <div className="form-row">
        <label className="form-label">Profile Name</label>
        <input
          className="form-input form-input--editable"
          type="text"
          value={profile.name}
          onChange={(e) => update({ name: e.target.value })}
        />
      </div>
      <div className="form-row">
        <label className="form-label">Use Case Tag</label>
        <input
          className="form-input form-input--editable"
          type="text"
          value={profile.use_case_tag}
          onChange={(e) => update({ use_case_tag: e.target.value })}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-input form-input--editable form-textarea"
          value={profile.description ?? ""}
          onChange={(e) => update({ description: e.target.value || null })}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="form-row">
          <label className="form-label">Max TTFT (s)</label>
          <input
            className="form-input form-input--editable"
            type="number"
            value={profile.max_ttft_seconds ?? ""}
            onChange={(e) => update({ max_ttft_seconds: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
        <div className="form-row">
          <label className="form-label">Min Context</label>
          <input
            className="form-input form-input--editable"
            type="number"
            value={profile.min_context_window ?? ""}
            onChange={(e) => update({ min_context_window: e.target.value ? Number(e.target.value) : null })}
          />
        </div>
      </div>
      <div className="form-row">
        <label className="form-label">Accuracy Weight</label>
        <input
          className="form-input form-input--editable"
          type="number"
          step="0.1"
          value={profile.accuracy_weight ?? ""}
          onChange={(e) => update({ accuracy_weight: e.target.value ? Number(e.target.value) : null })}
        />
      </div>
    </div>
  );
}
