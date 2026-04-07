## ADDED Requirements

### Requirement: HTML assembly from project files
系统 SHALL 将项目文件系统中的文件组装为完整的 HTML 文档用于 iframe 预览。组装过程：读取 `index.html`，将 `<link rel="stylesheet" href="style.css">` 替换为内联 `<style>` 中的 `style.css` 内容，将 `<script src="app.js"></script>` 替换为内联 `<script>` 中的 `app.js` 内容。

#### Scenario: 标准三文件项目
- **WHEN** 项目包含 `index.html`（含 CSS link 和 JS script 引用）、`style.css`（含 `body { color: red; }`）、`app.js`（含 `console.log("hello")`）
- **THEN** 组装的 HTML SHALL 包含内联的 `<style>body { color: red; }</style>` 和内联的 `<script>console.log("hello")</script>`

#### Scenario: index.html 无资源引用
- **WHEN** `index.html` 不包含 `<link>` 或 `<script src>` 标签
- **THEN** 组装的 HTML SHALL 保留原始 `index.html` 内容，不注入额外标签

#### Scenario: 额外文件引用
- **WHEN** `index.html` 引用了 `<script src="utils.js"></script>`，且 `utils.js` 存在于项目文件系统中
- **THEN** 系统 SHALL 同样将 `utils.js` 内容内联替换

### Requirement: Sandbox and helpers injection
组装 HTML 时 SHALL 注入 `sandbox.js`（沙盒安全层）和 `interact.js`（拖拽库），以及 mutation helper 函数（`setupDraggable`、`bringToFront`、`onActiveKeydown`、`onActiveKeyup`）。这些脚本 SHALL 在用户代码之前加载。

#### Scenario: 沙盒注入
- **WHEN** 系统组装预览 HTML
- **THEN** 生成的 HTML SHALL 在用户 `app.js` 之前包含 `sandbox.js`、`interact.js` 和 mutation helpers 的 `<script>` 标签

### Requirement: Iframe preview loading
前端 SHALL 通过 `iframe.contentDocument.open(); doc.write(preview_html); doc.close()` 将组装的 HTML 加载到 iframe 中。加载完成后 SHALL 重新初始化 mutation helpers。

#### Scenario: 预览加载成功
- **WHEN** 后端返回 `preview_html`，前端调用 `build_preview`
- **THEN** iframe SHALL 显示组装后的页面内容，mutation helpers（拖拽、窗口控制）可用

#### Scenario: 主题同步
- **WHEN** 当前主题为浅色模式，预览 HTML 加载到 iframe
- **THEN** iframe 内的文档 SHALL 应用浅色主题 class

### Requirement: Runtime error capture
前端 SHALL 在 iframe 中设置 `window.onerror` 处理程序，捕获 JavaScript 运行时错误。捕获的错误 SHALL 自动回传给 LLM 进行修复，最多重试 2 次。

#### Scenario: 捕获运行时错误并自动修复
- **WHEN** 注入的 `app.js` 包含 `undefinedFunction()` 导致 ReferenceError
- **THEN** 前端 SHALL 捕获错误，自动调用 `call_llm` 将错误信息作为指令发送（含 "Runtime error: ReferenceError: undefinedFunction is not defined"），LLM 修复后重新加载预览

#### Scenario: 连续错误达到重试上限
- **WHEN** 运行时错误在 2 次自动修复后仍然存在
- **THEN** 系统 SHALL 停止重试，在日志中显示最终错误信息

#### Scenario: 修复成功
- **WHEN** 第一次运行出错，自动修复后不再出错
- **THEN** 系统 SHALL 正常显示修复后的预览，在日志中记录自动修复过程

### Requirement: Context bar update
预览加载完成后，前端 SHALL 更新上下文使用条，显示当前项目文件的估算 token 数量。

#### Scenario: 上下文更新
- **WHEN** 预览加载完成
- **THEN** 上下文条 SHALL 显示项目所有文件的总 token 估算值（文件内容长度之和 / 4）
