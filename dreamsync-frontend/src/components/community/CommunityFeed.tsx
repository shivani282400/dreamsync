import { useEffect, useState, useCallback, useMemo } from "react";
import DreamPost from "./DreamPost";
import {
  getCommunityFeed,
  onCommunityFeedRefresh,
} from "../../lib/apiClient";
import type { CommunityDream } from "../../lib/apiClient";
import { useDreamStore } from "../../store/dreamStore";

const THEMES = ["All", "Calm", "Anxious", "Fear", "Freedom"];

function relativeTime(value: string) {
  const now = Date.now();
  const date = new Date(value).getTime();
  const diff = Math.max(0, now - date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} weeks ago`;
  return new Date(value).toLocaleDateString();
}

export default function CommunityFeed() {
  const [feedDreams, setFeedDreams] = useState<CommunityDream[]>([]);
  const [query, setQuery] = useState("");
  const [activeTheme, setActiveTheme] = useState("All");
  const [loading, setLoading] = useState(true);
  const { dreams, fetchDreams } = useDreamStore();

  const loadFeed = useCallback(async () => {
    try {
      const data = await getCommunityFeed(activeTheme);
      setFeedDreams(data);
    } catch (err) {
      console.error("Failed to load community feed", err);
    } finally {
      setLoading(false);
    }
  }, [activeTheme]);

  useEffect(() => {
    setLoading(true);
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    return onCommunityFeedRefresh(() => {
      setLoading(true);
      loadFeed();
    });
  }, [loadFeed]);

  useEffect(() => {
    fetchDreams().catch(() => {});
  }, [fetchDreams]);

  const filteredDreams = feedDreams.filter((dream) => {
    const matchesText = dream.anonymizedText
      .toLowerCase()
      .includes(query.toLowerCase());

    const matchesTheme =
      activeTheme === "All" || dream.theme === activeTheme;

    return matchesText && matchesTheme;
  });

  const recentSignals = useMemo(() => {
    const moods = new Set<string>();
    const tags = new Set<string>();

    dreams.forEach((dream) => {
      if (dream.mood) moods.add(dream.mood.toLowerCase());
      dream.tags?.forEach((tag) => tags.add(tag.toLowerCase()));
    });

    return { moods, tags };
  }, [dreams]);

  if (loading) {
    return <p className="text-sm text-textMuted">Loading shared dreams…</p>;
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search shared dreams…"
        className="w-full bg-transparent border border-white/10 rounded-xl
                   px-4 py-2 text-sm outline-none
                   placeholder:text-textMuted
                   focus:ring-1 focus:ring-accent/30"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {THEMES.map((theme) => (
          <button
            key={theme}
            onClick={() => setActiveTheme(theme)}
            className={`px-3 py-1 rounded-full text-xs transition
              ${
                activeTheme === theme
                  ? "bg-accent text-black"
                  : "bg-white/5 text-textMuted hover:bg-white/10"
              }
            `}
          >
            {theme}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {filteredDreams.length > 0 ? (
          filteredDreams.map((dream, index) => (
            <DreamPost
              key={dream.id}
              excerpt={dream.anonymizedText}
              theme={dream.theme}
              relativeTime={relativeTime(dream.createdAt)}
              index={index}
              username={dream.username}
              showBridge={
                recentSignals.moods.has(dream.theme.toLowerCase()) ||
                recentSignals.tags.has(dream.theme.toLowerCase())
              }
            />
          ))
        ) : (
          <p className="text-sm text-textMuted">
            No shared dreams yet. Be the first to share anonymously.
          </p>
        )}
      </div>
    </div>
  );
}
