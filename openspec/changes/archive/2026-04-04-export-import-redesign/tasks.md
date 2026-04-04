## 1. Rust 后端数据结构与状态管理

- [x] 1.1 定义 `Mutation` 结构体（instruction: String, code: String）和 `ExportData` 结构体（version, name, created_at, active_version, versions）
- [x] 1.2 使用 `tauri::State<Mutex<Vec<Mutation>>>` 管理版本列表状态

## 2. Rust 后端 Tauri Commands

- [x] 2.1 实现 `save_mutation` 命令：接收 instruction 和 code，追加到版本列表
- [x] 2.2 实现 `get_mutation_count` 命令：返回当前版本数量
- [x] 2.3 实现 `export_app` 命令：将版本列表序列化为 JSON 写入指定路径，name 参数为应用名称，active_version 默认为最新版本索引
- [x] 2.4 实现 `import_app` 命令：读取 JSON 文件，替换内存版本列表，返回 active_version 指定的代码
- [x] 2.5 实现 `clear_mutations` 命令：清空版本列表
- [x] 2.6 注册所有新命令到 `invoke_handler`

## 3. 前端导入导出重写

- [x] 3.1 删除旧的 `exportState()` 和 `importState()` 函数
- [x] 3.2 实现 `exportApp()`：打开保存对话框，调用 `export_app` 命令，记录日志
- [x] 3.3 实现 `importApp()`：检查未保存版本 → 弹确认框 → 打开文件对话框 → 调用 `import_app` → 清除非核心 DOM → 注入代码
- [x] 3.4 实现确认模态框 UI：显示未保存版本数量，提供确认和取消按钮

## 4. 前端 mutation 循环集成

- [x] 4.1 修改 `mutate()` 函数：在 `injectCode(code)` 成功后调用 `invoke('save_mutation', { instruction, code })`
- [x] 4.2 将导入导出按钮事件从旧函数绑定到新函数
