import { useDreamStore } from "../../store/dreamStore";
import GlassContainer from "../ui/GlassContainer";

const MOODS = [
  { label: "Happy", emoji: "😊" },
  { label: "Peaceful", emoji: "😌" },
  { label: "Anxious", emoji: "😰" },
  { label: "Sad", emoji: "😢" },
  { label: "Surprised", emoji: "😮" },
  { label: "Confused", emoji: "🤔" },
];

export default function MoodSelector() {
  const mood = useDreamStore((s) => s.mood);
  const setMood = useDreamStore((s) => s.setMood);

  return (
    <div className="space-y-4">
      <p className="text-sm text-textMuted">
        How did the dream make you feel?
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {MOODS.map((m) => (
          <GlassContainer
            key={m.label}
            onClick={() => setMood(m.label)}
            className={`cursor-pointer text-center py-6 transition
              ${
                mood === m.label
                  ? "bg-accent/20 border-accent"
                  : "hover:bg-white/[0.06]"
              }`}
          >
            <div className="text-3xl">{m.emoji}</div>
            <p className="mt-2 text-sm">{m.label}</p>
          </GlassContainer>
        ))}
      </div>
    </div>
  );
}
