const DEFAULT_DIFY_URL = "https://api.dify.ai/v1";
const DIFY_TIMEOUT_MS = 300_000;

type DifyStreamEvent = {
  event?: string;
  answer?: string;
  conversation_id?: string;
  message?: string;
};

function streamResponse(stream: ReadableStream) {
  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform" },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = body.query;
    const conversationId = body.conversationId || "";
    const user = body.user;

    if (typeof query !== "string" || !query.trim() || query.length > 4000) {
      return Response.json({ error: "请输入 1–4000 字的项目经历。" }, { status: 400 });
    }
    if (typeof user !== "string" || !/^web-[a-zA-Z0-9-]{8,80}$/.test(user)) {
      return Response.json({ error: "用户会话标识无效，请刷新页面重试。" }, { status: 400 });
    }

    const apiKey = process.env.DIFY_API_KEY;
    if (!apiKey) return Response.json({ error: "服务端尚未配置 Dify API Key。" }, { status: 503 });

    const baseUrl = (process.env.DIFY_API_URL || DEFAULT_DIFY_URL).replace(/\/$/, "");
    const upstream = await fetch(`${baseUrl}/chat-messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ inputs: {}, query: query.trim(), response_mode: "streaming", conversation_id: typeof conversationId === "string" ? conversationId : "", user, auto_generate_name: true }),
      signal: AbortSignal.timeout(DIFY_TIMEOUT_MS),
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.json().catch(() => null);
      const safeMessage = detail?.message || detail?.code || `Dify 请求失败（${upstream.status}）`;
      return Response.json({ error: safeMessage }, { status: upstream.status });
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
          try {
            data = JSON.parse(rawData);
          } catch {
            return;
          }

          let safeEvent: Record<string, unknown> | null = null;
          if (data.event === "message" || data.event === "agent_message") {
            receivedAnswer ||= Boolean(data.answer);
            safeEvent = { event: data.event, answer: data.answer || "", conversation_id: data.conversation_id || "" };
          } else if (data.event === "workflow_started") {
            safeEvent = { event: data.event, conversation_id: data.conversation_id || "" };
          } else if (data.event === "message_end") {
            receivedMessageEnd = true;
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
          if (wasAborted || receivedMessageEnd || receivedAnswer) {
            controller.close();
            return;
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: "error", message: "读取 Dify 回复失败，请重新发送一次。" })}\n\n`));
          controller.close();
        }
      },
    });

    return streamResponse(safeStream);
  } catch (reason) {
    console.error("[api/chat] Dify proxy failed", reason);
    if (reason instanceof DOMException && reason.name === "TimeoutError") return Response.json({ error: "Dify 响应超时，请稍后重试。" }, { status: 504 });
    return Response.json({ error: "无法连接 Dify，请检查服务网络后重试。" }, { status: 502 });
  }
}
