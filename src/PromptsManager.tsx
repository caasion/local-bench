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
      <h1 className="text-4xl font-normal text-white mb-6">Prompts</h1>

      {/* Search bar */}
      <div className="flex items-center bg-zinc-700 rounded-full px-4 py-2.5 mb-4 gap-2">
        <svg className="w-6 h-6 text-neutral-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-white text-xl placeholder-neutral-400 outline-none flex-1"
        />
      </div>

      {/* Tag filters + Add Prompt button */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          className={`px-3 py-0.5 text-base rounded-lg border ${filterTag === "all" ? "border-fuchsia-500 text-fuchsia-400 bg-zinc-700" : "border-neutral-400 text-white bg-zinc-700"}`}
          onClick={() => setFilterTag("all")}
        >
          All ({prompts.length})
        </button>
        {uniqueTags.map((tag) => (
          <button
            key={tag}
            className={`px-3 py-0.5 text-base rounded-lg border ${filterTag === tag ? "border-fuchsia-500 text-fuchsia-400 bg-zinc-700" : "border-neutral-400 text-white bg-zinc-700"}`}
            onClick={() => setFilterTag(tag)}
          >
            {tag}
          </button>
        ))}
        <button
          className="ml-auto bg-fuchsia-500 text-black font-medium text-lg px-6 py-2 rounded-md"
          onClick={() => setCreating(true)}
        >
          Add Prompt
        </button>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      {/* Create form */}
      {creating && (
        <div className="bg-neutral-700 rounded-lg p-4 mb-4">
          <h3 className="text-white text-lg font-medium mb-3">New Prompt</h3>
          <div className="mb-3">
            <label className="text-neutral-400 text-sm mb-1 block">Use Case Tag</label>
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="e.g. coding, reasoning, chat..."
              list="tag-suggestions"
              className="bg-zinc-700 text-white rounded-lg px-3 py-2 w-full outline-none border border-neutral-600 focus:border-fuchsia-500"
            />
            <datalist id="tag-suggestions">
              {uniqueTags.map((t) => <option key={t} value={t} />)}
            </datalist>
          </div>
          <div className="mb-3">
            <label className="text-neutral-400 text-sm mb-1 block">Content</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={5}
              placeholder="Enter prompt content..."
              autoFocus
              className="bg-zinc-700 text-white rounded-lg px-3 py-2 w-full outline-none border border-neutral-600 focus:border-fuchsia-500 resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button className="bg-fuchsia-500 text-black font-medium px-4 py-2 rounded-md" onClick={handleCreate}>Save</button>
            <button className="bg-zinc-700 text-white px-4 py-2 rounded-lg" onClick={() => { setCreating(false); setError(""); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Prompts list */}
      <div className="flex flex-col gap-4">
        {visible.length === 0 && (
          <p className="text-neutral-400">
            No prompts{filterTag !== "all" ? ` tagged "${filterTag}"` : ""}.
          </p>
        )}
        {visible.map((p) => (
          <div key={p.id} className="bg-neutral-700 rounded-lg overflow-hidden p-3.5">
            <div className="flex items-start justify-between mb-2">
              <span className="bg-zinc-700 text-white text-base px-3 py-0.5 rounded-lg border border-neutral-400">
                {p.use_case_tag}
              </span>
              {editingId !== p.id && (
                <div className="flex gap-2">
                  <button className="bg-zinc-700 text-white font-medium text-lg px-4 py-1.5 rounded-lg" onClick={() => startEdit(p)}>Edit</button>
                  <button className="bg-zinc-700 text-red-400 font-medium text-lg px-4 py-1.5 rounded-lg" onClick={() => handleDelete(p.id)}>Delete</button>
                </div>
              )}
            </div>
            {editingId === p.id ? (
              <>
                <textarea
                  className="w-full bg-zinc-700 text-white text-sm rounded-lg px-3 py-2 outline-none border border-neutral-600 focus:border-fuchsia-500 resize-none"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  autoFocus
                />
                <div className="flex gap-2 mt-2">
                  <button className="bg-fuchsia-500 text-black font-medium px-4 py-2 rounded-md" onClick={() => saveEdit(p.id)}>Save</button>
                  <button className="bg-zinc-700 text-white px-4 py-2 rounded-lg" onClick={cancelEdit}>Cancel</button>
                </div>
              </>
            ) : (
              <p className="text-white text-sm">{p.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
