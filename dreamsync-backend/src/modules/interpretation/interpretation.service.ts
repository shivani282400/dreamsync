import {
  buildStructuredDreamText,
  generateEmbedding,
} from "../../services/embedding.service.js";
import {
  findSimilarDreams,
  getDreamEmbedding,
} from "../../services/vector.service.js";
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
 * Minimal fallback (only used if LLM completely fails)
 */
function fallbackInterpretation(): InterpretationOutput {
  return {
    summary:
      "This dream contains images that may hold personal meaning. You might explore which part felt most emotionally vivid.",
    themes: ["symbol", "emotion"],
    emotionalTone: "neutral",
    reflectionPrompts: [
      "Which image felt strongest?",
      "What emotion stayed with you?",
      "Did anything feel familiar?",
      "What part would you revisit?",
    ],
    symbolTags: ["dream"],
    wordReflections: [
      {
        word: "image",
        reflection:
          "Sometimes a single dream image can reflect something subtle happening beneath the surface.",
      },
    ],
  };
}

/**
 * Soft validation (non-destructive)
 */
function ensureStructure(output: any): InterpretationOutput {
  return {
    summary: output?.summary ?? "",
    themes: Array.isArray(output?.themes) ? output.themes : [],
    emotionalTone: output?.emotionalTone ?? "",
    reflectionPrompts: Array.isArray(output?.reflectionPrompts)
      ? output.reflectionPrompts
      : [],
    symbolTags: Array.isArray(output?.symbolTags)
      ? output.symbolTags
      : [],
    wordReflections: Array.isArray(output?.wordReflections)
      ? output.wordReflections
      : [],
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

  // 3️⃣ Embedding (optional)
  try {
    const structuredText = buildStructuredDreamText({
      title: dream.title,
      content: dream.content,
      mood: dream.mood ?? undefined,
      tags: dream.tags ?? [],
    });
  
    const embedding = await generateEmbedding(structuredText);
  
    if (embedding && Array.isArray(embedding)) {
      await findSimilarDreams(input.userId, embedding, 3).catch(() => {});
    }
  } catch {
    console.warn("Embedding skipped.");
  }
  

  const lens = getRandomLens();

  // 4️⃣ Strong anti-generic prompt
  const prompt = `
You are a grounded, emotionally intelligent dream reflection writer.

STRICT RULES:
- Reference specific elements from THIS dream.
- Do NOT use generic filler phrases.
- Do NOT say:
  "This dream presents"
  "Sequence of images"
  "Emotional atmosphere"
  "Rather than pointing to one fixed meaning"
- No diagnosis.
- No advice.
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

Dream:
"""
${dream.content}
"""

Mood: ${dream.mood ?? "not specified"}
Tags: ${(dream.tags ?? []).join(", ") || "none"}

Make the interpretation feel specific and emotionally distinct.
`.trim();

  let rawResult: any;

  try {
    rawResult = await generateInterpretationWithLLM(prompt, {
      temperature: 0.8,
      topP: 0.9,
    });

    console.log("RAW LLM RESULT:", rawResult);
  } catch (err) {
    console.error("LLM call failed:", err);
    return fallbackInterpretation();
  }

  // 5️⃣ Soft structure enforcement
  const result = ensureStructure(rawResult);

  // 6️⃣ Persist
  await prisma.interpretation.create({
    data: {
      dreamId: dream.id,
      content: result,
    },
  });

  return result;
}
