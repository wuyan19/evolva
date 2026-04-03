## Why

项目当前是 Tauri v2 默认脚手架（greet 示例），需要实现 Evolva 的核心功能：一个自修改桌面应用。用户通过自然语言指令，LLM 分析当前 DOM 并生成 JS 代码来修改界面，循环迭代。DESIGN.md 已包含完整的设计方案，经过 MVP 可行性验证和修复，可以直接落地。

## What Changes

- 将脚手架前端替换为 Evolva UI（header + settings 面板 + context bar + log + input）
- 将 Rust 端 `greet` 命令替换为 `call_llm` 命令，支持 OpenAI 和 Anthropic 两种 API 协议
- 添加 `reqwest` 依赖用于 Rust 端 HTTP 请求（绕过 CORS）
- 实现 DOM 捕获 → LLM 调用 → 代码提取 → 脚本注入的完整突变循环
- 实现设置面板（API Key / Base URL / Protocol / Model）持久化到 localStorage
- 实现 context 用量监控条
- DOM 捕获时压缩：剥离脚本、系统 prompt、截断日志（最近 10 条）

## Capabilities

### New Capabilities

- `llm-proxy`: Rust 端 LLM API 代理，支持 OpenAI（/v1/chat/completions）和 Anthropic（/v1/messages）协议路由
- `self-mutation`: DOM 捕获、代码块提取、脚本注入执行的完整突变循环
- `app-ui`: Evolva 前端界面，包含 header、settings 面板、context bar、log、input 区域

### Modified Capabilities

（无现有 capability）

## Impact

- `src-tauri/src/lib.rs` — 完全重写（greet → call_llm + 协议路由）
- `src-tauri/Cargo.toml` — 添加 reqwest 依赖
- `src/index.html` — 完全重写（脚手架 → Evolva UI）
- `src/main.js` — 删除（逻辑内联到 index.html）
- `src/styles.css` — 删除（样式内联到 index.html）
- `src-tauri/tauri.conf.json` — 微调窗口配置
- `src-tauri/capabilities/default.json` — 保持不变
