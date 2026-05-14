use crate::types::{TagsResponse, Model, PsResponse, GenerationResponse, GenerateRequest};

#[tauri::command]
pub async fn get_models() -> Result<Vec<Model>, String> {
    let client = reqwest::Client::new();

    let resp = client
        .get("http://localhost:11434/api/tags")
        .send()
        .await
        .map_err(|e| format!("Request error: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("HTTP error: {}", resp.status()));
    }

    let tags: TagsResponse = resp
        .json()
        .await
        .map_err(|e| format!("Failed to deserialize response: {}", e))?;

    for model in &tags.models {
        println!("{}: {} ({} bytes)", model.name, model.details.quantization_level, model.size);
    }

    Ok(tags.models)
}

pub async fn get_all_running_models() -> Result<PsResponse, String> {
    let client = reqwest::Client::new();

    let resp = client
        .get("http://localhost:11434/api/ps")
        .send()
        .await
        .map_err(|e| format!("Request error: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("HTTP error: {}", resp.status()));
    }

    let result = resp
        .json()
        .await
        .map_err(|e| format!("Failed to deserialize response: {}", e))?;

    Ok(result)
}

pub async fn generate(body: GenerateRequest) -> Result<GenerationResponse, String> {
    let client = reqwest::Client::new();

    let resp = client
        .post("http://localhost:11434/api/generate")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Request error: {}", e))?;

    if !resp.status().is_success() {
        return Err(format!("HTTP error: {}", resp.status()));
    }

    let result: GenerationResponse = resp
        .json()
        .await
        .map_err(|e| format!("Failed to deserialize response: {}", e))?;

    Ok(result)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::GenerateRequest;

    #[tokio::test]
    async fn test_get_models() {
        let result = get_models().await;
        match result {
            Ok(models) => println!("Got {} models", models.len()),
            Err(e) => println!("Error: {}", e),
        }
    }

    #[tokio::test]
    async fn test_generate() {
        let req = GenerateRequest {
            model: "llama3.2:3b".to_string(),
            prompt: Some("hello".to_string()),
            suffix: None,
            images: None,
            format: None,
            system: None,
            stream: false,
            think: None,
            raw: None,
            keep_alive: None,
            options: None,
        };

        let result = generate(req).await;
        match result {
            Ok(response) => println!("{}", response.response.as_deref().unwrap_or("<no response>")),
            Err(e) => println!("Error: {}", e),
        }
    }

    #[tokio::test]
    async fn test_get_all_running_models() {
        let result = get_all_running_models().await;
        match result {
            Ok(result) => println!("{:#?}", result),
            Err(e) => println!("Error: {}", e),
        }
    }
}
