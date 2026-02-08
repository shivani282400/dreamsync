import type { InsightContent } from "../../lib/apiClient";
import type { ReactNode } from "react";

export default function InsightLetterCard({
  title,
  content,
  compact = false,
}: {
  title: string;
  content: InsightContent | null;
  compact?: boolean;
}) {
  if (!content) return null;

  const Wrapper = ({ children }: { children: ReactNode }) =>
    compact ? (
      <>{children}</>
    ) : (
      <div className="bg-white/5 rounded-2xl p-8 border border-white/10 space-y-4">
        <h2 className="text-xl text-white/90">{title}</h2>
        {children}
      </div>
    );

  return (
    <Wrapper>
      <div className="text-white/70 space-y-2">
        <p className="text-white/80 font-light">{content.title}</p>
        <p>{content.summary}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-xs uppercase tracking-wide text-white/40 mb-2">
            Dominant Themes
          </p>
          <div className="flex flex-wrap gap-2">
            {content.dominantThemes.map((theme) => (
              <span
                key={theme}
                className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/80"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-xs uppercase tracking-wide text-white/40 mb-2">
            Emotional Arc
          </p>
          <p className="text-white/70 text-sm">{content.emotionalArc}</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10 md:col-span-2">
          <p className="text-xs uppercase tracking-wide text-white/40 mb-2">
            Questions You Explored
          </p>
          <ul className="text-white/60 text-sm space-y-1">
            {content.keyQuestionsYouExplored.map((q, i) => (
              <li key={i}>• {q}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-white/60 text-sm">{content.closingNote}</p>
    </Wrapper>
  );
}
