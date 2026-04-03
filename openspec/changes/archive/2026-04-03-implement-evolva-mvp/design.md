## Context

Evolva 是 Ouroboros 的 Tauri v2 重写版。当前项目是 `create-tauri-app` 生成的默认脚手架，包含一个 `greet` 命令和样板前端。需要将其替换为自修改应用的核心功能。

核心循环：用户输入指令 → 捕获当前 DOM → 通过 Rust 后端调用 LLM → 提取 JS 代码块 → 注入执行 → 界面变化 → 循环。

约束：
- 纯 Cargo 构建，不使用 Node.js / npm
- 前端为单文件 `index.html`（内联 CSS + JS）
- MVP 阶段仅支持标准 OpenAI 和 Anthropic API，不支持 Ollama

## Goals / Non-Goals

**Goals:**
- 实现完整的自修改循环（DOM 捕获 → LLM → JS 注入）
- 支持 OpenAI 和 Anthropic 两种 API 协议
- 前端 UI 可用：设置面板、日志、上下文监控、输入区域
- DOM 捕获时有效压缩（剥离脚本、系统 prompt、日志截断）

**Non-Goals:**
- 不支持 Ollama / 本地模型（后续迭代）
- 不实现请求取消机制
- 不实现多轮对话历史
- 不实现状态持久化（刷新丢失）
- 不使用 Tailwind CSS

## Decisions

### 1. Rust 端代理 LLM 请求（非前端 fetch）

**选择**：通过 Tauri Command 调用 Rust `reqwest` 发 HTTP 请求
**替代方案**：前端直接 `fetch()`
**理由**：Tauri webview 中前端请求受 CORS 限制，Rust 端无此约束。Ouroboros 在浏览器中被 CORS 困扰是重写的核心动机。

### 2. 单文件前端（内联 CSS + JS）

**选择**：所有前端代码内联在一个 `index.html` 中
**替代方案**：分离为 HTML + CSS + JS 文件
**理由**：单文件使 DOM 捕获完整一致，LLM 能看到完整页面状态。分离文件需要在捕获时拼接，增加复杂度。Ouroboros 也是单文件架构。

### 3. 协议路由设计

**选择**：Rust 端根据 `protocol` 字段路由到 `call_openai` 或 `call_anthropic`
**替代方案**：前端构造不同格式的 body，Rust 只做透传
**理由**：两种协议的 headers、URL 构造、响应解析差异大（Anthropic 用 `x-api-key` + `content[]` 数组，OpenAI 用 `Bearer` + `choices[]`），Rust 端分别处理更清晰。

### 4. DOM 压缩策略

**选择**：三层压缩——剥离尾部脚本、剥离系统 prompt、日志截断最近 10 条
**替代方案**：仅剥离脚本（原设计）
**理由**：系统 prompt 约 500+ tokens 且已作为 system message 发送，重复发送浪费。日志无截断时 5-10 轮后上下文膨胀严重。参考 Ouroboros 的压缩策略。

### 5. `withGlobalTauri: true` + `csp: null`

**选择**：暴露全局 `window.__TAURI__` 对象，禁用 CSP
**理由**：全局对象避免前端引入 npm 包；CSP null 是动态 `<script>` 注入的必要条件。这是安全性和功能性的权衡——MVP 阶段接受此风险。

## Risks / Trade-offs

- **[上下文膨胀]** → DOM 捕获压缩缓解但不根治。10+ 轮后仍可能溢出 128K。后续可考虑 DOM diff 或滑动窗口。
- **[LLM 不遵守指令]** → 系统 prompt 约束不修改核心 UI 元素，但只是软约束。LLM 可能破坏应用。目前无回滚机制。
- **[CSP null 安全风险]** → LLM 生成的代码有完整浏览器 API 权限。MVP 可接受，后续可考虑沙箱化。
- **[无取消机制]** → 长请求无法中断。MVP 可接受。
