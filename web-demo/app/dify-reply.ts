export type StructuredReply = { feedback: string; nextQuestion: string; guidance: string[] };

function decodeJsonString(value: string) {
  return value.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

function cleanDifyText(raw: string) {
  let text = raw;
  const thinkingEnd = text.lastIndexOf("</think>");
  if (thinkingEnd >= 0) text = text.slice(thinkingEnd + 8);
  else if (text.trimStart().startsWith("<think>")) return "";
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
}

function normalizeStructuredJson(raw: string) {
  return raw
    .replace(/\\_/g, "_")
    .replace(/"answer_guidance(?:ance)?"\s*:/gi, '"answer_guidance":')
    .replace(/"answer_guidance(?:ance)?\s*:/gi, '"answer_guidance":');
}

function readJsonString(source: string, keys: string[]) {
  for (const key of keys) {
    const match = source.match(new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "s"));
    if (match?.[1]) return decodeJsonString(match[1]).trim();
  }
  return "";
}

function readGuidanceArray(source: string) {
  const arrayBody = source.match(/"?answer_guidance(?:ance)?"?\s*:\s*\[([\s\S]*?)]/i)?.[1];
  if (!arrayBody) return [];
  return Array.from(arrayBody.matchAll(/"((?:\\.|[^"\\])*)"/g))
    .map((match) => decodeJsonString(match[1]).trim())
    .filter(Boolean);
}

function cleanSectionText(value: string) {
  return value
    .replace(/^\s*["']+|["']+\s*$/g, "")
    .replace(/\\n/g, "\n")
    .trim();
}

function parseGuidanceLines(value: string) {
  return value
    .split(/\r?\n|(?=\s*[-*•]\s+)/)
    .map((line) => cleanSectionText(line.replace(/^\s*(?:[-*•]|\d+[.)、])\s*/, "")))
    .filter(Boolean);
}

function parseMarkerReply(source: string): StructuredReply | null {
  const match = source.match(
    /【+\s*本轮反馈\s*】+\s*([\s\S]*?)\s*【+\s*下一问(?:题)?\s*】+\s*([\s\S]*?)\s*【+\s*回答思路\s*】+\s*([\s\S]*)/,
  );
  if (!match) return null;

  const feedback = cleanSectionText(match[1]);
  const nextQuestion = cleanSectionText(match[2]);
  if (!feedback || !nextQuestion) return null;

  return { feedback, nextQuestion, guidance: parseGuidanceLines(match[3]) };
}

export function structuredReplyToText(reply: StructuredReply) {
  const guidance = reply.guidance.length > 0
    ? `\n\n回答思路\n${reply.guidance.map((item, index) => `${index + 1}. ${item}`).join("\n")}`
    : "";
  return `${reply.feedback}\n\n${reply.nextQuestion}${guidance}`;
}

export function parseStructuredReply(raw: string): StructuredReply | null {
  let candidate = cleanDifyText(raw);

  const markerReply = parseMarkerReply(candidate);
  if (markerReply) return markerReply;

  for (let depth = 0; depth < 3 && candidate; depth += 1) {
    const jsonStart = candidate.indexOf("{");
    if (jsonStart < 0) return null;
    const jsonSource = normalizeStructuredJson(candidate.slice(jsonStart));

    try {
      const parsed = JSON.parse(jsonSource);
      if (!parsed || typeof parsed !== "object") return null;

      const feedback = typeof parsed.feedback === "string" ? parsed.feedback.trim() : "";
      const nextQuestionValue = parsed.next_question ?? parsed.nextQuestion ?? parsed.question;
      const nextQuestion = typeof nextQuestionValue === "string" ? nextQuestionValue.trim() : "";
      const guidanceEntry = Object.entries(parsed).find(([key]) => key.replace(/[^a-z]/gi, "").toLowerCase().startsWith("answerguidance"));
      const guidance = Array.isArray(guidanceEntry?.[1])
        ? guidanceEntry[1]
          .filter((item: unknown): item is string => typeof item === "string" && Boolean(item.trim()))
          .map((item: string) => item.trim())
        : [];

      if (feedback && nextQuestion) return { feedback, nextQuestion, guidance };
      if (typeof parsed.answer !== "string") return null;
      candidate = cleanDifyText(parsed.answer);
    } catch {
      const feedback = readJsonString(jsonSource, ["feedback"]);
      const nextQuestion = readJsonString(jsonSource, ["next_question", "nextQuestion", "question"]);
      if (feedback && nextQuestion) {
        return { feedback, nextQuestion, guidance: readGuidanceArray(jsonSource) };
      }
      return null;
    }
  }

  return null;
}

function pickStructuredReply(text: string) {
  const structured = parseStructuredReply(text);
  if (structured) return structuredReplyToText(structured);

  const jsonStart = text.indexOf("{");
  if (jsonStart < 0) return "";

  const jsonText = text.slice(jsonStart).trim();
  try {
    const parsed = JSON.parse(jsonText);
    if (typeof parsed.feedback === "string" && typeof parsed.next_question === "string") {
      return `${parsed.feedback}\n\n${parsed.next_question}`;
    }
    for (const key of ["reply", "answer", "question", "next_question", "feedback", "final_star", "star"]) {
      if (typeof parsed[key] === "string") return parsed[key];
    }
  } catch {
    const partial = jsonText.match(/"(?:reply|answer|question|next_question|feedback)"\s*:\s*"((?:\\.|[^"\\])*)/s)?.[1];
    if (partial) return decodeJsonString(partial);
  }

  return "";
}

export function formatDifyAnswer(raw: string) {
  const text = cleanDifyText(raw);
  if (!text) return "";

  const structuredReply = pickStructuredReply(text);
  if (structuredReply) return structuredReply;
  if (text.startsWith("{")) return "";

  return text;
}
