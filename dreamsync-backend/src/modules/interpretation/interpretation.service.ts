import {
  buildStructuredDreamText,
  generateEmbedding,
} from "../../services/embedding.service.js";

import {
  findSimilarDreams,
  getDreamEmbedding,
} from "../../services/vector.service.js";

import { buildInterpretationPrompt } from "./interpretation.prompts.js";
import {
  generateInterpretationWithLLM,
} from "../../services/llm.service.js";
import { PrismaClient } from "@prisma/client";
import {
  isSafeInterpretation,
  isValidInterpretation,
  normalizeInterpretation,
} from "./interpretation.validators.js";

type InterpretationOutput = {
  summary: string;
  themes: string[];
  emotionalTone: string;
  reflectionPrompts: string[];
  symbolTags: string[];
  wordReflections: { word: string; reflection: string }[];
};

/**
 * Fallback — ONLY if LLM completely fails
 */
function fallbackInterpretation(): InterpretationOutput {
  console.warn("⚠️ Using fallback interpretation (LLM failed)");

  return {
    summary:
      "There is a piece of this dream that stands out; it might help to notice which image or moment feels the most vivid.",
    themes: ["curiosity", "reflection"],
    emotionalTone: "neutral",
    reflectionPrompts: [
      "Which moment is the easiest to recall?",
      "What feeling followed you after waking?",
      "Is there a small detail that feels oddly important?",
    ],
    symbolTags: ["dream"],
    wordReflections: [
      {
        word: "moment",
        reflection:
          "A single image can hold more weight than the full storyline.",
      },
    ],
  };
}

/**
 * Random interpretive lens
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
    const content = existing.content as InterpretationOutput;
    // If an older run stored malformed or fallback output, regenerate instead of repeating it.
    if (content && isValidInterpretation(content)) {
      return content;
    }
  }

  // 3️⃣ Embedding (non-blocking)
  try {
    let embedding = await getDreamEmbedding(input.userId, dream.id);

    if (!embedding) {
      const structuredText = buildStructuredDreamText({
        title: dream.title,
        content: dream.content,
        mood: dream.mood ?? undefined,
        tags: dream.tags ?? [],
      });

      embedding = await generateEmbedding(structuredText);
    }

    if (embedding && Array.isArray(embedding)) {
      await findSimilarDreams(input.userId, embedding, 3).catch(() => {});
    }
  } catch {
    console.warn("Embedding skipped.");
  }

  // 4️⃣ Build prompt (Friendly Reflective Guide tone)
  const lens = getRandomLens();

  const prompt = buildInterpretationPrompt({
    dreamText: dream.content,
    mood: dream.mood ?? undefined,
    tags: dream.tags ?? [],
    lens,
  });

  // 5️⃣ Call LLM
  let result: InterpretationOutput | null = null;

  try {
    const llm = await generateInterpretationWithLLM(prompt, {
      temperature: 0.8,
      topP: 0.9,
    });

    if (llm.ok) {
      result = normalizeInterpretation(llm.data);
    } else {
      console.warn("⚠️ LLM error:", llm.error);
    }
  } catch (err) {
    // LLM should rarely throw now; keep a guard just in case.
    console.error("❌ LLM call failed:", err);
  }

  // 6️⃣ Soft validation and safety gating
  if (result && !isSafeInterpretation(result)) {
    console.warn("⚠️ Unsafe interpretation detected. Falling back.");
    result = null;
  }

  if (!result) {
    // Only use fallback when we truly cannot recover any usable output.
    result = fallbackInterpretation();
  }

  // 7️⃣ Persist
  if (existing) {
    // Update instead of create to avoid unique constraint violations on dreamId.
    await prisma.interpretation.update({
      where: { id: existing.id },
      data: { content: result },
    });
  } else {
    await prisma.interpretation.create({
      data: {
        dreamId: dream.id,
        content: result,
      },
    });
  }

  return result;
}
