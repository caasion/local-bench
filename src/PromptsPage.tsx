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
    <div className="page prompts-page">
      <h1 className="page__title">Prompts</h1>

      <div className="prompts-toolbar">
        <div className="prompts-search">
          <svg className="prompts-search__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            className="prompts-search__input"
            type="text"
            placeholder="Search prompts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="prompts-tabs-row">
        <div className="prompts-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`prompts-tab${activeCategory === cat ? " prompts-tab--active" : ""}`}
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
        <div className="prompt-create-card">
          <h3 className="prompt-create-card__title">New {activeCategory} Prompt</h3>
          <textarea
            className="prompt-textarea"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={4}
            placeholder="Enter prompt content..."
            autoFocus
          />
          <div className="prompt-card-actions">
            <button className="btn btn--primary btn--sm" onClick={handleCreate}>Save</button>
            <button className="btn btn--ghost btn--sm" onClick={() => { setCreating(false); setNewContent(""); }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="prompts-section">
        <h2 className="subsection-heading">{activeCategory}</h2>
        {filtered.length === 0 && (
          <p className="empty-state">No prompts found.</p>
        )}
        {filtered.map((p) => (
          <div key={p.id} className="prompt-card">
            {editingId === p.id ? (
              <>
                <textarea
                  className="prompt-textarea"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  autoFocus
                />
                <div className="prompt-card-actions">
                  <button className="btn btn--primary btn--sm" onClick={() => saveEdit(p.id)}>Save</button>
                  <button className="btn btn--ghost btn--sm" onClick={cancelEdit}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <p className="prompt-card__content">{p.content}</p>
                <div className="prompt-card-actions">
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
