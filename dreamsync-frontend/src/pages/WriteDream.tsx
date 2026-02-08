import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDream, interpretDream } from "../lib/apiClient";

import { useSpeechToText } from "../hooks/useSpeechToText";

const MOODS = [
  { label: "Happy", emoji: "😊" },
  { label: "Peaceful", emoji: "😌" },
  { label: "Anxious", emoji: "😰" },
  { label: "Sad", emoji: "😢" },
  { label: "Surprised", emoji: "😮" },
  { label: "Confused", emoji: "🤔" },
];

export default function WriteDream() {
  const navigate = useNavigate();

  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🎙️ Speech → Text
  const { start } = useSpeechToText((text) => {
    setContent((prev) => (prev ? prev + " " + text : text));
  });

  async function handleInterpret() {
    if (!content.trim()) {
      alert("Please write or speak your dream first.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // 1️⃣ Save dream
      const dream = await createDream({
        content,
        mood: mood ?? undefined,
      });
      
      await interpretDream(dream.id);
      
      navigate(`/interpretation/${dream.id}`);
      
  
      // 3️⃣ Redirect to interpretation page
      navigate(`/interpretation/${dream.id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to interpret dream");
    } finally {
      setIsSubmitting(false);
    }
  }
  

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-10">
      {/* 📝 Dream Editor */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <p className="text-sm text-white/50">
          This space is private. Write freely — details, emotions, fragments.
        </p>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="I remember being somewhere unfamiliar, walking slowly..."
          className="w-full min-h-[220px] bg-transparent resize-none outline-none text-white/80 placeholder:text-white/30"
        />

        {/* 🎙️ Speech Button */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={start}
            className="text-white/50 hover:text-white text-sm"
          >
            🎙️ Speak your dream
          </button>

          <span className="text-xs text-white/30">
            Voice → text
          </span>
        </div>
      </div>

      {/* 😌 Mood Selector */}
      <div>
        <p className="text-white/60 mb-4">
          How did the dream make you feel?
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {MOODS.map((m) => (
            <button
              type="button"
              key={m.label}
              onClick={() => setMood(m.label)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition
                ${
                  mood === m.label
                    ? "bg-white/10 border-white/30"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
            >
              <span>{m.emoji}</span>
              <span className="text-white/70 text-sm">
                {m.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 🔮 Interpret Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleInterpret}
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl bg-amber-400/80 text-black font-medium disabled:opacity-40"
        >
          {isSubmitting ? "Saving your dream…" : "Interpret Dream"}
        </button>
      </div>
    </div>
  );
}
