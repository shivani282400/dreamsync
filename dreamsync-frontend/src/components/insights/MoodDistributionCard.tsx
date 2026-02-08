import type { CalendarDay } from "../../lib/apiClient";

export default function MoodDistributionCard({
  days,
}: {
  days: CalendarDay[];
}) {
  const moodMap = new Map<string, number>();
  for (const day of days) {
    if (!day.dominantMood) continue;
    const key = day.dominantMood.toLowerCase();
    moodMap.set(key, (moodMap.get(key) ?? 0) + day.count);
  }

  const moods = Array.from(moodMap.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl p-6 border border-white/10 backdrop-blur">
      <h2 className="text-lg text-white/85 mb-4">Mood Distribution</h2>
      {moods.length === 0 ? (
        <p className="text-sm text-white/40">
          Mood trends will appear as you add more dreams.
        </p>
      ) : (
        <div className="space-y-3">
          {moods.map(([mood, count]) => (
            <div key={mood} className="flex items-center gap-3">
              <span className="text-xs text-white/60 w-24 capitalize">{mood}</span>
              <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400/40 via-indigo-300/30 to-white/10"
                  style={{ width: `${Math.min(count * 12, 100)}%` }}
                />
              </div>
              <span className="text-xs text-white/40">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
