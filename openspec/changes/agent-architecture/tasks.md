## 1. 依赖与基础设施

- [x] 1.1 在 `Cargo.toml` 中添加 `rig-core` 依赖（含 `openai` 和 `anthropic` feature），验证编译通过
- [x] 1.2 在 `lib.rs` 中定义 `ProjectFs` 结构体（`HashMap<String, String>` + 方法：`read`、`write`、`edit`、`list`、`grep`）
- [x] 1.3 添加 Tauri 状态管理：`Mutex<HashMap<String, ProjectFs>>`（项目文件系统）和 `Mutex<HashMap<String, Vec<rig::message::Message>>>`（对话历史）

## 2. 项目文件系统工具实现

- [x] 2.1 实现 `ReadFileTool`（rig Tool trait）：读取项目文件，不存在时返回错误
- [x] 2.2 实现 `WriteFileTool`（rig Tool trait）：写入/创建文件
- [x] 2.3 实现 `EditFileTool`（rig Tool trait）：搜索替换编辑，old_text 唯一性校验
- [x] 2.4 实现 `ListFilesTool`（rig Tool trait）：列出文件路径并排序
- [x] 2.5 实现 `GrepTool`（rig Tool trait）：正则搜索项目文件内容，返回匹配行及行号

## 3. rig Agent 集成

- [x] 3.1 实现 rig 客户端构建函数：根据 `settings.protocol` 选择 OpenAI 或 Anthropic 提供商，支持自定义 `base_url`
- [x] 3.2 实现系统提示词更新：从"DOM 操作模式"改为"文件操作模式"（英文，编译进二进制）
- [x] 3.3 实现 Agent 构建函数：组合 rig 客户端 + 系统提示词 + 5 个工具 + max_turns(20)
- [x] 3.4 实现 `call_llm` 新命令：构建 Agent → 执行 `.chat(instruction, history)` → 返回 `LlmResult`
- [x] 3.5 实现对话历史管理：按标签页维护历史，token 超过 70% 时应用压缩策略

## 4. 构建预览机制

- [x] 4.1 实现 HTML 组装函数：将项目文件（index.html、style.css、app.js 等）内联组装为完整 HTML
- [x] 4.2 在组装中注入 sandbox.js + interact.js + mutation helpers（`setupDraggable`、`bringToFront` 等）
- [x] 4.3 实现 `build_preview` Tauri 命令：调用组装函数，返回完整 HTML 字符串
- [x] 4.4 实现 `init_project` Tauri 命令：创建默认三文件项目（index.html 骨架 + 空 style.css + 空 app.js）

## 5. 前端适配

- [x] 5.1 重写 `mutate()` 函数：调用新 `call_llm` → 监听 `tool-call`/`tool-result` 事件 → 显示工具日志 → 用 `preview_html` 重建 iframe
- [x] 5.2 实现工具调用日志渲染：在 log 区域显示每个工具调用的名称、参数摘要和执行结果
- [x] 5.3 实现预览加载：通过 `doc.write(preview_html)` 替换 iframe 内容，重新初始化 mutation helpers
- [x] 5.4 实现运行时错误捕获：在 iframe 中设置 `window.onerror`，错误自动回传 LLM 修复（最多 2 次）
- [x] 5.5 实现标签页创建时调用 `init_project`，标签页关闭时清理项目数据
- [x] 5.6 更新上下文条：显示项目文件总 token 估算（文件内容长度之和 / 4）

## 6. 导出/导入迁移

- [x] 6.1 更新 `export_app` 命令：输出版本 2 格式（`version: 2` + `files` 对象 + `window_states`）
- [x] 6.2 更新 `import_app` 命令：自动检测版本 1/2 格式
- [x] 6.3 实现版本 1 → 2 自动迁移：最终版本代码放入 `app.js`，创建最小 `index.html` 和空 `style.css`
- [x] 6.4 更新 `auto_save` / `auto_load` 命令为版本 2 格式
- [x] 6.5 更新前端导入流程：版本 2 直接调用 `build_preview`，版本 1 迁移后调用 `build_preview`

## 7. 清理旧代码

- [x] 7.1 移除 `call_openai` 和 `call_anthropic` 函数
- [x] 7.2 移除 `extract_code` 和 `capture_dom` 函数
- [x] 7.3 移除 `HashMap<String, Vec<Mutation>>` 状态（保留 `Mutation` 用于 v1 兼容）
- [x] 7.4 移除 `save_mutation`、`get_mutation_count`、`estimate_tokens` 命令
- [x] 7.5 移除前端 `injectCode` 函数（已被 `loadPreviewHtml` 替代）
- [x] 7.6 移除前端 DOM 快照捕获和代码注入相关逻辑
- [x] 7.7 Cargo.toml 移除不再需要的依赖（如果 rig 内部已包含）
