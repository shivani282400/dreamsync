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
      "Something about this dream feels meaningful. You might notice which part stays with you the longest.",
    themes: ["symbol", "reflection"],
    emotionalTone: "neutral",
    reflectionPrompts: [
      "Which moment felt strongest?",
      "Did anything surprise you?",
      "What emotion lingered after waking?",
      "Does any part connect to your current life?",
    ],
    symbolTags: ["dream"],
    wordReflections: [
      {
        word: "moment",
        reflection:
          "Sometimes a single moment carries more meaning than the whole storyline.",
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
  let result: InterpretationOutput;

  try {
    result = await generateInterpretationWithLLM(prompt, {
      temperature: 0.8,
      topP: 0.9,
    });

    console.log("✅ LLM RESPONSE:", result);
  } catch (err) {
    console.error("❌ LLM call failed:", err);
    return fallbackInterpretation();
  }

  // 6️⃣ Basic structural safety (non-destructive)
  if (!result || typeof result.summary !== "string") {
    console.warn("⚠️ Invalid LLM structure. Using fallback.");
    return fallbackInterpretation();
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
