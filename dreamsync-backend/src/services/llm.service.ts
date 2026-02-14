import { GoogleGenerativeAI } from "@google/generative-ai";
import { InterpretationOutput } from "../modules/interpretation/interpretation.types.js";

let gemini: GoogleGenerativeAI | null = null;

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  if (!gemini) {
    gemini = new GoogleGenerativeAI(apiKey);
  }

  return gemini;
}

type LLMOptions = {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
};

/**
 * Extract valid JSON from model response safely
 */
function extractJson(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("LLM did not return JSON");
  }

  return raw.slice(start, end + 1);
}

/**
 * Main LLM interpretation function
 */
export async function generateInterpretationWithLLM(
  prompt: string,
  options?: LLMOptions
): Promise<InterpretationOutput> {
  const client = getGeminiClient();

  // Use supported model for v1beta endpoint
  const modelName =
    process.env.GEMINI_MODEL?.trim() || "gemini-1.0-pro";

  const systemInstruction = `
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
    systemInstruction,
  });

  try {
    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options?.temperature ?? 0.85,
        topP: options?.topP ?? 0.9,
        maxOutputTokens: options?.maxTokens ?? 240,
      },
    });

    const raw = response.response.text()?.trim();

    if (!raw) {
      throw new Error("Empty response from LLM");
    }

    const jsonString = extractJson(raw);

    return JSON.parse(jsonString) as InterpretationOutput;
  } catch (err: any) {
    console.error("❌ Gemini LLM Error:", err?.message || err);
    throw err;
  }
}

/**
 * Generic JSON generation helper
 */
export async function generateJsonWithLLM<T = unknown>(
  prompt: string,
  options?: LLMOptions
): Promise<T> {
  const client = getGeminiClient();

  const modelName =
    process.env.GEMINI_MODEL?.trim() || "gemini-1.0-pro";

  const model = client.getGenerativeModel({
    model: modelName,
    systemInstruction:
      "Return ONLY valid JSON. No markdown. No commentary.",
  });

  try {
    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt.trim() }] }],
      generationConfig: {
        temperature: options?.temperature ?? 0.8,
        topP: options?.topP ?? 0.9,
        maxOutputTokens: options?.maxTokens ?? 240,
      },
    });

    const raw = response.response.text()?.trim();

    if (!raw) {
      throw new Error("Empty response from LLM");
    }

    const jsonString = extractJson(raw);

    return JSON.parse(jsonString) as T;
  } catch (err: any) {
    console.error("❌ Gemini JSON LLM Error:", err?.message || err);
    throw err;
  }
}
