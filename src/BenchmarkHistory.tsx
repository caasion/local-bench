import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

interface BenchmarkRunRecord {
  id: number;
  model_name: string;
  run_at: string;
  tokens_per_second: number;
  total_tokens: number;
  vram_peak_mb: number;
  cpu_peak_percent: number;
  ttft_ns_mean: number;
  ttft_ns_std_dev: number;
  total_time_ns_mean: number;
  total_time_ns_std_dev: number;
  likely_ram_spillover: boolean;
}

const formatTime = (ns: number) => (ns / 1e6).toFixed(2) + " ms";

export function BenchmarkHistory() {
  const [runs, setRuns] = useState<BenchmarkRunRecord[]>([]);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      const data = await invoke<BenchmarkRunRecord[]>("get_benchmark_history");
      setRuns(data);
    } catch (err) {
      setError(`Failed to load history: ${err}`);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const deleteRun = async (id: number) => {
    try {
      await invoke("delete_benchmark_run", { id });
      setRuns((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(`Failed to delete: ${err}`);
    }
  };

  return (
    <main className="container">
      <h1>Benchmark History</h1>
      {error && <div className="error">{error}</div>}
      {runs.length === 0 ? (
        <p className="empty-state">No benchmark runs yet. Run a benchmark to see history here.</p>
      ) : (
        <div className="history-list">
          {runs.map((run) => (
            <div key={run.id} className="history-card">
              <div className="history-card-header">
                <span className="history-model">{run.model_name}</span>
                <span className="history-date">
                  {new Date(run.run_at).toLocaleString()}
                </span>
                <button
                  className="secondary-btn danger-btn action-btn"
                  onClick={() => deleteRun(run.id)}
                >
                  Delete
                </button>
              </div>
              <div className="result-grid">
                <div className="result-item">
                  <span className="label">Throughput:</span>
                  <span className="value">{run.tokens_per_second.toFixed(2)} tok/s</span>
                </div>
                <div className="result-item">
                  <span className="label">TTFT:</span>
                  <span className="value">
                    {formatTime(run.ttft_ns_mean)}{" "}
                    <span className="std-dev">± {formatTime(run.ttft_ns_std_dev)}</span>
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">Total Time:</span>
                  <span className="value">
                    {formatTime(run.total_time_ns_mean)}{" "}
                    <span className="std-dev">± {formatTime(run.total_time_ns_std_dev)}</span>
                  </span>
                </div>
                <div className="result-item">
                  <span className="label">Total Tokens:</span>
                  <span className="value">{run.total_tokens}</span>
                </div>
                <div className="result-item">
                  <span className="label">VRAM Peak:</span>
                  <span className="value">{run.vram_peak_mb.toFixed(0)} MB</span>
                </div>
                <div className="result-item">
                  <span className="label">CPU Peak:</span>
                  <span className="value">{run.cpu_peak_percent.toFixed(1)}%</span>
                </div>
                <div className="result-item">
                  <span className="label">RAM Spillover:</span>
                  <span className={`value ${run.likely_ram_spillover ? "spillover-warning" : "spillover-ok"}`}>
                    {run.likely_ram_spillover ? "Likely" : "Unlikely"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
