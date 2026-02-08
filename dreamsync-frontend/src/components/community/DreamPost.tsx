import { motion } from "framer-motion";
import GlassContainer from "../ui/GlassContainer";

type Props = {
  excerpt: string;
  theme: string;
  relativeTime: string;
  index: number;
  username: string;
  showBridge?: boolean;
};

export default function DreamPost({
  excerpt,
  theme,
  relativeTime,
  index,
  username,
  showBridge,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
        delay: index * 0.04,
      }}
    >
      <GlassContainer className="space-y-4 transition hover:bg-white/10">
        
        {/* Dream excerpt */}
        <p className="text-textPrimary italic leading-relaxed">
          “{excerpt}”
        </p>

        {/* Meta */}
        <p className="text-xs text-textMuted">
          {username} · Theme: {theme} · {relativeTime}
        </p>

        {showBridge && (
          <p className="text-xs text-white/50">
            This dream reflects themes you’ve explored.
          </p>
        )}

      </GlassContainer>
    </motion.div>
  );
}
