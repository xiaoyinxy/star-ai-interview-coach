# STAR 面试教练 Web Demo

一个连接 Dify Chatflow 的 AI 产品经理面试故事挖掘网页。前端使用 React、TypeScript 与 Next.js App Router；访问者在页面内填写自己的 Dify App API Key，同源接口只负责安全转发，不需要部署者配置密钥。

## 本地启动

1. 安装依赖：`npm install`
2. 启动：`npm run dev`
3. 打开 `http://localhost:3000`
4. 在“连接设置”中填写 Dify App API Key 和 API 地址

## 部署到 Vercel

- Root Directory 设置为 `web-demo`
- Framework Preset 选择 `Next.js`
- 不需要添加环境变量
- 用户的 Dify 配置仅保存在当前浏览器会话（`sessionStorage`），关闭浏览器后自动清除

## 已实现

- Dify SSE 流式对话与多轮 `conversation_id` 延续
- 用户自助配置 Dify App API Key 与自定义 HTTPS API 地址
- 思考态、慢响应、错误提示与重新开始
- 快捷开场问题、Enter 发送与移动端适配
- 服务端事件过滤，隐藏工作流节点、系统提示词和调用费用
- Dify 推理标签与结构化 JSON 回复清洗
