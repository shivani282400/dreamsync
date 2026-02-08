import type { InterpretationOutput } from "./interpretation.types";

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
