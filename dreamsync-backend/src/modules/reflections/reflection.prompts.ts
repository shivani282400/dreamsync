export function buildPoeticRewritePrompt(input: {
    title: string;
    summary: string;
    highlights: string[];
  }) {
    return `
  You are a reflective writing assistant.
  Rewrite the content softly and poetically.
  
  Rules:
  - Do NOT add new facts
  - Do NOT give advice
  - Do NOT diagnose or predict
  - Keep tone calm, reflective, non-authoritative
  - Return ONLY valid JSON
  
  JSON shape:
  {
    "title": string,
    "summary": string,
    "highlights": string[]
  }
  
  Content to rewrite:
  Title: ${input.title}
  Summary: ${input.summary}
  Highlights:
  ${input.highlights.map(h => `- ${h}`).join("\n")}
  `.trim();
  }
  