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
 * Cleaner fallback (no repetitive generic paragraph)
 */
function fallbackInterpretation(): InterpretationOutput {
  return {
    summary:
      "Something in this dream stands out, but its meaning may still be unfolding. It might help to sit with the strongest image a little longer.",
    themes: ["symbol", "reflection", "emotion"],
    emotionalTone: "uncertain, contemplative",
    reflectionPrompts: [
      "Which image feels most vivid now?",
      "Did anything surprise you in the dream?",
      "What feeling lingered after waking?",
      "Does anything in your current life feel similar in tone?",
    ],
    symbolTags: ["dream", "symbol", "reflection"],
    wordReflections: [
      {
        word: "image",
        reflection:
          "Sometimes a single image carries more emotional weight than the entire storyline.",
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
 * Random interpretive lens to reduce repetition
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

  // 3️⃣ Embedding
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

  // 5️⃣ Strong anti-repetition prompt
  const prompt = `
You are a thoughtful and grounded dream reflection writer.

STRICT RULES:
- You MUST reference specific symbols or actions from THIS dream.
- You MUST avoid generic filler language.
- Do NOT say:
  "This dream presents"
  "Sequence of images"
  "Emotional atmosphere"
  "Rather than pointing to one fixed meaning"
- No diagnosis.
- No advice.
- No future prediction.
- Use soft language (may, might, could).

Interpret through a ${lens} lens.

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

Make this interpretation feel emotionally distinct and grounded in THIS dream.
`.trim();

  let result: InterpretationOutput;

  try {
    result = await generateInterpretationWithLLM(prompt, {
      temperature: 0.8,
      topP: 0.9,
    });

    console.log("RAW LLM RESULT:", result);
  } catch (err) {
    console.warn("LLM unavailable. Using fallback.");
    result = fallbackInterpretation();
  }

  // 6️⃣ Strict validation (no silent fallback)
  if (!isValidInterpretation(result) || !isSafeInterpretation(result)) {
    console.error("Interpretation failed validation:", result);
    throw new Error("Interpretation validation failed");
  }

  // 7️⃣ Persist
  await prisma.interpretation.create({
    data: {
      dreamId: dream.id,
      content: result,
    },
  });

  return result;
}
