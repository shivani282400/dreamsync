import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Build structured text for embeddings
 */
export function buildStructuredDreamText(dream: {
  title?: string | null;
  content: string;
  mood?: string | null;
  tags?: string[];
}): string {
  const parts: string[] = [];

  if (dream.title) parts.push(`Title: ${dream.title}`);
  parts.push(`Dream: ${dream.content}`);

  if (dream.mood) parts.push(`Mood: ${dream.mood}`);
  if (dream.tags && dream.tags.length > 0) {
    parts.push(`Tags: ${dream.tags.join(", ")}`);
  }

  return parts.join("\n");
}

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
 * Generate embedding safely (Phase 2 guarantee)
 * Returns null if Gemini is unavailable
 */
export async function generateEmbedding(
  text: string
): Promise<number[] | null> {
  const client = getGeminiClient();

  // ✅ Embeddings are optional
  if (!client) return null;

  try {
    const model = client.getGenerativeModel({
      model: "models/embedding-001",
    });

    const result = await model.embedContent(text);

    return result.embedding.values;
  } catch (err) {
    console.warn("Gemini embedding failed, skipping:", err);
    return null;
  }
}
