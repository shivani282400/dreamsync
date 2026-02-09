import { GoogleGenerativeAI } from "@google/generative-ai";
import { InterpretationOutput } from "../modules/interpretation/interpretation.types.js"

let client: GoogleGenerativeAI | null = null;

function getGeminiClient() {
  if (!process.env.GEMINI_API_KEY) return null;

  if (!client) {
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  return client;
}

/**
 * Gemini interpretation call (STRICT JSON)
 */
export async function generateInterpretationWithGemini(
  prompt: string
): Promise<InterpretationOutput> {
  const gemini = getGeminiClient();
  if (!gemini) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const model = gemini.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const result = await model.generateContent(`
Return ONLY valid JSON in this exact format:

{
  "summary": string,
  "themes": string[],
  "emotionalTone": string,
  "reflectionPrompts": string[],
  "symbolTags": string[],
  "wordReflections": { "word": string, "reflection": string }[]
}

${prompt}
`);

  const text = result.response.text();

  let parsed: InterpretationOutput;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini returned invalid JSON");
  }

  return parsed;
}
