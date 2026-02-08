// normalizeMonthlyReflection.ts

export type NormalizedMonthlyReflection = {
    title: string;
    summary: string;
    highlights: string[];
  };
  
  export function normalizeMonthlyReflection(
    input: any
  ): NormalizedMonthlyReflection {
    // Plain defensive defaults
    const title =
      typeof input?.title === "string"
        ? input.title
        : "Monthly Reflection";
  
    const summary =
      typeof input?.summary === "string"
        ? input.summary
        : "";
  
    const highlights = Array.isArray(input?.highlights)
      ? input.highlights.filter((h: unknown) => typeof h === "string")
      : [];
  
    return {
      title,
      summary,
      highlights,
    };
  }
  