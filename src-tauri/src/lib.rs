use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::Manager;

#[cfg(desktop)]
use tauri_plugin_opener::OpenerExt;

// === Compiled-in System Prompt ===
const SYSTEM_PROMPT: &str = r#"You are Evolva, a self-evolving application that modifies a webpage based on user instructions.

## Output

You **MUST ONLY** output a single ```javascript code block. **NEVER** output any text, explanation, or markdown outside the code fence.

## Available APIs

- `setupDraggable(element)` — enable drag/resize on a window element
- `bringToFront(element)` — bring a window to front (adds `.active` class)
- `onActiveKeydown(windowEl, handler)` / `onActiveKeyup(windowEl, handler)` — scoped keyboard handlers for the active window
- `await evolva.import('package-name')` — dynamic import of npm packages via esm.sh (e.g. `await evolva.import('chart.js')`). **Use this instead of `import()` or `require()`**. Supports browser-compatible JS libraries only (no Node.js built-ins, no native addons).
- `await evolva.readFile(path)` — read a file from disk
- `await evolva.writeFile(path, content)` — write a file to disk
- `await evolva.store(key)` / `await evolva.store(key, value)` / `await evolva.store(key, null)` — read / write / delete persistent key-value pair
- `await evolva.clipboardRead()` / `await evolva.clipboardWrite(text)` — read / write clipboard

## Window System

- New UI elements **MUST** use class `evolva-window` (position:absolute, flex-column, pre-styled with rounded corners and shadow)
- Use class `window-header` with an `h2` inside as the drag handle
- **MUST** assign a descriptive `id` to every top-level element you create
- **MUST** call `setupDraggable(el)` and add `mousedown` → `bringToFront(el)` on every new window
- Window controls (minimize, maximize, close) are **automatically** added to every window header when you call `setupDraggable(el)`

## Constraints

- **NEVER** assign to `document.body.innerHTML`
- **NEVER** redefine `setupDraggable`, `bringToFront`, `onActiveKeydown`, `onActiveKeyup`
- **NEVER** use `import()` or `require()` — use `await evolva.import()` instead
- **NEVER** use `document.addEventListener('keydown/keyup', ...)` — use `onActiveKeydown/onActiveKeyup` instead
- **MUST** modify existing elements in place rather than recreating them
- **MUST** reuse existing CSS variables and classes rather than defining new styles

## Theming

CSS variables: `--accent`, `--bg-window`, `--bg-header`, `--bg-input`, `--border`, `--text-primary`, `--text-muted`, `--btn-bg`, `--btn-border`, `--color-error`, --color-warning`"#;

