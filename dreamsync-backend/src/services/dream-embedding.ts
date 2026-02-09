/**
 * Phase 2: Orchestrates embedding generation and vector storage after a dream is saved.
 * Runs as a side effect — API must NOT wait on this.
 * If it fails, dream save still succeeds.
 */

import { FastifyBaseLogger } from "fastify";
import { buildStructuredDreamText, generateEmbedding } from "./embedding.service.js"
import { upsertDreamEmbedding } from "./vector.service.js"

/**
 * Minimal dream shape required for embeddings
 * (kept here to avoid cross-layer coupling)
 */
export type DreamForEmbedding = {
  id: string;
  userId: string;
  content: string;
  title?: string | null;
  mood?: string | null;
  tags?: string[];
  createdAt: Date;
};

/**
 * Generate embedding from structured dream text and upsert to vector DB.
 * Call this fire-and-forget after POST /dreams; do not await in the route handler.
 * If OPENAI_API_KEY or PINECONE_API_KEY are unset, embedding is skipped.
 */
export async function embedAndStoreDream(
  dream: DreamForEmbedding,
  log: FastifyBaseLogger
): Promise<void> {
  if (!process.env.OPENAI_API_KEY || !process.env.PINECONE_API_KEY) {
    log.debug(
      "Skipping dream embedding (OPENAI_API_KEY or PINECONE_API_KEY not set)"
    );
    return;
  }

  try {
    const text = buildStructuredDreamText({
      title: dream.title,
      content: dream.content,
      mood: dream.mood ?? undefined,
      tags: dream.tags,
    });

    const embedding = await generateEmbedding(text);

    // ✅ NEW: embedding can be null → skip safely
    if (!embedding) {
      log.debug(
        { dreamId: dream.id },
        "Embedding generation skipped (no OpenAI client)"
      );
      return;
    }

    await upsertDreamEmbedding({
      dreamId: dream.id,
      userId: dream.userId,
      embedding,
      createdAt: dream.createdAt,
      mood: dream.mood ?? undefined,
      tags: dream.tags?.length ? dream.tags : undefined,
    });

    log.info({ dreamId: dream.id }, "Dream embedding stored");
  } catch (err) {
    log.error(
      { err, dreamId: dream.id },
      "Dream embedding failed (dream already saved)"
    );
  }
}
