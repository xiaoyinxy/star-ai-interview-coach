# STAR 面试教练 Web Demo

一个连接 Dify Chatflow 的 AI 产品经理面试故事挖掘网页。前端使用 React、TypeScript、Next.js App Router 与 Tailwind CSS；Dify API 由同源服务端接口代理，浏览器不会接触 API Key。

## 本地启动

1. 复制 `.env.example` 为 `.env.local`，填写你的 Dify API Key。
2. 安装依赖：`npm install`
3. 启动：`npm run dev`
4. 打开 `http://localhost:3000`

## 环境变量

- `DIFY_API_URL`：Dify API 地址，默认 `https://api.dify.ai/v1`
- `DIFY_API_KEY`：Dify 应用 API Key，仅服务端可读

## 已实现

- Dify SSE 流式对话与多轮 `conversation_id` 延续
- 思考态、慢响应、错误提示与重新开始
- 快捷开场问题、Enter 发送与移动端适配
- 服务端事件过滤，隐藏工作流节点、系统提示词和调用费用
- Dify 推理标签与结构化 JSON 回复清洗
