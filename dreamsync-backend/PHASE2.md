# DreamSync Phase 2 — Semantic Memory (Embeddings + Vector DB)

Phase 2 adds **semantic memory** so dreams are remembered as vectors before any interpretation. No UI or API changes; everything runs in the background.

## Architecture

- **Neon (PostgreSQL):** Dreams stay in `Dream` table only. No embeddings in the DB.
- **Pinecone:** One index holds all dream embeddings. **One namespace per `userId`** so similarity search never crosses users.
- **OpenAI:** `text-embedding-3-small` (1536 dimensions) turns structured dream text into vectors.

Flow:

1. `POST /dreams` → dream saved to Neon → **response sent immediately**.
2. In the background: build text (title + content + mood + tags) → generate embedding → upsert to Pinecone (namespace = userId, id = dreamId).

If embedding fails or env vars are missing, the dream is still saved; we only log and skip.

## Vector record shape (in Pinecone)

Each vector has:

- **id:** `dreamId` (so we can delete by dream when needed).
- **values:** `embedding` (number[], length 1536).
- **metadata:** `dreamId`, `userId`, `createdAt` (ISO string), optional `mood`, optional `tags` (string[]).
- **namespace:** `userId` (user-isolated).

## Environment variables

Optional for Phase 2 (if unset, dream save still works; embedding is skipped):

```env
# Pinecone (create index in app.pinecone.io; dimension = 1536)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=dreamsync-dreams

# OpenAI (for text-embedding-3-small)
OPENAI_API_KEY=your_openai_api_key
```

Create a Pinecone index named `dreamsync-dreams` (or your `PINECONE_INDEX`) with dimension **1536** and metric **cosine**.

## Backend-only utilities (for Phase 3)

- **`findSimilarDreams(userId, dreamEmbedding, limit = 5)`** in `src/services/vector.service.ts`  
  Returns similar dream ids and scores within the user’s namespace. Not exposed via API in Phase 2; will be used for LLM context in Phase 3.

## Files added/updated

- `src/config/vector.ts` — index name, dimension, model.
- `src/services/embedding.service.ts` — `buildStructuredDreamText`, `generateEmbedding`.
- `src/services/vector.service.ts` — Pinecone client, `upsertDreamEmbedding`, `findSimilarDreams`.
- `src/services/dream-embedding.ts` — `embedAndStoreDream` (orchestration, fire-and-forget).
- `src/modules/dreams/dreams.controller.ts` — after create, calls `void embedAndStoreDream(dream, req.log).catch(() => {})`.
