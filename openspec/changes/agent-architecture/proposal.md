## Why

当前 Evolva 采用 DOM 快照方式与 LLM 交互——每轮将完整 iframe DOM 发送给 LLM，LLM 返回单段 JS 代码注入执行。这带来三个核心问题：(1) DOM 快照随交互轮次膨胀，大量 token 浪费在重复的静态内容上；(2) LLM 每轮只能输出一段代码，无法读取文件、搜索代码、多步操作，复杂任务容易出错；(3) 代码执行失败后无反馈机制，LLM 无法自我修复。

## What Changes

- **BREAKING**：用项目文件系统替代 DOM 快照作为 LLM 的工作介质。每个标签页拥有独立的文件目录（`index.html`、`style.css`、`app.js`），LLM 通过工具操作文件，而非直接修改 DOM
- **BREAKING**：用 Tool-Use 多轮循环替代单次代码注入。LLM 可以调用 `read_file`、`write_file`、`edit_file`、`list_files`、`grep` 等工具自主完成任务，直到认为完成才停止
- 引入 `rig` 库统一管理 OpenAI / Anthropic 等 API 协议差异，替代当前手写的 `reqwest` 调用
- 新增构建预览机制：LLM 完成文件操作后，将项目文件组装为 HTML 加载到 iframe 中预览
- 新增错误反馈循环：构建或运行时错误自动回传 LLM，支持自动修复
- 新增对话历史管理：维护多轮工具调用的完整消息历史，支持上下文压缩

## Capabilities

### New Capabilities
- `project-fs`: 项目文件系统管理——每个标签页的独立文件目录创建、文件读写、列表、搜索
- `tool-use-loop`: Tool-Use 多轮循环——基于 rig 的 Agent 构建器，自动处理工具调用循环、协议转换、对话历史管理
- `build-preview`: 构建预览——将项目文件组装为 HTML 加载到 iframe，捕获运行时错误回传 LLM

### Modified Capabilities
- `self-mutation`: 核心变异流程从"DOM 快照→单段代码"变为"指令→多轮工具调用→构建预览"
- `llm-proxy`: 从手写 reqwest 调用迁移到 rig 统一 API，协议路由由 rig 内部处理
- `app-io`: 导出格式从保存代码版本列表变为保存项目文件目录；导入从重放代码变为还原文件

## Impact

- **Cargo.toml**：新增 `rig-core` 依赖，可能移除 `reqwest`（rig 内部使用）
- **lib.rs**：大幅重构——移除 `call_openai`/`call_anthropic`/`extract_code`/`capture_dom`，新增 rig Agent 构建和项目管理命令
- **app.js**：`mutate()` 函数重构为驱动后端 tool-use 循环并实时展示进度；`injectCode` 被 `build_preview` 替代
- **sandbox.js**：保持不变（仍作为 iframe 安全层）
- **style.css**：新增工具调用日志样式
- **向后兼容**：旧版 `.evolva.json` 导出文件需要迁移工具或兼容层
