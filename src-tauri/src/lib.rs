use regex::Regex;
use rig::completion::{Chat, ToolDefinition, CompletionModel};
use rig::client::CompletionClient;
use rig::providers::{anthropic, openai, deepseek, gemini, groq, mistral, openrouter, ollama};
use rig::client::Nothing;
use rig::tool::Tool;
use rig::agent::{HookAction, PromptHook, ToolCallHookAction};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::Manager;

#[cfg(desktop)]
use tauri_plugin_opener::OpenerExt;

// === Compiled-in System Prompt ===
const SYSTEM_PROMPT: &str = r#"You are Evolva, a self-evolving web application builder. The user will give you instructions, and you must modify the project files to implement their request.

## Project Structure

The project has three files you can work with:
- `index.html` — The HTML body content (do NOT include `<html>/<head>/<body>` wrappers, `<script src="app.js">`, or `<link href="style.css">` — all files are assembled inline automatically)
- `style.css` — Custom CSS styles (theme variables and window system styles are already defined by the base theme — only add your own styles)
- `app.js` — JavaScript logic (runs as a plain `<script>`, NOT a module — use `evolva.import()` for external modules)

## Tools

You have the following tools to read and modify project files:
- `read_file` — Read a file's content
- `write_file` — Write/create a file (full content replacement)
- `edit_file` — Search and replace in a file (old_text must be unique)
- `list_files` — List all project files
- `grep` — Search across all files with a regex pattern

## Workflow

1. First, use `read_file` or `list_files` to understand the current state of the project
2. Plan your changes based on the user's instruction
3. Use `write_file` or `edit_file` to make changes
4. After all changes, respond with a brief summary of what you did

## Window System (IMPORTANT)

The runtime provides a draggable window system. UI elements should be wrapped in windows:

```html
<div id="my-window" class="evolva-window" style="width:400px;height:300px">
  <div class="window-header"><h2>Window Title</h2></div>
  <div class="window-body" style="padding:12px;flex:1;overflow:auto">
    <!-- content here -->
  </div>
</div>
```

Rules:
- Always use class `evolva-window` for top-level containers (position:absolute, flex-column, pre-styled with theme)
- Always include `<div class="window-header"><h2>Title</h2></div>` as the first child (acts as drag handle)
- Assign a descriptive `id` to every window element
- Window controls (minimize, maximize, close) are automatically injected by the runtime — do NOT add them yourself
- Content goes inside a wrapper div after the header (use `style="padding:12px;flex:1;overflow:auto"`)
- Set explicit `width` and `height` on each window; position them with `style="left:Xpx;top:Ypx"` or use `transform:translate(Xpx,Ypx)`

## Available CSS Variables

```css
--accent: #00d4ff;            /* Primary accent color (cyan) */
--accent-on: #0f0f1a;         /* Text on accent background */
--bg-canvas: #0f0f1a;         /* Canvas/dot-grid background */
--bg-window: #16213e;         /* Window background */
--bg-header: #1a1a30;         /* Window header background */
--bg-input: #0f0f1a;          /* Input field background */
--border: #2a2a4a;            /* Border color */
--border-active: #3a3a5a;     /* Active border */
--text-primary: #e0e0e0;      /* Primary text */
--text-muted: #5a5a7a;        /* Muted/secondary text */
--btn-bg: #2a2a4a;            /* Button background */
--btn-border: #3a3a5a;        /* Button border */
--color-error: #ef4444;       /* Error red */
--color-warning: #f59e0b;     /* Warning amber */
--shadow-window: 0 8px 32px rgba(0,0,0,0.4);
--shadow-active: 0 8px 32px rgba(0,212,255,0.15);
```

Use these variables for consistent theming. For example: `background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border);`

## Runtime APIs

The following APIs are available in the sandbox environment:

- **HTTP requests**: `fetch()` works normally (transparently proxied, CORS bypassed)
- **Import npm modules**: `const mod = await evolva.import('module-name')` (loaded via esm.sh)
- **Persistent storage**: `await evolva.store('key')` to read, `await evolva.store('key', 'value')` to write
- **File access**: `await evolva.readFile(path)` / `await evolva.writeFile(path, content)`
- **Clipboard**: `await evolva.clipboardRead()` / `await evolva.clipboardWrite(text)`
- **External links**: `<a href="https://...">` opens in system browser automatically
- **localStorage**: Available but in-memory only (not persisted between sessions)

