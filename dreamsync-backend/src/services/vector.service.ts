import { Pinecone } from "@pinecone-database/pinecone";
import { VECTOR_CONFIG } from "../config/vector.js"

export type DreamVectorRecord = {
  dreamId: string;
  userId: string;
  embedding: number[];
  createdAt: Date;
  mood?: string;
  tags?: string[];
};

let pinecone: Pinecone | null = null;

/**
 * Safe Pinecone getter — returns null if not configured
 */
function getPinecone(): Pinecone | null {
  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey || apiKey.trim() === "") return null;

  if (!pinecone) {
    pinecone = new Pinecone({ apiKey });
  }
  return pinecone;
}

function getIndex(userId: string) {
  const pc = getPinecone();
  if (!pc) return null;

  return pc.index(VECTOR_CONFIG.indexName).namespace(userId);
}

/**
 * Upsert embedding (safe no-op if Pinecone not configured)
 */
export async function upsertDreamEmbedding(
  record: DreamVectorRecord
): Promise<void> {
  const index = getIndex(record.userId);
  if (!index) return;

  await index.upsert([
    {
      id: record.dreamId,
      values: record.embedding,
      metadata: {
        dreamId: record.dreamId,
        userId: record.userId,
        createdAt: record.createdAt.toISOString(),
        ...(record.mood ? { mood: record.mood } : {}),
        ...(record.tags?.length ? { tags: record.tags } : {}),
      },
    },
  ]);
}

/**
 * Fetch stored embedding (returns null if Pinecone unavailable)
 */
export async function getDreamEmbedding(
  userId: string,
  dreamId: string
): Promise<number[] | null> {
  const index = getIndex(userId);
  if (!index) return null;

  const result = await index.fetch([dreamId]);
  return result.records?.[dreamId]?.values ?? null;
}

/**
 * Similarity search (returns empty list if Pinecone unavailable)
 */
export async function findSimilarDreams(
  userId: string,
  dreamEmbedding: number[],
  limit: number = 5
): Promise<Array<{ dreamId: string; score: number }>> {
  const index = getIndex(userId);
  if (!index) return [];

  const result = await index.query({
    vector: dreamEmbedding,
    topK: limit + 1,
    includeMetadata: false,
  });

  return (
    result.matches?.map((m) => ({
      dreamId: m.id as string,
      score: m.score ?? 0,
    })) ?? []
  );
}
