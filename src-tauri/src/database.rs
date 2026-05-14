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