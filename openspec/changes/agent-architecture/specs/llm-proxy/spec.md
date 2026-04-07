## MODIFIED Requirements

### Requirement: OpenAI protocol support
系统 SHALL 通过 `rig-core` 库的 `rig::providers::openai` 模块支持调用 OpenAI 兼容 API。系统 SHALL 使用 `openai::Client::builder().api_key(key).base_url(url).build()` 构建客户端。协议路由由 rig 内部处理，后端不再手动拼接 HTTP 请求。

#### Scenario: Successful OpenAI call
- **WHEN** 用户发送指令，protocol 设置为 "openai"，api_key 为 "sk-xxx"，base_url 为 "https://api.openai.com/v1"，model 为 "gpt-4o"
- **THEN** 系统 SHALL 通过 rig 的 OpenAI 客户端发起请求，返回 LLM 响应

#### Scenario: OpenAI call with empty API key
- **WHEN** 用户发送指令，api_key 为空
- **THEN** 系统 SHALL 构建不含认证信息的 rig 客户端

#### Scenario: OpenAI API error
- **WHEN** OpenAI API 返回非 2xx 状态码
- **THEN** rig SHALL 返回错误，后端将错误信息传递给前端

### Requirement: Anthropic protocol support
系统 SHALL 通过 `rig-core` 库的 `rig::providers::anthropic` 模块支持调用 Anthropic API。系统 SHALL 使用 `anthropic::Client::builder().api_key(key).base_url(url).build()` 构建客户端。

#### Scenario: Successful Anthropic call
- **WHEN** 用户发送指令，protocol 设置为 "anthropic"，api_key 为 "sk-ant-xxx"，base_url 为 "https://api.anthropic.com"
- **THEN** 系统 SHALL 通过 rig 的 Anthropic 客户端发起请求，返回 LLM 响应

#### Scenario: Anthropic call with empty API key
- **WHEN** 用户发送指令，api_key 为空
- **THEN** 系统 SHALL 构建不含认证信息的 rig 客户端

#### Scenario: Anthropic API error
- **WHEN** Anthropic API 返回非 2xx 状态码
- **THEN** rig SHALL 返回错误，后端将错误信息传递给前端

### Requirement: Protocol routing
系统 SHALL 根据 `protocol` 字段选择 rig 的提供商模块。"anthropic" 值使用 `rig::providers::anthropic`；其他值使用 `rig::providers::openai`。

#### Scenario: Route to Anthropic
- **WHEN** protocol 字段为 "anthropic"
- **THEN** 系统 SHALL 使用 rig 的 Anthropic 客户端构建 Agent

#### Scenario: Route to OpenAI (default)
- **WHEN** protocol 字段为 "openai" 或任何其他值
- **THEN** 系统 SHALL 使用 rig 的 OpenAI 客户端构建 Agent
