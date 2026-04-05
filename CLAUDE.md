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

- **前端**：`src/` 目录下多文件应用（HTML + CSS + JS），无构建步骤
  - `index.html` — 页面结构
  - `style.css` — 样式与主题变量
  - `app.js` — 逻辑、i18n、iframe 管理、沙盒权限代理
  - `sandbox.js` — iframe 沙盒拦截层（fetch/import/文件/存储/剪贴板代理）
- **后端**：`src-tauri/src/lib.rs` — Rust 实现 LLM 调用、Settings 持久化、DOM 压缩、代码提取
- **通信**：Tauri Command 模式，前端通过 `window.__TAURI__.core.invoke()` 调用后端

### iframe 隔离架构

控制面板（evolva-core）与 LLM 变异空间（mutation-space iframe）完全隔离：
- **前端负责**：UI 渲染、iframe 初始化（加载 CSS/interact.js/sandbox.js/辅助函数）、主题与语言同步、代码注入、沙盒权限代理
- **后端负责**：Settings 持久化、System Prompt（编译进二进制）、DOM 压缩、代码提取、Token 估算、沙盒代理命令（文件读写/网络/存储）

### 自修改引擎

1. 前端读取 iframe DOM + 用户指令，发送到后端
2. 后端压缩 DOM、拼接编译常量 System Prompt、调用 LLM API
3. 后端从响应提取代码
4. 前端转换 `require()`/`import()` 为 `evolva.import()`，将代码注入 iframe 执行

### 关键设计决策

| 决策 | 原因 |
|------|------|
| iframe 隔离变异空间 | LLM 代码无法触及控制面板，安全且省 token |
| CSP 设为 null | 动态 script 注入所需 |
| withGlobalTauri: true | 避免 npm，直接全局访问 Tauri API |
| Rust 代理 LLM 调用 | 绕过 CORS |
| Settings 后端持久化 | API Key 不暴露给前端注入的 JS |
| System Prompt 编译进二进制 | 不占用 DOM 空间，减少发给 LLM 的上下文 |
| i18n 前端翻译表 | 支持中英文切换，语言设置保存在后端配置文件 |

## 关键文件

| 文件 | 职责 |
|------|------|
| `src/index.html` | 页面 HTML 结构 |
| `src/style.css` | 样式、主题变量、窗口样式 |
| `src/app.js` | 前端逻辑、i18n、iframe 管理、沙盒权限代理 |
| `src/sandbox.js` | iframe 沙盒拦截层，代理 fetch/import/文件/存储/剪贴板 |
| `src-tauri/src/lib.rs` | Rust 后端，LLM API 代理、沙盒命令、Settings |
| `src-tauri/tauri.conf.json` | Tauri 应用配置 |
| `src-tauri/Cargo.toml` | Rust 依赖管理 |

## 必须遵守

> **以下规则优先级最高，违反任何一条即为错误。**

1. **语言**：所有输出（回复、文档、代码注释、commit message、OpenSpec 产物）必须使用中文，代码标识符除外。
2. **CSP 不改动**：`tauri.conf.json` 中 CSP 必须保持 null，不得收紧。
3. **不引入包管理**：禁止添加 package.json、npm install、前端构建工具，保持 `withGlobalTauri: true`。
4. **系统提示词固定英文**：编译进二进制的 SYSTEM_PROMPT 使用英文，不做多语言切换。
