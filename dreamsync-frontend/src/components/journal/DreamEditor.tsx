import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassContainer from "../ui/GlassContainer";
import { useDreamStore } from "../../store/dreamStore";

export default function DreamEditor() {
  const [dream, setDream] = useState("");
  const [share, setShare] = useState(false);

  const setDreamText = useDreamStore((s) => s.setDreamText);

  const navigate = useNavigate();

  const handleInterpret = () => {
    if (!dream.trim()) return;
    setDreamText(dream);

    navigate("/interpretation");
  };

  return (
    <GlassContainer className="space-y-5">
      <p className="text-sm text-textMuted">
        This space is private. Write freely — details, emotions, fragments.
      </p>

      <textarea
        value={dream}
        onChange={(e) => {
          const v = e.target.value;
          setDream(v);
          setDreamText(v);
        }}
        placeholder="I remember being somewhere unfamiliar, walking slowly…"
        className="w-full min-h-[220px] bg-transparent resize-none outline-none
                   text-base leading-relaxed text-textPrimary
                   placeholder:text-textMuted
                   focus:ring-1 focus:ring-accent/30
                   rounded-lg p-2 transition"
      />

      {/* Share option */}
      <label className="flex items-center gap-3 text-sm text-textMuted cursor-pointer">
        <input
          type="checkbox"
          checked={share}
          onChange={(e) => setShare(e.target.checked)}
          className="accent-accent"
        />
        Share this dream anonymously in the community
      </label>

      {/* Action */}
      <div className="flex justify-end">
        <button
          onClick={handleInterpret}
          disabled={!dream.trim()}
          className="px-5 py-2 rounded-xl bg-accent text-black font-medium
                     transition-all duration-200
                     hover:scale-[1.02] active:scale-[0.98]
                     disabled:opacity-40 disabled:hover:scale-100"
        >
          Interpret Dream
        </button>
      </div>
    </GlassContainer>
  );
}
