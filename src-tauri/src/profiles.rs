use rusqlite::params;

use crate::{database::DbState, types::Profile};

#[tauri::command]
pub fn get_all_profiles(state: tauri::State<'_, DbState>) -> Result<Vec<Profile>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, name, description, max_ttft_seconds, min_context_window, accuracy_weight, use_case_tag FROM profiles" 
    )
        .map_err(|e| e.to_string())?;

    let profiles = stmt.query_map([], |row| Ok(Profile {
        id: row.get(0)?,
        name: row.get(1)?,
        description: row.get(2)?,
        max_ttft_seconds: row.get(3)?,
        min_context_window: row.get(4)?,
        accuracy_weight: row.get(5)?,
        use_case_tag: row.get(6)?
    }))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(profiles)
}

#[tauri::command]
pub fn create_profile(state: tauri::State<
'_, DbState>, name: String, use_case_tag: String) -> Result<i64, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO profiles (name, use_case_tag) VALUES (?1, ?2)", params![name, use_case_tag],
    )
        .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn update_profile(state: tauri::State<'_, DbState>, profile: Profile) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE profiles SET name=?1, description=?2, max_ttft_seconds=?3, min_context_window=?4, accuracy_weight=?5, use_case_tag=?6 WHERE id=?7", params![
            profile.name,
            profile.description,
            profile.max_ttft_seconds,
            profile.min_context_window,
            profile.accuracy_weight,
            profile.use_case_tag,
            profile.id
        ]
    )
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn delete_profile(state: tauri::State<'_, DbState>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM profiles WHERE id=?1", params![id]
    )
        .map_err(|e| e.to_string())?;

    Ok(())
}