export function buildInterpretationPrompt(params: {
  title?: string;
  dreamText: string;
  mood?: string | null;
  tags?: string[];
  lens?: string;
}) {
  const { title, dreamText, mood, tags, lens } = params;

  void tags;
  void lens;

  return `
You are a psychologically insightful dream analyst.

Interpret the dream clearly and directly.

Dream:
"${dreamText}"

Mood:
"${mood ?? "not specified"}"

Title:
"${title ?? "untitled"}"

Return STRICT valid JSON only.
No markdown.
No explanation.
No commentary.
No code blocks.

Use EXACTLY this structure:

{
  "summary": string,
  "themes": string[],
  "emotionalTone": string,
  "reflectionPrompts": string[],
  "symbolTags": string[],
  "wordReflections": [
    { "word": string, "reflection": string }
  ]
}

Rules:
- Summary must be 3-4 full complete sentences.
- Themes must contain exactly 3 items.
- ReflectionPrompts must contain exactly 3 items.
- SymbolTags must contain at least 2 items.
- WordReflections must contain exactly 2 objects.
- EmotionalTone must be a single descriptive word.
- Never leave arrays empty.
- Never truncate sentences.
- Keep total output under 250 words.
`;
}
