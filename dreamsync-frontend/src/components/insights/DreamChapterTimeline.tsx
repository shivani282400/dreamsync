import { Link } from "react-router-dom";
import type { DreamChapter } from "../../lib/apiClient";

export default function DreamChapterTimeline({
  dreams,
}: {
  dreams: DreamChapter["dreams"];
}) {
  return (
    <div className="mt-4 space-y-4">
      {dreams.map((dream) => (
        <div
          key={dream.id}
          className="flex items-start gap-4 border-l border-white/10 pl-4"
        >
          <div className="mt-1 w-2 h-2 rounded-full bg-white/40" />
          <div className="flex-1 space-y-1">
            <p className="text-xs text-white/40">
              {new Date(dream.createdAt).toLocaleDateString()}
            </p>
            <Link
              to={`/interpretation/${dream.id}`}
              className="text-sm text-white/80 hover:text-white"
            >
              {dream.title || "Untitled Dream"}
            </Link>
          </div>
          {dream.emotionalTone && (
            <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
              {dream.emotionalTone}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
