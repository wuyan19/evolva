use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Mutation {
    instruction: String,
    code: String,
}

#[derive(Serialize)]
struct ExportData {
    version: u32,
    name: String,
    created_at: String,
    active_version: usize,
    versions: Vec<Mutation>,
}

#[derive(Deserialize)]
struct LlmRequest {
    protocol: String,
    api_key: String,
    base_url: String,
    model: String,
    system: String,
    user: String,
}

async fn call_openai(req: &LlmRequest) -> Result<String, String> {
    let client = reqwest::Client::new();
    let mut headers = reqwest::header::HeaderMap::new();

    if !req.api_key.is_empty() {
        headers.insert(
            reqwest::header::AUTHORIZATION,
            format!("Bearer {}", req.api_key).parse().unwrap(),
        );
    }
    headers.insert(
        reqwest::header::CONTENT_TYPE,
        "application/json".parse().unwrap(),
    );

    let url = format!("{}/chat/completions", req.base_url.trim_end_matches('/'));

    let body = serde_json::json!({
        "model": req.model,
        "messages": [
            {"role": "system", "content": req.system},
            {"role": "user", "content": req.user}
        ]
    });

    let resp = client
        .post(&url)
        .headers(headers)
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("API error {}: {}", status, text));
    }

    let json: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;

    json["choices"][0]["message"]["content"]
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "No content in response".to_string())
}

async fn call_anthropic(req: &LlmRequest) -> Result<String, String> {
    let client = reqwest::Client::new();
    let mut headers = reqwest::header::HeaderMap::new();

    if !req.api_key.is_empty() {
        headers.insert("x-api-key", req.api_key.parse().unwrap());
    }
    headers.insert("anthropic-version", "2023-06-01".parse().unwrap());
    headers.insert(
        reqwest::header::CONTENT_TYPE,
        "application/json".parse().unwrap(),
    );

    let base = req
        .base_url
        .trim_end_matches('/')
        .trim_end_matches("/v1");
    let url = format!("{}/v1/messages", base);

    let body = serde_json::json!({
        "model": req.model,
        "max_tokens": 16384,
        "system": req.system,
        "messages": [
            {"role": "user", "content": req.user}
        ]
    });

    let resp = client
        .post(&url)
        .headers(headers)
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("API error {}: {}", status, text));
    }

    let json: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;

    if let Some(content) = json["content"].as_array() {
        for block in content {
            if block["type"] == "text" {
                return block["text"]
                    .as_str()
                    .map(|s| s.to_string())
                    .ok_or_else(|| "No text in content block".to_string());
            }
        }
    }

    Err("No text content block found".to_string())
}

#[tauri::command]
async fn call_llm(req: LlmRequest) -> Result<String, String> {
    match req.protocol.as_str() {
        "anthropic" => call_anthropic(&req).await,
        _ => call_openai(&req).await,
    }
}

#[tauri::command]
fn save_mutation(
    state: tauri::State<'_, Mutex<Vec<Mutation>>>,
    instruction: String,
    code: String,
) -> Result<(), String> {
    let mut list = state.lock().map_err(|e| e.to_string())?;
    list.push(Mutation { instruction, code });
    Ok(())
}

#[tauri::command]
fn get_mutation_count(state: tauri::State<'_, Mutex<Vec<Mutation>>>) -> Result<usize, String> {
    let list = state.lock().map_err(|e| e.to_string())?;
    Ok(list.len())
}

#[tauri::command]
fn export_app(
    state: tauri::State<'_, Mutex<Vec<Mutation>>>,
    path: String,
    name: String,
) -> Result<(), String> {
    let list = state.lock().map_err(|e| e.to_string())?;
    if list.is_empty() {
        return Err("No mutations to export".to_string());
    }
    let active_version = list.len() - 1;
    let data = ExportData {
        version: 1,
        name,
        created_at: chrono::Utc::now().to_rfc3339(),
        active_version,
        versions: list.clone(),
    };
    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    std::fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn import_app(
    state: tauri::State<'_, Mutex<Vec<Mutation>>>,
    path: String,
) -> Result<Vec<String>, String> {
    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let data: serde_json::Value =
        serde_json::from_str(&content).map_err(|e| format!("Invalid JSON: {}", e))?;

    let versions_val = data
        .get("versions")
        .ok_or("Missing 'versions' field")?;
    let versions: Vec<Mutation> =
        serde_json::from_value(versions_val.clone()).map_err(|e| format!("Invalid versions: {}", e))?;

    let active_version = data
        .get("active_version")
        .and_then(|v| v.as_u64())
        .ok_or("Missing 'active_version' field")? as usize;

    if active_version >= versions.len() {
        return Err("Invalid active_version".to_string());
    }

    let codes: Vec<String> = versions[..=active_version]
        .iter()
        .map(|m| m.code.clone())
        .collect();

    let mut list = state.lock().map_err(|e| e.to_string())?;
    *list = versions;

    Ok(codes)
}

#[tauri::command]
fn clear_mutations(state: tauri::State<'_, Mutex<Vec<Mutation>>>) -> Result<(), String> {
    let mut list = state.lock().map_err(|e| e.to_string())?;
    list.clear();
    Ok(())
}

#[tauri::command]
fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .manage(Mutex::new(Vec::<Mutation>::new()))
        .invoke_handler(tauri::generate_handler![
            call_llm,
            save_mutation,
            get_mutation_count,
            export_app,
            import_app,
            clear_mutations,
            get_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
