# Evolva — 设计文档

> 自修改 Tauri 桌面应用 | Windows 构建

---

## 1. 概述

Evolva 是 Ouroboros 的 Tauri v2 重写版。核心改进：

| 问题 | Ouroboros（浏览器） | Evolva（Tauri） |
|------|--------------------|--------------------|
| CORS | 被 file:// 协议拦截 | Rust 后端请求，无跨域限制 |
| LLM 生成 Node.js 代码 | 无法执行 | 系统提示词明确约束浏览器环境 |
| API Key 存储 | localStorage 明文 | localStorage（桌面应用隔离） |
| 系统能力 | 仅浏览器 API | 可通过 Tauri Command 扩展 |

工作流程不变：捕获 DOM → 发送 LLM → 接收 JS → 注入执行 → 循环。

---

## 2. 环境准备（Windows）

### 2.1 安装 Rust

```powershell
# 访问 https://rustup.rs/ 下载并运行 rustup-init.exe
# 或 winget:
winget install Rustlang.Rustup
```

验证：
```powershell
rustc --version
cargo --version
```

### 2.2 安装 Tauri CLI

```powershell
cargo install tauri-cli
```

> 无需 Node.js / npm，纯 Cargo 构建。

### 2.3 Visual Studio C++ Build Tools

如果尚未安装，Tauri 需要 MSVC 工具链：
- 安装 [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- 勾选 "C++ build tools" 工作负载

### 2.4 WebView2

Windows 10/11 已内置。Windows 7/8 需手动安装 [Edge WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)。

---

## 3. 项目结构

```
evolva/
├── src/
│   └── index.html              # 前端 UI
└── src-tauri/
    ├── Cargo.toml              # Rust 依赖
    ├── build.rs                # Tauri 构建脚本
    ├── tauri.conf.json         # Tauri v2 配置
    ├── capabilities/
    │   └── default.json        # 权限声明
    └── src/
        ├── main.rs             # 入口
        └── lib.rs              # 核心逻辑：call_llm 命令
```

---

## 4. 文件内容

### 4.1 `src-tauri/Cargo.toml`

```toml
[package]
name = "evolva"
version = "0.1.0"
edition = "2021"

[lib]
name = "evolva_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
reqwest = { version = "0.12", features = ["json"] }
tauri-plugin-opener = "2"
```

### 4.2 `src-tauri/build.rs`

```rust
fn main() {
    tauri_build::build()
}
```

### 4.3 `src-tauri/src/main.rs`

```rust
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    evolva_lib::run()
}
```

### 4.4 `src-tauri/src/lib.rs`

```rust
use serde::Deserialize;
use serde_json::json;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct LlmRequest {
    api_key: String,
    base_url: String,
    model: String,
    protocol: String,
    system_msg: String,
    user_msg: String,
}

#[tauri::command]
async fn call_llm(request: LlmRequest) -> Result<String, String> {
    let client = reqwest::Client::new();

    if request.protocol == "anthropic" {
        call_anthropic(&client, &request).await
    } else {
        call_openai(&client, &request).await
    }
}

async fn call_anthropic(
    client: &reqwest::Client,
    req: &LlmRequest,
) -> Result<String, String> {
    let base_url = req.base_url.trim_end_matches("/v1").trim_end_matches('/');
    let url = format!("{}/v1/messages", base_url);

    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert("Content-Type", "application/json".parse().unwrap());
    if !req.api_key.is_empty() {
        headers.insert("x-api-key", req.api_key.parse().unwrap());
    }
    headers.insert("anthropic-version", "2023-06-01".parse().unwrap());

    let body = json!({
        "model": req.model,
        "max_tokens": 16384,
        "system": req.system_msg,
        "messages": [{"role": "user", "content": req.user_msg}],
        "thinking": {"type": "disabled"}
    });

    let resp = client
        .post(&url)
        .headers(headers)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Connection error: {}", e))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("API {}: {}", status, text));
    }

    let data: serde_json::Value = resp.json().await.map_err(|e| format!("Parse error: {}", e))?;

    // 在 content 数组中找到 type=text 的块（跳过 thinking 块）
    if let Some(content) = data["content"].as_array() {
        for block in content {
            if block["type"] == "text" {
                if let Some(text) = block["text"].as_str() {
                    return Ok(text.to_string());
                }
            }
        }
    }

    Err(format!(
        "Unexpected response: {}",
        data.to_string().chars().take(200).collect::<String>()
    ))
}

async fn call_openai(
    client: &reqwest::Client,
    req: &LlmRequest,
) -> Result<String, String> {
    let url = format!("{}/chat/completions", req.base_url.trim_end_matches('/'));

    let mut headers = reqwest::header::HeaderMap::new();
    headers.insert("Content-Type", "application/json".parse().unwrap());
    if !req.api_key.is_empty() {
        headers.insert(
            "Authorization",
            format!("Bearer {}", req.api_key).parse().unwrap(),
        );
    }

    let body = json!({
        "model": req.model,
        "messages": [
            {"role": "system", "content": req.system_msg},
            {"role": "user", "content": req.user_msg}
        ]
    });

    let resp = client
        .post(&url)
        .headers(headers)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Connection error: {}", e))?;

    if !resp.status().is_success() {
        let status = resp.status();
        let text = resp.text().await.unwrap_or_default();
        return Err(format!("API {}: {}", status, text));
    }

    let data: serde_json::Value = resp.json().await.map_err(|e| format!("Parse error: {}", e))?;

    data["choices"][0]["message"]["content"]
        .as_str()
        .map(|s| s.to_string())
        .ok_or_else(|| "Unexpected response format".to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![call_llm])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 4.5 `src-tauri/tauri.conf.json`

```json
{
    "productName": "Evolva",
    "version": "0.1.0",
    "identifier": "com.evolva.app",
    "build": {
        "frontendDist": "../src"
    },
    "app": {
        "withGlobalTauri": true,
        "windows": [
            {
                "title": "Evolva",
                "width": 800,
                "height": 600,
                "center": true,
                "resizable": true,
                "minWidth": 400,
                "minHeight": 400
            }
        ],
        "security": {
            "csp": null
        }
    }
}
```

**关键字段说明：**
- `withGlobalTauri: true` — 注入 `window.__TAURI__` 全局对象，前端无需 npm 包
- `csp: null` — 允许动态 `<script>` 注入（mutation 执行必需）
- `frontendDist: "../src"` — 指向纯 HTML 目录，无需构建工具

### 4.6 `src-tauri/capabilities/default.json`

```json
{
    "identifier": "default",
    "description": "Default permissions for Evolva",
    "windows": ["main"],
    "permissions": [
        "core:default",
        "core:window:default"
    ]
}
```

### 4.7 `src/index.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Evolva</title>
    <style>
        :root {
            --bg: #fafafa;
            --surface: #ffffff;
            --text: #111111;
            --text-2: #999999;
            --accent: #6366f1;
            --accent-h: #4f46e5;
            --border: #eeeeee;
            --radius: 6px;
            --font: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
            --mono: ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: var(--font);
            background: var(--bg);
            color: var(--text);
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            user-select: none;
        }

        /* ── Header ── */
        header {
            padding: 20px 24px 16px;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }

        header h1 {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: -0.03em;
        }

        header .sub {
            font-size: 11px;
            color: var(--text-2);
            margin-top: 2px;
        }

        .gear-btn {
            background: none;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 6px 12px;
            font-size: 12px;
            color: var(--text-2);
            cursor: pointer;
            transition: all 0.15s;
        }

        .gear-btn:hover {
            color: var(--text);
            border-color: var(--text-2);
        }

        /* ── Settings ── */
        .settings {
            display: none;
            padding: 16px 24px;
            border-bottom: 1px solid var(--border);
            background: var(--surface);
        }

        .settings.open { display: block; }

        .s-grid {
            display: grid;
            grid-template-columns: 80px 1fr;
            gap: 8px;
            align-items: center;
        }

        .s-grid label {
            font-size: 11px;
            color: var(--text-2);
        }

        .s-grid input, .s-grid select {
            font-family: var(--mono);
            font-size: 12px;
            padding: 6px 10px;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            outline: none;
            width: 100%;
            background: var(--bg);
        }

        .s-grid input:focus, .s-grid select:focus {
            border-color: var(--accent);
        }

        .save-btn {
            grid-column: 2;
            justify-self: start;
            background: var(--text);
            color: var(--surface);
            border: none;
            padding: 6px 20px;
            border-radius: var(--radius);
            font-size: 12px;
            cursor: pointer;
            margin-top: 4px;
        }

        .save-btn:hover { opacity: 0.85; }

        /* ── Context Bar ── */
        .ctx {
            padding: 10px 24px;
            border-bottom: 1px solid var(--border);
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .ctx .label {
            font-size: 11px;
            color: var(--text-2);
            white-space: nowrap;
            font-variant-numeric: tabular-nums;
        }

        .ctx .track {
            flex: 1;
            height: 3px;
            background: var(--border);
            border-radius: 2px;
            overflow: hidden;
        }

        .ctx .fill {
            height: 100%;
            background: var(--accent);
            border-radius: 2px;
            transition: width 0.3s;
        }

        .ctx .fill.warn { background: #f59e0b; }
        .ctx .fill.danger { background: #ef4444; }

        /* ── Log ── */
        .log {
            flex: 1;
            overflow-y: auto;
            padding: 16px 24px;
            font-family: var(--mono);
            font-size: 12px;
            line-height: 1.9;
            user-select: text;
        }

        .log-e { margin-bottom: 2px; }
        .log-e .t { color: var(--text-2); }
        .log-e .sys { color: #22c55e; font-weight: 600; }
        .log-e .usr { color: var(--accent); font-weight: 600; }
        .log-e .err { color: #ef4444; }

        /* ── Input ── */
        .input {
            padding: 16px 24px;
            border-top: 1px solid var(--border);
            background: var(--surface);
            display: flex;
            gap: 10px;
            align-items: flex-end;
        }

        .input textarea {
            flex: 1;
            font-family: var(--font);
            font-size: 14px;
            padding: 10px 12px;
            border: 1px solid var(--border);
            border-radius: var(--radius);
            outline: none;
            resize: none;
            min-height: 42px;
            max-height: 140px;
            line-height: 1.5;
            background: var(--bg);
        }

        .input textarea:focus { border-color: var(--accent); }

        .send {
            width: 42px;
            height: 42px;
            background: var(--text);
            color: var(--surface);
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            transition: opacity 0.15s;
        }

        .send:hover { opacity: 0.85; }
        .send.loading { opacity: 0.4; cursor: not-allowed; }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .spinner {
            width: 18px;
            height: 18px;
            border: 2px solid transparent;
            border-top-color: var(--surface);
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }
    </style>
</head>
<body>

    <header>
        <div>
            <h1>evolva</h1>
            <div class="sub">self-evolving application</div>
        </div>
        <button class="gear-btn" id="toggle-settings">settings</button>
    </header>

    <div class="settings" id="settings">
        <div class="s-grid">
            <label>API Key</label>
            <input type="password" id="api-key" placeholder="sk-...">
            <label>Base URL</label>
            <input type="text" id="base-url" placeholder="https://api.openai.com/v1">
            <label>Protocol</label>
            <select id="protocol">
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
            </select>
            <label>Model</label>
            <input type="text" id="model" placeholder="gpt-4o">
            <div></div>
            <button class="save-btn" id="save-btn">save</button>
        </div>
    </div>

    <div class="ctx">
        <span class="label" id="ctx-text">context 0 / 128k</span>
        <div class="track"><div class="fill" id="ctx-fill" style="width:0%"></div></div>
    </div>

    <div class="log" id="log"></div>

    <div class="input">
        <textarea id="prompt" placeholder="type your command..." rows="1"></textarea>
        <button class="send" id="send-btn">
            <svg id="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <div class="spinner" id="spinner" style="display:none"></div>
        </button>
    </div>

    <!-- System Prompt -->
    <script type="text/plain" id="system-prompt">
## Role
You are Evolva, a self-editing HTML application running in a desktop webview. Satisfy the user's request by mutating the current DOM (State A) into a new, functional state (State B).

## Environment
You run in a **browser webview**, NOT Node.js. NEVER use: require(), process, Buffer, fs, net, http, child_process, path, __dirname, __filename, module.exports, or any Node.js built-in.
ONLY use browser-native APIs: fetch, DOM APIs, Canvas, WebGL, Web Audio, IndexedDB, localStorage, CSS, Web Workers, etc.
For external libraries, use: const lib = await import("https://esm.sh/package-name")

## Rules
* State Transition: Analyze the HTML source, then write JavaScript that modifies the DOM to implement the requested feature.
* Preservation: NEVER delete or modify the #log, #prompt, #send-btn, #settings, #ctx-text, #ctx-fill, or header elements. Modifying these kills the application.
* UI Standards: Create new content as styled HTML elements. You may use inline CSS or create <style> tags. Position new elements to avoid overlapping the core UI (header, context bar, input area).
* Efficiency: Keep code concise. Use https://esm.sh/ for external libraries via dynamic import(). Do not inline large assets.
* User Instruction: Identify by reading the last entry in the #log element.

## Output Format
Respond with EXACTLY ONE JavaScript code block fenced with ```javascript ... ```. No markdown, no explanations, no text outside the code block. The code will be injected directly into the page inside an async IIFE.
    </script>

    <script>
        // ── Check Tauri Environment ──
        if (!window.__TAURI__) {
            document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui;color:#999">Evolva must run inside Tauri. Use: cargo tauri dev</div>';
            throw new Error('Not in Tauri environment');
        }

        const invoke = window.__TAURI__.core.invoke;
        const state = { processing: false };

        // ── DOM Refs ──
        const $ = id => document.getElementById(id);
        const els = {
            settings:    $('settings'),
            toggleBtn:   $('toggle-settings'),
            saveBtn:     $('save-btn'),
            apiKey:      $('api-key'),
            baseUrl:     $('base-url'),
            protocol:    $('protocol'),
            model:       $('model'),
            prompt:      $('prompt'),
            sendBtn:     $('send-btn'),
            arrow:       $('arrow'),
            spinner:     $('spinner'),
            log:         $('log'),
            ctxText:     $('ctx-text'),
            ctxFill:     $('ctx-fill'),
            sysPrompt:   $('system-prompt'),
        };

        // ── Settings ──
        function loadSettings() {
            els.apiKey.value   = localStorage.getItem('evolva_key') || '';
            els.baseUrl.value  = localStorage.getItem('evolva_base') || '';
            els.model.value    = localStorage.getItem('evolva_model') || '';
            els.protocol.value = localStorage.getItem('evolva_protocol') || 'openai';
        }

        function saveSettings() {
            localStorage.setItem('evolva_key', els.apiKey.value.trim());
            localStorage.setItem('evolva_base', els.baseUrl.value.trim());
            localStorage.setItem('evolva_model', els.model.value.trim());
            localStorage.setItem('evolva_protocol', els.protocol.value);
            log('system', 'Settings saved.');
        }

        els.toggleBtn.addEventListener('click', () => {
            els.settings.classList.toggle('open');
            els.toggleBtn.textContent = els.settings.classList.contains('open') ? 'close' : 'settings';
        });

        els.saveBtn.addEventListener('click', saveSettings);

        // ── Log (XSS-safe: textContent only) ──
        function log(actor, text) {
            const e = document.createElement('div');
            e.className = 'log-e';

            const t = document.createElement('span');
            t.className = 't';
            t.textContent = new Date().toLocaleTimeString();

            const a = document.createElement('span');
            a.className = actor === 'user' ? 'usr' : actor === 'error' ? 'err' : 'sys';
            a.textContent = actor + ':';

            const m = document.createElement('span');
            m.textContent = ' ' + text;

            e.append(t, ' ', a, m);
            els.log.appendChild(e);
            els.log.scrollTop = els.log.scrollHeight;
        }

        // ── Context ──
        function updateCtx() {
            const tokens = Math.ceil(document.documentElement.outerHTML.length / 4);
            const pct = Math.min((tokens / 128000) * 100, 100).toFixed(1);
            els.ctxText.textContent = `context ${tokens.toLocaleString()} / 128k (${pct}%)`;
            els.ctxFill.style.width = pct + '%';
            els.ctxFill.className = 'fill' + (tokens > 96000 ? ' danger' : tokens > 72000 ? ' warn' : '');
        }

        // ── Mutation Execution ──
        function executeMutation(code) {
            // Auto-convert require() → dynamic import()
            const transformed = code
                .replace(/(?:const|let|var)\s+(\w+)\s*=\s*require\(\s*['"]([^'"]+)['"]\s*\)/g,
                    'const $1 = (await import("https://esm.sh/$2"))')
                .replace(/require\(\s*['"]([^'"]+)['"]\s*\)/g,
                    '(await import("https://esm.sh/$1"))');

            const script = document.createElement('script');
            script.textContent = `(async function() {
                try { ${transformed} }
                catch(e) { console.error("Mutation Error:", e); }
            })();`;
            document.body.appendChild(script);
            script.remove();
        }

        // ── Main Execution Flow ──
        async function execute() {
            if (state.processing) return;

            const prompt = els.prompt.value.trim();
            if (!prompt) return;

            const apiKey   = localStorage.getItem('evolva_key') || '';
            const baseUrl  = localStorage.getItem('evolva_base') || '';
            const model    = localStorage.getItem('evolva_model') || '';
            const protocol = localStorage.getItem('evolva_protocol') || 'openai';

            if (!apiKey && !baseUrl) {
                log('error', 'Configure settings first.');
                return;
            }

            // Lock UI
            state.processing = true;
            els.sendBtn.classList.add('loading');
            els.arrow.style.display = 'none';
            els.spinner.style.display = 'block';
            log('user', prompt);

            try {
                // 1. Capture DOM (compress to save tokens)
                const dom = document.documentElement.outerHTML
                    // Strip trailing scripts
                    .replace(/<script[^>]*>[\s\S]*?<\/script>\s*(?=<\/body>)/gi,
                        '<!-- scripts omitted -->')
                    // Strip system prompt (already sent as system message)
                    .replace(/<script type="text\/plain"[^>]*>[\s\S]*?<\/script>/gi,
                        '<!-- system prompt omitted -->')
                    // Keep only last 10 log entries
                    .replace(/((?:<div class="log-e">[\s\S]*?<\/div>\s*){10,})/, prev => {
                        const entries = prev.match(/<div class="log-e">[\s\S]*?<\/div>/g);
                        return entries ? entries.slice(-10).join('\n') : prev;
                    });

                // 2. Build system message with full rules
                const sysMsg = els.sysPrompt.textContent;

                // 3. Call LLM via Rust backend (no CORS!)
                const content = await invoke('call_llm', {
                    request: {
                        apiKey,
                        baseUrl,
                        model,
                        protocol,
                        systemMsg: sysMsg,
                        userMsg: dom,
                    }
                });

                log('system', 'Response received. Applying mutation...');

                // 4. Extract code block
                const match = content.match(/```(?:javascript|js)?\s*\n?([\s\S]*?)\n?\s*```/)
                    || content.match(/~~~(?:javascript|js)?\s*\n?([\s\S]*?)\n?\s*~~~/);

                if (match?.[1]) {
                    executeMutation(match[1]);
                    log('system', 'Mutation applied.');
                    els.prompt.value = '';
                    els.prompt.style.height = '';
                } else {
                    log('error', 'No JavaScript code block found.');
                    console.log('Full response:', content);
                }

            } catch (err) {
                log('error', String(err));
            } finally {
                state.processing = false;
                els.sendBtn.classList.remove('loading');
                els.arrow.style.display = '';
                els.spinner.style.display = 'none';
                updateCtx();
            }
        }

        // ── Events ──
        els.sendBtn.addEventListener('click', execute);
        els.prompt.addEventListener('keydown', e => {
            if (e.ctrlKey && e.key === 'Enter') execute();
        });
        els.prompt.addEventListener('input', function () {
            this.style.height = '';
            this.style.height = Math.min(this.scrollHeight, 140) + 'px';
        });

        // ── Init ──
        loadSettings();
        updateCtx();
        log('system', 'Evolva loaded.');
    </script>
</body>
</html>
```

---

## 5. 构建与运行

### 5.1 创建项目

在 Windows 上按第 3 节结构创建目录和文件：

```powershell
mkdir evolva\src
mkdir evolva\src-tauri\src
mkdir evolva\src-tauri\capabilities
# 然后将上述各文件内容写入对应路径
```

### 5.2 开发运行

```powershell
cd evolva
cargo tauri dev
```

首次运行会编译 Rust 依赖，约 3-5 分钟。之后增量编译很快。

### 5.3 构建安装包

```powershell
cargo tauri build
```

产物在 `src-tauri/target/release/bundle/`。

---

## 6. 与 Ouroboros 的差异

| 特性 | Ouroboros | Evolva |
|------|-----------|--------|
| 运行环境 | 浏览器（file:// 或 HTTP） | Tauri 桌面应用 |
| HTTP 请求 | 前端 fetch（受 CORS 限制） | Rust reqwest（无限制） |
| 外观 | 深色窗口 + Tailwind CDN | 极简主义 + 原生 CSS |
| 窗口管理 | interact.js 拖拽窗口 | 原生窗口（系统拖拽） |
| XSS 防护 | ❌ 原版 innerHTML | ✅ textContent |
| require() | 自动转换 import() | 自动转换 import() |
| API 协议 | OpenAI + Anthropic | OpenAI + Anthropic |
| Thinking tokens | 禁用 | 禁用 |
| DOM 压缩 | 剥离脚本/日志截断 | 剥离脚本/系统 prompt/日志截断 |

---

## 7. 配置示例

### OpenAI

| 字段 | 值 |
|------|-----|
| API Key | `sk-...` |
| Base URL | `https://api.openai.com/v1` |
| Protocol | OpenAI |
| Model | `gpt-4o` |

### Anthropic

| 字段 | 值 |
|------|-----|
| API Key | `sk-ant-...` |
| Base URL | `https://api.anthropic.com` |
| Protocol | Anthropic |
| Model | `claude-sonnet-4-20250514` |
