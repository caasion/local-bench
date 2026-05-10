import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

interface Model {
  name: string;
  model: string;
  size: number;
}

interface PromptResult {
  prompt: string;
  tokens_per_second_mean: number;
  tokens_per_second_std_dev: number;
  ttft_ns_mean: number;
  ttft_ns_std_dev: number;
  total_time_ns_mean: number;
  total_time_ns_std_dev: number;
  total_tokens: number;
}

interface BenchmarkResult {
  model: string;
  likely_ram_spillover: boolean;
  tokens_per_second: number;
  ttft_ns: number;
  total_time_ns: number;
  total_tokens: number;
  vram_peak_mb: number;
  cpu_peak_percent: number;
  tokens_per_second_mean: number;
  tokens_per_second_std_dev: number;
  ttft_ns_mean: number;
  ttft_ns_std_dev: number;
  total_time_ns_mean: number;
  total_time_ns_std_dev: number;
  per_prompt: PromptResult[];
}

const DEFAULT_PROMPT = "hello. how is the weather today? It seems quite bad in my eyes, but I'm not sure if it is actually that bad.";

function App() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [prompts, setPrompts] = useState<string[]>([DEFAULT_PROMPT]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [error, setError] = useState<string>("");
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelList = await invoke<Model[]>("get_models");
        setModels(modelList);
        if (modelList.length > 0) {
          setSelectedModel(modelList[0].name);
        }
      } catch (err) {
        setError(`Failed to load models: ${err}`);
      }
    };

    loadModels();
  }, []);

  const runBenchmark = async () => {
    if (!selectedModel) {
      setError("Please select a model");
      return;
    }

    setIsRunning(true);
    setError("");
    setResult(null);
    setExpandedPrompts(new Set());

    try {
      const testResult = await invoke<BenchmarkResult>("benchmark", {
        input: { model: selectedModel, prompts, times: 5 },
      });

      setResult(testResult);
    } catch (err) {
      setError(`Benchmark failed: ${err}`);
    } finally {
      setIsRunning(false);
    }
  };

  const addPrompt = () => setPrompts((prev) => [...prev, ""]);

  const removePrompt = (i: number) =>
    setPrompts((prev) => prev.filter((_, idx) => idx !== i));

  const updatePrompt = (i: number, value: string) =>
    setPrompts((prev) => prev.map((p, idx) => (idx === i ? value : p)));

  const togglePromptExpand = (i: number) =>
    setExpandedPrompts((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatTime = (ns: number) => {
    const ms = ns / 1e6;
    return ms.toFixed(2) + " ms";
  };

  const statRow = (label: string, mean: number, std: number, fmt: (n: number) => string) => (
    <div className="result-item" title={`Mean: ${fmt(mean)}  ±  ${fmt(std)} std dev`}>
      <span className="label">{label}:</span>
      <span className="value">{fmt(mean)} <span className="std-dev">± {fmt(std)}</span></span>
    </div>
  );

  return (
    <main className="container">
      <h1>Model Benchmark</h1>

      <div className="benchmark-form">
        <div className="form-group">
          <label htmlFor="model-select">Model:</label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isRunning}
          >
            {models.map((model) => (
              <option key={model.name} value={model.name}>
                {model.name} ({formatBytes(model.size)})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Prompts:</label>
          {prompts.map((p, i) => (
            <div key={i} className="prompt-row">
              <textarea
                value={p}
                onChange={(e) => updatePrompt(i, e.target.value)}
                disabled={isRunning}
                rows={3}
                placeholder={`Prompt ${i + 1}`}
              />
              <div className="prompt-row-actions">
                <button
                  onClick={() => updatePrompt(i, DEFAULT_PROMPT)}
                  disabled={isRunning}
                  className="secondary-btn"
                >
                  Reset
                </button>
                {prompts.length > 1 && (
                  <button
                    onClick={() => removePrompt(i)}
                    disabled={isRunning}
                    className="secondary-btn danger-btn"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <button onClick={addPrompt} disabled={isRunning} className="secondary-btn">
            + Add Prompt
          </button>
        </div>

        <button
          onClick={runBenchmark}
          disabled={isRunning || !selectedModel}
          className="primary-btn"
        >
          {isRunning ? "Running Benchmark..." : "Run Benchmark"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <div className="results">
          <h2>Results for {result.model}</h2>

          <h3>Overall ({result.per_prompt.length} prompt{result.per_prompt.length !== 1 ? "s" : ""}, 5 iterations each)</h3>
          <div className="result-grid">
            {statRow("TTFT", result.ttft_ns_mean, result.ttft_ns_std_dev, formatTime)}
            {statRow("Throughput", result.tokens_per_second_mean, result.tokens_per_second_std_dev, (n) => n.toFixed(2) + " tok/s")}
            {statRow("Total Time", result.total_time_ns_mean, result.total_time_ns_std_dev, formatTime)}
            <div className="result-item">
              <span className="label">Total Tokens:</span>
              <span className="value">{result.total_tokens}</span>
            </div>
            <div className="result-item">
              <span className="label">VRAM Peak:</span>
              <span className="value">{result.vram_peak_mb} MB</span>
            </div>
            <div className="result-item">
              <span className="label">CPU Peak:</span>
              <span className="value">{result.cpu_peak_percent.toFixed(1)}%</span>
            </div>
            <div className="result-item">
              <span className="label">RAM Spillover:</span>
              <span className={`value ${result.likely_ram_spillover ? "spillover-warning" : "spillover-ok"}`}>
                {result.likely_ram_spillover ? "Likely" : "Unlikely"}
              </span>
            </div>
          </div>

          {result.per_prompt.length > 1 && (
            <>
              <h3>Per Prompt</h3>
              {result.per_prompt.map((pr: PromptResult, i: number) => (
                <div key={i} className="prompt-result">
                  <button
                    className="prompt-result-header"
                    onClick={() => togglePromptExpand(i)}
                  >
                    <span className="prompt-label">
                      Prompt {i + 1}: <em>{pr.prompt.length > 80 ? pr.prompt.slice(0, 80) + "…" : pr.prompt}</em>
                    </span>
                    <span className="prompt-summary">
                      {pr.tokens_per_second_mean.toFixed(1)} tok/s · {formatTime(pr.ttft_ns_mean)} TTFT
                    </span>
                    <span className="expand-icon">{expandedPrompts.has(i) ? "▲" : "▼"}</span>
                  </button>
                  {expandedPrompts.has(i) && (
                    <div className="result-grid prompt-result-body">
                      {statRow("TTFT", pr.ttft_ns_mean, pr.ttft_ns_std_dev, formatTime)}
                      {statRow("Throughput", pr.tokens_per_second_mean, pr.tokens_per_second_std_dev, (n) => n.toFixed(2) + " tok/s")}
                      {statRow("Total Time", pr.total_time_ns_mean, pr.total_time_ns_std_dev, formatTime)}
                      <div className="result-item">
                        <span className="label">Total Tokens:</span>
                        <span className="value">{pr.total_tokens}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </main>
  );
}

export default App;
