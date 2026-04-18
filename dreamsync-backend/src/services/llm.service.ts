import { InterpretationOutput } from "../modules/interpretation/interpretation.types";

type LLMOptions = {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
};

const GEMINI_MODEL = "gemini-2.0-flash";
const GROQ_MODEL =
  process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";

const LLM_TIMEOUT = 15000; // 15s timeout

const FALLBACK_REFLECTION_PROMPTS = [
  "Which specific image from the dream felt emotionally charged, and what real-life situation does it resemble?",
  "Where did you feel the strongest shift in the dream, and what part of you might that shift represent?",
  "If one dream symbol were speaking for a hidden need, what would it ask you to notice?",
];

class LLMAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LLMAuthError";
  }
}

function stripCodeFences(raw: string): string {
  return raw.replace(/```json/gi, "").replace(/```/g, "").trim();
}

function parseJsonObject<T>(raw: string): T {
  const cleaned = stripCodeFences(raw);

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return JSON.parse(extractJsonObject(cleaned)) as T;
  }
}

function extractJsonObject(raw: string): string {
  const cleaned = stripCodeFences(raw);
  const start = cleaned.indexOf("{");
  if (start === -1) {
    throw new Error("No JSON object found in model response");
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < cleaned.length; i += 1) {
    const ch = cleaned[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (ch === "\\") {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === "{") depth += 1;
    if (ch === "}") depth -= 1;

    if (depth === 0) {
      return cleaned.slice(start, i + 1);
    }
  }

  throw new Error("No complete JSON object found in model response");
}

type TherapistDreamResponse = {
  reflection?: string;
  emotion: string;
  keywords?: string[];
  interpretation: string;
  insight?: string;
  symbols?: { symbol: string; meaning: string }[];
};

function isNativeInterpretation(value: unknown): value is InterpretationOutput {
  const parsed = value as InterpretationOutput;
  return (
    parsed &&
    typeof parsed.summary === "string" &&
    Array.isArray(parsed.themes) &&
    typeof parsed.emotionalTone === "string" &&
    Array.isArray(parsed.reflectionPrompts) &&
    Array.isArray(parsed.symbolTags) &&
    Array.isArray(parsed.wordReflections)
  );
}

function parseLLMOutput(raw: string): InterpretationOutput {
  const parsed = parseJsonObject<unknown>(raw);

  if (isNativeInterpretation(parsed)) {
    const output = normalizeInterpretationShape(parsed);
    assertDeepInterpretation(output);
    return output;
  }

  const output = toInterpretationOutputFromTherapistJson(parsed);
  assertDeepInterpretation(output);
  return output;
}

function normalizeInterpretationShape(output: InterpretationOutput): InterpretationOutput {
  return {
    summary: humanizeResponse(output.summary.trim()),
    themes: output.themes
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim())
      .slice(0, 3),
    emotionalTone: humanizeResponse(output.emotionalTone.trim()),
    reflectionPrompts: output.reflectionPrompts
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim())
      .slice(0, 3),
    symbolTags: output.symbolTags
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .map((item) => item.trim())
      .slice(0, 6),
    wordReflections: output.wordReflections
      .filter(
        (item) =>
          typeof item?.word === "string" &&
          item.word.trim().length > 0 &&
          typeof item?.reflection === "string" &&
          item.reflection.trim().length > 0
      )
      .map((item) => ({
        word: item.word.trim(),
        reflection: humanizeResponse(item.reflection.trim()),
      }))
      .slice(0, 3),
  };
}

