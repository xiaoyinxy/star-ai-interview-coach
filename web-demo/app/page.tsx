"use client";

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { formatDifyAnswer, parseStructuredReply, structuredReplyToText, type StructuredReply } from "./dify-reply";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  pending?: boolean;
  structured?: StructuredReply;
  intent?: "generator";
};
type DifyStreamEvent = { event?: string; answer?: string; conversation_id?: string; message?: string };
type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  difyConversationId: string;
  messages: Message[];
};
type ProviderConfig = {
  apiKey: string;
  baseUrl: string;
};

const WELCOME: Message = {
  id: "welcome",
  role: "assistant",
  content:
    "你好，我是你的 AI 产品经理面试教练。先用几句话告诉我一段你亲自参与的项目经历吧。\n\n不用一开始就讲完整，我会像真实面试官一样，一轮只追问一个最关键的信息缺口。",
};

const STARTERS = [
  "我负责过一个智能问答项目，知识库召回率一直不理想。",
  "我想梳理一个 RAG 项目",
  "帮我挖掘一段实习经历",
];

const STAR_STEPS = [
  { key: "S", label: "情境", hint: "背景与约束" },
  { key: "T", label: "任务", hint: "目标与职责" },
  { key: "A", label: "行动", hint: "判断与推进" },
  { key: "R", label: "结果", hint: "数据与复盘" },
];

const REVIEW_POINTS = ["事实优先", "单点追问", "贡献归因", "数据闭环"];
const HISTORY_STORAGE_KEY = "star-coach-conversations-v1";
const CONFIG_SESSION_KEY = "star-coach-dify-config-v1";
const DEFAULT_DIFY_URL = "https://api.dify.ai/v1";
const NEW_CONVERSATION_TITLE = "新的面试故事";
const GENERATOR_PROMPT = "请执行 generator 意图，基于当前对话已经收集的全部项目信息，生成完整、可直接用于面试表达的 STAR_generator 结果。";
const WELCOME_MESSAGES = [WELCOME];

