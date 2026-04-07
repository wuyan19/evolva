## MODIFIED Requirements

### Requirement: Export to file
Rust 后端 SHALL 提供 `export_app` 命令，将当前项目文件系统快照写入 JSON 文件。文件格式（版本 2）SHALL 包含 `version: 2`、`name`（应用名称）、`created_at`（导出时间 ISO 8601）、`files`（文件路径到内容的映射对象）、`window_states`（可选的窗口状态数组）。

#### Scenario: 导出包含多文件的项目
- **WHEN** 项目文件系统包含 `index.html`、`style.css`、`app.js` 三个文件，前端调用 `export_app`
- **THEN** 后端 SHALL 写入 JSON 文件，`version` 为 2，`files` 包含三个文件的内容

#### Scenario: 导出包含额外文件的项目
- **WHEN** 项目文件系统包含 `index.html`、`style.css`、`app.js`、`utils.js`，前端调用 `export_app`
- **THEN** 后端 SHALL 写入 JSON 文件，`files` 包含所有四个文件

### Requirement: Import from file
Rust 后端 SHALL 提供 `import_app` 命令，读取 JSON 文件并恢复项目文件系统。命令 SHALL 自动检测文件格式版本：版本 1（含 `versions` 数组）SHALL 自动迁移为文件格式；版本 2（含 `files` 对象）SHALL 直接加载。

#### Scenario: 导入版本 2 格式
- **WHEN** 前端调用 `import_app` 传入版本 2 格式的 JSON 文件（含 `files` 对象）
- **THEN** 后端 SHALL 用 `files` 中的内容替换当前标签页的文件系统，返回加载的文件列表

#### Scenario: 导入版本 1 格式自动迁移
- **WHEN** 前端调用 `import_app` 传入版本 1 格式的 JSON 文件（含 `versions` 数组）
- **THEN** 后端 SHALL 将最终版本的代码放入 `app.js`，创建最小 `index.html`（基本 HTML 骨架）和空 `style.css`，并在返回结果中标记 `migrated: true`

#### Scenario: 导入无效 JSON
- **WHEN** 前端调用 `import_app` 传入格式错误的文件
- **THEN** 后端 SHALL 返回错误包含解析失败信息

### Requirement: Import version replay
导入版本 2 格式时，前端 SHALL 直接将 `files` 中的内容还原到文件系统，无需顺序重放。导入版本 1 格式（迁移后）时，前端 SHALL 将迁移产生的文件加载到 iframe 预览。

#### Scenario: 版本 2 直接加载
- **WHEN** 导入版本 2 格式成功
- **THEN** 前端 SHALL 调用 `build_preview` 将文件组装为 HTML 加载到 iframe，无需逐个重放

#### Scenario: 版本 1 迁移后加载
- **WHEN** 导入版本 1 格式并自动迁移完成
- **THEN** 前端 SHALL 将迁移产生的文件加载到 iframe 预览

### Requirement: Auto-save with project files
`auto_save` 命令 SHALL 将当前项目文件系统快照保存为版本 2 格式的 JSON 文件。

#### Scenario: 保存项目状态
- **WHEN** 前端调用 `auto_save` 传入标签页 ID 和名称
- **THEN** 后端 SHALL 将文件系统快照和窗口状态写入自动保存文件

### Requirement: Auto-load project files
`auto_load` 命令 SHALL 从自动保存文件恢复项目文件系统和窗口状态。

#### Scenario: 恢复项目
- **WHEN** 前端调用 `auto_load` 传入标签页 ID
- **THEN** 后端 SHALL 从文件恢复文件系统，返回文件内容和窗口状态

## REMOVED Requirements

### Requirement: Mutation version accumulation
**Reason**: 版本列表被项目文件系统取代。每次 `call_llm` 直接修改文件，不再维护增量版本列表。
**Migration**: 项目文件系统始终保存最新状态，导出时保存完整快照。

### Requirement: Mutation count query
**Reason**: 不再使用增量版本计数。导出判断改为检查文件系统是否有用户内容。
**Migration**: 通过 `list_files` 和文件内容检查替代。

### Requirement: Clear mutations
**Reason**: 不再有版本列表需要清除。标签页关闭时直接删除整个项目文件系统。
**Migration**: `close_tab` 时自动清理项目数据。

### Requirement: Import DOM cleanup
**Reason**: 不再需要清理 iframe DOM 再重放代码。预览通过 `doc.write()` 完全重建。
**Migration**: `build_preview` 直接替换整个 iframe 内容。
