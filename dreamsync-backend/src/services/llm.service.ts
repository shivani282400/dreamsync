import Groq from "groq-sdk";
import { InterpretationOutput } from "../modules/interpretation/interpretation.types.js";

let groq: Groq | null = null;

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    // Fix: explicit error for missing key, no silent fallback.
    throw new Error("Groq API key not configured");
  }

  if (!groq) {
    groq = new Groq({ apiKey });
  }

  return groq;
}

type LLMOptions = {
  temperature?: number;
};

/**
 * Main LLM abstraction for DreamSync
 * Currently powered by Groq (Llama 3 8B)
 */
export async function generateInterpretationWithLLM(
  prompt: string,
  options?: LLMOptions
): Promise<InterpretationOutput> {
  const client = getGroqClient();

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

  const response = await client.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    temperature: options?.temperature ?? 0.8,
  });

  const raw = response.choices?.[0]?.message?.content?.trim() ?? "";

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
  const client = getGroqClient();

  const response = await client.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [
      { role: "system", content: "Return ONLY valid JSON. No markdown. No commentary." },
      { role: "user", content: prompt.trim() },
    ],
    temperature: options?.temperature ?? 0.8,
  });

  const raw = response.choices?.[0]?.message?.content?.trim() ?? "";

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
