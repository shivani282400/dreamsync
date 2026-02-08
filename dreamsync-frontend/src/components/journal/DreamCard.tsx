import GlassContainer from "../ui/GlassContainer";

type Props = {
  excerpt: string;
  date: string;
  shared?: boolean;
};

export default function DreamCard({ excerpt, date, shared }: Props) {
  return (
    <GlassContainer className="space-y-2">
      <p className="text-textPrimary leading-relaxed">
        {excerpt}
      </p>

      <div className="flex items-center justify-between text-xs text-textMuted">
        <span>{date}</span>
        {shared && (
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white/70">
            Shared
          </span>
        )}
      </div>
    </GlassContainer>
  );
}
