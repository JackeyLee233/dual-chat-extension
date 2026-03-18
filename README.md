# dual-chat-extension

一个 Chrome 扩展，用一个统一输入框同时向 ChatGPT 和 Claude 官方网页发送消息。

## 功能

- 一个统一输入框
- 一个发送按钮
- 同时发送到：
  - `chatgpt.com`
  - `claude.ai`
- 支持发送快捷键切换：
  - `Enter` 发送 / `Ctrl+Enter` 换行
  - `Ctrl+Enter` 发送 / `Enter` 换行
- 发送后自动清空输入框

## 文件结构

- `manifest.json`：扩展配置
- `background.js`：后台逻辑
- `popup.html` / `popup.js`：扩展弹窗 UI
- `content/`：注入 ChatGPT / Claude 页面的脚本
- `ui.css`：样式

## 使用方式

1. 打开 `chrome://extensions`
2. 开启开发者模式
3. 选择“加载已解压的扩展程序”
4. 选择当前目录
5. 保持 ChatGPT 和 Claude 页面已打开
6. 点击扩展图标，在 popup 中输入并发送

## 说明
本扩展使用官方网页，不依赖官方 API。
