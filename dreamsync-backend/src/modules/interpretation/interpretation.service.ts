import {
  buildStructuredDreamText,
  generateEmbedding,
} from "../../services/embedding.service";
import {
  findSimilarDreams,
  getDreamEmbedding,
} from "../../services/vector.service";
import {
  isValidInterpretation,
  isSafeInterpretation,
} from "./interpretation.validators";
import { generateInterpretationWithGemini } from "../../services/gemini.service";
import { PrismaClient } from "@prisma/client";

type InterpretationOutput = {
  summary: string;
  themes: string[];
  emotionalTone: string;
  reflectionPrompts: string[];
  symbolTags: string[];
  wordReflections: { word: string; reflection: string }[];
};

/**
 * Fallback interpretation (used when Gemini is unavailable)
 */
function fallbackInterpretation(): InterpretationOutput {
  return {
    summary:
      "This dream feels like an inner processing space where impressions are still settling. It may be highlighting subtle feelings or questions that are not fully resolved yet.",
    themes: ["reflection", "inner awareness", "transition", "uncertainty"],
    emotionalTone: "quiet, contemplative",
    reflectionPrompts: [
      "What part of the dream felt most emotionally charged?",
      "Which image or moment lingered after waking?",
      "If the dream had a message, what might it be asking you to notice?",
      "Where do you feel a similar tone in your waking life lately?",
    ],
    symbolTags: [
      "processing",
      "inner-world",
      "transition",
      "uncertainty",
      "reflection",
      "emotion",
    ],
    wordReflections: [
      {
        word: "moment",
        reflection:
          "The idea of a moment can point to something small yet important that wants your attention.",
      },
      {
        word: "settling",
        reflection:
          "Settling suggests emotions or thoughts finding their place after a period of movement.",
      },
      {
        word: "question",
        reflection:
          "A question in a dream often hints at curiosity, a decision point, or a gentle uncertainty.",
      },
    ],
  };
}

/**
 * Reduce past dreams into short memory summaries
 */
function summarizeMemoryDream(dream: {
  content: string;
  mood?: string | null;
  tags?: string[];
}): string {
  const text =
    dream.content.length > 200
      ? dream.content.slice(0, 200) + "..."
      : dream.content;

  const parts = [`Dream: ${text}`];

  if (dream.mood) parts.push(`Mood: ${dream.mood}`);
  if (dream.tags?.length) parts.push(`Tags: ${dream.tags.join(", ")}`);

  return parts.join(" | ");
}

export async function generateInterpretation(
  prisma: PrismaClient,
  input: {
  userId: string;
  dreamId: string;
}): Promise<InterpretationOutput> {

  // 1️⃣ Verify ownership
  const dream = await prisma.dream.findFirst({
    where: {
      id: input.dreamId,
      userId: input.userId,
    },
  });

  if (!dream) {
    throw new Error("Dream not found or access denied");
  }

  // 2️⃣ Idempotency
  const existing = await prisma.interpretation.findUnique({
    where: { dreamId: dream.id },
  });

  if (existing) {
    return existing.content as InterpretationOutput;
  }

  // 3️⃣ Embedding (best-effort)
  let dreamEmbedding: number[] | null = null;

  try {
    dreamEmbedding = await getDreamEmbedding(input.userId, dream.id);

    if (!dreamEmbedding) {
      const structuredText = buildStructuredDreamText({
        title: dream.title,
        content: dream.content,
        mood: dream.mood ?? undefined,
        tags: dream.tags ?? [],
      });

      dreamEmbedding = await generateEmbedding(structuredText);
    }
  } catch {
    console.warn("Embedding unavailable, skipping semantic memory");
  }

  // 4️⃣ Memory retrieval
  let memoryContext: string[] = [];

  if (dreamEmbedding) {
    try {
      const similar = await findSimilarDreams(
        input.userId,
        dreamEmbedding,
        5
      );

      const ids = similar
        .map((s) => s.dreamId)
        .filter((id) => id !== dream.id);

      if (ids.length > 0) {
        const memoryDreams = await prisma.dream.findMany({
          where: {
            id: { in: ids },
            userId: input.userId,
          },
          select: {
            content: true,
            mood: true,
            tags: true,
          },
        });

        memoryContext = memoryDreams.map(summarizeMemoryDream);
      }
    } catch {
      console.warn("Memory retrieval failed, continuing without context");
    }
  }

  // 5️⃣ Prompt
  const memorySection =
    memoryContext.length > 0
      ? `Relevant past dreams:\n- ${memoryContext.join("\n- ")}`
      : "No relevant past dreams found.";

  const prompt = `
You are a reflective dream analysis assistant.
Your tone is calm, grounded, and psychologically aware.
Do not diagnose. Do not predict the future. Do not give advice.
Offer symbolic interpretations and gentle reflective questions only.
Avoid authoritative claims; use soft language (e.g., "may," "might," "could").

Output rules:
- Return ONLY valid JSON (no markdown, no extra text).
- Keep each field concise but meaningful.
- No medical, legal, or deterministic claims.

JSON format:
{
  "summary": string, // 2-4 sentences, reflective and nuanced
  "themes": string[], // 4-7 short noun phrases
  "emotionalTone": string, // 1-3 words
  "reflectionPrompts": string[], // 4-6 gentle questions
  "symbolTags": string[], // 6-12 lowercase tags, 1-2 words each
  "wordReflections": { "word": string, "reflection": string }[] // 4-8 items, word = 1-3 words from the dream, reflection = 1-2 sentences
}

Current dream:
${dream.content}

${memorySection}
`.trim();

  // 6️⃣ Gemini call with HARD fallback
  let result: InterpretationOutput;

  try {
    result = await generateInterpretationWithGemini(prompt);
  } catch (err) {
    console.warn("Gemini unavailable. Using fallback interpretation.");
    result = fallbackInterpretation();
  }

  // 7️⃣ HARD VALIDATION
  if (!isValidInterpretation(result) || !isSafeInterpretation(result)) {
    result = fallbackInterpretation();
  }

  // 8️⃣ Persist
  await prisma.interpretation.create({
    data: {
      dreamId: dream.id,
      content: result,
    },
  });

  return result;
}
