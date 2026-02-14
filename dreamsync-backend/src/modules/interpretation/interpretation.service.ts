import {
  buildStructuredDreamText,
  generateEmbedding,
} from "../../services/embedding.service.js";

import {
  findSimilarDreams,
  getDreamEmbedding,
} from "../../services/vector.service.js";

import { buildInterpretationPrompt } from "./interpretation.prompts.js";
import { generateInterpretationWithLLM } from "../../services/llm.service.js";
import { PrismaClient } from "@prisma/client";
import { normalizeInterpretation } from "./interpretation.validators.js";

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
    summary: "Interpretation temporarily unavailable due to a processing error.",
    themes: [],
    emotionalTone: "",
    reflectionPrompts: [],
    symbolTags: [],
    wordReflections: [],
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
    forceRegenerate?: boolean;
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

  // 2️⃣ Idempotency (never reuse stale content unless explicitly allowed)
  const existing = await prisma.interpretation.findUnique({
    where: { dreamId: dream.id },
  });

  const forceRegenerate = input.forceRegenerate ?? false;
  if (existing && !forceRegenerate) {
    return existing.content as InterpretationOutput;
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
    });

    result = normalizeInterpretation(llm);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("❌ LLM call failed:", err);
    // Explicitly surface missing API key instead of falling back.
    if (message.includes("Groq API key not configured")) {
      throw err;
    }
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
