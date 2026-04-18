import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { CommunityComment, CommunityDream } from "../../lib/apiClient";
import { commentOnDream, likeDream } from "../../lib/apiClient";
import CommentSheet from "./CommentSheet";
import LikeButton from "./LikeButton";

type Props = {
  dream: CommunityDream;
  index: number;
  relativeTime: string;
  showBridge?: boolean;
  onRefresh?: () => Promise<void> | void;
};

export default function DreamCard({
  dream,
  index,
  relativeTime,
  showBridge,
  onRefresh,
}: Props) {
  const [isLiked, setIsLiked] = useState(Boolean(dream.isLiked));
  const [likesCount, setLikesCount] = useState(dream.likesCount ?? 0);
  const [comments, setComments] = useState<CommunityComment[]>(dream.comments ?? []);
  const [commentsCount, setCommentsCount] = useState(
    dream.commentsCount ?? dream.comments?.length ?? 0
  );
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    setIsLiked(Boolean(dream.isLiked));
    setLikesCount(dream.likesCount ?? 0);
    setComments(dream.comments ?? []);
    setCommentsCount(dream.commentsCount ?? dream.comments?.length ?? 0);
  }, [dream]);

  useEffect(() => {
    if (!showComments || !onRefresh) return;

    const interval = window.setInterval(() => {
      void onRefresh();
    }, 3000);

    return () => window.clearInterval(interval);
  }, [showComments, onRefresh]);

  async function handleLike() {
    if (!dream.dreamId || isLiking) return;

    const nextLiked = !isLiked;
    const nextCount = Math.max(0, likesCount + (nextLiked ? 1 : -1));
    setIsLiked(nextLiked);
    setLikesCount(nextCount);
    setIsLiking(true);

    try {
      const updated = await likeDream(dream.dreamId);
      setIsLiked(updated.isLiked);
      setLikesCount(updated.likesCount);
      setCommentsCount(updated.commentsCount);
    } catch (error) {
      console.error("Failed to toggle like", error);
      setIsLiked(!nextLiked);
      setLikesCount(likesCount);
    } finally {
      setIsLiking(false);
    }
  }

  async function handleSubmitComment(content: string) {
    if (!dream.dreamId) return;

    const optimisticComment: CommunityComment = {
      id: `optimistic-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      username: "You",
    };

    setComments((current) => [optimisticComment, ...current]);
    setCommentsCount((count) => count + 1);

    try {
      const updated = await commentOnDream(dream.dreamId, content);
      setComments((current) => [
        updated.comment,
        ...current.filter((item) => item.id !== optimisticComment.id),
      ]);
      setCommentsCount(updated.commentsCount);
      setLikesCount(updated.likesCount);
      await onRefresh?.();
    } catch (error) {
      console.error("Failed to post comment", error);
      setComments((current) =>
        current.filter((item) => item.id !== optimisticComment.id)
      );
      setCommentsCount((count) => Math.max(0, count - 1));
      throw error;
    }
  }

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.42,
          ease: "easeOut",
          delay: index * 0.05,
        }}
        className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.14),_rgba(255,255,255,0.03)_45%,_rgba(10,10,10,0.2)_100%)] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_30%,transparent_65%,rgba(255,255,255,0.04))]" />

        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.34em] text-white/45">
              Shared Dream
            </p>
            <p className="mt-2 text-sm text-white/55">
              {dream.username} · {dream.theme} · {relativeTime}
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
            {dream.mood ?? "Open"}
          </div>
        </div>

        <p className="relative mt-5 text-[1.02rem] leading-8 text-white/90">
          "{dream.content ?? dream.anonymizedText}"
        </p>

        <div className="relative mt-4 flex flex-wrap gap-2">
          {dream.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60"
            >
              {tag}
            </span>
          ))}
        </div>

        {showBridge ? (
          <p className="relative mt-4 text-sm text-amber-100/75">
            This dream moves close to emotional weather you have explored too.
          </p>
        ) : null}

        <div className="relative mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <LikeButton
            isLiked={isLiked}
            likesCount={likesCount}
            disabled={isLiking}
            onClick={() => void handleLike()}
          />

          <button
            type="button"
            onClick={() => setShowComments(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 transition hover:scale-[1.03] hover:bg-white/10 hover:text-white"
          >
            <span className="text-base">💬</span>
            <span className="font-medium tabular-nums">{commentsCount}</span>
          </button>
        </div>
      </motion.article>

      <CommentSheet
        comments={comments}
        commentsCount={commentsCount}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onSubmitComment={handleSubmitComment}
      />
    </>
  );
}
