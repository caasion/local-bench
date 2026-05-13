use rusqlite::Connection;
use std::path::Path;
use tauri::Manager;

fn open_db(app_handle: &tauri::AppHandle) -> rusqlite::Result<Connection> {
    let app_dir = app_handle.path().app_data_dir().unwrap();
    let db_path = app_dir.join("localbench.db");
    let conn = Connection::open(db_path)?;
    Ok(conn)
}
