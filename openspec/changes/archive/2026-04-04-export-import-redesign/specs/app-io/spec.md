## ADDED Requirements

### Requirement: Mutation version accumulation
Rust 后端 SHALL 维护一个内存中的版本列表。每次前端调用 `save_mutation` 命令时，后端 SHALL 将用户指令和 LLM 生成的代码追加到列表中。

#### Scenario: 保存第一个版本
- **WHEN** 前端调用 `save_mutation` 传入 instruction="帮我做一个计算器" 和 code="// JS code"
- **THEN** 后端 SHALL 将该版本追加到列表，版本索引为 0

#### Scenario: 保存后续版本
- **WHEN** 版本列表中已有 2 个版本，前端调用 `save_mutation` 传入新的 instruction 和 code
- **THEN** 后端 SHALL 将该版本追加到列表，版本索引为 2

### Requirement: Mutation count query
Rust 后端 SHALL 提供 `get_mutation_count` 命令，返回当前累积的版本数量。

#### Scenario: 查询空列表
- **WHEN** 前端调用 `get_mutation_count` 且没有任何已保存的版本
- **THEN** 返回 0

#### Scenario: 查询有版本的列表
- **WHEN** 已保存 3 个版本，前端调用 `get_mutation_count`
- **THEN** 返回 3

### Requirement: Export to file
Rust 后端 SHALL 提供 `export_app` 命令，将版本列表写入 JSON 文件。文件格式 SHALL 包含 `version`（格式版本号）、`name`（应用名称）、`created_at`（导出时间 ISO 8601）、`active_version`（默认最新版本索引）、`versions`（版本数组，每项包含 `instruction` 和 `code`）。

#### Scenario: 导出多个版本
- **WHEN** 版本列表中有 3 个版本，前端调用 `export_app` 传入 path 和 name
- **THEN** 后端 SHALL 写入 JSON 文件，`active_version` 为 2，`versions` 包含 3 个条目

#### Scenario: 导出空版本列表
- **WHEN** 版本列表为空，前端调用 `export_app`
- **THEN** 后端 SHALL 返回错误 "No mutations to export"

### Requirement: Import from file
Rust 后端 SHALL 提供 `import_app` 命令，读取 JSON 文件并返回 `active_version` 指定版本的代码。后端 SHALL 用文件中的版本列表替换当前内存中的版本列表。

#### Scenario: 导入有效文件
- **WHEN** 前端调用 `import_app` 传入包含 3 个版本且 active_version=1 的文件路径
- **THEN** 后端 SHALL 返回 versions[1].code，并用文件中的版本列表替换内存列表

#### Scenario: 导入无效 JSON
- **WHEN** 前端调用 `import_app` 传入格式错误的文件
- **THEN** 后端 SHALL 返回错误包含解析失败信息

#### Scenario: active_version 越界
- **WHEN** 文件中 active_version 超出 versions 数组范围
- **THEN** 后端 SHALL 返回错误 "Invalid active_version"

### Requirement: Clear mutations
Rust 后端 SHALL 提供 `clear_mutations` 命令，清空内存中的版本列表。

#### Scenario: 清除版本
- **WHEN** 前端调用 `clear_mutations`
- **THEN** 后端 SHALL 将版本列表清空，后续 `get_mutation_count` 返回 0

### Requirement: Import DOM cleanup
导入执行代码前，前端 SHALL 清除当前页面中所有非核心 DOM 元素（body 中 `id !== 'evolva-core'` 且 `id !== 'import-file'` 的元素）和动态添加的 head style 标签（保留第一个）。

#### Scenario: 清除用户创建的窗口
- **WHEN** 页面上有 2 个 `.evolva-window` 和 `#evolva-core`，用户触发导入
- **THEN** 导入代码执行前 SHALL 移除这 2 个 `.evolva-window`，保留 `#evolva-core`

#### Scenario: 清除动态样式
- **WHEN** head 中有 3 个 style 标签（1 个原始 + 2 个 LLM 添加的），用户触发导入
- **THEN** 导入代码执行前 SHALL 移除后 2 个 style 标签

### Requirement: Import confirmation
当存在未保存的版本（`get_mutation_count` > 0）时，前端 SHALL 在导入前显示确认对话框，告知用户当前有未保存的版本。用户确认后 SHALL 继续，取消后 SHALL 终止导入。

#### Scenario: 有未保存版本时导入
- **WHEN** 当前有 3 个未保存的版本，用户点击导入
- **THEN** SHALL 显示确认对话框提示 "当前会话有 3 个版本未导出，导入将覆盖当前状态。是否继续？"

#### Scenario: 确认导入
- **WHEN** 用户在确认对话框中点击确认
- **THEN** SHALL 继续执行导入流程

#### Scenario: 取消导入
- **WHEN** 用户在确认对话框中点击取消
- **THEN** SHALL 终止导入流程，不做任何修改
