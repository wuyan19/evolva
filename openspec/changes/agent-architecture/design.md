## Context

Evolva 当前采用 DOM 快照方式与 LLM 交互：前端捕获 iframe 的 `document.documentElement.outerHTML`，发送到 `call_llm` Tauri 命令，后端通过手写的 `reqwest` 调用（`call_openai` / `call_anthropic`）访问 LLM API，从响应中提取 markdown 代码块，返回前端通过 `injectCode()` 作为 `<script>` 元素注入执行。

这种架构存在三个核心问题：
1. **Token 浪费**：DOM 快照随交互轮次膨胀，大量 token 消耗在重复的静态内容上
2. **能力受限**：每轮只能输出一段 JS 代码，LLM 无法读取文件、搜索代码、分步操作
3. **无错误反馈**：代码执行失败后无机制回传 LLM，无法自我修复

**目标架构**：每个标签页的独立文件目录（`index.html`、`style.css`、`app.js`）+ LLM Tool-Use 多轮循环 + 构建预览 + 错误反馈。使用 `rig-core` 库作为 LLM 提供商抽象层。

**约束**：无 npm / 前端构建工具，CSP 保持 null，`withGlobalTauri: true`，系统提示词英文编译进二进制。

## Goals / Non-Goals

**Goals:**
- 用 `rig-core` 统一 LLM 提供商调用，替代手写的 reqwest OpenAI/Anthropic 代码
- 为每个标签页创建隔离的项目文件系统（内存 HashMap）
- 实现 Tool-Use 循环，LLM 自主调用 `read_file`、`write_file`、`edit_file`、`list_files`、`grep` 工具
- 实现构建预览：将项目文件组装为 HTML 加载到 iframe
- 实现错误反馈循环：运行时错误自动回传 LLM 修复
- 维护对话历史，支持上下文窗口管理
- 旧版 `.evolva.json` 文件向后兼容

**Non-Goals:**
- 不向用户暴露多轮对话 UI（用户只发一条指令，工具循环在内部完成）
- 不在此变更中添加新的 LLM 提供商（仅 OpenAI/Anthropic）
- 不修改 `sandbox.js`（保持现有沙盒安全层）
- 不实现项目文件磁盘持久化（文件在内存中，仅导出时持久化）
- 不实现流式 LLM 响应（Tool-Use 循环需要完整响应）
- 不修改标签页管理或窗口系统

## Decisions

### D1: rig 集成方案

**决策**：在 `Cargo.toml` 中用 `rig-core` 替代 `reqwest` 直接调用。根据 `settings.protocol` 在运行时构建对应的 rig 客户端：

```rust
// OpenAI
rig::providers::openai::Client::builder()
    .api_key(&settings.api_key)
    .base_url(&settings.base_url)
    .build()

// Anthropic
rig::providers::anthropic::Client::builder()
    .api_key(settings.api_key.clone())
    .base_url(&settings.base_url)
    .build()
```

工具注册使用 `ToolDyn` trait 对象（`Vec<Box<dyn ToolDyn>>`），Agent 通过 `.tool(T).preamble(S).max_turns(N).build()` 构建。

**理由**：rig 内部处理 OpenAI (`tool_calls`) 和 Anthropic (`content blocks`) 的工具调用格式差异，消除约 110 行手写 HTTP 代码。两个提供商都支持 `base_url()` 自定义端点。

**备选 A**：保留 reqwest 手动实现 tool-use 协议 → 维护成本高，OpenAI 和 Anthropic 的 tool_call JSON 格式不同，API 变更需同步修改。
**备选 B**：使用 `async-openai` crate → 不支持 Anthropic，需要第二个库。

### D2: 项目文件结构

**决策**：每个标签页在 Rust 内存中维护虚拟文件系统，表示为 `HashMap<String, String>`（路径 → 内容）。初始文件集：

```
index.html    — 主 HTML 结构
style.css     — 样式表
app.js        — 应用逻辑
```

存储在 Tauri 状态中：`Mutex<HashMap<String, ProjectFs>>`。文件路径相对于项目根目录（如 `"index.html"`、`"components/header.js"`）。LLM 可创建子目录（通过写入 `"components/header.js"` 等 key）。

**理由**：内存 HashMap 简单快速，无需文件系统 I/O。三文件结构是 Web 开发的通用模式，LLM 自然理解。

**备选 A**：磁盘文件系统（tempdir）→ 增加清理复杂性、权限问题、跨平台路径问题。
**备选 B**：Git 支持的文件存储（git2 crate）→ 强大的版本控制，但对 MVP 过重。

### D3: Tool-Use 循环流程

**决策**：实现 5 个核心工具作为 rig Tool trait：

