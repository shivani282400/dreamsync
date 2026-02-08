import { useState } from "react";
import PageTransition from "../components/ui/PageTransition";
import GlassContainer from "../components/ui/GlassContainer";

export default function Settings() {
  const [shareByDefault, setShareByDefault] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto mt-10 space-y-8">

        <h1 className="text-2xl font-semibold">
          Settings
        </h1>

        <GlassContainer className="space-y-6">

          {/* Sharing preference */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={shareByDefault}
              onChange={(e) => setShareByDefault(e.target.checked)}
              className="accent-accent mt-1"
            />
            <div>
              <p className="text-sm font-medium">
                Share dreams by default
              </p>
              <p className="text-xs text-textMuted">
                You can always change this before interpreting.
              </p>
            </div>
          </label>

          {/* Voice recording */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={voiceEnabled}
              onChange={(e) => setVoiceEnabled(e.target.checked)}
              className="accent-accent mt-1"
            />
            <div>
              <p className="text-sm font-medium">
                Enable voice recording
              </p>
              <p className="text-xs text-textMuted">
                Allow recording dreams using your microphone.
              </p>
            </div>
          </label>

        </GlassContainer>

        <GlassContainer className="space-y-2">
          <p className="text-sm font-medium">
            Privacy
          </p>
          <p className="text-xs text-textMuted leading-relaxed">
            Your dreams are private by default. Shared dreams are always anonymous
            and never linked to your identity.
          </p>
        </GlassContainer>

      </div>
    </PageTransition>
  );
}
