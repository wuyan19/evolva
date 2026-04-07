## MODIFIED Requirements

### Requirement: Mutation loop orchestration
系统 SHALL 通过 Tool-Use 多轮循环编排完整的变异流程：锁定 UI → 构建项目工具和对话历史 → 执行 rig Agent 循环 → 发送工具调用进度事件 → 组装预览 HTML → 加载预览到 iframe → 捕获运行时错误 → 错误自动修复（最多 2 次）→ 保存项目状态 → 解锁 UI。Prompt textarea 在成功完成后 SHALL 清空。

#### Scenario: Full successful cycle
- **WHEN** 用户提交有效的指令且设置已配置
- **THEN** 系统 SHALL 锁定 UI、记录用户消息、构建 Agent 执行 Tool-Use 循环、实时显示工具调用日志、组装并加载预览到 iframe、保存项目状态、记录成功、清空 prompt、解锁 UI

#### Scenario: Processing lock
- **WHEN** 请求进行中且用户再次点击发送
- **THEN** 系统 SHALL 忽略点击，不启动重复请求

#### Scenario: Missing configuration
- **WHEN** 用户未配置 api_key 且未配置 base_url 时提交指令
- **THEN** 系统 SHALL 记录错误 "Configure settings first"，不调用 LLM

#### Scenario: Tool call progress display
- **WHEN** LLM 在循环中调用 `write_file` 工具
- **THEN** 日志区域 SHALL 实时显示工具调用记录（工具名称、参数摘要、执行结果）

#### Scenario: Error auto-fix
- **WHEN** 预览加载后 iframe 中发生 JavaScript 运行时错误
- **THEN** 系统 SHALL 自动将错误信息作为新指令发送给 LLM，修复后重新加载预览

## REMOVED Requirements

### Requirement: DOM capture with compression
**Reason**: 项目文件系统取代了 DOM 快照方式。LLM 现在通过 `read_file` 工具按需读取文件，不再需要捕获和压缩 DOM。
**Migration**: 项目文件作为 LLM 的工作介质，`read_file` 工具提供精确的文件内容。

### Requirement: Code block extraction
**Reason**: Tool-Use 模式下 LLM 通过工具调用操作文件，不再返回 markdown 代码块。rig 库内部处理 LLM 响应解析。
**Migration**: rig 的 Agent 自动解析 LLM 响应中的工具调用。

### Requirement: Script injection and execution
**Reason**: 代码不再直接注入 iframe。取而代之的是写入项目文件，然后通过构建预览机制加载。
**Migration**: `write_file` / `edit_file` 工具操作文件，`build_preview` 组装并加载 HTML。
