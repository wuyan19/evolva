use serde::Deserialize;

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![call_llm])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
