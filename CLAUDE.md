# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Evolva 是一个自演化桌面应用，基于 Tauri v2 构建。用户通过自然语言指令修改应用 UI，应用捕获当前 DOM 状态发送给 LLM，接收 JavaScript 代码并动态执行，形成持续的自修改循环。

## 常用命令

```bash
cargo tauri dev          # 开发模式运行
cargo tauri build        # 生产构建
cargo check              # 检查 Rust 编译
npm run tauri dev        # 等效于 cargo tauri dev
```

无测试套件，无 lint 配置。

## 架构

### 双层架构

- **前端**：`src/index.html` — 单文件应用，包含所有 HTML/CSS/JS，无构建步骤
- **后端**：`src-tauri/src/lib.rs` — Rust 实现 LLM API 代理，避免前端 CORS 限制

### 前后端通信

通过 Tauri Command 模式：
- 前端使用 `window.__TAURI__.core.invoke()` 调用后端命令
- 后端通过 `#[tauri::command]` 宏暴露异步函数
- 主要命令：`call_llm` — 接收 LLM 请求参数，路由到 OpenAI 或 Anthropic API

### 自修改引擎（核心流程）

1. **DOM 捕获** (`captureDom`) — 剥离 script 标签、系统提示，截断日志至最近 10 条
2. **LLM 调用** (`mutate`) — 通过 Rust 后端发送压缩后的 DOM + 用户指令
3. **代码提取** (`extractCode`) — 从 markdown 代码块中解析 JavaScript
4. **代码注入** (`injectCode`) — 将 `require()` 转换为 esm.sh 动态 import，以 async IIFE 注入执行

### UI 组件

- 可拖拽窗口系统（interact.js CDN）
- 设置面板（API Key / URL / 协议 / 模型 / 主题，localStorage 持久化）
- 上下文栏（token 估算与进度条）
- 日志区（带时间戳、角色标签、颜色编码）
- 暗/亮主题切换（CSS 变量 + `.light` class）

## 关键设计决策

- **单文件前端**：确保 LLM 能看到完整页面状态，无需文件拼接
- **CSP 设为 null**：动态 script 注入所需，MVP 阶段的权衡
- **withGlobalTauri: true**：避免 npm 包管理，直接全局访问 Tauri API
- **Rust 代理 LLM 调用**：绕过 webview CORS 限制

## OpenSpec 工作流

项目使用 OpenSpec 驱动的开发流程，配置在 `openspec/` 目录：
- `specs/` — 当前规格说明（app-ui, llm-proxy, self-mutation）
- `changes/` — 变更记录与设计文档

## 关键文件

| 文件 | 职责 |
|------|------|
| `src/index.html` | 完整前端应用（HTML + CSS + JS） |
| `src-tauri/src/lib.rs` | Rust 后端，LLM API 代理 |
| `src-tauri/tauri.conf.json` | Tauri 应用配置 |
| `src-tauri/Cargo.toml` | Rust 依赖管理 |
| `openspec/specs/` | 功能规格说明 |

## 必须遵守

不管是**提问**还是生成 Markdown **文档**，都必须使用中文。

包括但不限于以下文档生成：
- 在使用 OpenSpec 规范驱动开发过程中生成的文档（proposal.md、design.md、tasks.md 和 spec.md）
- 在使用 superpower 规范驱动开发过程中生成的文档（设计文档、实施文档）
- README.md 说明文档
- 使用指南文档
- 任何需要生成文档的地方
