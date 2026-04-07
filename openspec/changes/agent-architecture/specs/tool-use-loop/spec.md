## ADDED Requirements

### Requirement: rig Agent construction
系统 SHALL 使用 `rig-core` 库构建 LLM Agent。根据用户设置的 `protocol` 字段，在运行时选择 OpenAI 或 Anthropic 提供商。Agent SHALL 配置系统提示词（编译进二进制的英文提示）、5 个项目工具（`read_file`、`write_file`、`edit_file`、`list_files`、`grep`）和最大工具调用轮次限制。

#### Scenario: 构建 OpenAI Agent
- **WHEN** 用户设置 protocol 为 "openai"，api_key 为 "sk-xxx"，base_url 为 "https://api.openai.com/v1"，model 为 "gpt-4o"
- **THEN** 系统 SHALL 使用 `rig::providers::openai::Client::builder().api_key("sk-xxx").base_url("https://api.openai.com/v1").build()` 构建客户端，并创建配置了工具和提示词的 Agent

#### Scenario: 构建 Anthropic Agent
- **WHEN** 用户设置 protocol 为 "anthropic"，api_key 为 "sk-ant-xxx"，base_url 为 "https://api.anthropic.com"
- **THEN** 系统 SHALL 使用 `rig::providers::anthropic::Client::builder()` 构建客户端，并创建配置了工具和提示词的 Agent

#### Scenario: 配置缺失时拒绝调用
- **WHEN** 用户未配置 api_key 且未配置 base_url
- **THEN** 系统 SHALL 返回错误 "Configure settings first"，不构建 Agent

### Requirement: Multi-turn tool-use loop
系统 SHALL 通过 rig Agent 的 `.chat(instruction, history).max_turns(20)` 执行多轮工具调用循环。LLM 每次返回工具调用时，rig 自动执行工具并将结果回传 LLM，循环持续直到 LLM 不再调用工具或达到最大轮次。

#### Scenario: 单轮完成（LLM 一次写入所有文件）
- **WHEN** 用户发送 "创建一个待办事项应用"，LLM 在一轮中连续调用 `write_file` 写入 `index.html`、`style.css`、`app.js`，然后返回文本响应
- **THEN** 系统 SHALL 执行所有工具调用，返回最终响应

#### Scenario: 多轮交互（LLM 先读取再修改）
- **WHEN** 用户发送 "修改计算器的样式"，LLM 先调用 `read_file("style.css")`，读取结果后调用 `edit_file` 修改样式
- **THEN** 系统 SHALL 自动处理两轮工具调用，将第一次工具结果喂给 LLM 继续推理

#### Scenario: 达到最大轮次限制
- **WHEN** LLM 连续调用工具达到 20 次仍未停止
- **THEN** 系统 SHALL 终止循环，返回已执行的工具调用记录和截断警告

### Requirement: Conversation history management
系统 SHALL 为每个标签页维护独立的对话历史（`Vec<Message>`），每次 `call_llm` 调用后追加新消息。当估算 token 数超过上下文窗口 70% 时，SHALL 应用压缩策略。

#### Scenario: 历史累积
- **WHEN** 用户在第 2 次发送指令时
- **THEN** 系统 SHALL 将第 1 次的完整对话历史（系统提示 + 用户消息 + 工具调用 + 最终响应）作为上下文发送

#### Scenario: 上下文压缩触发
- **WHEN** 对话历史估算 token 数超过上下文窗口的 70%
- **THEN** 系统 SHALL 保留最近 5 轮完整工具调用，截断旧轮次的工具结果为摘要，保留系统提示和最新用户消息

#### Scenario: 首次调用无历史
- **WHEN** 新创建的标签页首次调用 `call_llm`
- **THEN** 系统 SHALL 仅发送系统提示和用户消息，不包含历史

### Requirement: Tool call progress events
后端 SHALL 在 Tool-Use 循环执行期间，通过 Tauri 事件向前端发送实时进度：工具调用开始时发送 `tool-call` 事件，工具执行完成后发送 `tool-result` 事件。

#### Scenario: 工具调用进度通知
- **WHEN** LLM 调用 `write_file` 工具
- **THEN** 后端 SHALL 先发送 `tool-call` 事件 `{tab_id, tool: "write_file", args: {path: "app.js", content: "..."}, status: "calling"}`，执行完成后发送 `tool-result` 事件 `{tab_id, tool: "write_file", result: "OK", duration_ms: 150}`

#### Scenario: 多个工具连续调用
- **WHEN** LLM 连续调用 3 个工具
- **THEN** 后端 SHALL 为每个工具分别发送 `tool-call` 和 `tool-result` 事件对

### Requirement: LLM result return
`call_llm` 命令 SHALL 返回 `LlmResult` 结构，包含：`files_changed`（被修改的文件列表）、`preview_html`（组装的预览 HTML）、`error`（可选错误）、`tool_calls`（工具调用日志列表）。

#### Scenario: 成功完成
- **WHEN** Tool-Use 循环正常完成
- **THEN** 返回的 `LlmResult` SHALL 包含非空的 `preview_html`、`files_changed` 列表和 `tool_calls` 日志

#### Scenario: LLM API 错误
- **WHEN** LLM API 返回非 2xx 状态码
- **THEN** 返回的 `LlmResult` SHALL 包含 `error` 字段，描述错误信息
