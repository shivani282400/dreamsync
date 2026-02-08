import { GoogleGenerativeAI } from "@google/generative-ai";
import { InterpretationOutput } from "../modules/interpretation/interpretation.types";

/**
 * Lazy Gemini client
 */
let gemini: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI | null {
  if (!process.env.GEMINI_API_KEY) return null;

  if (!gemini) {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  return gemini;
}

/**
 * Generate interpretation using Google Gemini
 * Enforces STRICT JSON output
 */
export async function generateInterpretationWithLLM(
  prompt: string
): Promise<InterpretationOutput> {
  const client = getGeminiClient();

  if (!client) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const model = client.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const result = await model.generateContent(`
You must return ONLY valid JSON.
No markdown. No explanations.

The JSON must match this shape exactly:
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

  const raw = result.response.text();

  if (!raw) {
    throw new Error("Empty response from Gemini");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }

  return parsed as InterpretationOutput;
}
