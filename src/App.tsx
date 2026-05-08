import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

interface Model {
  name: string;
  model: string;
  size: number;
}

interface TestResult {
  model: string;
  tokens_per_second: number;
  ttft_ns: number;
  total_time_ns: number;
  total_tokens: number;
}

interface GpuMetrics {
  vram_used: number;
  vram_total: number;
  utilization: number;
}

const DEFAULT_PROMPT = "hello. how is the weather today? It seems quite bad in my eyes, but I'm not sure if it is actually that bad.";

function App() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [prompt, setPrompt] = useState<string>(DEFAULT_PROMPT);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [vramPeak, setVramPeak] = useState<number | null>(null);
  const [error, setError] = useState<string>("");

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
    setVramPeak(null);

    try {
      // Get initial VRAM
      const initialVram = await invoke<GpuMetrics>("get_vram");
      let peakVram = initialVram.vram_used;

      // Start monitoring VRAM in background
      const vramInterval = setInterval(async () => {
        try {
          const metrics = await invoke<GpuMetrics>("get_vram");
          if (metrics.vram_used > peakVram) {
            peakVram = metrics.vram_used;
          }
        } catch (err) {
          console.error("Failed to get VRAM metrics:", err);
        }
      }, 100);

      // Run test
      const testResult = await invoke<TestResult>("test_model", {
        model: selectedModel,
      });

      clearInterval(vramInterval);

      // Get final VRAM reading
      const finalVram = await invoke<GpuMetrics>("get_vram");
      if (finalVram.vram_used > peakVram) {
        peakVram = finalVram.vram_used;
      }

      setResult(testResult);
      setVramPeak(peakVram);
    } catch (err) {
      setError(`Benchmark failed: ${err}`);
    } finally {
      setIsRunning(false);
    }
  };

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
          <label htmlFor="prompt-input">Prompt:</label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isRunning}
            rows={4}
          />
          <button
            onClick={() => setPrompt(DEFAULT_PROMPT)}
            disabled={isRunning}
            className="secondary-btn"
          >
            Reset to Default
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
          <div className="result-grid">
            <div className="result-item">
              <span className="label">TTFT:</span>
              <span className="value">{formatTime(result.ttft_ns)}</span>
            </div>
            <div className="result-item">
              <span className="label">Throughput:</span>
              <span className="value">{result.tokens_per_second.toFixed(2)} tok/s</span>
            </div>
            {vramPeak !== null && (
              <div className="result-item">
                <span className="label">VRAM Peak:</span>
                <span className="value">{formatBytes(vramPeak)}</span>
              </div>
            )}
            <div className="result-item">
              <span className="label">Total Tokens:</span>
              <span className="value">{result.total_tokens}</span>
            </div>
            <div className="result-item">
              <span className="label">Total Time:</span>
              <span className="value">{formatTime(result.total_time_ns)}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
