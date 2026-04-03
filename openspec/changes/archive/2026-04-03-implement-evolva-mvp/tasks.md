## 1. Rust 后端

- [x] 1.1 更新 `src-tauri/Cargo.toml`：添加 `reqwest = { version = "0.12", features = ["json"] }` 依赖
- [x] 1.2 重写 `src-tauri/src/lib.rs`：实现 `call_llm` Tauri Command，包含 `LlmRequest` 结构体和协议路由逻辑
- [x] 1.3 实现 `call_openai` 函数：构造 Bearer header、POST `/chat/completions`、解析 `choices[0].message.content`
- [x] 1.4 实现 `call_anthropic` 函数：构造 x-api-key + anthropic-version header、POST `/v1/messages`、解析 content 数组中 type=text 块

## 2. 前端 UI

- [x] 2.1 重写 `src/index.html`：替换脚手架内容为 Evolva 完整 UI（header + settings + context bar + log + input + system prompt + 主脚本）
- [x] 2.2 删除 `src/main.js` 和 `src/styles.css`（不再需要，逻辑和样式已内联）

## 3. 配置微调

- [x] 3.1 更新 `src-tauri/tauri.conf.json`：添加 `center: true`、`resizable: true`、`minWidth: 400`、`minHeight: 400`

## 4. 验证

- [x] 4.1 运行 `cargo tauri dev` 确认应用启动无报错
- [x] 4.2 验证设置面板：打开/关闭切换、保存/加载 localStorage
- [x] 4.3 验证 context bar 显示初始 token 估算
- [x] 4.4 配置 OpenAI 或 Anthropic API，发送测试指令，验证完整突变循环
