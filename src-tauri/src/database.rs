use rusqlite::Connection;
use std::path::Path;
use std::sync::Mutex;
use tauri::Manager;

pub struct DbState(pub Mutex<Connection>);

pub fn open_db(app_handle: &tauri::AppHandle) -> rusqlite::Result<Connection> {
    let app_dir = app_handle.path().app_data_dir().unwrap();
    let db_path = app_dir.join("localbench.db");
    let conn = Connection::open(db_path)?;
    Ok(conn)
}

pub fn initialize_schema(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch("
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
            prompt_id INTEGER,
            run_at TEXT NOT NULL,
            mode TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS benchmark_samples (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_id INTEGER NOT NULL REFERENCES benchmark_runs(id),
            ttft_ms REAL,
            tokens_per_second REAL,
            vram_peak_mb INTEGER,
            vram_sustained_mb INTEGER
        );

        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            max_ttft_seconds REAL,
            min_context_window INTEGER,
            accuracy_weight TEXT,
            use_case_tag TEXT
        );

        CREATE TABLE IF NOT EXISTS prompts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            use_case_tag TEXT NOT NULL,
            content TEXT NOT NULL
        );
    ")?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_write_and_read() -> rusqlite::Result<()> {
        let conn = Connection::open_in_memory()?;
        
        initialize_schema(&conn)?;
        
        conn.execute(
            "INSERT INTO models (name, quantization) VALUES (?1, ?2)",
            ("qwen2.5-coder:14b", "Q4_K_M"),
        )?;

        let mut stmt = conn.prepare("SELECT id, name, quantization FROM models")?;

        let models: Vec<_> = stmt.query_map([], |row| {
            Ok((
                row.get::<_, i64>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
            ))
        })?.collect();

        for model in models {
            let (id, name, quant) = model?;
            println!("{id}: {name} ({quant})");
        }

        Ok(())
    }
}