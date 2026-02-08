import { useInsightStore } from "../../store/insightStore";

export default function EmotionalTrendChart() {
  const trends = useInsightStore((s) => s.emotionalTrends);

  const grouped = trends.reduce((acc: any, t) => {
    acc[t.period] ??= [];
    acc[t.period].push(t.emotion);
    return acc;
  }, {});

  return (
    <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl p-6 border border-white/10 backdrop-blur">
      <h2 className="text-lg text-white/85 mb-4">
        Emotional Flow Over Time
      </h2>

      <div className="space-y-3">
        {Object.entries(grouped).map(([period, emotions]) => (
          <div key={period} className="flex items-center gap-4">
            <span className="text-sm text-white/50 w-24">
              {period}
            </span>

            <div className="flex flex-wrap gap-2">
              {(emotions as string[]).map((e, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs
                             bg-gradient-to-r from-indigo-400/20 via-sky-300/10 to-transparent text-indigo-100 border border-white/10"
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
