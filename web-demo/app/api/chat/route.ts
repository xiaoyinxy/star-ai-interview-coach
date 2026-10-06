const DEFAULT_DIFY_URL = "https://api.dify.ai/v1";
const DEFAULT_SILICONFLOW_URL = "https://api.siliconflow.cn/v1";
const REQUEST_TIMEOUT_MS = 300_000;

type Provider = "dify" | "siliconflow";
type ChatMessage = { role: "user" | "assistant"; content: string };
type DifyStreamEvent = { event?: string; answer?: string; conversation_id?: string; message?: string };
type SiliconFlowChunk = {
  choices?: Array<{ delta?: { content?: string }; finish_reason?: string | null }>;
  error?: { message?: string };
};

const COACH_SYSTEM_PROMPT = `你是一名严格、友善的 AI 产品经理面试教练，使用 STAR 法则帮助用户把真实项目经历整理成可信、具体、可面试表达的故事。

工作规则：
1. 事实优先，绝不替用户编造数据、职责或结果。
2. 每轮先给简短反馈，再只追问一个最关键的信息缺口。
3. 优先厘清用户的个人判断、具体行动、协作方式、量化结果和复盘。
4. 普通对话必须只输出合法 JSON，不要使用 Markdown 代码块，格式为：{"feedback":"简短反馈","next_question":"一个明确问题","answer_guidance":["提示1","提示2"]}。
5. 当用户要求执行 generator 意图时，基于对话中已经确认的事实，输出一版完整、自然、可直接口述的中文 STAR 答案；对缺失信息明确标注“待补充”，不要编造。`;

function streamResponse(stream: ReadableStream) {
  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform" },
  });
}

function validateBaseUrl(raw: unknown, provider: Provider) {
  const fallback = provider === "siliconflow" ? DEFAULT_SILICONFLOW_URL : DEFAULT_DIFY_URL;
  if (typeof raw !== "string" || raw.length > 500) throw new Error("API 地址无效。");
  let parsed: URL;
  try { parsed = new URL(raw || fallback); } catch { throw new Error("API 地址格式无效。"); }
  const hostname = parsed.hostname.toLowerCase();
  const isIpAddress = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith("[");
  const isLocalName = hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local") || hostname.endsWith(".internal");
  if (parsed.protocol !== "https:" || isIpAddress || isLocalName || (parsed.port && parsed.port !== "443")) {
    throw new Error("API 地址必须是可公开访问的 HTTPS 地址。");
  }
  return parsed.toString().replace(/\/$/, "");
}

function safeHistory(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is ChatMessage => Boolean(
      item &&
      (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string" &&
      item.content.trim() &&
      item.content.length <= 12_000,
    ))
    .slice(-20)
    .map((item) => ({ role: item.role, content: item.content.trim() }));
}

async function proxyDify(body: Record<string, unknown>, apiKey: string, baseUrl: string) {
  const upstream = await fetch(`${baseUrl}/chat-messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({
      inputs: {}, query: String(body.query).trim(), response_mode: "streaming",
      conversation_id: typeof body.conversationId === "string" ? body.conversationId : "",
      user: body.user, auto_generate_name: true,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.json().catch(() => null);
    return Response.json({ error: detail?.message || detail?.code || `Dify 请求失败（${upstream.status}）` }, { status: upstream.status });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const safeStream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";
      let receivedAnswer = false;
      let receivedMessageEnd = false;
      function forwardBlock(block: string) {
        const dataLine = block.split(/\r?\n/).find((line) => line.startsWith("data:"));
        if (!dataLine) return;
        const rawData = dataLine.slice(5).trim();
        if (!rawData || rawData === "[DONE]") return;
        let data: DifyStreamEvent;
        try { data = JSON.parse(rawData); } catch { return; }
        let safeEvent: Record<string, unknown> | null = null;
        if (data.event === "message" || data.event === "agent_message") {
          receivedAnswer ||= Boolean(data.answer);
          safeEvent = { event: data.event, answer: data.answer || "", conversation_id: data.conversation_id || "" };
        } else if (data.event === "workflow_started" || data.event === "message_end") {
          receivedMessageEnd ||= data.event === "message_end";
          safeEvent = { event: data.event, conversation_id: data.conversation_id || "" };
        } else if (data.event === "error") {
          safeEvent = { event: "error", message: data.message || "Dify 返回了异常。" };
        }
        if (safeEvent) controller.enqueue(encoder.encode(`data: ${JSON.stringify(safeEvent)}\n\n`));
      }
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const blocks = buffer.split(/\r?\n\r?\n/);
          buffer = blocks.pop() || "";
          blocks.forEach(forwardBlock);
        }
        buffer += decoder.decode();
        if (buffer.trim()) forwardBlock(buffer);
        controller.close();
      } catch (reason) {
        const wasAborted = reason instanceof DOMException && reason.name === "AbortError";
        if (wasAborted || receivedMessageEnd || receivedAnswer) return controller.close();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: "error", message: "读取 Dify 回复失败，请重新发送一次。" })}\n\n`));
        controller.close();
      }
    },
  });
  return streamResponse(safeStream);
}

