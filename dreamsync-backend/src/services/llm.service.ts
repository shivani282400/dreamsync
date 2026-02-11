import { GoogleGenerativeAI } from "@google/generative-ai";
import { InterpretationOutput } from "../modules/interpretation/interpretation.types.js";

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
export async function generateInterpretationWithLLM(
  prompt: string,
  options?: LLMOptions
): Promise<InterpretationOutput> {
  const client = getGeminiClient();

  if (!client) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const model = client.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: options?.temperature ?? 0.8,
      topP: options?.topP ?? 0.9,
    },
  });

  const result = await model.generateContent(`
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
  "wordReflections": { "word": string, "reflection": string }[]
}

${prompt}
`.trim());

  const raw = result.response.text()?.trim();

  if (!raw) {
    throw new Error("Empty response from LLM");
  }

  // Safer JSON extraction
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("LLM did not return JSON");
  }

  const jsonString = raw.slice(start, end + 1);

  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    console.error("Raw LLM output:", raw);
    throw new Error("LLM returned invalid JSON");
  }

  return parsed as InterpretationOutput;
}
