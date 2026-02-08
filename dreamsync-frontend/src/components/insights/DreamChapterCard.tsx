import { motion, AnimatePresence } from "framer-motion";
import GlassContainer from "../ui/GlassContainer";
import DreamChapterTimeline from "./DreamChapterTimeline";
import type { DreamChapter } from "../../lib/apiClient";

export default function DreamChapterCard({
  chapter,
  expanded,
  onToggle,
}: {
  chapter: DreamChapter;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <GlassContainer className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-white/90 text-base font-light">
          {chapter.title}
        </h3>
        <p className="text-sm text-white/60">{chapter.explanation}</p>
      </div>

      <div className="text-xs text-white/50 space-y-1">
        <p>Emotional arc: {chapter.emotionalArc}</p>
        <p>
          {new Date(chapter.startDate).toLocaleDateString()} – {" "}
          {new Date(chapter.endDate).toLocaleDateString()}
        </p>
      </div>

      <button
        onClick={onToggle}
        className="text-xs text-accent hover:underline"
      >
        {expanded ? "Hide dreams" : "View dreams in this chapter"}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <DreamChapterTimeline dreams={chapter.dreams} />
          </motion.div>
        )}
      </AnimatePresence>
    </GlassContainer>
  );
}
