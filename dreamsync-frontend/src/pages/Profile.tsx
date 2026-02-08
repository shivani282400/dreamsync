import { useEffect, useMemo, useState } from "react";
import PageTransition from "../components/ui/PageTransition";
import GlassContainer from "../components/ui/GlassContainer";
import Logo from "../components/ui/Logo";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useDreamStore } from "../store/dreamStore";
import Modal from "../components/ui/Modal";
import {
  getCurrentUser,
  lockUsername,
  regenerateUsername,
  updateUsername,
} from "../lib/apiClient";

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { dreams, fetchDreams } = useDreamStore();
  const [identity, setIdentity] = useState<{
    username: string;
    usernameLocked: boolean;
  } | null>(null);
  const [editing, setEditing] = useState(false);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchDreams().catch(() => {});
  }, [fetchDreams]);

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        setIdentity({
          username: data.username,
          usernameLocked: data.usernameLocked,
        });
        setUsernameDraft(data.username);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 2800);
    return () => window.clearTimeout(timer);
  }, [message]);

  const displayName = useMemo(() => {
    if (identity?.username) return identity.username;
    if (user?.username) return user.username;
    return "Anonymous Dreamer";
  }, [identity?.username, user?.username]);

  const totalDreams = dreams.length;
  const sharedCount = dreams.filter((d) => d.isShared).length;
  const privateCount = Math.max(totalDreams - sharedCount, 0);
  const lastDreamDate = dreams[0]?.createdAt
    ? new Date(dreams[0].createdAt).toLocaleDateString()
    : "No entries yet";

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto mt-16 px-4 space-y-12">

        {/* Identity header */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-accent/15 blur-2xl rounded-full" />
            <Logo size={64} showText={false} />
          </div>

          <div>
            <h1 className="font-serif text-2xl tracking-wide">
              {displayName}
            </h1>
            <p className="text-sm text-textMuted">
              Anonymous identity · Private by design
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <GlassContainer className="text-center space-y-1">
            <p className="font-serif text-xl">{totalDreams}</p>
            <p className="text-xs text-textMuted">Dreams logged</p>
          </GlassContainer>

          <GlassContainer className="text-center space-y-1">
            <p className="font-serif text-xl">{sharedCount}</p>
            <p className="text-xs text-textMuted">Shared</p>
          </GlassContainer>

          <GlassContainer className="text-center space-y-1">
            <p className="font-serif text-xl">{privateCount}</p>
            <p className="text-xs text-textMuted">Private</p>
          </GlassContainer>
        </div>

        <GlassContainer className="space-y-2">
          <p className="text-sm text-textMuted">Identity</p>
          <p className="text-sm text-textPrimary">
            {displayName}
          </p>
          <p className="text-xs text-textMuted">
            {identity?.usernameLocked ? "Locked" : "Unlocked"}
          </p>
        </GlassContainer>

        <GlassContainer className="space-y-3">
          <p className="text-sm text-textMuted">Anonymous identity</p>
          <p className="text-sm text-textPrimary">
            Your name is only seen by you. It keeps your presence consistent
            without revealing personal details.
          </p>
          {!identity?.usernameLocked && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setEditing((prev) => !prev)}
                className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10"
              >
                ✏️ Edit username
              </button>
              <button
                onClick={async () => {
                  const updated = await regenerateUsername();
                  setIdentity({
                    username: updated.username,
                    usernameLocked: updated.usernameLocked,
                  });
                  setUsernameDraft(updated.username);
                  setMessage("A new anonymous name has been generated.");
                }}
                className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10"
              >
                🔁 Regenerate
              </button>
              <button
                onClick={() => setLockModalOpen(true)}
                className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10"
              >
                🔒 Lock username
              </button>
            </div>
          )}

          {editing && !identity?.usernameLocked && (
            <div className="space-y-2">
              <input
                value={usernameDraft}
                onChange={(e) => setUsernameDraft(e.target.value)}
                placeholder="Your anonymous username"
                className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2 text-sm outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const updated = await updateUsername(usernameDraft);
                    setIdentity({
                      username: updated.username,
                      usernameLocked: updated.usernameLocked,
                    });
                    setEditing(false);
                    setMessage("Your anonymous name has been updated.");
                  }}
                  className="text-xs px-3 py-1 rounded-full bg-accent text-black"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setUsernameDraft(identity?.username ?? "");
                    setEditing(false);
                  }}
                  className="text-xs px-3 py-1 rounded-full bg-white/5"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-textMuted">
                Use 3–20 characters: letters, numbers, underscores.
              </p>
            </div>
          )}

          {identity?.usernameLocked && (
            <p className="text-xs text-textMuted">
              Your username is locked and can no longer be changed.
            </p>
          )}
        </GlassContainer>

        {message && (
          <p className="text-xs text-white/60">{message}</p>
        )}

        {/* Reflection card */}
        <GlassContainer className="space-y-3">
          <p className="text-sm text-textMuted">
            About this space
          </p>
          <p className="text-sm leading-relaxed">
            DreamSync is your private journal to reflect on subconscious
            experiences. Dreams you choose to share are always anonymous
            and never linked to your identity.
          </p>
        </GlassContainer>

        {/* Actions */}
        <div className="flex flex-col gap-4 text-sm">

          <Link
            to="/my-dreams"
            className="hover:text-textPrimary transition"
          >
            → View my dreams
          </Link>

          <Link
            to="/settings"
            className="hover:text-textPrimary transition"
          >
            → Settings & preferences
          </Link>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-left text-red-400/80 hover:text-red-400 transition"
          >
            → Log out
          </button>

        </div>

      </div>

      <Modal
        open={lockModalOpen}
        title="Lock your anonymous name?"
        description="This is permanent. You won’t be able to edit or regenerate it later."
        confirmLabel="Lock name"
        onCancel={() => setLockModalOpen(false)}
        onConfirm={async () => {
          const updated = await lockUsername();
          setIdentity({
            username: updated.username,
            usernameLocked: updated.usernameLocked,
          });
          setLockModalOpen(false);
          setMessage("Your anonymous name has been locked.");
        }}
      />
    </PageTransition>
  );
}
