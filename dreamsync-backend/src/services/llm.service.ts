import { GoogleGenerativeAI } from "@google/generative-ai";
import { InterpretationOutput } from "../modules/interpretation/interpretation.types.js";

let gemini: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    // Explicit error for missing key, no silent fallback.
    throw new Error("Gemini API key not configured");
  }

  if (!gemini) {
    gemini = new GoogleGenerativeAI(apiKey);
  }

  return gemini;
}

type LLMOptions = {
  temperature?: number;
};

/**
 * Main LLM abstraction for DreamSync
 * Currently powered by Google Gemini
 */
export async function generateInterpretationWithLLM(
  prompt: string,
  options?: LLMOptions
): Promise<InterpretationOutput> {
  const client = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-1.5-flash";

  const system = `
Return ONLY valid JSON.
No markdown.
No commentary.

The JSON must match this exact structure:
{
  "summary": string,
  "themes": string[],
  "emotionalTone": string,
  "reflectionPrompts": string[],
  "symbolTags": string[],
  "wordReflections": [{ "word": string, "reflection": string }]
}
  `.trim();

  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: system,
  });

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: options?.temperature ?? 0.8 },
  });

  const raw = response.response.text()?.trim() ?? "";

  if (!raw) {
    throw new Error("Empty response from LLM");
  }

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("LLM did not return JSON");
  }

  const jsonString = raw.slice(start, end + 1);

  try {
    return JSON.parse(jsonString) as InterpretationOutput;
  } catch {
    throw new Error("LLM returned invalid JSON");
  }
}

/**
 * Generic JSON helper
 * Use when the prompt already describes the JSON schema (e.g., reflection rewrites).
 */
export async function generateJsonWithLLM<T = unknown>(
  prompt: string,
  options?: LLMOptions
): Promise<T> {
  const client = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL?.trim() || "gemini-1.5-flash";

  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction: "Return ONLY valid JSON. No markdown. No commentary.",
  });

  const response = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt.trim() }] }],
    generationConfig: { temperature: options?.temperature ?? 0.8 },
  });

  const raw = response.response.text()?.trim() ?? "";

  if (!raw) {
    throw new Error("Empty response from LLM");
  }

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("LLM did not return JSON");
  }

  const jsonString = raw.slice(start, end + 1);

  try {
    return JSON.parse(jsonString) as T;
  } catch {
    throw new Error("LLM returned invalid JSON");
  }
}
