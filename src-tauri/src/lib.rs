mod metrics;
mod database;
mod types;
mod ollama;
mod benchmark;

use tauri::Manager;
use rusqlite::Connection;
use std::sync::Mutex;


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_dir = app.path().app_data_dir().unwrap();
            std::fs::create_dir_all(&app_dir).unwrap();
            let db_path = app_dir.join("localbench.db");
            let conn = Connection::open(db_path).unwrap();
            database::initialize_schema(&conn).unwrap();
            app.manage(database::DbState(Mutex::new(conn)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            ollama::get_models, 
            metrics::get_vram, 
            benchmark::benchmark
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
