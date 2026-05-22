import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface Prompt {
  id: number;
  use_case_tag: string;
  content: string;
}

export function PromptsManager() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filterTag, setFilterTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newContent, setNewContent] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const data = await invoke<Prompt[]>("get_all_prompts");
      setPrompts(data);
    } catch (e) {
      setError(`Failed to load prompts: ${e}`);
    }
  };

  useEffect(() => { load(); }, []);

  const uniqueTags = Array.from(new Set(prompts.map((p) => p.use_case_tag))).sort();

  const visible = prompts
    .filter((p) => filterTag === "all" || p.use_case_tag === filterTag)
    .filter((p) => !searchQuery ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.use_case_tag.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const startEdit = (p: Prompt) => {
    setEditingId(p.id);
    setEditContent(p.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const saveEdit = async (id: number) => {
    setError("");
    try {
      await invoke("update_prompt_content", { id: id.toString(), newContent: editContent });
      setEditingId(null);
      await load();
    } catch (e) {
      setError(`Failed to update: ${e}`);
    }
  };

  const handleDelete = async (id: number) => {
    setError("");
    try {
      await invoke("delete_prompt", { id: id.toString() });
      if (editingId === id) cancelEdit();
      await load();
    } catch (e) {
      setError(`Failed to delete: ${e}`);
    }
  };

  const handleCreate = async () => {
    setError("");
    if (!newTag.trim() || !newContent.trim()) {
      setError("Tag and content are required.");
      return;
    }
    try {
      await invoke("create_prompt", { useCaseTag: newTag.trim(), content: newContent.trim() });
      setCreating(false);
      setNewTag("");
      setNewContent("");
      await load();
    } catch (e) {
      setError(`Failed to create: ${e}`);
    }
  };

  return (
    <div className="page">
      <h1 className="page__title">Prompts</h1>

      {/* Search bar */}
      <div className="flex items-center bg-[var(--bg-input)] rounded-[var(--radius-sm)] px-4 py-2.5 mb-4 gap-2">
        <svg className="w-5 h-5 text-[var(--text-muted)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-[var(--text-primary)] text-[0.875rem] placeholder-[var(--text-muted)] outline-none flex-1"
        />
      </div>

      {/* Tag filters + Add Prompt button */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          className={[
            "px-3 py-0.5 text-[0.8rem] rounded-[var(--radius-sm)] border font-medium transition-colors",
            filterTag === "all"
              ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-muted)]"
              : "border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-input)] hover:text-[var(--text-primary)]",
          ].join(" ")}
          onClick={() => setFilterTag("all")}
        >
          All ({prompts.length})
        </button>
        {uniqueTags.map((tag) => (
          <button
            key={tag}
            className={[
              "px-3 py-0.5 text-[0.8rem] rounded-[var(--radius-sm)] border font-medium transition-colors",
              filterTag === tag
                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-muted)]"
                : "border-[var(--border)] text-[var(--text-secondary)] bg-[var(--bg-input)] hover:text-[var(--text-primary)]",
            ].join(" ")}
            onClick={() => setFilterTag(tag)}
          >
            {tag}
          </button>
        ))}
        <button
          className="btn btn--primary ml-auto"
          onClick={() => setCreating(true)}
        >
          Add Prompt
        </button>
      </div>

      {error && <div className="text-[var(--danger)] mb-4 text-[0.875rem]">{error}</div>}

      {/* Create form */}
      {creating && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-5 mb-4">
          <h3 className="text-[1rem] font-semibold text-[var(--text-primary)] mb-4">New Prompt</h3>
          <div className="form-group">
            <label className="form-label">Use Case Tag</label>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="e.g. coding, reasoning, chat..."
              list="tag-suggestions"
              className="form-input"
            />
            <datalist id="tag-suggestions">
              {uniqueTags.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
          <div className="form-group">
            <label className="form-label">Content</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={5}
              placeholder="Enter prompt content..."
              autoFocus
              className="form-input resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button className="btn btn--primary btn--sm" onClick={handleCreate}>Save</button>
            <button className="btn btn--ghost btn--sm" onClick={() => { setCreating(false); setError(""); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Prompts list */}
      <div className="flex flex-col gap-2">
        {visible.length === 0 && (
          <p className="empty-state">
            No prompts{filterTag !== "all" ? ` tagged "${filterTag}"` : ""}.
          </p>
        )}
        {visible.map((p) => (
          <div key={p.id} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] p-4">
            <div className="flex items-start justify-between mb-3">
              <span className="px-2.5 py-0.5 text-[0.75rem] font-medium rounded-[var(--radius-sm)] bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent-muted)]">
                {p.use_case_tag}
              </span>
              {editingId !== p.id && (
                <div className="flex gap-2">
                  <button className="btn btn--ghost btn--sm" onClick={() => startEdit(p)}>Edit</button>
                  <button className="btn btn--danger btn--sm" onClick={() => handleDelete(p.id)}>Delete</button>
                </div>
              )}
            </div>
            {editingId === p.id ? (
              <>
                <textarea
                  className="form-input resize-none w-full"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button className="btn btn--primary btn--sm" onClick={() => saveEdit(p.id)}>Save</button>
                  <button className="btn btn--ghost btn--sm" onClick={cancelEdit}>Cancel</button>
                </div>
              </>
            ) : (
              <p className="text-[0.875rem] text-[var(--text-primary)]">{p.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
