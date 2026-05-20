use rusqlite::params;
use crate::database::{DbState, fetch_benchmark_history};
use crate::types::BenchmarkRunRecord;

#[tauri::command]
pub fn get_benchmark_history(state: tauri::State<'_, DbState>) -> Result<Vec<BenchmarkRunRecord>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    fetch_benchmark_history(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_benchmark_run(state: tauri::State<'_, DbState>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM benchmark_runs WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
