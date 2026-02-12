import type { InterpretationOutput } from "./interpretation.types.js"

/**
 * Hard schema validation
 * Ensures structure is exactly what Phase 4 will depend on
 */
export function isValidInterpretation(
  data: any
): data is InterpretationOutput {
  return (
    typeof data === "object" &&
    typeof data.summary === "string" &&
    Array.isArray(data.themes) &&
    data.themes.every((t: any) => typeof t === "string") &&
    typeof data.emotionalTone === "string" &&
    Array.isArray(data.reflectionPrompts) &&
    data.reflectionPrompts.every((p: any) => typeof p === "string") &&
    Array.isArray(data.symbolTags) &&
    data.symbolTags.every((t: any) => typeof t === "string") &&
    Array.isArray(data.wordReflections) &&
    data.wordReflections.every(
      (item: any) =>
        typeof item === "object" &&
        typeof item.word === "string" &&
        typeof item.reflection === "string"
    )
  );
}

/**
 * Soft normalization
 * Coerces partial LLM output into the expected shape instead of hard-failing.
 */
export function normalizeInterpretation(
  data: any
): InterpretationOutput | null {
  if (!data || typeof data !== "object") return null;

  const summary =
    typeof data.summary === "string" ? data.summary.trim() : "";
  const themes = Array.isArray(data.themes)
    ? data.themes.filter((t: any) => typeof t === "string")
    : [];
  const emotionalTone =
    typeof data.emotionalTone === "string"
      ? data.emotionalTone.trim()
      : "";
  const reflectionPrompts = Array.isArray(data.reflectionPrompts)
    ? data.reflectionPrompts.filter((p: any) => typeof p === "string")
    : [];
  const symbolTags = Array.isArray(data.symbolTags)
    ? data.symbolTags.filter((t: any) => typeof t === "string")
    : [];
  const wordReflections = Array.isArray(data.wordReflections)
    ? data.wordReflections
        .filter(
          (item: any) =>
            item &&
            typeof item === "object" &&
            typeof item.word === "string" &&
            typeof item.reflection === "string"
        )
        .map((item: any) => ({
          word: item.word,
          reflection: item.reflection,
        }))
    : [];

  // Require at least a usable summary; other fields can be empty and filled later.
  if (!summary) return null;

  return {
    summary,
    themes,
    emotionalTone,
    reflectionPrompts,
    symbolTags,
    wordReflections,
  };
}

/**
 * Safety validation
 * Prevents predictive, diagnostic, or authoritative language
 */
const FORBIDDEN_PHRASES = [
  "you will",
  "this means you must",
  "this predicts",
  "mental illness",
  "diagnosis",
  "guarantees that",
  "this proves",
  "you should",
];

export function isSafeInterpretation(
  output: InterpretationOutput
): boolean {
  const combinedText = `
    ${output.summary}
    ${output.emotionalTone}
    ${output.reflectionPrompts.join(" ")}
    ${output.symbolTags.join(" ")}
    ${output.wordReflections
      .map((r) => `${r.word} ${r.reflection}`)
      .join(" ")}
  `.toLowerCase();

  return !FORBIDDEN_PHRASES.some((phrase) =>
    combinedText.includes(phrase)
  );
}