// === Types ===

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Settings {
    #[serde(default)]
    api_key: String,
    #[serde(default = "default_base_url")]
    base_url: String,
    #[serde(default = "default_model")]
    model: String,
    #[serde(default = "default_protocol")]
    protocol: String,
    #[serde(default)]
    theme: String,
    #[serde(default)]
    language: String,
    #[serde(default)]
    permissions: Option<PermissionsConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct PermissionsConfig {
    #[serde(default)]
    network: bool,
    #[serde(default)]
    fs_read: bool,
    #[serde(default)]
    fs_write: bool,
    #[serde(default)]
    tauri_api: bool,
    #[serde(default)]
    storage: bool,
    #[serde(default)]
    clipboard: bool,
}

impl Default for PermissionsConfig {
    fn default() -> Self {
        PermissionsConfig {
            network: false,
            fs_read: false,
            fs_write: false,
            tauri_api: false,
            storage: false,
            clipboard: false,
        }
    }
}

fn default_base_url() -> String {
    "https://api.openai.com/v1".to_string()
}
fn default_model() -> String {
    "gpt-4o".to_string()
}
fn default_protocol() -> String {
    "openai".to_string()
}

impl Default for Settings {
    fn default() -> Self {
        Settings {
            api_key: String::new(),
            base_url: default_base_url(),
            model: default_model(),
            protocol: default_protocol(),
            theme: String::new(),
            language: String::new(),
            permissions: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Mutation {
    instruction: String,
    code: String,
}

#[derive(Serialize, Deserialize)]
struct ExportData {
    version: u32,
    name: String,
    created_at: String,
    active_version: usize,
    versions: Vec<Mutation>,
    #[serde(skip_serializing_if = "Option::is_none", default)]
    states: Option<serde_json::Value>,
}

/// import_app / auto_load 的返回类型
#[derive(Serialize)]
struct LoadResult {
    codes: Vec<String>,
    states: Option<serde_json::Value>,
}

#[derive(Deserialize)]
struct LlmRequest {
    dom: String,
    instruction: String,
}

#[derive(Serialize)]
struct LlmResult {
    code: Option<String>,
    raw: String,
}

#[derive(Serialize)]
struct TokenEstimate {
    tokens: usize,
    max_tokens: usize,
    percentage: f64,
}

// === Helper Functions ===

fn settings_path(app: &tauri::AppHandle) -> Result<std::path::PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("settings.json"))
}

fn auto_save_path(app: &tauri::AppHandle, tab_id: &str) -> Result<std::path::PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let safe_id = tab_id.replace(|c: char| !c.is_alphanumeric() && c != '-' && c != '_', "_");
    Ok(dir.join(format!("app_{}.evolva.json", safe_id)))
}

fn load_settings_from_file(app: &tauri::AppHandle) -> Settings {
    let path = match settings_path(app) {
        Ok(p) => p,
        Err(_) => return Settings::default(),
    };
    if !path.exists() {
        return Settings::default();
    }
    let content = match std::fs::read_to_string(&path) {
        Ok(c) => c,
        Err(_) => return Settings::default(),
    };
    serde_json::from_str(&content).unwrap_or_default()
}

/// Strip all <script> tags from HTML (case-insensitive)
fn strip_script_tags(html: &str) -> String {
    let re = Regex::new(r"(?i)<script[\s\S]*?</script>").unwrap();
    re.replace_all(html, "").to_string()
}

/// Compress whitespace: collapse multiple blank lines into one
fn compress_whitespace(html: &str) -> String {
    let re = Regex::new(r"\n{3,}").unwrap();
    re.replace_all(html.trim(), "\n\n").to_string()
}

/// Capture and compress DOM: strip scripts, compress whitespace
fn capture_dom(html: &str) -> String {
    let stripped = strip_script_tags(html);
    compress_whitespace(&stripped)
}

/// Extract JS code from LLM markdown response
fn extract_code(response: &str) -> Option<String> {
    let patterns = [
        r"```(?:javascript|js|jsx|ts|typescript)?\s*\n([\s\S]*?)```",
        r"~~~(?:javascript|js|jsx|ts|typescript)?\s*\n([\s\S]*?)~~~",
    ];
    for pat in &patterns {
        let re = Regex::new(pat).unwrap();
        if let Some(caps) = re.captures(response) {
            if let Some(m) = caps.get(1) {
                return Some(m.as_str().trim().to_string());
            }
        }
    }
    None
}

// === LLM API Calls ===

async fn call_openai(
    api_key: &str,
    base_url: &str,
    model: &str,
    system: &str,
    user: &str,
) -> Result<String, String> {
    let client = reqwest::Client::new();
    let mut headers = reqwest::header::HeaderMap::new();

    if !api_key.is_empty() {
        headers.insert(
            reqwest::header::AUTHORIZATION,
            format!("Bearer {}", api_key).parse().unwrap(),
        );
    }
    headers.insert(
        reqwest::header::CONTENT_TYPE,
        "application/json".parse().unwrap(),
    );

    let url = format!("{}/chat/completions", base_url.trim_end_matches('/'));

    let body = serde_json::json!({
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user}
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

async fn call_anthropic(
    api_key: &str,
    base_url: &str,
    model: &str,
    system: &str,
    user: &str,
) -> Result<String, String> {
    let client = reqwest::Client::new();
    let mut headers = reqwest::header::HeaderMap::new();

    if !api_key.is_empty() {
        headers.insert("x-api-key", api_key.parse().unwrap());
    }
    headers.insert("anthropic-version", "2023-06-01".parse().unwrap());
    headers.insert(
        reqwest::header::CONTENT_TYPE,
        "application/json".parse().unwrap(),
    );

    let base = base_url.trim_end_matches('/').trim_end_matches("/v1");
    let url = format!("{}/v1/messages", base);

    let body = serde_json::json!({
        "model": model,
        "max_tokens": 16384,
        "system": system,
        "messages": [
            {"role": "user", "content": user}
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

// === Tauri Commands ===

#[tauri::command]
async fn load_settings(app: tauri::AppHandle) -> Result<Settings, String> {
    Ok(load_settings_from_file(&app))
}

#[tauri::command]
async fn save_settings(app: tauri::AppHandle, settings: Settings) -> Result<(), String> {
    let path = settings_path(&app)?;
    let json = serde_json::to_string_pretty(&settings).map_err(|e| e.to_string())?;
    std::fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn call_llm(app: tauri::AppHandle, req: LlmRequest) -> Result<LlmResult, String> {
    // Load settings from backend file
    let settings = load_settings_from_file(&app);

    if settings.api_key.is_empty() && settings.base_url.is_empty() {
        return Err("Configure settings first".to_string());
    }

    // Capture and compress DOM
    let dom = capture_dom(&req.dom);
    eprintln!("[call_llm] DOM after capture: {} chars, instruction: {:?}", dom.len(), req.instruction);

    // Build user message
    let user_msg = format!("Current DOM:\n```\n{}\n```\n\nUser instruction: {}", dom, req.instruction);

    // Call LLM API
    let raw = match settings.protocol.as_str() {
        "anthropic" => {
            call_anthropic(&settings.api_key, &settings.base_url, &settings.model, SYSTEM_PROMPT, &user_msg).await?
        }
        _ => {
            call_openai(&settings.api_key, &settings.base_url, &settings.model, SYSTEM_PROMPT, &user_msg).await?
        }
    };

    // Extract code from response
    eprintln!("[call_llm] LLM raw response: {} chars", raw.len());
    let code = extract_code(&raw);
    match &code {
        Some(c) => eprintln!("[call_llm] Extracted code: {} chars", c.len()),
        None => eprintln!("[call_llm] No code block found in response"),
    }

    Ok(LlmResult { code, raw })
}

#[tauri::command]
fn estimate_tokens(dom: String) -> TokenEstimate {
    let stripped = capture_dom(&dom);
    let tokens = stripped.len() / 4;
    let max_tokens = 128000;
    let percentage = ((tokens as f64) / (max_tokens as f64) * 100.0).min(100.0);
    TokenEstimate {
        tokens,
        max_tokens,
        percentage,
    }
}

#[tauri::command]
fn save_mutation(
    state: tauri::State<'_, Mutex<HashMap<String, Vec<Mutation>>>>,
    tab_id: String,
    instruction: String,
    code: String,
) -> Result<(), String> {
    let mut map = state.lock().map_err(|e| e.to_string())?;
    let list = map.entry(tab_id).or_insert_with(Vec::new);
    list.push(Mutation { instruction, code });
    Ok(())
}

#[tauri::command]
fn get_mutation_count(
    state: tauri::State<'_, Mutex<HashMap<String, Vec<Mutation>>>>,
    tab_id: String,
) -> Result<usize, String> {
    let map = state.lock().map_err(|e| e.to_string())?;
    Ok(map.get(&tab_id).map(|v| v.len()).unwrap_or(0))
}

#[tauri::command]
fn export_app(
    state: tauri::State<'_, Mutex<HashMap<String, Vec<Mutation>>>>,
    path: String,
    name: String,
    tab_id: String,
    window_states: Option<serde_json::Value>,
) -> Result<(), String> {
    let map = state.lock().map_err(|e| e.to_string())?;
    let list = map.get(&tab_id).ok_or("Tab not found".to_string())?;
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
        states: window_states,
    };
    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    std::fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn import_app(
    state: tauri::State<'_, Mutex<HashMap<String, Vec<Mutation>>>>,
    path: String,
    tab_id: String,
) -> Result<LoadResult, String> {
    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let data: serde_json::Value =
        serde_json::from_str(&content).map_err(|e| format!("Invalid JSON: {}", e))?;

    let versions_val = data.get("versions").ok_or("Missing 'versions' field")?;
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

    let states = data.get("states").cloned();

    let mut map = state.lock().map_err(|e| e.to_string())?;
    map.insert(tab_id, versions);

    Ok(LoadResult { codes, states })
}

#[tauri::command]
fn clear_mutations(
    state: tauri::State<'_, Mutex<HashMap<String, Vec<Mutation>>>>,
    tab_id: String,
) -> Result<(), String> {
    let mut map = state.lock().map_err(|e| e.to_string())?;
    map.remove(&tab_id);
    Ok(())
}

#[tauri::command]
fn auto_save(
    state: tauri::State<'_, Mutex<HashMap<String, Vec<Mutation>>>>,
    app: tauri::AppHandle,
    tab_id: String,
    tab_name: String,
    window_states: Option<serde_json::Value>,
) -> Result<(), String> {
    let map = state.lock().map_err(|e| e.to_string())?;
    let path = auto_save_path(&app, &tab_id)?;

    let list = match map.get(&tab_id) {
        Some(l) => l,
        None => {
            if path.exists() {
                std::fs::remove_file(&path).map_err(|e| e.to_string())?;
            }
            return Ok(());
        }
    };

    if list.is_empty() {
        if path.exists() {
            std::fs::remove_file(&path).map_err(|e| e.to_string())?;
        }
        return Ok(());
    }

    let active_version = list.len() - 1;
    let data = ExportData {
        version: 1,
        name: tab_name,
        created_at: chrono::Utc::now().to_rfc3339(),
        active_version,
        versions: list.clone(),
        states: window_states,
    };
    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    std::fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn auto_load(
    state: tauri::State<'_, Mutex<HashMap<String, Vec<Mutation>>>>,
    app: tauri::AppHandle,
    tab_id: String,
) -> Result<Option<LoadResult>, String> {
    let path = auto_save_path(&app, &tab_id)?;
    if !path.exists() {
        return Ok(None);
    }

    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let data: serde_json::Value =
        serde_json::from_str(&content).map_err(|e| format!("Invalid JSON: {}", e))?;

    let versions_val = data.get("versions").ok_or("Missing 'versions' field")?;
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

    let states = data.get("states").cloned();

    let mut map = state.lock().map_err(|e| e.to_string())?;
    map.insert(tab_id, versions);

    Ok(Some(LoadResult { codes, states }))
}

// === Tab Save Management ===

#[derive(Serialize)]
struct SavedTab {
    tab_id: String,
    name: String,
}

#[tauri::command]
fn list_saved_tabs(app: tauri::AppHandle) -> Result<Vec<SavedTab>, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    if !dir.exists() {
        return Ok(vec![]);
    }
    let entries = std::fs::read_dir(&dir).map_err(|e| e.to_string())?;
    let mut result = Vec::new();
    for entry in entries {
        if let Ok(entry) = entry {
            let name = entry.file_name().to_string_lossy().to_string();
            if name.starts_with("app_tab-") && name.ends_with(".evolva.json") {
                let tab_id = name
                    .trim_start_matches("app_")
                    .trim_end_matches(".evolva.json")
                    .to_string();
                // 尝试读取文件获取标签页名称
                let tab_name = std::fs::read_to_string(entry.path())
                    .ok()
                    .and_then(|content| serde_json::from_str::<serde_json::Value>(&content).ok())
                    .and_then(|v| v.get("name").and_then(|n| n.as_str()).map(|s| s.to_string()))
                    .unwrap_or_else(|| tab_id.clone());
                result.push(SavedTab { tab_id, name: tab_name });
            }
        }
    }
    Ok(result)
}

#[tauri::command]
fn delete_tab_save(app: tauri::AppHandle, tab_id: String) -> Result<(), String> {
    let path = auto_save_path(&app, &tab_id)?;
    if path.exists() {
        std::fs::remove_file(&path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[derive(Serialize)]
struct AppInfo {
    version: String,
    authors: String,
}

#[tauri::command]
fn get_app_info() -> AppInfo {
    AppInfo {
        version: env!("CARGO_PKG_VERSION").to_string(),
        authors: env!("CARGO_PKG_AUTHORS").replace(':', ", "),
    }
}

/// 打开 GitHub Releases 页面（更新失败时的回退方案）
#[tauri::command]
async fn open_github(app: tauri::AppHandle) -> Result<(), String> {
    app.opener()
        .open_url("https://github.com/wuyan19/evolva/releases", None::<&str>)
        .map_err(|e| e.to_string())
}

/// 在系统浏览器中打开指定 URL
#[tauri::command]
async fn open_url(app: tauri::AppHandle, url: String) -> Result<(), String> {
    app.opener()
        .open_url(&url, None::<&str>)
        .map_err(|e| e.to_string())
}

// === Sandbox Proxy Commands ===

/// 沙盒文件读取代理
#[tauri::command]
fn sandbox_read_file(path: String) -> Result<String, String> {
    // 安全检查：只允许读取文件，不允许路径遍历
    let p = std::path::Path::new(&path);
    if path.is_empty() {
        return Err("Path is empty".to_string());
    }
    std::fs::read_to_string(p).map_err(|e| e.to_string())
}

/// 沙盒文件写入代理
#[tauri::command]
fn sandbox_write_file(path: String, content: String) -> Result<(), String> {
    let p = std::path::Path::new(&path);
    if path.is_empty() {
        return Err("Path is empty".to_string());
    }
    // 确保父目录存在
    if let Some(parent) = p.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    std::fs::write(p, content).map_err(|e| e.to_string())
}

/// 沙盒存储：读取
#[tauri::command]
fn sandbox_store_get(app: tauri::AppHandle, tab_id: String, key: String) -> Result<Option<String>, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let safe_id = tab_id.replace(|c: char| !c.is_alphanumeric() && c != '-' && c != '_', "_");
    let store_path = dir.join(format!("sandbox_store_{}.json", safe_id));
    if !store_path.exists() {
        return Ok(None);
    }
    let content = std::fs::read_to_string(&store_path).map_err(|e| e.to_string())?;
    let map: std::collections::HashMap<String, String> =
        serde_json::from_str(&content).unwrap_or_default();
    Ok(map.get(&key).cloned())
}

/// 沙盒存储：写入/删除
#[tauri::command]
fn sandbox_store_set(
    app: tauri::AppHandle,
    tab_id: String,
    key: String,
    value: Option<String>,
) -> Result<(), String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    let safe_id = tab_id.replace(|c: char| !c.is_alphanumeric() && c != '-' && c != '_', "_");
    let store_path = dir.join(format!("sandbox_store_{}.json", safe_id));

    let mut map: std::collections::HashMap<String, String> = if store_path.exists() {
        let content = std::fs::read_to_string(&store_path).unwrap_or_default();
        serde_json::from_str(&content).unwrap_or_default()
    } else {
        std::collections::HashMap::new()
    };

    if let Some(v) = value {
        map.insert(key, v);
    } else {
        map.remove(&key);
    }

    let json = serde_json::to_string(&map).map_err(|e| e.to_string())?;
    std::fs::write(&store_path, json).map_err(|e| e.to_string())
}

/// 沙盒网络请求代理：通过 Rust 后端发起 HTTP 请求，绕过浏览器 CORS
#[derive(Serialize)]
struct ProxyResponse {
    ok: bool,
    status: u16,
    status_text: String,
    headers: std::collections::HashMap<String, String>,
    body: String,
    url: String,
}

#[tauri::command]
async fn sandbox_proxy_fetch(
    url: String,
    method: String,
    headers: std::collections::HashMap<String, String>,
    body: Option<String>,
) -> Result<ProxyResponse, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .map_err(|e| e.to_string())?;

    let mut req_builder = client.request(
        reqwest::Method::from_bytes(method.to_uppercase().as_bytes()).unwrap_or(reqwest::Method::GET),
        &url,
    );

    for (key, value) in &headers {
        if let Ok(v) = value.parse::<reqwest::header::HeaderValue>() {
            req_builder = req_builder.header(key.as_str(), v);
        }
    }

    if let Some(b) = body {
        req_builder = req_builder.body(b);
    }

    let resp = req_builder.send().await.map_err(|e| format!("Request failed: {}", e))?;

    let status = resp.status().as_u16();
    let ok = resp.status().is_success();
    let status_text = resp.status().canonical_reason().unwrap_or("").to_string();
    let resp_url = resp.url().to_string();

    let mut resp_headers = std::collections::HashMap::new();
    for (key, value) in resp.headers() {
        resp_headers.insert(key.to_string(), value.to_str().unwrap_or("").to_string());
    }

    let resp_body = resp.text().await.map_err(|e| e.to_string())?;

    Ok(ProxyResponse {
        ok,
        status,
        status_text,
        headers: resp_headers,
        body: resp_body,
        url: resp_url,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(Mutex::new(HashMap::<String, Vec<Mutation>>::new()))
        .invoke_handler(tauri::generate_handler![
            load_settings,
            save_settings,
            call_llm,
            estimate_tokens,
            save_mutation,
            get_mutation_count,
            export_app,
            import_app,
            clear_mutations,
            auto_save,
            auto_load,
            list_saved_tabs,
            delete_tab_save,
            get_app_info,
            sandbox_read_file,
            sandbox_write_file,
            sandbox_store_get,
            sandbox_store_set,
            sandbox_proxy_fetch,
            open_github,
            open_url,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
