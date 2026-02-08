/**
 * Phase 2: Vector DB & embedding configuration.
 * Embeddings are stored in Pinecone only — NOT in Neon/PostgreSQL.
 * User isolation: one namespace per userId so similarity search never crosses users.
 */

export const VECTOR_CONFIG = {
  /** Pinecone index name (create in Pinecone console or via API). */
  indexName: process.env.PINECONE_INDEX ?? "dreamsync-dreams",
  /** OpenAI text-embedding-3-small output dimension. Do not change unless you switch model. */
  embeddingDimension: 1536,
  /** OpenAI embedding model. */
  embeddingModel: "text-embedding-3-small",
} as const;
