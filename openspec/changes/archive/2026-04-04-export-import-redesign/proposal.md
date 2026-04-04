## Why

当前的导入导出功能基于 DOM 快照序列化，导出的是 `outerHTML`，导入时通过 `insertAdjacentHTML` 恢复。这种方式丢失了事件监听器、运行时状态和 JavaScript 行为，导致导入后的应用无法正常交互。核心矛盾在于：Evolva 是自修改应用，真正的"状态"是 LLM 生成的代码，而非代码执行后的 DOM 副产品。

## What Changes

- **移除前端导出导入逻辑**：删除 `exportState()`、`importState()` 函数，不再在前端操作 DOM 序列化
- **新增 Rust 后端 Tauri Commands**：`save_mutation`、`export_app`、`import_app`、`clear_mutations`
- **新增版本累积机制**：每次 `mutate()` 成功后，前端调用 `save_mutation` 将用户指令和 LLM 生成的代码发送到 Rust 后端存储
- **新增结构化导出文件格式**：JSON 文件包含 `version`、`name`、`created_at`、`active_version`、`versions` 数组，每个版本包含用户指令和完整代码
- **新增基于版本回放的导入**：导入时清除当前非核心 DOM 元素，执行 `active_version` 指定的代码版本
- **新增导入确认机制**：当存在未保存的版本时，导入前弹出确认对话框

## Capabilities

### New Capabilities
- `app-io`：应用导入导出能力，包括版本累积、文件导出、文件导入和版本回放

### Modified Capabilities
- `self-mutation`：`mutate()` 流程新增调用 `save_mutation` 步骤，每次变异后记录版本
- `app-ui`：导入导出按钮行为变更，新增导入确认对话框

## Impact

- **Rust 后端**（`src-tauri/src/lib.rs`）：新增 4 个 Tauri Commands，新增 `Mutation` 和 `ExportData` 数据结构
- **前端**（`src/index.html`）：删除旧 `exportState()`/`importState()`，修改 `mutate()` 新增版本记录调用，重写导入导出按钮事件处理
- **依赖**：无新增外部依赖，使用已有的 `tauri-plugin-dialog` 和 `tauri-plugin-fs`