const INITIAL_CONVERSATION: Conversation = {
  id: "initial",
  title: NEW_CONVERSATION_TITLE,
  createdAt: 0,
  updatedAt: 0,
  difyConversationId: "",
  messages: WELCOME_MESSAGES,
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createConversation(): Conversation {
  const now = Date.now();
  return {
    id: makeId(),
    title: NEW_CONVERSATION_TITLE,
    createdAt: now,
    updatedAt: now,
    difyConversationId: "",
    messages: [WELCOME],
  };
}

function makeConversationTitle(text: string) {
  const compact = text.replace(/\s+/g, " ").trim();
  return compact.length > 20 ? `${compact.slice(0, 20)}…` : compact;
}

function formatHistoryTime(timestamp: number) {
  if (!timestamp) return "刚刚";
  const date = new Date(timestamp);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();
  return sameDay
    ? date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" });
}

function countSignal(text: string) {
  let score = 0;
  if (/[0-9%％]/.test(text)) score += 1;
  if (/我|负责|推动|设计|分析|协调|落地|复盘/.test(text)) score += 1;
  if (/结果|提升|降低|上线|转化|召回|准确|满意|投诉/.test(text)) score += 1;
  return score;
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([INITIAL_CONVERSATION]);
  const [activeConversationId, setActiveConversationId] = useState(INITIAL_CONVERSATION.id);
  const [historyReady, setHistoryReady] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState<"coach" | "brief">("coach");
  const [providerConfig, setProviderConfig] = useState<ProviderConfig>({ apiKey: "", baseUrl: DEFAULT_DIFY_URL });
  const [configDraft, setConfigDraft] = useState<ProviderConfig>({ apiKey: "", baseUrl: DEFAULT_DIFY_URL });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [configError, setConfigError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
        const parsed = stored ? JSON.parse(stored) : null;
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed
            .filter((item): item is Conversation =>
              Boolean(item && typeof item.id === "string" && typeof item.title === "string" && Array.isArray(item.messages)),
            )
            .map((conversation) => ({
              ...conversation,
              messages: conversation.messages.filter((message) => !message.pending),
            }));
          if (valid.length > 0) {
            setConversations(valid);
            setActiveConversationId(valid[0].id);
          }
        }
      } catch {
        localStorage.removeItem(HISTORY_STORAGE_KEY);
      } finally {
        setHistoryReady(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = sessionStorage.getItem(CONFIG_SESSION_KEY);
        const parsed = stored ? JSON.parse(stored) : null;
        if (parsed && typeof parsed.apiKey === "string" && typeof parsed.baseUrl === "string") {
          const restored = { apiKey: parsed.apiKey, baseUrl: parsed.baseUrl };
          setProviderConfig(restored);
          setConfigDraft(restored);
        } else {
          setSettingsOpen(true);
        }
      } catch {
        sessionStorage.removeItem(CONFIG_SESSION_KEY);
        setSettingsOpen(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!historyReady) return;
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations, historyReady]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || conversations[0],
    [activeConversationId, conversations],
  );
  const messages = useMemo(() => activeConversation?.messages || WELCOME_MESSAGES, [activeConversation]);
  const sortedConversations = useMemo(
    () => [...conversations].sort((a, b) => b.updatedAt - a.updatedAt),
    [conversations],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const userMessages = useMemo(
    () => messages.filter((message) => message.role === "user" && message.intent !== "generator"),
    [messages],
  );
  const assistantMessages = useMemo(() => messages.filter((message) => message.role === "assistant" && message.id !== "welcome"), [messages]);
  const latestAssistant = assistantMessages.at(-1)?.content || "等待第一段项目经历后，我会提炼亮点并追问最值得补齐的信息。";
  const progress = Math.min(userMessages.length + Math.floor(assistantMessages.length / 2), 4);
  const signalScore = Math.min(userMessages.reduce((sum, item) => sum + countSignal(item.content), 0), 9);
  const storyText = userMessages.map((item) => item.content).join("\n");
  const hasMetric = /[0-9%％]/.test(storyText);
  const hasAction = /我|负责|推动|设计|分析|协调|落地/.test(storyText);
  const hasResult = /结果|提升|降低|上线|转化|召回|准确|满意|投诉/.test(storyText);

  function updateConversation(targetId: string, updater: (conversation: Conversation) => Conversation) {
    setConversations((current) => current.map((conversation) => (conversation.id === targetId ? updater(conversation) : conversation)));
  }

  function updateMessages(targetId: string, updater: (messages: Message[]) => Message[]) {
    updateConversation(targetId, (conversation) => ({
      ...conversation,
      messages: updater(conversation.messages),
      updatedAt: Date.now(),
    }));
  }

  async function sendMessage(
    query = input,
    options: { displayText?: string; intent?: "generator" } = {},
  ) {
    const text = query.trim();
    if (!text || isSending || !activeConversation) return;
    if (!providerConfig.apiKey) {
      setConfigError("请先填写 Dify App API Key。");
      setSettingsOpen(true);
      return;
    }

    const targetConversationId = activeConversation.id;
    const displayText = options.displayText || text;
    const userMessage: Message = { id: makeId(), role: "user", content: displayText, intent: options.intent };
    const assistantId = makeId();
    updateConversation(targetConversationId, (current) => ({
      ...current,
      title: current.title === NEW_CONVERSATION_TITLE && options.intent !== "generator"
        ? makeConversationTitle(displayText)
        : current.title,
      updatedAt: Date.now(),
      messages: [...current.messages, userMessage, { id: assistantId, role: "assistant", content: "", pending: true }],
    }));
    setInput("");
    setError("");
    setIsSending(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      let userId = localStorage.getItem("star-coach-user");
      if (!userId) {
        userId = `web-${crypto.randomUUID()}`;
        localStorage.setItem("star-coach-user", userId);
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: text,
          conversationId: activeConversation.difyConversationId,
          user: userId,
          apiKey: providerConfig.apiKey,
          baseUrl: providerConfig.baseUrl,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error || "教练暂时无法回答，请稍后再试。");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let rawAnswer = "";
      let streamError = "";

      function consumeEventBlock(eventBlock: string) {
        for (const line of eventBlock.split(/\r?\n/)) {
          if (!line.startsWith("data:")) continue;
          const raw = line.slice(5).trim();
          if (!raw || raw === "[DONE]") continue;

          let data: DifyStreamEvent;
          try {
            data = JSON.parse(raw);
          } catch {
            continue;
          }

          if (data.conversation_id) {
            updateConversation(targetConversationId, (current) => ({ ...current, difyConversationId: data.conversation_id || "" }));
          }
          if (data.event === "message" || data.event === "agent_message") {
            rawAnswer += data.answer || "";
            const visibleAnswer = formatDifyAnswer(rawAnswer);
            updateMessages(targetConversationId, (current) =>
              current.map((item) => (item.id === assistantId ? { ...item, content: visibleAnswer, pending: true } : item)),
            );
          }
          if (data.event === "error") streamError = data.message || "Dify 返回了异常。";
        }
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || "";
        events.forEach(consumeEventBlock);
      }
      buffer += decoder.decode();
      if (buffer.trim()) consumeEventBlock(buffer);

      const structured = parseStructuredReply(rawAnswer);
      const finalAnswer = structured ? structuredReplyToText(structured) : formatDifyAnswer(rawAnswer);
      if (!finalAnswer && streamError) throw new Error(streamError);
      updateMessages(targetConversationId, (current) =>
        current.map((item) =>
          item.id === assistantId
            ? { ...item, content: finalAnswer || "我没有收到有效回复，请再试一次。", pending: false, structured: structured || undefined }
            : item,
        ),
      );
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === "AbortError") {
        updateMessages(targetConversationId, (current) =>
          current.filter((item) => item.id !== assistantId && (options.intent !== "generator" || item.id !== userMessage.id)),
        );
        return;
      }
      const message = reason instanceof Error ? reason.message : "连接失败，请稍后重试。";
      setError(message);
      updateMessages(targetConversationId, (current) => current.filter((item) => item.id !== assistantId));
    } finally {
      if (abortRef.current === controller) {
        setIsSending(false);
        abortRef.current = null;
      }
    }
  }

  function startNewConversation() {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsSending(false);
    if (activeConversation?.messages.length === 1 && !activeConversation.difyConversationId) {
      setInput("");
      setError("");
      setView("coach");
      return;
    }
    const conversation = createConversation();
    setConversations((current) => [conversation, ...current]);
    setActiveConversationId(conversation.id);
    setInput("");
    setError("");
    setIsSending(false);
    setView("coach");
  }

  function openConversation(id: string) {
    if (id === activeConversationId) return;
    abortRef.current?.abort();
    abortRef.current = null;
    setActiveConversationId(id);
    setInput("");
    setError("");
    setIsSending(false);
    setView("coach");
  }

  function generateInterviewResult() {
    setView("coach");
    void sendMessage(GENERATOR_PROMPT, { displayText: "生成面试结果", intent: "generator" });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage();
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  function openSettings() {
    setConfigDraft(providerConfig);
    setConfigError("");
    setSettingsOpen(true);
  }

  function saveSettings(event: FormEvent) {
    event.preventDefault();
    const apiKey = configDraft.apiKey.trim();
    const baseUrl = configDraft.baseUrl.trim().replace(/\/$/, "");
    if (apiKey.length < 10) {
      setConfigError("请输入有效的 Dify App API Key。");
      return;
    }
    try {
      const url = new URL(baseUrl);
      if (url.protocol !== "https:") throw new Error("invalid protocol");
    } catch {
      setConfigError("API 地址必须是有效的 HTTPS 地址。");
      return;
    }
    const nextConfig = { apiKey, baseUrl };
    sessionStorage.setItem(CONFIG_SESSION_KEY, JSON.stringify(nextConfig));
    setProviderConfig(nextConfig);
    setConfigDraft(nextConfig);
    setConfigError("");
    setSettingsOpen(false);
  }

  return (
    <main className="app-shell">
      <a className="skip-link" href="#coach-workspace">跳到对话区</a>
      <section className="workspace">
        <aside className="conversation-sidebar" aria-label="对话导航">
          <div className="sidebar-brand" aria-label="STAR 面试教练">
            <span className="brand-mark">S</span>
            <span>
              <strong>STAR 面试教练</strong>
              <small>AI INTERVIEW WORKSPACE</small>
            </span>
          </div>

          <button type="button" className="new-conversation-button" onClick={startNewConversation}>
            <span aria-hidden="true">+</span>
            新建对话
          </button>

          <nav className="history-nav" aria-label="历史对话">
            <div className="history-heading">
              <h2>历史对话</h2>
              <span>{conversations.length}</span>
            </div>
            <div className="conversation-list">
              {sortedConversations.map((conversation) => {
                const turnCount = conversation.messages.filter(
                  (message) => message.role === "user" && message.intent !== "generator",
                ).length;
                return (
                  <button
                    type="button"
                    className={`conversation-item${conversation.id === activeConversationId ? " active" : ""}`}
                    aria-current={conversation.id === activeConversationId ? "page" : undefined}
                    onClick={() => openConversation(conversation.id)}
                    key={conversation.id}
                  >
                    <span className="conversation-title">{conversation.title}</span>
                    <span className="conversation-meta">
                      {turnCount > 0 ? `${turnCount} 轮` : "未开始"}
                      <i aria-hidden="true" />
                      {formatHistoryTime(conversation.updatedAt)}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="sidebar-status">
            <span><i className={providerConfig.apiKey ? "" : "offline"} aria-hidden="true" />{providerConfig.apiKey ? "Dify 已配置" : "等待配置 Dify"}</span>
            <small>密钥仅保存在当前浏览器会话</small>
            <button type="button" className="settings-link" onClick={openSettings}>连接设置</button>
          </div>
        </aside>

        <section className="coach-stage" id="coach-workspace" aria-label="与 AI 面试教练对话">
          <header className="stage-header">
            <div className="stage-title">
              <p className="eyebrow">LIVE COACHING</p>
              <h1>{activeConversation?.title || NEW_CONVERSATION_TITLE}</h1>
              <span>{userMessages.length > 0 ? `第 ${userMessages.length} 轮 · 自动保存` : "从一段真实项目经历开始"}</span>
            </div>
            <div className="stage-actions">
              <button type="button" className="settings-button" onClick={openSettings} aria-label="打开 Dify 连接设置">
                <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16"><path d="M12 15.25A3.25 3.25 0 1 0 12 8.75a3.25 3.25 0 0 0 0 6.5Zm8.1-2.1v-2.3l-2.05-.68a7.05 7.05 0 0 0-.63-1.51l.97-1.94-1.63-1.63-1.94.97a7.05 7.05 0 0 0-1.51-.63L12.63 3h-2.3l-.68 2.05c-.53.16-1.04.37-1.51.63L6.2 4.71 4.57 6.34l.97 1.94c-.26.47-.47.98-.63 1.51l-2.05.68v2.3l2.05.68c.16.53.37 1.04.63 1.51l-.97 1.94 1.63 1.63 1.94-.97c.47.26.98.47 1.51.63l.68 2.05h2.3l.68-2.05c.53-.16 1.04-.37 1.51-.63l1.94.97 1.63-1.63-.97-1.94c.26-.47.47-.98.63-1.51l2.05-.68Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
                <span>设置</span>
              </button>
              <div className="segmented" role="tablist" aria-label="视图切换">
                <button type="button" className={view === "coach" ? "active" : ""} onClick={() => setView("coach")}>对话</button>
                <button type="button" className={view === "brief" ? "active" : ""} onClick={() => setView("brief")}>简报</button>
              </div>
              <button
                type="button"
                className="generate-button"
                onClick={generateInterviewResult}
                disabled={isSending || userMessages.length === 0}
              >
                生成面试结果
              </button>
            </div>
          </header>

          {view === "coach" ? (
            <>
              <div className="message-stream" aria-live="polite" aria-busy={isSending}>
                {messages.map((message) =>
                  message.role === "assistant" ? (
                    <div className="coach-row" key={message.id}>
                      <div className="avatar">AI</div>
                      <div className={`message coach-message${message.structured ? " structured-message" : ""}`}>
                        {message.content ? (
                          message.structured ? <StructuredCoachReply reply={message.structured} /> : <p>{message.content}</p>
                        ) : <ThinkingState />}
                        {message.pending && message.content && <span className="cursor" />}
                      </div>
                    </div>
                  ) : (
                    <div className="user-row" key={message.id}>
                      <div className={`message user-message${message.intent === "generator" ? " generator-request" : ""}`}>
                        {message.intent === "generator" && <span>FINAL STAR</span>}
                        <p>{message.content}</p>
                      </div>
                      <div className="user-avatar">你</div>
                    </div>
                  ),
                )}
                <div ref={endRef} />
              </div>

              {messages.length === 1 && (
                <div className="starter-prompts" aria-label="快速开始">
                  {STARTERS.map((prompt) => <button type="button" key={prompt} onClick={() => void sendMessage(prompt)}>{prompt}</button>)}
                </div>
              )}
            </>
          ) : (
            <div className="brief-view">
              <div className="brief-card primary">
                <span>最新教练结论</span>
                <p>{latestAssistant}</p>
              </div>
              <div className="brief-grid">
                {REVIEW_POINTS.map((point, index) => (
                  <div className="brief-card" key={point}>
                    <b>0{index + 1}</b>
                    <strong>{point}</strong>
                    <p>{index < progress ? "已有线索，继续补强。" : "等待对话补齐。"}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form className="composer-shell" onSubmit={onSubmit}>
            <label htmlFor="message">继续补充项目事实</label>
            <div className="composer">
              <textarea
                id="message"
                rows={3}
                value={input}
                maxLength={4000}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={onKeyDown}
                disabled={isSending}
                placeholder="例如：我在实习时负责过一个智能问答项目，但知识库召回率一直不理想..."
              />
              <button type="submit" className="send-button" aria-label="发送消息" disabled={!input.trim() || isSending || !providerConfig.apiKey}>
                {isSending ? "..." : "Send"}
              </button>
            </div>
            <div className="composer-meta">
              <span className={error ? "error-text" : ""}>{error || "教练会结合当前会话持续追问；请避免输入个人敏感信息。"}</span>
              <span>{input.length}/4000 · Enter 发送</span>
            </div>
          </form>
        </section>

        <aside className="right-rail" aria-label="实时洞察">
          <div className="rail-heading">
            <p className="eyebrow">STORY READINESS</p>
            <h2>故事完成度</h2>
          </div>

          <div className="star-card compact-star-card">
            <div className="section-title">
              <span>STAR Map</span>
              <strong>{progress}/4</strong>
            </div>
            <ol className="star-steps">
              {STAR_STEPS.map((step, index) => (
                <li className={index < progress ? "active" : index === progress ? "current" : ""} key={step.key}>
                  <b>{step.key}</b>
                  <span>{step.label}</span>
                  <small>{step.hint}</small>
                </li>
              ))}
            </ol>
          </div>

          <div className="signal-card compact-signal-card">
            <div className="section-title">
              <span>Answer Signal</span>
              <strong>{signalScore}/9</strong>
            </div>
            <div className="signal-bars compact" aria-label={`答案信号强度 ${signalScore}/9`}>
              {Array.from({ length: 9 }).map((_, index) => <i className={index < signalScore ? "active" : ""} key={index} />)}
            </div>
            <ul className="check-list">
              <li className={hasAction ? "done" : ""}>个人动作清晰</li>
              <li className={hasMetric ? "done" : ""}>包含量化信息</li>
              <li className={hasResult ? "done" : ""}>形成结果闭环</li>
            </ul>
          </div>

          <div className="insight-card accent">
            <span>当前教练判断</span>
            <p>{isSending ? "正在分析当前回答中的信息缺口..." : latestAssistant}</p>
          </div>

          <div className="metric-grid">
            <div>
              <span>轮次</span>
              <strong>{userMessages.length}</strong>
            </div>
            <div>
              <span>状态</span>
              <strong>{isSending ? "分析中" : "就绪"}</strong>
            </div>
          </div>

          <div className="insight-card">
            <div className="section-title">
              <span>本轮工作方式</span>
              <strong>AI Coach</strong>
            </div>
            <ul className="logic-list">
              <li>持续记忆当前故事上下文</li>
              <li>一次只追问一个关键缺口</li>
              <li>生成结果前检查事实完整度</li>
            </ul>
          </div>
        </aside>
      </section>

      {settingsOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && providerConfig.apiKey) setSettingsOpen(false);
        }}>
          <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <div className="modal-heading">
              <div>
                <p className="eyebrow">CONNECTION</p>
                <h2 id="settings-title">连接你的 Dify 应用</h2>
              </div>
              {providerConfig.apiKey && <button type="button" className="modal-close" onClick={() => setSettingsOpen(false)} aria-label="关闭设置">×</button>}
            </div>
            <p className="modal-intro">填写 Dify 应用的 API 信息即可开始。密钥只保存在当前浏览器会话中，关闭浏览器后会自动清除。</p>
            <form onSubmit={saveSettings}>
              <label htmlFor="dify-api-key">App API Key <span>必填</span></label>
              <div className="secret-field">
                <input
                  id="dify-api-key"
                  type={showApiKey ? "text" : "password"}
                  value={configDraft.apiKey}
                  onChange={(event) => setConfigDraft((current) => ({ ...current, apiKey: event.target.value }))}
                  placeholder="app-xxxxxxxxxxxxxxxx"
                  autoComplete="off"
                  required
                />
                <button type="button" onClick={() => setShowApiKey((current) => !current)}>{showApiKey ? "隐藏" : "显示"}</button>
              </div>
              <label htmlFor="dify-base-url">API 地址 <span>必填</span></label>
              <input
                id="dify-base-url"
                type="url"
                inputMode="url"
                value={configDraft.baseUrl}
                onChange={(event) => setConfigDraft((current) => ({ ...current, baseUrl: event.target.value }))}
                placeholder={DEFAULT_DIFY_URL}
                required
              />
              <p className="field-help">Dify 云服务默认使用 https://api.dify.ai/v1；自托管服务请填写对应的 HTTPS 地址。</p>
              {configError && <p className="config-error" role="alert">{configError}</p>}
              <button type="submit" className="save-settings-button">保存并开始使用</button>
            </form>
            <p className="privacy-note"><strong>隐私提示：</strong>你的 Key 会随请求经过本站后端转发给 Dify，但不会写入本站数据库、代码仓库或 Vercel 环境变量。</p>
          </section>
        </div>
      )}
    </main>
  );
}

function ThinkingState() {
  return (
    <div className="thinking-state" aria-label="教练正在分析">
      <div className="thinking-line" />
      <div className="thinking-line short" />
      <div className="typing"><span /><span /><span /></div>
    </div>
  );
}

function StructuredCoachReply({ reply }: { reply: StructuredReply }) {
  return (
    <div className="structured-reply">
      <section className="reply-feedback">
        <h3>教练反馈</h3>
        <p>{reply.feedback}</p>
      </section>
      <section className="reply-question">
        <span className="question-index" aria-hidden="true">Q</span>
        <div>
          <h3>下一步追问</h3>
          <p>{reply.nextQuestion}</p>
        </div>
      </section>
      {reply.guidance.length > 0 && (
        <section className="reply-guidance">
          <h3>回答思路</h3>
          <ol>
            {reply.guidance.map((item, index) => (
              <li key={`${index}-${item}`}>
                <span aria-hidden="true">{index + 1}</span>
                <p>{item}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
