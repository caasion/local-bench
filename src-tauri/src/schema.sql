CREATE TABLE IF NOT EXISTS models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    parameter_count INTEGER,
    quantization TEXT,
    context_window INTEGER,
    family TEXT 
);

CREATE TABLE IF NOT EXISTS benchmark_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER NOT NULL REFERENCES models(id),
    run_at TEXT NOT NULL,
    mode TEXT,
    likely_ram_spillover BOOLEAN,
    tps REAL,
    tps_std_dev REAL,
    ttft_ns_mean REAL,
    ttft_ns_std_dev REAL,
    model_load_time_ns REAL,
    vram_peak_mb REAL,
    vram_avg_mb REAL,
    cpu_peak_percent REAL,
    cpu_avg_percent REAL,
    gpu_peak_percent REAL,
    gpu_avg_percent REAL
);

CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    max_ttft_seconds REAL,
    min_context_window INTEGER,
    accuracy_weight INTEGER,
    use_case_tag TEXT
);

CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    use_case_tag TEXT NOT NULL,
    content TEXT NOT NULL
);