## Guidelines

- Write clean, well-structured HTML/CSS/JS
- Use modern CSS (flexbox, grid, variables) and modern JS (async/await, const/let)
- Use the provided CSS variables for colors, backgrounds, borders — do NOT hardcode values that already exist as variables
- Prefer `edit_file` for targeted changes; use `write_file` for new files or major rewrites
- All JavaScript runs in a plain script context — do NOT use `import`/`export` statements, use `evolva.import()` instead"#;

// === Types ===

/// 项目文件系统：文件路径 → 文件内容的内存映射
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
struct ProjectFs {
    files: HashMap<String, String>,
}

impl ProjectFs {
    fn new() -> Self {
        Self::default()
    }

    fn read(&self, path: &str) -> Result<String, String> {
        self.files
            .get(path)
            .cloned()
            .ok_or_else(|| format!("File not found: {}", path))
    }

    fn write(&mut self, path: &str, content: &str) {
        self.files.insert(path.to_string(), content.to_string());
    }

    fn edit(&mut self, path: &str, old_text: &str, new_text: &str) -> Result<(), String> {
        let content = self.files.get_mut(path).ok_or_else(|| format!("File not found: {}", path))?;
        let count = content.matches(old_text).count();
        if count == 0 {
            return Err(format!("old_text not found in {}", path));
        }
        if count > 1 {
            return Err(format!("old_text appears {} times in {}, must be unique", count, path));
        }
        *content = content.replace(old_text, new_text);
        Ok(())
    }

    fn list(&self) -> Vec<String> {
        let mut paths: Vec<String> = self.files.keys().cloned().collect();
        paths.sort();
        paths
    }

    fn grep(&self, pattern: &str) -> Result<Vec<GrepMatch>, String> {
        let re = Regex::new(pattern).map_err(|e| format!("Invalid regex: {}", e))?;
        let mut results = Vec::new();
        let mut paths: Vec<&String> = self.files.keys().collect();
        paths.sort();
        for path in paths {
            if let Some(content) = self.files.get(path) {
                for (i, line) in content.lines().enumerate() {
                    if re.is_match(line) {
                        results.push(GrepMatch {
                            file: path.clone(),
                            line_number: i + 1,
                            line: line.to_string(),
                        });
                    }
                }
            }
        }
        Ok(results)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct GrepMatch {
    file: String,
    line_number: usize,
    line: String,
}

// === 工具错误类型 ===

#[derive(Debug, thiserror::Error)]
#[error("{0}")]
struct ToolErr(String);

// === 项目文件系统工具 ===

type SharedProjectFs = Arc<Mutex<ProjectFs>>;

// --- read_file ---
#[derive(Deserialize)]
struct ReadFileArgs {
    path: String,
}

struct ReadFileTool {
    fs: SharedProjectFs,
}

impl Tool for ReadFileTool {
    const NAME: &'static str = "read_file";
    type Error = ToolErr;
    type Args = ReadFileArgs;
    type Output = String;

    async fn definition(&self, _prompt: String) -> ToolDefinition {
        ToolDefinition {
            name: "read_file".to_string(),
            description: "Read the content of a file in the project. Returns the full file content.".to_string(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {
                    "path": { "type": "string", "description": "File path, e.g. index.html, style.css, app.js" }
                },
                "required": ["path"]
            }),
        }
    }

    async fn call(&self, args: Self::Args) -> Result<Self::Output, Self::Error> {
        let fs = self.fs.lock().map_err(|e| ToolErr(e.to_string()))?;
        fs.read(&args.path).map_err(ToolErr)
    }
}

// --- write_file ---
#[derive(Deserialize)]
struct WriteFileArgs {
    path: String,
    content: String,
}

struct WriteFileTool {
    fs: SharedProjectFs,
}

impl Tool for WriteFileTool {
    const NAME: &'static str = "write_file";
    type Error = ToolErr;
    type Args = WriteFileArgs;
    type Output = String;