| 工具 | 参数 | 说明 |
|------|------|------|
| `read_file` | `{path}` | 读取项目文件内容 |
| `write_file` | `{path, content}` | 写入/创建文件 |
| `edit_file` | `{path, old_text, new_text}` | 搜索替换编辑（对 LLM 友好，无需行号） |
| `list_files` | `{directory?}` | 列出文件路径 |
| `grep` | `{pattern, path?}` | 搜索文件内容 |

循环流程：
1. 用户发送指令 → 前端调用 `call_llm` 命令（传入 `tab_id` + `instruction`）
2. 后端构建/获取该标签页的 Agent（含工具 + 对话历史）
3. `agent.chat(instruction, history).max_turns(20).await?` — rig 自动处理循环
4. LLM 返回工具调用 → rig 执行工具 → 返回结果 → LLM 继续，直到无工具调用或达到 max_turns
5. 后端追加消息到历史，组装预览 HTML，返回前端

**理由**：`edit_file` 使用搜索替换而非行号，因为 LLM 识别内容模式比计算行号更可靠。`max_turns(20)` 提供安全边界。rig 自动处理工具调度，无需手动编排。

**备选 A**：手动实现工具循环 → 需分别解析 OpenAI/Anthropic 的 tool_call JSON，正是 rig 消除的复杂性。
**备选 B**：LangChain-rs → 不够成熟，工具支持文档少。

### D4: 对话历史管理

**决策**：对话历史存储在 Rust 内存中，按标签页隔离：`Mutex<HashMap<String, Vec<Message>>>`。每个工具调用轮次追加消息。当估算 token 数超过上下文窗口 70% 时应用压缩策略：

1. 保留系统提示（始终）
2. 保留最近 5 轮完整的工具调用
3. 截断旧轮次的工具结果（保留调用摘要，替换详细结果为 `[截断]`）
4. 保留最新的用户消息和 LLM 响应

**理由**：工具调用轮次产生大量消息（每个工具调用 + 结果各一条），上下文增长快。70% 阈值提供安全余量防止 API 失败。

**备选 A**：无压缩，硬消息限制 → 过低丢失重要上下文，过高浪费 token。
**备选 B**：每次用户消息重置历史 → 丢失先前上下文，LLM 无法引用早期决策。

### D5: 构建预览机制

**决策**：Tool-Use 循环完成后，后端组装预览 HTML：

1. 从项目文件系统读取 `index.html`
2. 将 `<link rel="stylesheet" href="style.css">` 替换为内联 `<style>` 中的 `style.css` 内容
3. 将 `<script src="app.js"></script>` 替换为内联 `<script>` 中的 `app.js` 内容
4. 注入 `sandbox.js` 和 `interact.js`（复用现有缓存文本）
5. 注入现有的 mutation helpers（`setupDraggable`、`bringToFront` 等）
6. 通过 `build_preview` 命令返回完整 HTML 字符串
7. 前端通过 `iframe.contentDocument.open(); doc.write(html); doc.close()` 加载
8. 前端通过 `window.onerror` 捕获运行时错误
9. 检测到错误时自动回传 LLM 修复（最多重试 2 次）

**理由**：内联组装避免跨源 iframe src 问题。`doc.write()` 与现有 `initMutationSpaceForTab` 模式一致。运行时错误捕获提供关键反馈循环。

**备选 A**：使用 `iframe srcdoc` → 浏览器支持差异，CSP 行为不一致。
**备选 B**：Blob URL + `iframe.src` → 额外 URL 管理、生命周期控制。
**备选 C**：自定义 Tauri 协议服务内存文件 → 过度工程化。

### D6: 向后兼容

**决策**：支持旧版 `.evolva.json`（版本 1，含 `versions: [{instruction, code}]`）并提供自动迁移：

1. 格式检测：JSON 包含 `"versions"` 数组且条目含 `"code"` → 旧版
2. 迁移策略：将最终版本的 JS 代码放入 `app.js`，创建最小 `index.html` 和空 `style.css`
3. 新导出格式（版本 2）：
```json
{
  "version": 2,
  "name": "...",
  "created_at": "...",
  "files": { "index.html": "...", "style.css": "...", "app.js": "..." },
  "window_states": [...]
}
```

**理由**：版本 1 → 版本 2 迁移必须自动化，防止用户数据丢失。版本 2 格式更简单（文件快照，无需顺序重放）。

**备选 A**：完全放弃旧格式 → 破坏现有用户导出，不可接受。

### D7: 前后端通信

**决策**：用新的 `call_llm` 替换现有命令。后端在 Tool-Use 循环中通过 Tauri 事件（`app.emit`）发送实时进度：

