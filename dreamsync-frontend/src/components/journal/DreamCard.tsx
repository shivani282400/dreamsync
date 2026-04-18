import { motion } from "framer-motion";

type Props = {
  excerpt: string;
  date: string;
  shared?: boolean;
};

export default function DreamCard({ excerpt, date, shared }: Props) {
  return (
    <motion.article
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-xl shadow-[0_24px_60px_rgba(4,8,20,0.32)]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(124,108,246,0.16),transparent_40%,rgba(245,198,236,0.1))]" />
      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-4">
          <p className="max-w-[80%] text-sm uppercase tracking-[0.3em] text-white/45">
            Dream entry
          </p>
          {shared ? (
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#F5C6EC]">
              Shared
            </span>
          ) : null}
        </div>

        <p className="text-pretty text-[1.02rem] leading-8 text-white/90">
          {excerpt}
        </p>

        <div className="flex items-center justify-between text-sm text-white/55">
          <span>{date}</span>
          <span className="rounded-full bg-black/20 px-3 py-1 text-xs text-white/60">
            Private by default
          </span>
        </div>
      </div>
    </motion.article>
  );
}
