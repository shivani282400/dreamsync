import type { CalendarDay } from "../../lib/apiClient";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthMeta(month: string) {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;

  const firstDay = new Date(Date.UTC(year, monthIndex, 1));
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0));

  const startOffset = (firstDay.getUTCDay() + 6) % 7; // Monday-based
  const totalDays = lastDay.getUTCDate();

  return { startOffset, totalDays, year, monthIndex };
}

function moodColor(mood: string | null) {
  if (!mood) return "bg-white/5";
  const key = mood.toLowerCase();
  if (key.includes("calm") || key.includes("peace")) return "bg-emerald-500/20";
  if (key.includes("anx") || key.includes("fear")) return "bg-amber-500/20";
  if (key.includes("sad")) return "bg-blue-500/20";
  if (key.includes("joy") || key.includes("happy")) return "bg-pink-500/20";
  return "bg-white/10";
}

export default function InsightsCalendar({
  month,
  days,
  onSelectDay,
  selectedDate,
}: {
  month: string;
  days: CalendarDay[];
  selectedDate: string | null;
  onSelectDay: (day: CalendarDay | null) => void;
}) {
  const { startOffset, totalDays } = getMonthMeta(month);
  const dayMap = new Map(days.map((d) => [d.date, d]));

  const cells = Array.from({ length: startOffset }, () => null).concat(
    Array.from({ length: totalDays }, (_, i) => {
      const day = i + 1;
      const date = `${month}-${String(day).padStart(2, "0")}`;
      return dayMap.get(date) ?? {
        date,
        count: 0,
        dominantMood: null,
        tags: [],
        reflectionCount: 0,
        dreams: [],
      };
    })
  );

  return (
    <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl p-6 border border-white/10 backdrop-blur space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg text-white/85">Dream Calendar</h2>
        <p className="text-xs text-white/40">{month}</p>
      </div>

      <div className="grid grid-cols-7 gap-2 text-xs text-white/40">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {cells.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} />;
          }

          const isSelected = selectedDate === day.date;

          return (
            <button
              key={day.date}
              onClick={() => onSelectDay(day.count > 0 ? day : null)}
              className={`rounded-xl border border-white/10 p-2 text-left text-white/80 hover:bg-white/10 transition ${
                moodColor(day.dominantMood)
              } ${isSelected ? "ring-1 ring-white/30" : ""}`}
            >
              <div className="flex items-center justify-between text-xs">
                <span>{Number(day.date.split("-")[2])}</span>
                <span className="text-white/40">{day.count}</span>
              </div>
              <div className="mt-2 flex gap-1">
                {day.tags.slice(0, 3).map((tag) => (
                  <span
                    key={`${day.date}-${tag}`}
                    className="w-2 h-2 rounded-full bg-white/30"
                    title={tag}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-xs text-white/40">
        Tap a day to see dreams, mood, and tags.
      </p>
    </div>
  );
}
