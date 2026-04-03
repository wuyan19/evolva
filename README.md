# Evolva

一个能够**自我演化**的桌面应用。通过自然语言指令修改自身 UI，应用捕获当前 DOM 状态发送给 LLM，接收生成的 JavaScript 代码并动态执行——形成持续的自修改循环。

基于 [Tauri v2](https://v2.tauri.app/) 构建，前端使用纯 HTML/CSS/JS，后端使用 Rust。

## 工作原理

```
用户输入指令 → 捕获当前 DOM → 压缩后发送至 LLM → 接收 JS 代码 → 动态注入执行 → UI 更新
                                      ↑                                              |
                                      └────────── 下一次修改的起点 ──────────────────┘
```

1. **DOM 捕获** — 剥离 `<script>` 标签和系统提示，截断日志至最近 10 条，压缩上下文
2. **LLM 代理** — Rust 后端转发请求至 OpenAI / Anthropic API，绕过 webview CORS 限制
3. **代码提取** — 从 LLM 返回的 markdown 代码块中解析 JavaScript
4. **动态注入** — 将 `require()` 转换为 esm.sh 动态 import，以 async IIFE 注入执行

## 功能特性

- **自然语言驱动** — 用中文或英文描述你想要的 UI 改动，LLM 生成代码并即时生效
- **多协议支持** — 兼容 OpenAI 和 Anthropic 两种 API 协议
- **可拖拽窗口** — 基于 interact.js 的窗口系统，支持拖拽和缩放
- **上下文监控** — 实时显示 token 用量和上下文窗口占用比例
- **暗/亮主题** — 一键切换，设置自动持久化
- **操作日志** — 带时间戳的完整变更记录

## 快速开始

### 环境要求

- [Rust](https://www.rust-lang.org/tools/install) (stable)
- [Node.js](https://nodejs.org/) (v18+)
- 系统依赖参见 [Tauri 官方文档](https://v2.tauri.app/start/prerequisites/)

### 安装与运行

```bash
# 克隆仓库
git clone <repo-url>
cd evolva

# 安装前端依赖
npm install

# 开发模式运行
cargo tauri dev
```

### 构建发布

```bash
cargo tauri build
```

构建产物位于 `src-tauri/target/release/bundle/`。

## 使用方法

1. 启动应用后，点击右上角 **设置** 图标
2. 填写 API Key、Base URL，选择协议（OpenAI / Anthropic）和模型名称
3. 在底部输入框描述你想要的 UI 变更（例如："把背景改成渐变色"、"添加一个时钟组件"）
4. 按 **Ctrl+Enter** 或点击发送按钮
5. LLM 生成的代码将自动注入并执行

## 项目结构

```
evolva/
├── src/
│   └── index.html            # 完整前端应用（HTML + CSS + JS 单文件）
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs            # Rust 后端核心（LLM API 代理）
│   │   └── main.rs           # 入口点
│   ├── Cargo.toml            # Rust 依赖配置
│   └── tauri.conf.json       # Tauri 应用配置
├── openspec/                  # OpenSpec 规格驱动开发文档
│   └── specs/                # 功能规格说明
└── package.json              # npm 配置（Tauri CLI）
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Tauri v2 |
| 前端 | HTML / CSS / JavaScript（无框架，无构建步骤） |
| 后端 | Rust |
| HTTP 客户端 | reqwest 0.12 |
| 交互 | interact.js (CDN) |
| AI 接口 | OpenAI / Anthropic API |

## 开发

```bash
cargo tauri dev       # 开发模式（热重载）
cargo check           # 检查 Rust 编译错误
npm run tauri dev     # 等效于 cargo tauri dev
```

## 许可证

MIT
