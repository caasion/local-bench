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
  const visible = filterTag === "all" ? prompts : prompts.filter((p) => p.use_case_tag === filterTag);

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
    <main className="container prompts-container">
      <h1>Prompts Library</h1>

      <div className="tag-filter">
        <button
          className={`tag-btn${filterTag === "all" ? " active" : ""}`}
          onClick={() => setFilterTag("all")}
        >
          All ({prompts.length})
        </button>
        {uniqueTags.map((tag) => (
          <button
            key={tag}
            className={`tag-btn${filterTag === tag ? " active" : ""}`}
            onClick={() => setFilterTag(tag)}
          >
            {tag} ({prompts.filter((p) => p.use_case_tag === tag).length})
          </button>
        ))}
      </div>

      {error && <div className="error">{error}</div>}

      {creating ? (
        <div className="prompt-form-card">
          <h3>New Prompt</h3>
          <div className="form-group">
            <label>Use Case Tag</label>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="e.g. coding, reasoning, chat..."
              list="tag-suggestions"
            />
            <datalist id="tag-suggestions">
              {uniqueTags.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={5}
              placeholder="Enter prompt content..."
              autoFocus
            />
          </div>
          <div className="form-actions">
            <button className="primary-btn action-btn" onClick={handleCreate}>Save</button>
            <button className="secondary-btn action-btn" onClick={() => { setCreating(false); setError(""); }}>Cancel</button>
          </div>
        </div>
      ) : (
        <button className="primary-btn action-btn new-prompt-btn" onClick={() => setCreating(true)}>
          + New Prompt
        </button>
      )}

      <div className="prompts-list">
        {visible.length === 0 && (
          <p className="empty-state">
            No prompts{filterTag !== "all" ? ` tagged "${filterTag}"` : ""}.
          </p>
        )}
        {visible.map((p) => (
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
            {editingId === p.id ? (
              <>
                <textarea
                  className="inline-edit-area"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  autoFocus
                />
                <div className="form-actions">
                  <button className="primary-btn action-btn" onClick={() => saveEdit(p.id)}>Save</button>
                  <button className="secondary-btn action-btn" onClick={cancelEdit}>Cancel</button>
                </div>
              </>
            ) : (
              <p className="prompt-content">{p.content}</p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
