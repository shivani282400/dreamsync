import { useInsightStore } from "../../store/insightStore";

export default function ThemeFrequencyCard() {
  const { themes, symbols } = useInsightStore();

  const renderChips = (items: any[]) =>
    items.slice(0, 8).map((item) => (
      <span
        key={item.label}
        className="px-3 py-1 rounded-full text-sm
                   bg-white/10 text-white/80
                   border border-white/10"
      >
        {item.label} · {item.count}
      </span>
    ));
    {themes.length === 0 && (
        <p className="text-white/40 text-sm">
          Patterns will appear as you interpret more dreams.
        </p>
      )}
      
  return (
    <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl p-6 border border-white/10 backdrop-blur">
      <h2 className="text-lg text-white/85 mb-4">
        Recurring Themes & Symbols
      </h2>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-white/50 mb-2">Themes</p>
          <div className="flex flex-wrap gap-2">
            {renderChips(themes)}
          </div>
        </div>

        <div>
          <p className="text-sm text-white/50 mb-2">Symbols</p>
          <div className="flex flex-wrap gap-2">
            {renderChips(symbols)}
          </div>
        </div>
      </div>
    </div>
  );
}
