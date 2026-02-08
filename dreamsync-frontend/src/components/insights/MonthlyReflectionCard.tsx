import { useSpeech } from "../../hooks/useSpeech";

export default function MonthlyReflectionCard({ reflection }: any) {
  const { speak, stop } = useSpeech();

  const content = reflection.plain ?? reflection.poetic ?? reflection;

  const voiceText = `
    ${content.title}.
    ${content.summary}.
    ${content.highlights.join(". ")}
  `;

  return (
    <div className="bg-white/5 rounded-2xl p-8 border border-white/10 space-y-4">
      <div className="flex justify-between items-start">
        <h2 className="text-xl text-white/90">{content.title}</h2>

        <button onClick={() => speak(voiceText)}>🔊 Listen</button>
      </div>

      <p className="text-white/70">{content.summary}</p>

      <ul className="text-sm text-white/60 space-y-1">
        {content.highlights.map((h: string, i: number) => (
          <li key={i}>• {h}</li>
        ))}
      </ul>

      <button onClick={stop} className="text-xs text-white/40">
        Stop voice
      </button>
    </div>
  );
}