function toInterpretationOutputFromTherapistJson(parsed: unknown): InterpretationOutput {
  const response = parsed as TherapistDreamResponse;
  if (
    !response ||
    typeof response.emotion !== "string" ||
    typeof response.interpretation !== "string"
  ) {
    throw new Error("Model returned JSON that does not match the interpretation schema");
  }

  const emotion = response.emotion.trim();
  const symbolKeywords = Array.isArray(response.symbols)
    ? response.symbols
        .map((item) => item?.symbol)
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];
  const keywords = Array.isArray(response.keywords)
    ? response.keywords.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];
  const interpretation =
    typeof response.interpretation === "string" ? response.interpretation.trim() : "";
  const reflection = typeof response.reflection === "string" ? response.reflection.trim() : "";
  const insight = typeof response.insight === "string" ? response.insight.trim() : "";

  if (!emotion && !keywords.length && !symbolKeywords.length && !interpretation) {
    throw new Error("Model returned empty structured content");
  }

  const themeSource =
    symbolKeywords.length > 0
      ? symbolKeywords
      : keywords.length > 0
        ? keywords
        : [];
  const summary = humanizeResponse([reflection, interpretation, insight].filter(Boolean).join(" "));

  if (!summary) {
    throw new Error("Model returned no interpretation summary");
  }

  if (themeSource.length < 2) {
    throw new Error("Model returned too few dream-specific symbols");
  }

  const reflectionPrompts = themeSource.slice(0, 3).map((keyword) => {
    return `How does ${keyword} connect to the most vivid moment in this dream?`;
  });

  while (reflectionPrompts.length < 3) {
    reflectionPrompts.push(FALLBACK_REFLECTION_PROMPTS[reflectionPrompts.length]);
  }

  const wordReflections =
    Array.isArray(response.symbols) && response.symbols.length > 0
      ? response.symbols
          .filter(
            (item) =>
              typeof item?.symbol === "string" &&
              typeof item?.meaning === "string"
          )
          .slice(0, 2)
          .map((item) => ({
            word: item.symbol,
            reflection: humanizeResponse(item.meaning),
          }))
      : themeSource.slice(0, 2).map((keyword) => ({
          word: keyword,
          reflection: humanizeResponse(
            `${keyword} is tied to the emotional pattern described in the dream: ${emotion}`
          ),
        }));

  if (wordReflections.length < 2) {
    throw new Error("Model returned too few word reflections");
  }

  const output = {
    summary,
    themes: themeSource.slice(0, 3),
    emotionalTone: humanizeResponse(emotion),
    reflectionPrompts,
    symbolTags: themeSource.slice(0, Math.max(2, Math.min(5, themeSource.length))),
    wordReflections,
  };
  assertDeepInterpretation(output);
  return output;
}

function sentenceCount(text: string): number {
  return (text.match(/[.!?](\s|$)/g) ?? []).length;
}

function isGenericResponse(text: string): boolean {
  const genericPhrases = [
    "may reflect",
    "could mean",
    "sometimes",
    "in general",
    "this dream may",
    "various interpretations",
    "it is possible",
    "unresolved emotional processing",
    "needs more detail",
    "try recalling more details",
    "emotions and patterns",
  ];

  const tooShort = text.length < 150;
  const hasGeneric = genericPhrases.some((phrase) =>
    text.toLowerCase().includes(phrase)
  );
  const emotionalWords = [
    "feel",
    "feeling",
    "afraid",
    "fear",
    "longing",
    "tender",
    "hurt",
    "safe",
    "unsafe",
    "carrying",
    "protect",
    "pressure",
    "grief",
    "hope",
    "conflict",
    "anxious",
    "comfort",
  ];
  const hasEmotionalLanguage = emotionalWords.some((word) =>
    text.toLowerCase().includes(word)
  );
  const speaksToUser = /\b(you|your|yourself)\b/i.test(text);

  return tooShort || hasGeneric || !hasEmotionalLanguage || !speaksToUser;
}

function humanizeResponse(text: string): string {
  return text
    .replace(/The dream suggests/gi, "It feels like your mind is trying to show you")
    .replace(/This dream suggests/gi, "It feels like your mind is trying to show you")
    .replace(/This indicates/gi, "This might be connected to")
    .replace(/The presence of/gi, "Seeing")
    .replace(/\brepresents\b/gi, "could be reflecting")
    .trim();
}

function buildStrongerRetryPrompt(userInput: string): string {
  return `
Your previous response was too generic or emotionally flat.
Be more emotionally present and human.
Speak as if you truly understand the person.
Use "you" and "your".
Reference specific dream details.
Avoid vague language completely.

${userInput}
`.trim();
}

function buildJsonRepairPrompt(rawOutput: string, originalPrompt: string): string {
  return `
Convert the malformed model output below into ONLY valid JSON.
Do not add markdown, comments, or explanation.
The repaired JSON must preserve the dream-specific psychological meaning and must be deep, non-generic, and complete.

Required JSON shape:
{
  "reflection": "gentle, human-like emotional reflection (2-3 lines)",
  "emotion": "deep emotional explanation (not single word)",
  "symbols": [
    {
      "symbol": "...",
      "meaning": "psychological meaning"
    }
  ],
  "interpretation": "deep explanation (minimum 5 sentences)",
  "insight": "what this dream is telling the person"
}

Original dream prompt:
${originalPrompt}

Malformed output:
${rawOutput}
`.trim();
}

