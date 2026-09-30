import assert from "node:assert/strict";
import test from "node:test";

import { parseStructuredReply, structuredReplyToText } from "../app/dify-reply.ts";

test("preserves feedback, question, and every guidance item from Dify", () => {
  const raw = String.raw`{
    "feedback": "本轮你补充了项目背景和目标设计。",
    "next\_question": "你计划如何通过 Story Parser 解析用户的口语经历？",
    "answer\_guidanceance:[
      "你计划使用哪些具体方法和技术？",
      "你如何确保不会遗漏关键事实？",
      "你打算如何验证内容真实性？"
    ]
  }`;

  const parsed = parseStructuredReply(raw);

  assert.deepEqual(parsed, {
    feedback: "本轮你补充了项目背景和目标设计。",
    nextQuestion: "你计划如何通过 Story Parser 解析用户的口语经历？",
    guidance: [
      "你计划使用哪些具体方法和技术？",
      "你如何确保不会遗漏关键事实？",
      "你打算如何验证内容真实性？",
    ],
  });
  assert.match(structuredReplyToText(parsed!), /3\. 你打算如何验证内容真实性/);
});

test("accepts the canonical structured response", () => {
  const parsed = parseStructuredReply(JSON.stringify({
    feedback: "反馈",
    next_question: "下一题",
    answer_guidance: ["提示一", "提示二"],
  }));

  assert.deepEqual(parsed, {
    feedback: "反馈",
    nextQuestion: "下一题",
    guidance: ["提示一", "提示二"],
  });
});
