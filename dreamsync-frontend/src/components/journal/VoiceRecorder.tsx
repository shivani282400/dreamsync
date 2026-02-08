
import { useState } from "react";
import GlassContainer from "../ui/GlassContainer";

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <GlassContainer className="space-y-4">
      <p className="text-sm text-textMuted">
        Prefer speaking? You can record your dream instead.
      </p>

      <div className="flex items-center gap-4">
        {/* Mic button */}
        <button
          onClick={() => setIsRecording((prev) => !prev)}
          className={`w-14 h-14 rounded-full flex items-center justify-center
            transition-all duration-300
            ${isRecording
              ? "bg-red-400/90 text-black animate-pulse"
              : "bg-accent text-black hover:scale-105"}
          `}
        >
          {isRecording ? "■" : "🎤"}
        </button>

        <div className="text-sm text-textMuted">
          {isRecording ? "Recording…" : "Tap to start recording"}
        </div>
      </div>

      {/* Placeholder preview */}
      {isRecording && (
        <p className="text-xs text-textMuted">
          Your voice is being captured (preview only for now).
        </p>
      )}
    </GlassContainer>
  );
}