**Tauri 事件**：
- `tool-call`：`{tab_id, tool, args, status: "calling"}`
- `tool-result`：`{tab_id, tool, result, duration_ms}`

**返回值**：`LlmResult { files_changed: Vec<String>, preview_html: String, error: Option<String>, tool_calls: Vec<ToolCallLog> }`

**前端流程**：
1. 用户发送指令 → 调用 `call_llm`
2. 监听 `tool-call` / `tool-result` 事件，实时显示工具调用日志
3. `call_llm` 返回后，用 `preview_html` 重新加载 iframe
4. 设置 `window.onerror` 捕获运行时错误
5. 错误自动回传 `call_llm` 修复

**理由**：Tauri 事件系统提供实时进度，无需轮询或复杂流式设置。工具循环在 Rust 中完成，前端保持简洁。

**备选 A**：前端驱动工具循环 → 每个工具需要 IPC 往返，增加延迟。
**备选 B**：HTTP SSE 流式传输 → 需要本地 HTTP 服务器，增加攻击面。

## Risks / Trade-offs

1. **rig-core 成熟度风险**：rig 是较新的库，API 可能在版本间变化。→ 缓解：Cargo.toml 中锁定具体版本，抽象层很小（客户端构建 + 工具定义 + Agent 提示），必要时可迁移。

2. **LLM 工具调用可靠性**：并非所有模型都能可靠使用工具，小模型可能幻觉工具参数。→ 缓解：系统提示明确列出工具和参数格式。`edit_file` 使用文本搜索替换比行号编辑更容错。

3. **上下文窗口压力**：多轮工具调用含文件内容比单次代码注入消耗更多 token。→ 缓解：D4 的压缩策略 + `read_file` 让 LLM 选择性读取文件。

4. **向后兼容保真度**：版本 1 迁移有损（JS 代码 → `app.js`，但 DOM 状态未捕获）。→ 缓解：迁移代码向用户记录警告。

5. **失去直接 DOM 操作**：LLM 操作文件而非 DOM，某些场景效率可能降低。→ 缓解：系统提示引导 LLM 使用标准 HTML/CSS/JS 模式，构建预览将文件反映到可视化 DOM。

## Migration Plan

**阶段 1：基础设施（先添加，不删除）**
1. Cargo.toml 添加 `rig-core` 依赖
2. lib.rs 中创建 `ProjectFs` 结构体和 5 个 Tool 实现
3. 添加新的 Tauri 状态：`Mutex<HashMap<String, ProjectFs>>` + `Mutex<HashMap<String, Vec<Message>>>`
4. 实现新的 `call_llm_v2` 命令，与现有 `call_llm` 并行
5. 添加 `init_project`、`get_project_files`、`build_preview` 命令

**阶段 2：前端适配**
6. 添加新的 `mutate_v2()` 函数
7. 实现工具调用日志渲染（监听 Tauri 事件）
8. 实现预览加载逻辑
9. 实现错误反馈循环（自动重试）
10. 切换按钮处理程序到 `mutate_v2()`

**阶段 3：导出/导入迁移**
11. 更新 `export_app` 输出版本 2 格式
12. 更新 `import_app` 检测版本 1/2 格式
13. 实现版本 1 → 2 自动迁移
14. 更新 `auto_save` / `auto_load` 为版本 2 格式

**阶段 4：清理**
15. 移除旧的 `call_openai`、`call_anthropic`、`extract_code`、`capture_dom`
16. 移除旧 `call_llm` 命令
17. 移除 `injectCode` 前端函数
18. 移除 `Mutation` 结构体和 `HashMap<String, Vec<Mutation>>` 状态
19. 更新系统提示词为文件操作模式

## Open Questions

1. **rig-core 具体版本**：哪个版本具有稳定的 `ToolDyn` + `Chat` + Agent builder API？需验证候选版本兼容性。

2. **Anthropic base_url 行为**：rig 的 Anthropic 客户端使用自定义 `base_url` 时，是否会正确拼接 `/v1/messages`？需通过集成测试确认。

3. **文件粒度**：初始三文件结构是否足够，还是应鼓励 LLM 拆分为更多文件？系统提示词将引导此决策。

4. **错误检测范围**：`window.onerror` 仅捕获未处理异常。如果 LLM 生成视觉正确但功能损坏的代码？是否需要启发式检查（如验证预期元素存在）？

5. **上下文压缩策略**：摘要函数是调用 LLM（昂贵）还是基于规则（便宜但不智能）？建议：初始用基于规则（截断旧工具结果，保留摘要），后续添加 LLM 摘要。

6. **并发标签页**：两个标签页是否可同时运行 LLM 循环？当前设计通过按标签页独立状态支持，但 rig Agent 可能需要每次调用创建新实例。