function assertDeepInterpretation(output: InterpretationOutput): void {
  const summary = output.summary?.trim() ?? "";
  const emotionalTone = output.emotionalTone?.trim() ?? "";

  if (isGenericResponse(`${summary} ${emotionalTone}`)) {
    throw new Error("Interpretation rejected: generic response detected");
  }
  if (sentenceCount(summary) < 4 || summary.length < 220) {
    throw new Error("Interpretation rejected: summary is too shallow");
  }
  if (emotionalTone.length < 18) {
    throw new Error("Interpretation rejected: emotionalTone is too generic");
  }
  if (!Array.isArray(output.symbolTags) || output.symbolTags.length < 2) {
    throw new Error("Interpretation rejected: missing symbolic detail");
  }
  if (!Array.isArray(output.wordReflections) || output.wordReflections.length < 2) {
    throw new Error("Interpretation rejected: missing word reflections");
  }
}

async function callGemini(
  prompt: string,
  options?: LLMOptions
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Gemini fallback skipped: GEMINI_API_KEY is not configured");
  }

  console.log("AI Provider: Gemini (optional fallback)");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: options?.temperature ?? 0.7,
          topP: options?.topP ?? 0.8,
          maxOutputTokens: options?.maxTokens ?? 2000,
        },
      }),
      signal: AbortSignal.timeout(LLM_TIMEOUT),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API Error: ${err}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((part: any) => part?.text || "").join("") || "";

  if (!text) {
    throw new Error("No response from Gemini");
  }

  return text;
}

async function callGroq(prompt: string): Promise<string> {
  const apiKey =
    process.env.GROQ_API_KEY?.trim() ?? process.env.GROK_API_KEY?.trim();
  if (!apiKey) {
    throw new LLMAuthError("Missing GROQ_API_KEY");
  }

  if (!/^gsk/i.test(apiKey)) {
    throw new LLMAuthError(
      "Invalid GROQ_API_KEY for GroqCloud. Use a GroqCloud key that starts with gsk."
    );
  }

  console.log("AI Provider: GroqCloud (primary)");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a compassionate therapist who listens deeply and responds with emotional warmth, insight, and care.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_completion_tokens: 2000,
      top_p: 0.9,
    }),
    signal: AbortSignal.timeout(LLM_TIMEOUT),
  });

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 401 || /incorrect api key|invalid api key/i.test(err)) {
      throw new LLMAuthError(`Invalid GROQ_API_KEY: ${err}`);
    }
    throw new Error(`GroqCloud API Error: ${err}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || "";

  if (!text) {
    throw new Error("No response from GroqCloud");
  }

  return text;
}

async function getDeepInterpretationFromGrok(prompt: string): Promise<InterpretationOutput> {
  const raw = await callGroq(prompt);

  try {
    return parseLLMOutput(raw);
  } catch (parseError) {
    console.error("[GroqCloud parse failed, repairing JSON]", parseError);
    const repaired = await callGroq(buildJsonRepairPrompt(raw, prompt));
    return parseLLMOutput(repaired);
  }
}

async function getDeepInterpretationFromGemini(
  prompt: string,
  options?: LLMOptions
): Promise<InterpretationOutput> {
  const raw = await callGemini(prompt, options);

  try {
    return parseLLMOutput(raw);
  } catch (parseError) {
    console.error("[Gemini parse failed, repairing JSON]", parseError);
    const repaired = await callGemini(buildJsonRepairPrompt(raw, prompt), {
      ...options,
      temperature: 0.2,
      maxTokens: Math.max(options?.maxTokens ?? 0, 2500),
    });
    return parseLLMOutput(repaired);
  }
}

export async function generateInterpretationWithLLM(
  prompt: string,
  options?: LLMOptions
): Promise<InterpretationOutput> {
  let groqErrorMessage = "";

  try {
    // 1️⃣ Primary attempt with Groq
    return await getDeepInterpretationFromGrok(prompt);
  } catch (grokError: any) {
    // If it's an auth error, don't retry or fallback
    if (grokError instanceof LLMAuthError) throw grokError;

    groqErrorMessage = grokError.message;
    console.error("[GroqCloud failed, falling back to Gemini]", groqErrorMessage);

    try {
      // 2️⃣ Fallback to Gemini
      return await getDeepInterpretationFromGemini(prompt, options);
    } catch (geminiError: any) {
      console.error("[Gemini failed]", geminiError.message);

      // 3️⃣ Final attempt: Report both failures if fallback fails
      throw new Error(`AI Services unavailable. Groq Error: ${groqErrorMessage} | Gemini Error: ${geminiError.message}`);
    }
  }
}

export async function generateJsonWithLLM<T = unknown>(
  prompt: string,
  options?: LLMOptions
): Promise<T> {
  try {
    const raw = await callGroq(prompt);
    return parseJsonObject<T>(raw);
  } catch (grokError) {
    console.error("[GroqCloud failed]", grokError);
    const raw = await callGemini(prompt, options);
    return parseJsonObject<T>(raw);
  }
}
