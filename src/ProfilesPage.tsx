import { useState } from "react";
import { MOCK_PROFILES, type MockProfile } from "./mockData";
import { ProfileCard } from "./ProfileCard";

export function ProfilesPage() {
  const [profiles, setProfiles] = useState<MockProfile[]>([...MOCK_PROFILES]);
  const [selectedId, setSelectedId] = useState<number>(MOCK_PROFILES[0]?.id ?? 0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<MockProfile | null>(null);

  const selected = profiles.find((p) => p.id === selectedId);

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

  const isEditing = editingId === selectedId;

  return (
    <div className="page">
      <h1 className="page__title">Profiles</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-1.5 mb-2">
            {profiles.map((p) => (
              <button
                key={p.id}
                className={[
                  "px-4 py-1.5 rounded-[var(--radius-sm)] border font-[inherit] text-[0.8rem] font-medium cursor-pointer transition-all duration-150",
                  selectedId === p.id
                    ? "bg-[var(--accent)] border-[var(--accent)] text-white"
                    : "bg-transparent border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                ].join(" ")}
                onClick={() => { setSelectedId(p.id); cancelEdit(); }}
              >
                {p.name}
              </button>
            ))}
          </div>

          {selected && (
            <ProfileCard
              profile={selected}
              isEditing={isEditing}
              editDraft={editDraft}
              onEdit={() => startEdit(selected)}
              onSave={saveEdit}
              onCancel={cancelEdit}
              onDraftChange={setEditDraft}
            />
          )}
        </div>
      </div>
    </div>
  );
}
