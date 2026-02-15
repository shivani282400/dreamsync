import { InterpretationOutput } from "../modules/interpretation/interpretation.types.js";

type LLMOptions = {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
};

const GEMINI_MODEL = "gemini-2.5-flash";

const FALLBACK_INTERPRETATION: InterpretationOutput = {
  summary:
    "Your dream feels rich with personal meaning. It may be reflecting an emotional transition unfolding in your waking life.",
  themes: ["change", "self-reflection", "inner guidance"],
  emotionalTone: "reflective",
  reflectionPrompts: [
    "What part of this dream felt most emotionally real to you?",
    "Which symbol seems most connected to your current life?",
    "What might this dream be encouraging you to notice?"
  ],
  symbolTags: ["journey", "threshold", "signal"],
  wordReflections: [
    { word: "journey", reflection: "Represents movement through a personal process." },
    { word: "signal", reflection: "Suggests intuition trying to surface." }
  ]
};

async function callGeminiREST(
  prompt: string,
  options?: LLMOptions
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("Gemini API key not configured");

  const url = `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        maxOutputTokens: 600
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error: ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty text");

  return text.trim();
}

/* ---------------- STRUCTURED PARSING ---------------- */

function ensureMinimumLength<T>(arr: T[], min: number, fallback: T[]): T[] {
  if (!arr || arr.length === 0) return fallback;
  if (arr.length >= min) return arr.slice(0, min);
  const padded = [...arr];
  while (padded.length < min) {
    padded.push(fallback[padded.length % fallback.length]);
  }
  return padded;
}

function parseStructured(raw: string): InterpretationOutput {
  const cleaned = raw.replace(/```/g, "").trim();
  const sections = new Map<string, string[]>();
  let current = "";

  const lines = cleaned.split(/\r?\n/);
  const headerRegex = /^([A-Z_]+):\s*(.*)$/;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const match = line.match(headerRegex);
    if (match) {
      current = match[1];
      sections.set(current, []);
      if (match[2]) sections.get(current)!.push(match[2]);
      continue;
    }

    if (current) sections.get(current)!.push(line);
  }

  const summary = (sections.get("SUMMARY") ?? []).join(" ").trim();
  const themes = (sections.get("THEMES") ?? []).map(l => l.replace(/^[-*]\s*/, "").trim());
  const tone = (sections.get("EMOTIONAL_TONE") ?? []).join(" ").trim();
  const prompts = (sections.get("REFLECTION_PROMPTS") ?? []).map(l => l.replace(/^[-*]\s*/, "").trim());
  const tags = (sections.get("SYMBOL_TAGS") ?? []).map(l => l.replace(/^[-*]\s*/, "").trim());
  const wordLines = sections.get("WORD_REFLECTIONS") ?? [];

  const wordReflections = wordLines
    .map(l => l.replace(/^[-*]\s*/, "").trim())
    .map(l => {
      const idx = l.indexOf(":");
      if (idx === -1) return null;
      return {
        word: l.slice(0, idx).trim(),
        reflection: l.slice(idx + 1).trim()
      };
    })
    .filter(Boolean) as { word: string; reflection: string }[];

  if (!summary) throw new Error("Missing SUMMARY");

  return {
    summary,
    themes: ensureMinimumLength(themes, 3, FALLBACK_INTERPRETATION.themes),
    emotionalTone: tone || FALLBACK_INTERPRETATION.emotionalTone,
    reflectionPrompts: ensureMinimumLength(prompts, 3, FALLBACK_INTERPRETATION.reflectionPrompts),
    symbolTags: ensureMinimumLength(tags, 2, FALLBACK_INTERPRETATION.symbolTags),
    wordReflections: ensureMinimumLength(wordReflections, 2, FALLBACK_INTERPRETATION.wordReflections)
  };
}

function buildPrompt(userPrompt: string) {
  return `
Return ONLY this format:

SUMMARY:
<paragraph>

THEMES:
- item
- item
- item

EMOTIONAL_TONE:
<single word>

REFLECTION_PROMPTS:
- question
- question
- question

SYMBOL_TAGS:
- tag
- tag

WORD_REFLECTIONS:
- word: meaning
- word: meaning

User dream:
${userPrompt}
`.trim();
}

export async function generateInterpretationWithLLM(
  prompt: string,
  options?: LLMOptions
): Promise<InterpretationOutput> {
  try {
    const raw = await callGeminiREST(buildPrompt(prompt), options);
    return parseStructured(raw);
  } catch (err) {
    console.log("LLM failed. Using fallback.", err);
    return FALLBACK_INTERPRETATION;
  }
}

export async function generateJsonWithLLM<T = unknown>(
  prompt: string,
  options?: LLMOptions
): Promise<T> {
  const raw = await callGeminiREST(prompt, options);
  return raw as unknown as T;
}
