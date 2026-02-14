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

  // 2️⃣ Idempotency
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
    // Embedding is non-blocking; ignore failures.
  }

  // 4️⃣ Build prompt
  const lens = getRandomLens();

  const prompt = buildInterpretationPrompt({
    title: dream.title ?? undefined,
    dreamText: dream.content,
    mood: dream.mood ?? undefined,
    tags: dream.tags ?? [],
    lens,
  });

  // 5️⃣ Call LLM
  let result: InterpretationOutput | null = null;

  try {
    const llm = await generateInterpretationWithLLM(prompt, {
      temperature: 0.85,
      topP: 0.9,
      maxTokens: 240,
    });

    result = normalizeInterpretation(llm);
  } catch (err: any) {
    // Do NOT mask the real error
    throw err;
  }

  if (!result) {
    throw new Error("Interpretation normalization failed");
  }

  // 6️⃣ Persist
  if (existing) {
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
