type Props = {
    title: string;
    content: string;
  };
  
  export default function InsightBlock({ title, content }: Props) {
    return (
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-wide text-textMuted">
          {title}
        </p>
        <p className="text-base leading-relaxed text-textPrimary">
          {content}
        </p>
      </div>
    );
  }
  