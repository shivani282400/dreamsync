import { InterpretationOutput } from "../modules/interpretation/interpretation.types.js";

type LLMOptions = {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
};

const GEMINI_MODEL = "gemini-2.5-flash";

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
        temperature: options?.temperature ?? 0.2,
        topP: options?.topP ?? 0.8,
        maxOutputTokens: options?.maxTokens ?? 1500,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error: ${errorText}`);
  }

  const data = await response.json();
  console.log("[Gemini full response]", JSON.stringify(data));
  const candidate = data?.candidates?.[0];
  if (!candidate) throw new Error("No Gemini candidate returned");

  console.log("Gemini finishReason:", candidate.finishReason);
  if (candidate.finishReason !== "STOP") {
    throw new Error(`Gemini interrupted: ${candidate.finishReason}`);
  }

  const text = candidate?.content?.parts?.map((p: any) => p?.text || "").join("");

  if (!text) throw new Error("Gemini returned empty text");
  const trimmed = String(text).trim();
  if (!trimmed.endsWith("}")) {
    throw new Error("Gemini output truncated before closing brace");
  }

  console.log("[Gemini raw response]", text);
  return trimmed;
}

function extractJsonObject(raw: string): string {
  const cleaned = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  if (start === -1) {
    throw new Error("No JSON object start found in Gemini response");
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

  throw new Error("No complete JSON object found in Gemini response");
}

function validateInterpretationShape(data: any): asserts data is InterpretationOutput {
  const ok =
    data &&
    typeof data === "object" &&
    typeof data.summary === "string" &&
    Array.isArray(data.themes) &&
    typeof data.emotionalTone === "string" &&
    Array.isArray(data.reflectionPrompts) &&
    Array.isArray(data.symbolTags) &&
    Array.isArray(data.wordReflections);

  if (!ok) {
    throw new Error(
      "Invalid interpretation JSON shape. Required keys: summary, themes, emotionalTone, reflectionPrompts, symbolTags, wordReflections"
    );
  }
}

function isInterruptionOrTruncationError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("Gemini interrupted:") || msg.includes("truncated before closing brace");
}

export async function generateInterpretationWithLLM(
  prompt: string,
  options?: LLMOptions
): Promise<InterpretationOutput> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const attemptOptions =
      attempt === 0
        ? options
        : {
            ...options,
            temperature: 0.1,
            maxTokens: 1500,
          };

    try {
      const text = await callGeminiREST(prompt, attemptOptions);
      const parsed = JSON.parse(text);
      validateInterpretationShape(parsed);
      return parsed;
    } catch (error) {
      lastError = error;
      console.error(`[Gemini interpretation attempt ${attempt + 1} failed]`, error);
      if (attempt === 0 && isInterruptionOrTruncationError(error)) {
        console.log("[Gemini retry] Retrying once after interruption/truncation");
        continue;
      }
      break;
    }
  }

  throw new Error(
    `Interpretation JSON parsing failed after retry: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}

export async function generateJsonWithLLM<T = unknown>(
  prompt: string,
  options?: LLMOptions
): Promise<T> {
  const text = await callGeminiREST(prompt, options);
  return JSON.parse(text) as T;
}
