## ADDED Requirements

### Requirement: Per-tab project file system
系统 SHALL 为每个标签页维护一个独立的内存文件系统，表示为 `HashMap<String, String>`（路径 → 内容）。初始文件集为 `index.html`、`style.css`、`app.js`。

#### Scenario: 创建新标签页时初始化项目
- **WHEN** 前端创建新标签页并调用 `init_project` 命令
- **THEN** 后端 SHALL 创建包含 `index.html`（基本 HTML 骨架）、`style.css`（空文件）、`app.js`（空文件）的文件系统

#### Scenario: 文件系统隔离
- **WHEN** 标签页 A 写入 `app.js` 内容为 "console.log('A')"，标签页 B 写入 `app.js` 内容为 "console.log('B')"
- **THEN** 标签页 A 读取 `app.js` SHALL 返回 "console.log('A')"，标签页 B SHALL 返回 "console.log('B')"

### Requirement: Read file tool
系统 SHALL 提供 `read_file` 工具，接受文件路径参数，返回项目文件系统中对应文件的完整内容。

#### Scenario: 读取存在的文件
- **WHEN** LLM 调用 `read_file` 传入 `path: "style.css"`，且该文件存在
- **THEN** 系统 SHALL 返回文件的完整内容字符串

#### Scenario: 读取不存在的文件
- **WHEN** LLM 调用 `read_file` 传入 `path: "missing.js"`，且该文件不存在
- **THEN** 系统 SHALL 返回错误 "File not found: missing.js"

### Requirement: Write file tool
系统 SHALL 提供 `write_file` 工具，接受文件路径和内容参数，写入项目文件系统。如果文件已存在 SHALL 覆盖；如果文件不存在 SHALL 创建。路径中的目录层级 SHALL 自动创建（仅逻辑层面，因为是 HashMap）。

#### Scenario: 创建新文件
- **WHEN** LLM 调用 `write_file` 传入 `path: "components/header.js"` 和 `content: "export class Header {}"`
- **THEN** 系统 SHALL 在文件系统中创建该文件，后续 `read_file("components/header.js")` SHALL 返回写入的内容

#### Scenario: 覆盖已有文件
- **WHEN** `style.css` 已存在内容为 `body {}`，LLM 调用 `write_file` 传入 `path: "style.css"` 和新内容
- **THEN** 系统 SHALL 用新内容替换旧内容

### Requirement: Edit file tool
系统 SHALL 提供 `edit_file` 工具，接受文件路径、旧文本和新文本参数。系统 SHALL 在文件中查找 `old_text` 的精确匹配（仅第一次出现），替换为 `new_text`。`old_text` SHALL 在文件中唯一出现（仅一处）。

#### Scenario: 成功编辑
- **WHEN** `app.js` 内容为 `function hello() { return "hi"; }`，LLM 调用 `edit_file` 传入 `old_text: 'return "hi"'` 和 `new_text: 'return "hello"'`
- **THEN** 文件内容 SHALL 变为 `function hello() { return "hello"; }`

#### Scenario: 旧文本出现多次
- **WHEN** `app.js` 中 `console.log` 出现 3 次，LLM 调用 `edit_file` 传入 `old_text: "console.log"`
- **THEN** 系统 SHALL 返回错误 "old_text appears 3 times, expected exactly 1"

#### Scenario: 旧文本未找到
- **WHEN** LLM 调用 `edit_file` 传入 `old_text: "nonexistent code"`
- **THEN** 系统 SHALL 返回错误 "old_text not found in file"

### Requirement: List files tool
系统 SHALL 提供 `list_files` 工具，返回项目文件系统中所有文件的路径列表，按路径字母排序。

#### Scenario: 列出默认文件
- **WHEN** 项目刚初始化，LLM 调用 `list_files`
- **THEN** 系统 SHALL 返回 `["app.js", "index.html", "style.css"]`

#### Scenario: 列出含子目录的文件
- **WHEN** 项目包含 `index.html`、`style.css`、`app.js`、`components/header.js`，LLM 调用 `list_files`
- **THEN** 系统 SHALL 返回所有 4 个文件路径

### Requirement: Grep tool
系统 SHALL 提供 `grep` 工具，接受正则表达式模式和可选文件路径参数，在项目文件中搜索匹配内容。返回匹配行及上下文（文件路径、行号、匹配行文本）。如果指定了路径参数，SHALL 仅搜索该文件；否则搜索所有文件。

#### Scenario: 全局搜索
- **WHEN** `app.js` 包含 `function calculate()`，LLM 调用 `grep` 传入 `pattern: "function \\w+"`
- **THEN** 系统 SHALL 返回包含文件路径 `app.js`、行号和匹配行 `function calculate()` 的结果

#### Scenario: 指定文件搜索
- **WHEN** LLM 调用 `grep` 传入 `pattern: "color"` 和 `path: "style.css"`
- **THEN** 系统 SHALL 仅在 `style.css` 中搜索，不搜索其他文件

#### Scenario: 无匹配结果
- **WHEN** LLM 调用 `grep` 传入 `pattern: "nonexistent_pattern"`
- **THEN** 系统 SHALL 返回空结果

### Requirement: Project cleanup on tab close
当标签页关闭时，后端 SHALL 清除对应的项目文件系统和对话历史。

#### Scenario: 关闭标签页清理
- **WHEN** 前端调用 `close_tab` 传入标签页 ID
- **THEN** 后端 SHALL 删除该标签页的文件系统和对话历史，释放内存
