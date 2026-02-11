import {
  buildStructuredDreamText,
  generateEmbedding,
} from "../../services/embedding.service.js";
import {
  findSimilarDreams,
  getDreamEmbedding,
} from "../../services/vector.service.js";
import {
  isValidInterpretation,
  isSafeInterpretation,
} from "./interpretation.validators.js";
import { generateInterpretationWithLLM } from "../../services/llm.service.js";
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
 * Improved fallback interpretation (less generic)
 */
function fallbackInterpretation(): InterpretationOutput {
  return {
    summary:
      "This dream presents a sequence of images that may reflect a shifting emotional atmosphere. Rather than pointing to one fixed meaning, it could be highlighting contrasts or tensions that are still unfolding.",
    themes: ["imagery", "emotion", "contrast", "uncertainty"],
    emotionalTone: "subtle, reflective",
    reflectionPrompts: [
      "Which image stayed with you the longest after waking?",
      "Did any part of the dream feel familiar to your current life?",
      "What emotion seemed strongest beneath the surface?",
      "If the dream had a quiet message, what might it be nudging you toward noticing?",
    ],
    symbolTags: [
      "imagery",
      "emotion",
      "contrast",
      "awareness",
      "reflection",
      "symbol",
    ],
    wordReflections: [
      {
        word: "shift",
        reflection:
          "A sense of shifting may suggest something in your waking life that feels unsettled or in motion.",
      },
      {
        word: "image",
        reflection:
          "Dream images often act as emotional metaphors rather than literal scenes.",
      },
      {
        word: "tone",
        reflection:
          "The tone of a dream can sometimes matter more than the events themselves.",
      },
    ],
  };
}

/**
 * Summarize memory dreams for context contrast
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

/**
 * Random interpretive lens to prevent repetition
 */
function getRandomLens() {
  const lenses = ["symbolic", "emotional", "narrative", "memory-based"];
  return lenses[Math.floor(Math.random() * lenses.length)];
}

export async function generateInterpretation(
  prisma: PrismaClient,
  input: {
    userId: string;
    dreamId: string;
  }
): Promise<InterpretationOutput> {
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

  // 3️⃣ Embedding (best effort)
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

  const lens = getRandomLens();

  const memorySection =
    memoryContext.length > 0
      ? `Relevant past dreams (for contrast only — do NOT repeat their meanings):
- ${memoryContext.join("\n- ")}`
      : "No relevant past dreams found.";

  // 5️⃣ Strong anti-repetition + lighter tone prompt
  const prompt = `
You are an empathetic dream reflection writer.

CRITICAL RULES:
- You MUST reference at least 2 concrete symbols or moments from the CURRENT dream.
- You MUST explain what makes this dream emotionally distinct.
- Avoid generic phrases like "subconscious", "inner processing", or "unresolved emotions".
- No diagnosis. No advice. No future prediction.
- Use soft language (may, might, could).
- Keep tone warm, human, and easy to read.

Interpret primarily through a ${lens} lens.

Return ONLY valid JSON.

JSON format:
{
  "summary": string,
  "themes": string[],
  "emotionalTone": string,
  "reflectionPrompts": string[],
  "symbolTags": string[],
  "wordReflections": { "word": string, "reflection": string }[]
}

Current dream:
"""
${dream.content}
"""

Mood: ${dream.mood ?? "not specified"}
Tags: ${(dream.tags ?? []).join(", ")}

${memorySection}

Make this interpretation clearly different in tone or focus from past dreams.
`.trim();

  // 6️⃣ Gemini call
  let result: InterpretationOutput;

  try {
    result = await generateInterpretationWithLLM(prompt, {
      temperature: 0.7,
      topP: 0.9,
    });
    
  } catch (err) {
    console.warn("Gemini unavailable. Using fallback.");
    result = fallbackInterpretation();
  }

  // 7️⃣ Hard validation
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
