use rusqlite::{Connection, params};
use std::sync::Mutex;
use tauri::Manager;
use crate::types::{BenchmarkResult, BenchmarkRunRecord};

pub struct DbState(pub Mutex<Connection>);

pub fn upsert_model(conn: &Connection, name: &str) -> rusqlite::Result<i64> {
    conn.execute(
        "INSERT OR IGNORE INTO models (name) VALUES (?1)",
        params![name],
    )?;
    conn.query_row(
        "SELECT id FROM models WHERE name = ?1",
        params![name],
        |row| row.get(0),
    )
}

pub fn save_benchmark_result(conn: &Connection, result: &BenchmarkResult) -> rusqlite::Result<i64> {
    let model_id = upsert_model(conn, &result.model)?;
    conn.execute(
        "INSERT INTO benchmark_runs \
         (model_id, run_at, mode, likely_ram_spillover, tps, tps_std_dev, \
          ttft_ns_mean, ttft_ns_std_dev, model_load_time_ns, \
          vram_peak_mb, vram_avg_mb, cpu_peak_percent, cpu_avg_percent, \
          gpu_peak_percent, gpu_avg_percent) \
         VALUES (?1, strftime('%Y-%m-%dT%H:%M:%SZ', 'now'), 'standard', ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)",
        params![
            model_id,
            result.likely_ram_spillover,
            result.tps,
            result.tps_std_dev,
            result.ttft_ns_mean,
            result.ttft_ns_std_dev,
            result.model_load_time_ns as f64,
            result.vram_peak_mb as f64,
            result.vram_avg_mb,
            result.cpu_peak_percent as f64,
            result.cpu_avg_percent as f64,
            result.gpu_peak_percent as f64,
            result.gpu_avg_percent as f64,
        ],
    )?;
    Ok(conn.last_insert_rowid())
}

pub fn fetch_benchmark_history(conn: &Connection) -> rusqlite::Result<Vec<BenchmarkRunRecord>> {
    let mut stmt = conn.prepare(
        "SELECT r.id, m.name, r.run_at, \
         COALESCE(r.tps, 0.0), COALESCE(r.tps_std_dev, 0.0), \
         COALESCE(r.ttft_ns_mean, 0.0), COALESCE(r.ttft_ns_std_dev, 0.0), \
         COALESCE(r.model_load_time_ns, 0.0), \
         COALESCE(r.vram_peak_mb, 0.0), COALESCE(r.vram_avg_mb, 0.0), \
         COALESCE(r.cpu_peak_percent, 0.0), COALESCE(r.cpu_avg_percent, 0.0), \
         COALESCE(r.gpu_peak_percent, 0.0), COALESCE(r.gpu_avg_percent, 0.0), \
         COALESCE(r.likely_ram_spillover, 0) \
         FROM benchmark_runs r \
         JOIN models m ON r.model_id = m.id \
         ORDER BY r.run_at DESC",
    )?;

    let records = stmt
        .query_map([], |row| {
            Ok(BenchmarkRunRecord {
                id: row.get(0)?,
                model_name: row.get(1)?,
                run_at: row.get(2)?,
                tps: row.get(3)?,
                tps_std_dev: row.get(4)?,
                ttft_ns_mean: row.get(5)?,
                ttft_ns_std_dev: row.get(6)?,
                model_load_time_ns: row.get(7)?,
                vram_peak_mb: row.get(8)?,
                vram_avg_mb: row.get(9)?,
                cpu_peak_percent: row.get(10)?,
                cpu_avg_percent: row.get(11)?,
                gpu_peak_percent: row.get(12)?,
                gpu_avg_percent: row.get(13)?,
                likely_ram_spillover: row.get(14)?,
            })
        })?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    Ok(records)
}

pub fn open_db(app_handle: &tauri::AppHandle) -> rusqlite::Result<Connection> {
    let app_dir = app_handle.path().app_data_dir().unwrap();
    let db_path = app_dir.join("localbench.db");
    let conn = Connection::open(db_path)?;
    Ok(conn)
}

const SCHEMA: &str = include_str!("schema.sql");
const SEEDS: &str = include_str!("seeds.sql");

pub fn initialize_schema(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(SCHEMA)?;
    conn.execute_batch(SEEDS)?;
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