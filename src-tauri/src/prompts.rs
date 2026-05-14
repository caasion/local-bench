use rusqlite::params;

use crate::database::DbState;

#[tauri::command]
pub fn get_all_prompts(state: tauri::State<'_, DbState>) -> Result<Vec<Profile>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, use_case_tag, content FROM prompts"
    )
        .map_err(|e| e.to_string())?;
    
    let prompts = stmt.query_map([], |row| Ok(Prompt {
        id: row.get(0)?,
        use_case_tag: row.get(1)?,
        content: row.get(2)?,
    }))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(prompts)
}

pub fn get_prompt_by_use_case(state: tauri::State<'_, DbState>, use_case_tag: String) -> Result<Vec<Profile>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id, use_case_tag, content FROM prompts WHERE use_case_tag = ?1", params![use_case_tag]
    ).map_err(|e| e.to_string())?;

    let prompts = stmt.query_map([], |row| Ok(Prompt {
        id: row.get(0)?,
        use_case_tag: row.get(1)?,
        content: row.get(2)?,
    }))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(prompts)
}

#[tauri::command]
pub fn create_prompt(state: tauri::State<'_, DbState>, use_case_tag: String, content: String) -> Result<i64, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO profiles (use_case_tag, content) VALUES (?1, ?2)", params![use_case_tag, content],
    )
        .map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn update_prompt_content(state: tauri::State<'_, DbState>, id: String, new_content: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE profiles SET content=?1 WHERE id=?2", params![new_content, id]
    )
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_prompt(state: tauri::State<'_, DbState>, id: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "DELETE FROM profiles WHERE id=?1", params![id]
    )
        .map_err(|e| e.to_string())?;
    Ok(())
}