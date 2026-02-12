import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  InterpretationOutput,
} from "../modules/interpretation/interpretation.types.js";

let gemini: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI | null {
  if (!process.env.GEMINI_API_KEY) return null;

  if (!gemini) {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  return gemini;
}

type LLMOptions = {
  temperature?: number;
  topP?: number;
};

/**
 * Main LLM abstraction for DreamSync
 * Currently powered by Gemini
 */
// Return a discriminated union so callers can avoid throwing/fallback on partial failures.
export type LLMInterpretationResult =
  | { ok: true; data: InterpretationOutput; rawText: string }
  | { ok: false; error: string; rawText: string };

export async function generateInterpretationWithLLM(
  prompt: string,
  options?: LLMOptions
): Promise<LLMInterpretationResult> {
  const client = getGeminiClient();

  if (!client) {
    return {
      ok: false,
      error: "GEMINI_API_KEY not configured",
      rawText: "",
    };
  }

  const model = client.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: options?.temperature ?? 0.8,
      topP: options?.topP ?? 0.9,
    },
  });

  // Force a single JSON object to reduce parsing/fallback churn.
  const result = await model.generateContent(
    `
Return ONLY valid JSON.
Do NOT include markdown.
Do NOT include commentary.
Do NOT include code blocks.

The JSON must match this exact structure:
{
  "summary": string,
  "themes": string[],
  "emotionalTone": string,
  "reflectionPrompts": string[],
  "symbolTags": string[],
  "wordReflections": [{ "word": string, "reflection": string }]
}

${prompt}
`.trim()
  );

  const raw = result.response.text()?.trim() ?? "";

  if (!raw) {
    return { ok: false, error: "Empty response from LLM", rawText: "" };
  }

  // Safer JSON extraction
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1) {
    return {
      ok: false,
      error: "LLM did not return JSON",
      rawText: raw,
    };
  }

  const jsonString = raw.slice(start, end + 1);

  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return {
      ok: false,
      error: "LLM returned invalid JSON",
      rawText: raw,
    };
  }

  return {
    ok: true,
    data: parsed as InterpretationOutput,
    rawText: raw,
  };
}
