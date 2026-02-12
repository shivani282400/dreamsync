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

    if (
      typeof rewritten === "object" &&
      rewritten !== null &&
      "title" in rewritten &&
      "summary" in rewritten &&
      "highlights" in rewritten &&
      Array.isArray((rewritten as any).highlights)
    ) {
      return {
        title: (rewritten as any).title,
        summary: (rewritten as any).summary,
        highlights: (rewritten as any).highlights,
      };
    }

    // Fallback if shape is wrong
    return reflection;
  } catch {
    // Safety fallback
    return reflection;
  }
}
