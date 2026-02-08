import { useDreamStore } from "../../store/dreamStore";

const TAGS = [
  "flying",
  "falling",
  "water",
  "fire",
  "animals",
  "people",
  "nature",
  "city",
  "travel",
  "love",
  "fear",
  "adventure",
];

export default function TagSelector() {
  const tags = useDreamStore((s) => s.tags);
  const toggleTag = useDreamStore((s) => s.toggleTag);

  return (
    <div className="space-y-3">
      <p className="text-sm text-textMuted">Add keywords</p>

      <div className="flex flex-wrap gap-3">
        {TAGS.map((tag) => {
          const active = tags.includes(tag);

          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-1 rounded-full text-sm transition
                ${
                  active
                    ? "bg-accent text-black"
                    : "bg-white/[0.06] text-textMuted hover:bg-white/[0.1]"
                }`}
            >
              #{tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
