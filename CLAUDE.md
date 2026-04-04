# CLAUDE.md

## 项目概述

Evolva — 基于 Tauri v2 的自演化桌面应用。用户输入自然语言指令，应用捕获当前 DOM 状态发送给 LLM，接收 JavaScript 代码并动态执行，形成自修改循环。

## 常用命令

```bash
cargo tauri dev          # 开发模式运行
cargo tauri build        # 生产构建
cargo check              # 检查 Rust 编译
npm run tauri dev        # 等效于 cargo tauri dev
```

无测试套件，无 lint 配置。

## 架构

- **前端**：`src/index.html` — 单文件应用（HTML + CSS + JS），无构建步骤
- **后端**：`src-tauri/src/lib.rs` — Rust 实现 LLM 调用、Settings 持久化、DOM 压缩、代码提取
- **通信**：Tauri Command 模式，前端通过 `window.__TAURI__.core.invoke()` 调用后端

### 前后端职责分工

**前端负责**：UI 渲染、DOM 操作（日志截断、代码注入）、主题切换
**后端负责**：Settings 持久化（API Key 不经过前端）、System Prompt（编译进二进制）、DOM 压缩（剥离 script 标签）、代码提取（从 LLM 响应解析 JS）、require→esm.sh 转换、Token 估算

### 自修改引擎

1. 前端截断日志至最近 10 条，发送原始 DOM + 用户指令到后端
2. 后端压缩 DOM、拼接编译常量 System Prompt、调用 LLM API
3. 后端从响应提取代码、转换 require 为 esm.sh 动态 import
4. 前端将代码以 async IIFE 注入执行

### 关键设计决策

| 决策 | 原因 |
|------|------|
| 单文件前端 | LLM 可见完整页面状态 |
| CSP 设为 null | 动态 script 注入所需 |
| withGlobalTauri: true | 避免 npm，直接全局访问 Tauri API |
| Rust 代理 LLM 调用 | 绕过 CORS |
| Settings 后端持久化 | API Key 不暴露给前端注入的 JS |
| System Prompt 编译进二进制 | 不占用 DOM 空间，减少发给 LLM 的上下文 |

## 关键文件

| 文件 | 职责 |
|------|------|
| `src/index.html` | 完整前端应用 |
| `src-tauri/src/lib.rs` | Rust 后端，LLM API 代理 |
| `src-tauri/tauri.conf.json` | Tauri 应用配置 |
| `src-tauri/Cargo.toml` | Rust 依赖管理 |

## 必须遵守

> **以下规则优先级最高，违反任何一条即为错误。**

1. **语言**：所有输出（回复、文档、代码注释、commit message、OpenSpec 产物）必须使用中文，代码标识符除外。
2. **单文件约束**：前端代码只能存在于 `src/index.html`，禁止拆分为多个文件。
3. **CSP 不改动**：`tauri.conf.json` 中 CSP 必须保持 null，不得收紧。
4. **不引入包管理**：禁止添加 package.json、npm install、前端构建工具，保持 `withGlobalTauri: true`。