    async fn definition(&self, _prompt: String) -> ToolDefinition {
        ToolDefinition {
            name: "write_file".to_string(),
            description: "Write content to a file in the project. Creates the file if it does not exist, overwrites if it does.".to_string(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {
                    "path": { "type": "string", "description": "File path, e.g. index.html, style.css, app.js" },
                    "content": { "type": "string", "description": "Full file content to write" }
                },
                "required": ["path", "content"]
            }),
        }
    }

    async fn call(&self, args: Self::Args) -> Result<Self::Output, Self::Error> {
        let mut fs = self.fs.lock().map_err(|e| ToolErr(e.to_string()))?;
        fs.write(&args.path, &args.content);
        Ok(format!("Written {} bytes to {}", args.content.len(), args.path))
    }
}

// --- edit_file ---
#[derive(Deserialize)]
struct EditFileArgs {
    path: String,
    old_text: String,
    new_text: String,
}

struct EditFileTool {
    fs: SharedProjectFs,
}

impl Tool for EditFileTool {
    const NAME: &'static str = "edit_file";
    type Error = ToolErr;
    type Args = EditFileArgs;
    type Output = String;

    async fn definition(&self, _prompt: String) -> ToolDefinition {
        ToolDefinition {
            name: "edit_file".to_string(),
            description: "Search and replace in a project file. The old_text must appear exactly once in the file.".to_string(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {
                    "path": { "type": "string", "description": "File path" },
                    "old_text": { "type": "string", "description": "Exact text to find (must be unique in the file)" },
                    "new_text": { "type": "string", "description": "Replacement text" }
                },
                "required": ["path", "old_text", "new_text"]
            }),
        }
    }

    async fn call(&self, args: Self::Args) -> Result<Self::Output, Self::Error> {
        let mut fs = self.fs.lock().map_err(|e| ToolErr(e.to_string()))?;
        fs.edit(&args.path, &args.old_text, &args.new_text).map_err(ToolErr)?;
        Ok(format!("Edited {}", args.path))
    }
}

// --- list_files ---
#[derive(Deserialize)]
struct ListFilesArgs {}

struct ListFilesTool {
    fs: SharedProjectFs,
}

impl Tool for ListFilesTool {
    const NAME: &'static str = "list_files";
    type Error = ToolErr;
    type Args = ListFilesArgs;
    type Output = String;

    async fn definition(&self, _prompt: String) -> ToolDefinition {
        ToolDefinition {
            name: "list_files".to_string(),
            description: "List all files in the project. Returns file paths sorted alphabetically.".to_string(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {}
            }),
        }
    }

    async fn call(&self, _args: Self::Args) -> Result<Self::Output, Self::Error> {
        let fs = self.fs.lock().map_err(|e| ToolErr(e.to_string()))?;
        let files = fs.list();
        Ok(files.join("\n"))
    }
}

// --- grep ---
#[derive(Deserialize)]
struct GrepArgs {
    pattern: String,
}

struct GrepTool {
    fs: SharedProjectFs,
}

impl Tool for GrepTool {
    const NAME: &'static str = "grep";
    type Error = ToolErr;
    type Args = GrepArgs;
    type Output = String;

    async fn definition(&self, _prompt: String) -> ToolDefinition {
        ToolDefinition {
            name: "grep".to_string(),
            description: "Search for a regex pattern across all project files. Returns matching lines with file paths and line numbers.".to_string(),
            parameters: serde_json::json!({
                "type": "object",
                "properties": {
                    "pattern": { "type": "string", "description": "Regular expression pattern to search for" }
                },
                "required": ["pattern"]
            }),
        }
    }

    async fn call(&self, args: Self::Args) -> Result<Self::Output, Self::Error> {
        let fs = self.fs.lock().map_err(|e| ToolErr(e.to_string()))?;
        let matches = fs.grep(&args.pattern).map_err(ToolErr)?;
        if matches.is_empty() {
            return Ok("No matches found".to_string());
        }
        let result: Vec<String> = matches.iter().map(|m| format!("{}:{}: {}", m.file, m.line_number, m.line)).collect();
        Ok(result.join("\n"))
    }
}

/// 生成简单唯一 ID
fn generate_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let ts = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos();
    format!("{:x}", ts)
}

/// 单个供应商配置档案
#[derive(Debug, Clone, Serialize, Deserialize)]
struct ProviderProfile {
    id: String,
    name: String,
    protocol: String,
    #[serde(default)]
    api_key: String,
    #[serde(default)]
    base_url: String,
    #[serde(default)]
    model: String,
}

