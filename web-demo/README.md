# STAR 面试教练 Web Demo

一个支持 Dify Chatflow 与硅基流动模型的 AI 产品经理面试故事挖掘网页。前端使用 React、TypeScript 与 Next.js App Router；访问者在页面内选择服务商并填写自己的 API Key，同源接口只负责安全转发，不需要部署者配置密钥。

## 本地启动

1. 安装依赖：`npm install`
2. 启动：`npm run dev`
3. 打开 `http://localhost:3000`
4. 在“连接设置”中选择 Dify 或硅基流动，并填写 API Key、API 地址及所需模型 ID

## 部署到 Vercel

- Root Directory 设置为 `web-demo`
- Framework Preset 选择 `Next.js`
- 不需要添加环境变量
- 用户的服务商配置仅保存在当前浏览器会话（`sessionStorage`），关闭浏览器后自动清除

## 已实现

- Dify SSE 流式对话与多轮 `conversation_id` 延续
- 硅基流动 OpenAI 兼容接口、多轮上下文与 SSE 流式回复
- 用户自助选择服务商，配置 API Key、模型 ID 与自定义 HTTPS API 地址
- 思考态、慢响应、错误提示与重新开始
- 快捷开场问题、Enter 发送与移动端适配
- 服务端事件过滤，隐藏工作流节点、系统提示词和调用费用
- Dify 推理标签与结构化 JSON 回复清洗
