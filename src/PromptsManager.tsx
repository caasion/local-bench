import { useState } from "react";

interface Prompt {
  id: number;
  use_case_tag: string;
  content: string;
}

export function PromptsManager() {
  const defaultPrompts: Prompt[] = [
    { id: 1, use_case_tag: "coding", content: "Write a function that takes an array of integers and returns the two numbers that add up to a specific target. Explain your approach and time complexity." },
    { id: 2, use_case_tag: "coding", content: "Refactor the following code to improve readability, performance, and error handling. Explain each change you made and why." },
    { id: 3, use_case_tag: "reasoning", content: "A farmer needs to cross a river with a wolf, a goat, and a cabbage. The boat can only carry the farmer and one item at a time. If left alone, the wolf will eat the goat, and the goat will eat the cabbage. How can the farmer get everything across safely?" },
    { id: 4, use_case_tag: "reasoning", content: "You have 12 identical-looking balls. One is a different weight (heavier or lighter). Using a balance scale exactly 3 times, identify the odd ball and determine if it's heavier or lighter." },
    { id: 5, use_case_tag: "writing", content: "Write a concise product description for a new noise-cancelling headphone aimed at remote workers. The tone should be professional yet approachable, under 150 words." },
    { id: 6, use_case_tag: "writing", content: "Summarize the following article in 3 bullet points, preserving the key arguments and any statistical claims." },
    { id: 7, use_case_tag: "math", content: "Prove that the square root of 2 is irrational. Show each step clearly and explain the proof technique used." },
    { id: 8, use_case_tag: "math", content: "A ball is thrown upward from ground level at 20 m/s. Ignoring air resistance, calculate the maximum height reached and the total time in the air." },
    { id: 9, use_case_tag: "chat", content: "Explain quantum computing to a 10-year-old using simple analogies. Keep it under 100 words." },
    { id: 10, use_case_tag: "chat", content: "I'm feeling overwhelmed with my workload. Can you help me create a prioritization framework to decide what to tackle first?" },
  ];

  const [prompts, setPrompts] = useState<Prompt[]>(defaultPrompts);
  const [filterTag, setFilterTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newContent, setNewContent] = useState("");
  const [error, setError] = useState("");

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

  const saveEdit = (id: number) => {
    setPrompts((prev) => prev.map((p) => p.id === id ? { ...p, content: editContent } : p));
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) cancelEdit();
  };

  const handleCreate = () => {
    setError("");
    if (!newTag.trim() || !newContent.trim()) {
      setError("Tag and content are required.");
      return;
    }
    const nextId = prompts.length > 0 ? Math.max(...prompts.map((p) => p.id)) + 1 : 1;
    setPrompts((prev) => [...prev, { id: nextId, use_case_tag: newTag.trim(), content: newContent.trim() }]);
    setCreating(false);
    setNewTag("");
    setNewContent("");
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

      {/* Tag filter + Add Prompt button */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            className={`px-3 py-1.5 text-[0.8rem] font-medium rounded-[var(--radius-sm)] border transition-colors cursor-pointer ${
              filterTag === "all"
                ? "bg-accent/15 border-accent text-[var(--text-primary)]"
                : "bg-white/10 border-border text-[var(--text-secondary)] hover:bg-white/15 active:bg-white/20"
            }`}
            onClick={() => setFilterTag("all")}
          >
            All ({prompts.length})
          </button>
          {uniqueTags.map((tag) => (
            <button
              key={tag}
              className={`px-3 py-1.5 text-[0.8rem] font-medium rounded-[var(--radius-sm)] border transition-colors cursor-pointer ${
                filterTag === tag
                  ? "bg-accent/15 border-accent text-[var(--text-primary)]"
                  : "bg-white/10 border-border text-[var(--text-secondary)] hover:bg-white/15 active:bg-white/20"
              }`}
              onClick={() => setFilterTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
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
              <span className="px-2.5 py-0.5 text-[0.75rem] font-medium rounded-[var(--radius-sm)] bg-accent/15 border border-accent/50 text-[var(--text-primary)]">
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