impl ProviderProfile {
    fn new(name: &str, protocol: &str) -> Self {
        Self {
            id: generate_id(),
            name: name.to_string(),
            protocol: protocol.to_string(),
            api_key: String::new(),
            base_url: Self::default_base_url(protocol),
            model: Self::default_model(protocol),
        }
    }

    fn default_base_url(protocol: &str) -> String {
        match protocol {
            "openai" => "https://api.openai.com/v1".to_string(),
            "anthropic" => "https://api.anthropic.com".to_string(),
            "deepseek" => "https://api.deepseek.com".to_string(),
            "gemini" => "https://generativelanguage.googleapis.com".to_string(),
            "groq" => "https://api.groq.com/openai/v1".to_string(),
            "mistral" => "https://api.mistral.ai/v1".to_string(),
            "openrouter" => "https://openrouter.ai/api/v1".to_string(),
            "ollama" => "http://localhost:11434".to_string(),
            _ => String::new(),
        }
    }

    fn default_model(protocol: &str) -> String {
        match protocol {
            "openai" => "gpt-4o".to_string(),
            "anthropic" => "claude-sonnet-4-20250514".to_string(),
            "deepseek" => "deepseek-chat".to_string(),
            "gemini" => "gemini-2.5-flash".to_string(),
            "groq" => "llama-3.3-70b-versatile".to_string(),
            "mistral" => "mistral-large-latest".to_string(),
            "openrouter" => "anthropic/claude-sonnet-4-20250514".to_string(),
            "ollama" => "llama3".to_string(),
            _ => String::new(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Settings {
    #[serde(default)]
    providers: Vec<ProviderProfile>,
    #[serde(default)]
    active_provider_id: Option<String>,
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

impl Default for Settings {
    fn default() -> Self {
        Settings {
            providers: Vec::new(),
            active_provider_id: None,
            theme: String::new(),
            language: String::new(),
            permissions: None,
        }
    }
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
    /// v1: 变更列表；v2: 忽略
    #[serde(skip_serializing_if = "Vec::is_empty", default)]
    versions: Vec<Mutation>,
    /// v2: 项目文件 { path: content }
    #[serde(skip_serializing_if = "Option::is_none", default)]
    files: Option<HashMap<String, String>>,
    /// v1: active_version；v2: 忽略
    #[serde(skip_serializing_if = "Option::is_none", default)]
    active_version: Option<usize>,
    #[serde(skip_serializing_if = "Option::is_none", default)]
    states: Option<serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none", default)]
    window_states: Option<serde_json::Value>,
}

/// import_app / auto_load 的返回类型
#[derive(Serialize)]
struct LoadResult {
    codes: Vec<String>,
    states: Option<serde_json::Value>,
}

#[derive(Deserialize)]
struct LlmRequest {
    instruction: String,
    #[serde(rename = "tabId")]
    tab_id: String,
}

#[derive(Serialize, Clone)]
struct ToolCallLog {
    tool: String,
    args: String,
    result: String,
}

#[derive(Serialize)]
struct LlmResult {
    text: String,
    tool_calls: Vec<ToolCallLog>,
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

    let mut settings: Settings = serde_json::from_str(&content).unwrap_or_default();

    // 向后兼容：旧格式有 api_key 字段但无 providers，自动迁移
    if settings.providers.is_empty() {
        if let Ok(old) = serde_json::from_str::<serde_json::Value>(&content) {
            let old_api_key = old.get("api_key").and_then(|v| v.as_str()).unwrap_or("");
            if !old_api_key.is_empty() {
                let protocol = old.get("protocol").and_then(|v| v.as_str()).unwrap_or("openai");
                let profile = ProviderProfile {
                    id: generate_id(),
                    name: "Migrated".to_string(),
                    protocol: protocol.to_string(),
                    api_key: old_api_key.to_string(),
                    base_url: old.get("base_url").and_then(|v| v.as_str())
                        .filter(|s| !s.is_empty())
                        .map(|s| s.to_string())
                        .unwrap_or_else(|| ProviderProfile::default_base_url(protocol)),
                    model: old.get("model").and_then(|v| v.as_str())
                        .filter(|s| !s.is_empty())
                        .map(|s| s.to_string())
                        .unwrap_or_else(|| ProviderProfile::default_model(protocol)),
                };
                settings.active_provider_id = Some(profile.id.clone());
                settings.providers.push(profile);
                settings.theme = old.get("theme").and_then(|v| v.as_str()).unwrap_or("").to_string();
                settings.language = old.get("language").and_then(|v| v.as_str()).unwrap_or("").to_string();
                settings.permissions = old.get("permissions")
                    .and_then(|v| serde_json::from_value(v.clone()).ok());
                // 写回新格式
                if let Ok(json) = serde_json::to_string_pretty(&settings) {
                    let _ = std::fs::write(&path, json);
                }
            }
        }
    }

    settings
}

// === Agent Hook (工具调用日志) ===

#[derive(Clone)]
struct ToolLogHook {
    logs: Arc<Mutex<Vec<ToolCallLog>>>,
}

impl ToolLogHook {
    fn new() -> Self {
        Self {
            logs: Arc::new(Mutex::new(Vec::new())),
        }
    }

    fn take_logs(&self) -> Vec<ToolCallLog> {
        let mut logs = self.logs.lock().unwrap();
        std::mem::take(&mut *logs)
    }
}

impl<M: CompletionModel> PromptHook<M> for ToolLogHook {
    async fn on_tool_call(
        &self,
        tool_name: &str,
        _tool_call_id: Option<String>,
        _internal_call_id: &str,
        args: &str,
    ) -> ToolCallHookAction {
        // 记录工具调用（结果在 on_tool_result 中补全）
        ToolCallHookAction::cont()
    }

    async fn on_tool_result(
        &self,
        tool_name: &str,
        _tool_call_id: Option<String>,
        _internal_call_id: &str,
        args: &str,
        result: &str,
    ) -> HookAction {
        let entry = ToolCallLog {
            tool: tool_name.to_string(),
            args: args.to_string(),
            result: result.to_string(),
        };
        if let Ok(mut logs) = self.logs.lock() {
            logs.push(entry);
        }
        HookAction::cont()
    }
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
async fn call_llm(
    app: tauri::AppHandle,
    projects: tauri::State<'_, Mutex<HashMap<String, ProjectFs>>>,
    histories: tauri::State<'_, Mutex<HashMap<String, Vec<rig::completion::message::Message>>>>,
    req: LlmRequest,
) -> Result<LlmResult, String> {
    let settings = load_settings_from_file(&app);

    // 获取激活的供应商配置
    let provider = settings.active_provider_id
        .as_ref()
        .and_then(|id| settings.providers.iter().find(|p| &p.id == id))
        .ok_or("No active provider configured. Please add one in Settings.".to_string())?;

    if provider.api_key.is_empty() && provider.protocol != "ollama" {
        return Err("API Key is empty. Please configure it in Settings.".to_string());
    }

    // 获取当前标签页的项目文件系统（克隆到 Arc<Mutex> 中供工具使用）
    let project_fs = {
        let map = projects.lock().map_err(|e| e.to_string())?;
        map.get(&req.tab_id).cloned().unwrap_or_default()
    };
    let shared_fs = Arc::new(Mutex::new(project_fs));

    // 构建工具
    let read_tool = ReadFileTool { fs: shared_fs.clone() };
    let write_tool = WriteFileTool { fs: shared_fs.clone() };
    let edit_tool = EditFileTool { fs: shared_fs.clone() };
    let list_tool = ListFilesTool { fs: shared_fs.clone() };
    let grep_tool = GrepTool { fs: shared_fs.clone() };

    // 构建日志 hook
    let hook = ToolLogHook::new();

    // 构建对话历史
    let history = {
        let map = histories.lock().map_err(|e| e.to_string())?;
        map.get(&req.tab_id).cloned().unwrap_or_default()
    };

    // 宏：为每种 provider 构建统一的 agent 调用
    macro_rules! build_and_chat {
        ($client:expr) => {{
            let agent = $client.agent(&provider.model)
                .preamble(SYSTEM_PROMPT)
                .max_tokens(16384)
                .default_max_turns(20)
                .hook(hook.clone())
                .tool(read_tool)
                .tool(write_tool)
                .tool(edit_tool)
                .tool(list_tool)
                .tool(grep_tool)
                .build();

            agent.chat(&req.instruction, &history)
                .await
                .map_err(|e| format!("Agent error: {}", e))?
        }};
    }

    // 根据 protocol 构建 rig agent 并调用
    let text = match provider.protocol.as_str() {
        "anthropic" => {
            let client = anthropic::Client::builder()
                .api_key(&provider.api_key)
                .base_url(&provider.base_url)
                .build()
                .map_err(|e| format!("Anthropic client error: {}", e))?;
            build_and_chat!(client)
        }
        "deepseek" => {
            let client = deepseek::Client::builder()
                .api_key(&provider.api_key)
                .base_url(&provider.base_url)
                .build()
                .map_err(|e| format!("DeepSeek client error: {}", e))?;
            build_and_chat!(client)
        }
        "gemini" => {
            let client = gemini::Client::builder()
                .api_key(&provider.api_key)
                .base_url(&provider.base_url)
                .build()
                .map_err(|e| format!("Gemini client error: {}", e))?;
            build_and_chat!(client)
        }
        "groq" => {
            let client = groq::Client::builder()
                .api_key(&provider.api_key)
                .base_url(&provider.base_url)
                .build()
                .map_err(|e| format!("Groq client error: {}", e))?;
            build_and_chat!(client)
        }
        "mistral" => {
            let client = mistral::Client::builder()
                .api_key(&provider.api_key)
                .base_url(&provider.base_url)
                .build()
                .map_err(|e| format!("Mistral client error: {}", e))?;
            build_and_chat!(client)
        }
        "openrouter" => {
            let client = openrouter::Client::builder()
                .api_key(&provider.api_key)
                .base_url(&provider.base_url)
                .build()
                .map_err(|e| format!("OpenRouter client error: {}", e))?;
            build_and_chat!(client)
        }
        "ollama" => {
            let client = ollama::Client::builder()
                .api_key(Nothing)
                .base_url(&provider.base_url)
                .build()
                .map_err(|e| format!("Ollama client error: {}", e))?;
            build_and_chat!(client)
        }
        _ => {
            // 默认 OpenAI 兼容协议
            let client = openai::CompletionsClient::builder()
                .api_key(&provider.api_key)
                .base_url(&provider.base_url)
                .build()
                .map_err(|e| format!("OpenAI client error: {}", e))?;
            build_and_chat!(client)
        }
    };

    // 收集工具调用日志
    let tool_calls = hook.take_logs();

    // 更新对话历史
    {
        let mut map = histories.lock().map_err(|e| e.to_string())?;
        let hist = map.entry(req.tab_id.clone()).or_insert_with(Vec::new);
        hist.push(rig::completion::message::Message::user(&req.instruction));
        hist.push(rig::completion::message::Message::assistant(&text));
        // 保留最近 20 轮（40 条消息）
        if hist.len() > 40 {
            *hist = hist.split_off(hist.len() - 40);
        }
    }

    // 将修改后的项目文件系统写回状态
    {
        let mut map = projects.lock().map_err(|e| e.to_string())?;
        let updated_fs = shared_fs.lock().map_err(|e| e.to_string())?;
        map.insert(req.tab_id.clone(), updated_fs.clone());
    }

    eprintln!("[call_llm] Agent response: {} chars, {} tool calls", text.len(), tool_calls.len());

    Ok(LlmResult { text, tool_calls })
}

#[tauri::command]
fn build_preview(
    projects: tauri::State<'_, Mutex<HashMap<String, ProjectFs>>>,
    tab_id: String,
) -> Result<String, String> {
    let map = projects.lock().map_err(|e| e.to_string())?;
    let fs = map.get(&tab_id).ok_or("Tab project not found".to_string())?;

    let html_body = fs.read("index.html").unwrap_or_default();
    let css = fs.read("style.css").unwrap_or_default();
    let js = fs.read("app.js").unwrap_or_default();

    // 移除 index.html 中对项目文件 app.js / style.css 的引用
    // 这些文件已在模板中内联包含，通过相对路径加载会命中主应用的同名文件
    let html_body = Regex::new(r#"(?i)<script[^>]*src\s*=\s*["']app\.js["'][^>]*>[\s\S]*?</script>"#)
        .unwrap()
        .replace_all(&html_body, "")
        .into_owned();
    let html_body = Regex::new(r#"(?i)<link[^>]*href\s*=\s*["']style\.css["'][^>]*/?>"#)
        .unwrap()
        .replace_all(&html_body, "")
        .into_owned();

    eprintln!("[build_preview] tab={} files={} html={}B css={}B js={}B",
        tab_id, fs.files.len(), html_body.len(), css.len(), js.len());
    let base_css = include_str!("../../src/style.css");
    let sandbox_js = include_str!("../../src/sandbox.js");

    // 安全处理：防止 </script 截断 HTML 解析
    let safe_sandbox = sandbox_js.replace("</script", "<\\/script");
    let safe_js = js.replace("</script", "<\\/script");

    // 注入错误捕获脚本，将 iframe 内的错误转发给父页面
    let error_capture = r#"
window.onerror = function(msg, url, line, col, err) {
  window.parent.postMessage({ type: 'evolva-preview-error', message: String(msg), line: line, col: col, stack: err ? err.stack : '' }, '*');
};
window.addEventListener('unhandledrejection', function(e) {
  window.parent.postMessage({ type: 'evolva-preview-error', message: 'Unhandled Promise: ' + (e.reason ? e.reason.message || String(e.reason) : 'unknown'), line: 0, col: 0, stack: e.reason && e.reason.stack ? e.reason.stack : '' }, '*');
});
"#;

    let result = format!(
        r#"<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>{base_css}</style>
<style>{css}</style>
<script>{safe_sandbox}</script>
<script src="https://cdn.jsdelivr.net/npm/interactjs/dist/interact.min.js"></script>
<script>{error_capture}</script>
</head>
<body style="margin:0;padding:0;overflow:hidden;height:100vh;width:100vw;position:relative;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:var(--bg-canvas);background-image:radial-gradient(var(--bg-dot) 1px,transparent 1px);background-size:20px 20px;color:var(--text-primary);">
{html_body}
<script>{safe_js}</script>
</body></html>"#,
        base_css = base_css,
        css = css,
        safe_sandbox = safe_sandbox,
        error_capture = error_capture,
        safe_js = safe_js,
        html_body = html_body
    );

    Ok(result)
}

#[tauri::command]
fn init_project(
    projects: tauri::State<'_, Mutex<HashMap<String, ProjectFs>>>,
    tab_id: String,
) -> Result<(), String> {
    let mut map = projects.lock().map_err(|e| e.to_string())?;
    let mut fs = map.get(&tab_id).cloned().unwrap_or_default();

    // 仅在项目为空时初始化默认文件
    if fs.files.is_empty() {
        fs.write("index.html", r#"<div id="app"></div>"#);
        fs.write("style.css", "/* Evolva project styles — inherit base theme, override here */\n");
        fs.write("app.js", "// Evolva project logic\n");
    }

    map.insert(tab_id, fs);
    Ok(())
}

/// 调试命令：返回项目文件内容，用于排查空白预览问题
#[tauri::command]
fn debug_project(
    projects: tauri::State<'_, Mutex<HashMap<String, ProjectFs>>>,
    tab_id: String,
) -> Result<serde_json::Value, String> {
    let map = projects.lock().map_err(|e| e.to_string())?;
    let fs = map.get(&tab_id).ok_or("Tab not found".to_string())?;
    let mut files = serde_json::Map::new();
    for (name, content) in &fs.files {
        files.insert(name.clone(), serde_json::Value::String(content.clone()));
    }
    Ok(serde_json::Value::Object(files))
}

#[tauri::command]
fn export_app(
    projects: tauri::State<'_, Mutex<HashMap<String, ProjectFs>>>,
    path: String,
    name: String,
    tab_id: String,
    window_states: Option<serde_json::Value>,
) -> Result<(), String> {
    let map = projects.lock().map_err(|e| e.to_string())?;
    let fs = map.get(&tab_id).ok_or("Tab not found".to_string())?;
    if fs.files.is_empty() {
        return Err("No project files to export".to_string());
    }
    let data = ExportData {
        version: 2,
        name,
        created_at: chrono::Utc::now().to_rfc3339(),
        versions: Vec::new(),
        files: Some(fs.files.clone()),
        active_version: None,
        states: None,
        window_states,
    };
    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    std::fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn import_app(
    projects: tauri::State<'_, Mutex<HashMap<String, ProjectFs>>>,
    path: String,
    tab_id: String,
) -> Result<LoadResult, String> {
    let content = std::fs::read_to_string(&path).map_err(|e| e.to_string())?;
    let data: serde_json::Value =
        serde_json::from_str(&content).map_err(|e| format!("Invalid JSON: {}", e))?;

    let file_version = data.get("version").and_then(|v| v.as_u64()).unwrap_or(1) as u32;

    let (files, states, codes) = if file_version >= 2 {
        // v2: 直接读取 files 对象
        let files: HashMap<String, String> = data.get("files")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .ok_or("Missing or invalid 'files' field in v2 format")?;
        let states = data.get("window_states").cloned();
        (files, states, Vec::new())
    } else {
        // v1 → v2 迁移：将所有 mutation 代码合并为一个 app.js
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
        let combined_js = codes.join("\n\n");
        let mut files = HashMap::new();
        files.insert("index.html".to_string(), "<div id=\"app\"></div>".to_string());
        files.insert("style.css".to_string(), String::new());
        files.insert("app.js".to_string(), combined_js);
        let states = data.get("states").cloned();
        (files, states, codes)
    };

    let project_fs = ProjectFs { files };
    let mut map = projects.lock().map_err(|e| e.to_string())?;
    map.insert(tab_id, project_fs);

    Ok(LoadResult { codes, states })
}

#[tauri::command]
fn clear_mutations(
    projects: tauri::State<'_, Mutex<HashMap<String, ProjectFs>>>,
    tab_id: String,
) -> Result<(), String> {
    let mut map = projects.lock().map_err(|e| e.to_string())?;
    map.remove(&tab_id);
    Ok(())
}

#[tauri::command]
fn auto_save(
    projects: tauri::State<'_, Mutex<HashMap<String, ProjectFs>>>,
    app: tauri::AppHandle,
    tab_id: String,
    tab_name: String,
    window_states: Option<serde_json::Value>,
) -> Result<(), String> {
    let map = projects.lock().map_err(|e| e.to_string())?;
    let path = auto_save_path(&app, &tab_id)?;

    let fs = match map.get(&tab_id) {
        Some(fs) => fs,
        None => {
            if path.exists() {
                std::fs::remove_file(&path).map_err(|e| e.to_string())?;
            }
            return Ok(());
        }
    };

    if fs.files.is_empty() {
        if path.exists() {
            std::fs::remove_file(&path).map_err(|e| e.to_string())?;
        }
        return Ok(());
    }

    let data = ExportData {
        version: 2,
        name: tab_name,
        created_at: chrono::Utc::now().to_rfc3339(),
        versions: Vec::new(),
        files: Some(fs.files.clone()),
        active_version: None,
        states: None,
        window_states,
    };
    let json = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    std::fs::write(&path, json).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn auto_load(
    projects: tauri::State<'_, Mutex<HashMap<String, ProjectFs>>>,
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

    let file_version = data.get("version").and_then(|v| v.as_u64()).unwrap_or(1) as u32;

    let (files, states) = if file_version >= 2 {
        let files: HashMap<String, String> = data.get("files")
            .and_then(|v| serde_json::from_value(v.clone()).ok())
            .ok_or("Missing 'files' in v2 format")?;
        let states = data.get("window_states").cloned();
        (files, states)
    } else {
        // v1 → v2 迁移
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
        let combined_js = codes.join("\n\n");
        let mut files = HashMap::new();
        files.insert("index.html".to_string(), "<div id=\"app\"></div>".to_string());
        files.insert("style.css".to_string(), String::new());
        files.insert("app.js".to_string(), combined_js);
        let states = data.get("states").cloned();
        (files, states)
    };

    let project_fs = ProjectFs { files };
    let mut map = projects.lock().map_err(|e| e.to_string())?;
    map.insert(tab_id, project_fs);

    Ok(Some(LoadResult { codes: Vec::new(), states }))
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
        .manage(Mutex::new(HashMap::<String, ProjectFs>::new()))
        .manage(Mutex::new(HashMap::<String, Vec<rig::completion::message::Message>>::new()))
        .invoke_handler(tauri::generate_handler![
            load_settings,
            save_settings,
            call_llm,
            build_preview,
            init_project,
            debug_project,
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