async function proxySiliconFlow(body: Record<string, unknown>, apiKey: string, baseUrl: string) {
  const model = typeof body.model === "string" ? body.model.trim() : "";
  if (!model || model.length > 200) return Response.json({ error: "请填写有效的硅基流动模型 ID。" }, { status: 400 });
  const upstream = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({
      model, stream: true, temperature: 0.5,
      messages: [
        { role: "system", content: COACH_SYSTEM_PROMPT },
        ...safeHistory(body.history),
        { role: "user", content: String(body.query).trim() },
      ],
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.json().catch(() => null);
    const message = detail?.message || detail?.error?.message || detail?.error || `硅基流动请求失败（${upstream.status}）`;
    return Response.json({ error: typeof message === "string" ? message : `硅基流动请求失败（${upstream.status}）` }, { status: upstream.status });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const safeStream = new ReadableStream({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";
      let finished = false;
      function forwardLine(line: string) {
        if (!line.startsWith("data:")) return;
        const rawData = line.slice(5).trim();
        if (!rawData) return;
        if (rawData === "[DONE]") {
          if (!finished) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: "message_end" })}\n\n`));
          finished = true;
          return;
        }
        let chunk: SiliconFlowChunk;
        try { chunk = JSON.parse(rawData); } catch { return; }
        if (chunk.error?.message) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: "error", message: chunk.error.message })}\n\n`));
          return;
        }
        const answer = chunk.choices?.[0]?.delta?.content || "";
        if (answer) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: "message", answer })}\n\n`));
      }
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split(/\r?\n/);
          buffer = lines.pop() || "";
          lines.forEach(forwardLine);
        }
        buffer += decoder.decode();
        if (buffer.trim()) forwardLine(buffer);
        if (!finished) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: "message_end" })}\n\n`));
        controller.close();
      } catch (reason) {
        const wasAborted = reason instanceof DOMException && reason.name === "AbortError";
        if (!wasAborted) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: "error", message: "读取硅基流动回复失败，请重新发送一次。" })}\n\n`));
        controller.close();
      }
    },
  });
  return streamResponse(safeStream);
}

export async function POST(request: Request) {
  let provider: Provider = "dify";
  try {
    const body = await request.json() as Record<string, unknown>;
    provider = body.provider === "siliconflow" ? "siliconflow" : "dify";
    const query = body.query;
    const user = body.user;
    const apiKey = typeof body.apiKey === "string" ? body.apiKey.trim() : "";
    if (typeof query !== "string" || !query.trim() || query.length > 4000) {
      return Response.json({ error: "请输入 1–4000 字的项目经历。" }, { status: 400 });
    }
    if (typeof user !== "string" || !/^web-[a-zA-Z0-9-]{8,80}$/.test(user)) {
      return Response.json({ error: "用户会话标识无效，请刷新页面重试。" }, { status: 400 });
    }
    if (apiKey.length < 10 || apiKey.length > 500) {
      return Response.json({ error: `${provider === "siliconflow" ? "硅基流动" : "Dify"} API Key 无效，请在连接设置中检查。` }, { status: 400 });
    }
    let baseUrl: string;
    try { baseUrl = validateBaseUrl(body.baseUrl, provider); }
    catch (reason) { return Response.json({ error: reason instanceof Error ? reason.message : "API 地址无效。" }, { status: 400 }); }
    return provider === "siliconflow" ? proxySiliconFlow(body, apiKey, baseUrl) : proxyDify(body, apiKey, baseUrl);
  } catch (reason) {
    console.error(`[api/chat] ${provider} proxy failed`, reason);
    const name = provider === "siliconflow" ? "硅基流动" : "Dify";
    if (reason instanceof DOMException && reason.name === "TimeoutError") return Response.json({ error: `${name} 响应超时，请稍后重试。` }, { status: 504 });
    return Response.json({ error: `无法连接${name}，请检查服务网络后重试。` }, { status: 502 });
  }
}
