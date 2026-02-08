import type { CalendarDay } from "../../lib/apiClient";

export default function ReflectionFrequencyCard({
  days,
}: {
  days: CalendarDay[];
}) {
  const total = days.reduce((sum, day) => sum + day.reflectionCount, 0);

  return (
    <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl p-6 border border-white/10 backdrop-blur">
      <h2 className="text-lg text-white/85 mb-4">Reflection Frequency</h2>
      {total === 0 ? (
        <p className="text-sm text-white/40">
          Reflection frequency will show once you add answers.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-white/60">
            You added {total} reflection{total === 1 ? "" : "s"} this month.
          </p>
          <div className="space-y-2">
            {days
              .filter((day) => day.reflectionCount > 0)
              .map((day) => (
                <div key={day.date} className="flex items-center gap-3">
                  <span className="text-xs text-white/50 w-20">{day.date}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-400/40 via-fuchsia-300/30 to-white/10"
                      style={{ width: `${Math.min(day.reflectionCount * 20, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/40">{day.reflectionCount}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
