import { useState } from "react";
import { MOCK_PROMPTS, type MockPrompt } from "./mockData";

const CATEGORIES = ["Coding", "Reasoning", "Writing", "Image analysis"];

function categoryToTag(cat: string): string {
  if (cat === "Image analysis") return "image_analysis";
  return cat.toLowerCase();
}

export function PromptsPage() {
  const [prompts, setPrompts] = useState<MockPrompt[]>([...MOCK_PROMPTS]);
  const [activeCategory, setActiveCategory] = useState("Coding");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [newContent, setNewContent] = useState("");

  const activeTag = categoryToTag(activeCategory);
  const filtered = prompts.filter((p) => {
    const matchesTag = p.use_case_tag === activeTag;
    const matchesSearch = searchQuery === "" || p.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const startEdit = (p: MockPrompt) => {
    setEditingId(p.id);
    setEditContent(p.content);
  };

  const saveEdit = (id: number) => {
    setPrompts((prev) => prev.map((p) => p.id === id ? { ...p, content: editContent } : p));
    setEditingId(null);
    setEditContent("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const deletePrompt = (id: number) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) cancelEdit();
  };

  const handleCreate = () => {
    if (!newContent.trim()) return;
    const newId = Math.max(...prompts.map((p) => p.id), 0) + 1;
    setPrompts((prev) => [...prev, { id: newId, use_case_tag: activeTag, content: newContent.trim() }]);
    setCreating(false);
    setNewContent("");
  };

  return (
    <div className="page">
      <h1 className="page__title">Prompts</h1>

      <div className="mb-4">
        <div className="relative max-w-[400px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="w-full py-[9px] px-3 pl-9 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-primary)] font-[inherit] text-[0.875rem] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:shadow-[0_0_0_2px_var(--accent-muted)]"
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={[
                "px-4 py-1.5 rounded-[var(--radius-sm)] border font-[inherit] text-[0.8rem] font-medium cursor-pointer transition-all duration-150",
                activeCategory === cat
                  ? "bg-[var(--accent)] border-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                  : "bg-transparent border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
              ].join(" ")}
              onClick={() => { setActiveCategory(cat); setSearchQuery(""); }}
            >
              {cat}
            </button>
          ))}
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setCreating(true)}>
          Add Prompt
        </button>
      </div>

      {creating && (
        <div className="bg-[var(--bg-card)] border border-[var(--accent)] rounded-[var(--radius-md)] p-5 mb-5">
          <h3 className="text-[0.95rem] font-semibold text-[var(--text-primary)] mb-3">New {activeCategory} Prompt</h3>
          <textarea
            className="w-full p-3 rounded-[var(--radius-sm)] border border-[var(--accent)] bg-[var(--bg-input)] text-[var(--text-primary)] font-['Courier_New',monospace] text-[0.85rem] resize-y outline-none box-border focus:shadow-[0_0_0_2px_var(--accent-muted)]"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            placeholder="Enter prompt content..."
            autoFocus
          />
          <div className="flex gap-2 mt-2.5">
            <button className="btn btn--primary btn--sm" onClick={handleCreate}>Save</button>
            <button className="btn btn--ghost btn--sm" onClick={() => { setCreating(false); setNewContent(""); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <h2 className="subsection-heading">{activeCategory}</h2>
        {filtered.length === 0 && (
          <p className="empty-state">No prompts found.</p>
        )}
        {filtered.map((p) => (
          <div key={p.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4 px-5">
            {editingId === p.id ? (
              <>
                <textarea
                  className="w-full p-3 rounded-[var(--radius-sm)] border border-[var(--accent)] bg-[var(--bg-input)] text-[var(--text-primary)] font-['Courier_New',monospace] text-[0.85rem] resize-y outline-none box-border focus:shadow-[0_0_0_2px_var(--accent-muted)]"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  autoFocus
                />
                <div className="flex gap-2 mt-2.5">
                  <button className="btn btn--primary btn--sm" onClick={() => saveEdit(p.id)}>Save</button>
                  <button className="btn btn--ghost btn--sm" onClick={cancelEdit}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-[0.85rem] text-[var(--text-secondary)] leading-relaxed mb-3">{p.content}</p>
                <div className="flex gap-2 mt-2.5">
                  <button className="btn btn--accent btn--sm" onClick={() => startEdit(p)}>Edit</button>
                  <button className="btn btn--danger btn--sm" onClick={() => deletePrompt(p.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
