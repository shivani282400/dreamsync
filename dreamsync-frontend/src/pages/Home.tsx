import { useEffect, useMemo } from "react";
import PageTransition from "../components/ui/PageTransition";
import GlassContainer from "../components/ui/GlassContainer";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useDreamStore } from "../store/dreamStore";

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const { dreams, fetchDreams } = useDreamStore();

  useEffect(() => {
    fetchDreams().catch(() => {});
  }, [fetchDreams]);

  const name = useMemo(() => {
    if (user?.username) {
      return user.username;
    }
    return "Anonymous Dreamer";
  }, [user?.username]);

  const totalDreams = dreams.length;
  const lastDream = dreams[0];

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-6 pt-24 pb-20 space-y-16">

        {/* Greeting */}
        <section className="space-y-4">
          <p className="text-sm text-textMuted">
            Welcome back,
          </p>

          <h1 className="font-serif text-display tracking-wide">
            Welcome back, {name}
          </h1>

          <p className="max-w-xl text-textMuted">
            This is your quiet space to reflect, understand,
            and gently explore what your dreams may be telling you.
          </p>
        </section>

        {/* Primary actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <GlassContainer className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="font-serif text-heading tracking-wide">
                Journal a dream
              </h2>
              <p className="text-textMuted">
                Write or record what you remember.
              </p>
            </div>

            <Link to="/write" className="text-sm text-accent hover:underline">
              Start journaling →
            </Link>
          </GlassContainer>

          <GlassContainer className="p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="font-serif text-heading tracking-wide">
                Explore shared dreams
              </h2>
              <p className="text-textMuted">
                Discover patterns and emotions from others.
              </p>
            </div>

            <Link to="/community" className="text-sm text-accent hover:underline">
              Explore community →
            </Link>
          </GlassContainer>

        </section>

        {/* Secondary actions (Figma-style) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <GlassContainer className="p-6">
            <Link to="/my-dreams" className="block space-y-1">
              <p className="text-sm">My dreams</p>
              <p className="text-xs text-textMuted">
                Revisit past reflections
              </p>
            </Link>
          </GlassContainer>

          <GlassContainer className="p-6">
            <Link to="/write" className="block space-y-1">
              <p className="text-sm">Continue last dream</p>
              <p className="text-xs text-textMuted">
                {lastDream
                  ? "Pick up where you left off"
                  : "Start your next entry"}
              </p>
            </Link>
          </GlassContainer>

          <GlassContainer className="p-6">
            <div className="space-y-1">
              <p className="text-sm">Dreams logged</p>
              <p className="text-xs text-textMuted">
                {totalDreams} total {totalDreams === 1 ? "entry" : "entries"}
              </p>
            </div>
          </GlassContainer>

        </section>

        {/* Reassurance */}
        <section className="max-w-xl">
          <p className="text-xs text-textMuted">
            Your dreams are private by default. Sharing is always your choice.
          </p>
        </section>

      </div>
    </PageTransition>
  );
}
