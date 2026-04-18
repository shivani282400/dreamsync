import { AnimatePresence, motion } from "framer-motion";
import type { CommunityComment } from "../../lib/apiClient";
import CommentInput from "./CommentInput";

type Props = {
  comments: CommunityComment[];
  commentsCount: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmitComment: (content: string) => Promise<void>;
};

function sortComments(comments: CommunityComment[]) {
  return [...comments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export default function CommentSheet({
  comments,
  commentsCount,
  isOpen,
  onClose,
  onSubmitComment,
}: Props) {
  const sortedComments = sortComments(comments);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="Close comments"
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[72vh] max-w-2xl flex-col overflow-hidden rounded-t-[2rem] bg-[#f7f1ea] shadow-[0_-18px_80px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-stone-500">
                  Comments
                </p>
                <p className="mt-1 text-sm text-stone-700">
                  {commentsCount} {commentsCount === 1 ? "reflection" : "reflections"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-black/10 px-3 py-1 text-sm text-stone-600 transition hover:bg-black/5"
              >
                Close
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {sortedComments.length > 0 ? (
                sortedComments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: index * 0.03 }}
                    className="rounded-2xl bg-white/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-stone-900">
                        {comment.username}
                      </p>
                      <p className="text-xs text-stone-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-stone-700">
                      {comment.content}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="max-w-sm text-center text-sm leading-6 text-stone-500">
                    No comments yet. Start the conversation with something warm,
                    curious, or beautifully specific.
                  </p>
                </div>
              )}
            </div>

            <CommentInput onSubmit={onSubmitComment} />
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
