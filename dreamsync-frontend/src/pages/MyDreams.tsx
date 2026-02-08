import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition";
import DreamCard from "../components/journal/DreamCard";
import Modal from "../components/ui/Modal";
import {
  emitCommunityFeedRefresh,
  getDreams,
  shareDreamToCommunity,
  unshareDreamFromCommunity,
} from "../lib/apiClient";
import type { Dream } from "../lib/apiClient";

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MyDreams() {
  const [query, setQuery] = useState("");
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"share" | "unshare">("share");
  const [targetId, setTargetId] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getDreams();
        setDreams(data.dreams ?? []);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to load dreams.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (!flashMessage) return;
    const timer = window.setTimeout(() => setFlashMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [flashMessage]);

  const filteredDreams = dreams.filter((dream) => {
    const text = [dream.title, dream.content].filter(Boolean).join(" ");
    return text.toLowerCase().includes(query.toLowerCase());
  });

  async function handleShare(dreamId: string) {
    try {
      setSharingId(dreamId);
      await shareDreamToCommunity(dreamId);
      setDreams((prev) =>
        prev.map((dream) =>
          dream.id === dreamId ? { ...dream, isShared: true } : dream
        )
      );
      emitCommunityFeedRefresh();
      setFlashMessage("Your dream is now shared anonymously.");
    } catch (err) {
      setFlashMessage("Unable to share this dream right now.");
    } finally {
      setSharingId(null);
    }
  }

  async function handleUnshare(dreamId: string) {
    try {
      setSharingId(dreamId);
      await unshareDreamFromCommunity(dreamId);
      setDreams((prev) =>
        prev.map((dream) =>
          dream.id === dreamId ? { ...dream, isShared: false } : dream
        )
      );
      emitCommunityFeedRefresh();
      setFlashMessage("Your dream has been removed from the community.");
    } catch (err) {
      setFlashMessage("Unable to unshare this dream right now.");
    } finally {
      setSharingId(null);
    }
  }

  function openShareModal(dreamId: string) {
    setTargetId(dreamId);
    setModalMode("share");
    setModalOpen(true);
  }

  function openUnshareModal(dreamId: string) {
    setTargetId(dreamId);
    setModalMode("unshare");
    setModalOpen(true);
  }

  async function confirmModal() {
    if (!targetId) return;
    setModalOpen(false);
    if (modalMode === "share") {
      await handleShare(targetId);
    } else {
      await handleUnshare(targetId);
    }
    setTargetId(null);
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto mt-10 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">My dreams</h1>
          <p className="text-textMuted text-sm">
            Your personal dream journal over time.
          </p>
        </div>

        {/* Search */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your dreams…"
          className="w-full bg-transparent border border-white/10 rounded-xl
                     px-4 py-2 text-sm outline-none
                     placeholder:text-textMuted
                     focus:ring-1 focus:ring-accent/30"
        />

        {flashMessage && (
          <p className="text-xs text-white/60">{flashMessage}</p>
        )}

        {/* List */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-textMuted">Loading dreams…</p>
          ) : error ? (
            <p className="text-sm text-red-400">{error}</p>
          ) : filteredDreams.length > 0 ? (
            filteredDreams.map((dream) => {
              const isShared = !!dream.isShared;
              const isSharing = sharingId === dream.id;

              return (
                <div key={dream.id} className="space-y-2">
                  <button
                    onClick={() => navigate(`/interpretation/${dream.id}`)}
                    className="w-full text-left"
                  >
                    <DreamCard
                      excerpt={
                        dream.title ||
                        dream.content.slice(0, 120) +
                          (dream.content.length > 120 ? "…" : "")
                      }
                      date={formatDate(dream.createdAt)}
                      shared={isShared}
                    />
                  </button>

                  {/* Share button */}
                  <div className="flex justify-end">
                    {isShared ? (
                      <button
                        onClick={() => openUnshareModal(dream.id)}
                        disabled={isSharing}
                        className="text-xs px-3 py-1 rounded-full
                                   bg-white/5 hover:bg-white/10
                                   disabled:opacity-50"
                      >
                        {isSharing ? "Updating…" : "Unshare"}
                      </button>
                    ) : (
                      <button
                        onClick={() => openShareModal(dream.id)}
                        disabled={isSharing}
                        className="text-xs px-3 py-1 rounded-full
                                   bg-white/5 hover:bg-white/10
                                   disabled:opacity-50"
                      >
                        {isSharing ? "Sharing…" : "Share anonymously"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-textMuted">
              {dreams.length === 0
                ? "No dreams yet. Write your first dream to get started."
                : "No dreams match your search."}
            </p>
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={
          modalMode === "share"
            ? "Share this dream anonymously?"
            : "Unshare this dream?"
        }
        description={
          modalMode === "share"
            ? "This cannot be traced back to you."
            : "This will remove it from the community feed."
        }
        confirmLabel={modalMode === "share" ? "Share" : "Unshare"}
        onCancel={() => setModalOpen(false)}
        onConfirm={confirmModal}
      />
    </PageTransition>
  );
}
