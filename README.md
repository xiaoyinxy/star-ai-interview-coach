# STAR AI Interview Coach

面向校招和社招候选人的 AI 行为面试教练。产品通过多轮追问收集项目事实，并将碎片化口语经历整理为结构化的 STAR 面试故事。

## 核心能力

- 基于 Story State 管理多轮事实记忆
- 通过 Gap Detection 和 Vertical Drill-down 深挖个人贡献与决策细节
- 结合 AIPM 能力知识库生成专业追问
- 即使信息不完整也生成最小可用 STAR 初稿，并标注待补充事实
- 支持结构化反馈、下一轮问题与回答引导

## 项目结构

- `web-demo/`：Next.js 前端与 Dify 流式对话接口
- `RAG/`：AI 产品经理能力模型与检索知识库
- `评测集/`：意图识别数据集、回归测试与 Bad Case 样本
- `*.md` / `*.docx`：PRD、Prompt 迭代记录与产品优化故事

## 本地启动

```bash
cd web-demo
npm install
cp .env.example .env.local
npm run dev
```

在 `web-demo/.env.local` 中配置你自己的 `DIFY_API_KEY`。密钥仅由服务端读取，不会提交到 Git。

## 安全说明

仓库不包含 Dify API Key、SSH 私钥或本地环境文件。评测脚本与 Web 接口均通过环境变量读取密钥。
