import { motion } from "framer-motion";
import GlassContainer from "../ui/GlassContainer";
import InsightBlock from "./InsightBlock";

export default function InterpretationCard() {
  return (
    <GlassContainer className="space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.3 }}
      >
        <InsightBlock
          title="Emotional insight"
          content="This dream may reflect underlying anxiety mixed with curiosity. The unfamiliar environment suggests emotional uncertainty, while movement indicates an attempt to regain control."
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.3 }}
      >
        <InsightBlock
          title="Psychological pattern"
          content="The imagery points toward a period of transition in waking life — situations where you may feel unprepared yet internally motivated to move forward."
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        <InsightBlock
          title="Social symbolism"
          content="The absence of familiar figures can symbolize independence, or a feeling of navigating decisions without external reassurance."
        />
      </motion.div>
    </GlassContainer>
  );
}
