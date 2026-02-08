import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition";
import { getMonthlyInsights, getWeeklyInsights } from "../lib/apiClient";
import type { InsightContent } from "../lib/apiClient";

export default function InsightLetter({ mode }: { mode: "weekly" | "monthly" }) {
  const params = useParams();
  const period = params.period;
  const [content, setContent] = useState<InsightContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!period) return;

    async function load() {
      try {
        const data =
          mode === "weekly"
            ? await getWeeklyInsights(period)
            : await getMonthlyInsights(period);
        setContent(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [period, mode]);

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-6 py-14">
        <Link
          to="/insights"
          className="text-xs text-white/50 hover:text-white/70"
        >
          ← Back to Insights
        </Link>

        {loading ? (
          <p className="mt-8 text-white/60">Loading letter…</p>
        ) : content ? (
          <div className="mt-10 space-y-10">
            <div className="space-y-3">
              <h1 className="text-3xl md:text-4xl text-white/90 font-light">
                {content.title}
              </h1>
              <p className="text-white/70 text-lg leading-relaxed">
                {content.summary}
              </p>
            </div>

            <div className="space-y-6 text-white/70 text-lg leading-relaxed">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/40 mb-2">
                  Dominant Themes
                </p>
                <p>{content.dominantThemes.join(", ")}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-white/40 mb-2">
                  Emotional Arc
                </p>
                <p>{content.emotionalArc}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-white/40 mb-2">
                  Questions You Explored
                </p>
                <ul className="space-y-2">
                  {content.keyQuestionsYouExplored.map((q, i) => (
                    <li key={i}>• {q}</li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-white/40 mb-2">
                  Closing Note
                </p>
                <p>{content.closingNote}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-8 text-white/60">No letter available.</p>
        )}
      </div>
    </PageTransition>
  );
}
