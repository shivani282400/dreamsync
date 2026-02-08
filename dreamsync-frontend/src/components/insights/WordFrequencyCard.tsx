import type { WordFrequency } from "../../lib/apiClient";

export default function WordFrequencyCard({
  data,
}: {
  data: WordFrequency | null;
}) {
  if (!data || data.words.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl p-6 border border-white/10 backdrop-blur">
        <h2 className="text-lg text-white/85 mb-4">Reflection Words</h2>
        <p className="text-sm text-white/40">
          Word patterns will show after you add reflections.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/10 via-white/5 to-transparent rounded-2xl p-6 border border-white/10 backdrop-blur">
      <h2 className="text-lg text-white/85 mb-4">Reflection Words</h2>
      <div className="flex flex-wrap gap-2">
        {data.words.map((word) => (
          <span
            key={word.label}
            className="px-3 py-1 rounded-full text-xs bg-white/10 text-white/80 border border-white/10"
          >
            {word.label} · {word.count}
          </span>
        ))}
      </div>
    </div>
  );
}
