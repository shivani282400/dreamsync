import { motion } from "framer-motion";

type Props = {
  isLiked: boolean;
  likesCount: number;
  disabled?: boolean;
  onClick: () => void;
};

const burstVariants = {
  idle: { opacity: 0, scale: 0.2 },
  active: (index: number) => ({
    opacity: [0, 0.95, 0],
    x: [0, Math.cos((index / 6) * Math.PI * 2) * 20],
    y: [0, Math.sin((index / 6) * Math.PI * 2) * 20],
    scale: [0.4, 1.1, 0.2],
    transition: { duration: 0.42, ease: "easeOut" },
  }),
};

export default function LikeButton({
  isLiked,
  likesCount,
  disabled,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
        isLiked
          ? "border-rose-400/40 bg-rose-500/10 text-rose-300"
          : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <motion.span
        className="relative flex h-5 w-5 items-center justify-center"
        whileTap={{ scale: 1.35 }}
        animate={isLiked ? { scale: [1, 1.32, 1] } : { scale: 1 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <motion.span
            key={index}
            className="absolute h-1.5 w-1.5 rounded-full bg-rose-300"
            variants={burstVariants}
            initial="idle"
            animate={isLiked ? "active" : "idle"}
            custom={index}
          />
        ))}
        <motion.svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill={isLiked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="M12 21s-6.716-4.35-9.193-8.11C1.32 10.634 2.049 7.45 4.69 6.1c2.15-1.1 4.495-.292 5.81 1.473C11.815 5.808 14.16 5 16.31 6.1c2.641 1.35 3.37 4.534 1.883 6.79C18.716 16.65 12 21 12 21Z" />
        </motion.svg>
      </motion.span>
      <span className="font-medium tabular-nums">{likesCount}</span>
    </button>
  );
}
