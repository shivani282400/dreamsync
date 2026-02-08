import type { TagTrends } from "../../lib/apiClient";

export default function TagTrendChart({ data }: { data: TagTrends | null }) {
  if (!data || data.tags.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl p-6 border border-white/10 backdrop-blur">
        <h2 className="text-lg text-white/85 mb-4">Tag Trends</h2>
        <p className="text-sm text-white/40">
          Tag trends will appear as you add more tagged dreams.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl p-6 border border-white/10 backdrop-blur space-y-4">
      <h2 className="text-lg text-white/85">Tag Trends</h2>

      <div className="space-y-3">
        {data.points.map((point) => (
          <div key={point.date} className="space-y-2">
            <div className="text-xs text-white/40">{point.date}</div>
            <div className="grid grid-cols-1 gap-2">
              {data.tags.map((tag, index) => (
                <div
                  key={`${point.date}-${tag}`}
                  className="flex items-center gap-3"
                >
                  <span className="text-xs text-white/60 w-24 truncate">
                    {tag}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400/40 via-teal-300/40 to-sky-300/30"
                      style={{
                        width: `${Math.min(point.counts[index] * 20, 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-white/40">
                    {point.counts[index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
