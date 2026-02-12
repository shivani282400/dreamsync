import { buildPoeticRewritePrompt } from "./reflection.prompts.js"
import { generateJsonWithLLM } from "../../services/llm.service.js"
import type { Reflection } from "./reflection.types.js"

export async function rewriteReflectionPoetically(
  reflection: Reflection
): Promise<Reflection> {
  try {
    const prompt = buildPoeticRewritePrompt(reflection);

    // Fix: use generic JSON helper so the prompt-defined schema is preserved.
    const rewritten = await generateJsonWithLLM<Reflection>(prompt);

    if (rewritten.ok) {
      const data = rewritten.data as unknown;
      if (
        typeof data === "object" &&
        data !== null &&
        "title" in data &&
        "summary" in data &&
        "highlights" in data &&
        Array.isArray((data as any).highlights)
      ) {
        return {
          title: (data as any).title,
          summary: (data as any).summary,
          highlights: (data as any).highlights,
        };
      }
    }

    // Fallback if shape is wrong
    return reflection;
  } catch {
    // Safety fallback
    return reflection;
  }
}
