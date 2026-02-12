/**
 * Build structured text for embeddings
 */
export function buildStructuredDreamText(dream: {
  title?: string | null;
  content: string;
  mood?: string | null;
  tags?: string[];
}): string {
  const parts: string[] = [];

  if (dream.title) parts.push(`Title: ${dream.title}`);
  parts.push(`Dream: ${dream.content}`);

  if (dream.mood) parts.push(`Mood: ${dream.mood}`);
  if (dream.tags && dream.tags.length > 0) {
    parts.push(`Tags: ${dream.tags.join(", ")}`);
  }

  return parts.join("\n");
}

/**
 * Generate embedding safely (Phase 2 guarantee)
 * Returns null when embeddings are disabled (Gemini removed)
 */
export async function generateEmbedding(
  text: string
): Promise<number[] | null> {
  void text;
  // Embeddings are optional; Gemini has been removed.
  return null;
}
