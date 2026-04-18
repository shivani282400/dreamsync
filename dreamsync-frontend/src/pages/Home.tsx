import { useEffect, useMemo } from "react";
import PageTransition from "../components/ui/PageTransition";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useDreamStore } from "../store/dreamStore";
import { motion } from "framer-motion";

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
  const recentDreams = dreams.slice(0, 3);

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl space-y-10 pb-10">
        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur-2xl shadow-[0_24px_80px_rgba(4,8,20,0.34)] md:p-8"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(245,198,236,0.22),transparent_30%),linear-gradient(145deg,rgba(124,108,246,0.2),transparent_45%)]" />
            <div className="relative space-y-8">
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.35em] text-white/50">
                  Your inner weather
                </p>
                <div className="space-y-3">
                  <h1 className="max-w-2xl font-serif text-[2.8rem] leading-[1.05] text-white md:text-[4.4rem]">
                    How are you feeling today, {name}?
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-white/68 md:text-lg">
                    DreamSync is your soft place to record symbols, notice emotional patterns,
                    and receive interpretations that feel calm, personal, and emotionally present.
                  </p>
                </div>
              </div>

              <motion.div
                animate={{ boxShadow: ["0 0 0 rgba(124,108,246,0.1)", "0 0 38px rgba(124,108,246,0.22)", "0 0 0 rgba(124,108,246,0.1)"] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="rounded-[1.6rem] border border-white/15 bg-black/20 p-4 backdrop-blur-xl"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-white/78">Begin with whatever stayed with you.</p>
                    <p className="text-sm text-white/48">
                      Fragments, feelings, scenes, symbols. It all counts.
                    </p>
                  </div>
                  <Link
                    to="/write"
                    className="inline-flex items-center justify-center rounded-full bg-[linear-gradient(135deg,#7C6CF6,#F5C6EC)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:scale-[1.02] hover:shadow-[0_16px_40px_rgba(124,108,246,0.35)]"
                  >
                    Start a dream entry
                  </Link>
                </div>
              </motion.div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.07] p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">Dreams logged</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{totalDreams}</p>
                  <p className="mt-1 text-sm text-white/52">
                    {totalDreams === 1 ? "One remembered thread." : "Moments gathered over time."}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.07] p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">Last mood</p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {lastDream?.mood ?? "Unwritten"}
                  </p>
                  <p className="mt-1 text-sm text-white/52">
                    {lastDream ? "Your latest emotional signal." : "Your next entry will shape this."}
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.07] p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">Safe by default</p>
                  <p className="mt-3 text-2xl font-semibold text-white">Private</p>
                  <p className="mt-1 text-sm text-white/52">
                    Sharing is always optional and always yours.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.08 }}
            className="space-y-4"
          >
            <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur-2xl shadow-[0_24px_80px_rgba(4,8,20,0.3)]">
              <p className="text-xs uppercase tracking-[0.32em] text-white/45">Quick paths</p>
              <div className="mt-5 space-y-3">
                <Link
                  to="/community"
                  className="flex items-center justify-between rounded-[1.35rem] border border-white/10 bg-black/15 px-4 py-4 text-white/80 transition hover:scale-[1.01] hover:bg-black/20 hover:text-white"
                >
                  <span>Explore shared dreams</span>
                  <span className="text-white/45">Open</span>
                </Link>
                <Link
                  to="/my-dreams"
                  className="flex items-center justify-between rounded-[1.35rem] border border-white/10 bg-black/15 px-4 py-4 text-white/80 transition hover:scale-[1.01] hover:bg-black/20 hover:text-white"
                >
                  <span>Return to your journal</span>
                  <span className="text-white/45">Open</span>
                </Link>
                <Link
                  to="/insights"
                  className="flex items-center justify-between rounded-[1.35rem] border border-white/10 bg-black/15 px-4 py-4 text-white/80 transition hover:scale-[1.01] hover:bg-black/20 hover:text-white"
                >
                  <span>See your emotional patterns</span>
                  <span className="text-white/45">Open</span>
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/15 bg-[linear-gradient(135deg,rgba(124,108,246,0.24),rgba(245,198,236,0.14))] p-6 backdrop-blur-2xl shadow-[0_24px_80px_rgba(4,8,20,0.3)]">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45">Reflection</p>
              <blockquote className="mt-4 text-lg leading-8 text-white/88">
                "The dream you almost forget is sometimes the one your mind most wants you to hear."
              </blockquote>
            </div>
          </motion.aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: "easeOut", delay: 0.12 }}
            className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur-2xl shadow-[0_24px_80px_rgba(4,8,20,0.3)]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-white/45">Recent dreams</p>
                <h2 className="mt-2 font-serif text-2xl text-white">Your latest entries</h2>
              </div>
              <Link to="/my-dreams" className="text-sm text-[#F5C6EC] transition hover:text-white">
                View all
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {recentDreams.length > 0 ? (
                recentDreams.map((dream, index) => (
                  <motion.div
                    key={dream.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: 0.08 * index }}
                    className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4"
                  >
                    <p className="text-sm uppercase tracking-[0.24em] text-white/40">
                      {dream.mood ?? "Open mood"}
                    </p>
                    <p className="mt-3 text-base leading-7 text-white/84">
                      {dream.title || dream.content.slice(0, 120)}
                      {dream.content.length > 120 ? "..." : ""}
                    </p>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-black/10 p-8 text-center">
                  <p className="text-lg text-white/85">No dreams yet - start your journey 🌙</p>
                  <p className="mt-2 text-sm text-white/55">
                    The first entry is enough. You do not need perfect recall to begin.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, ease: "easeOut", delay: 0.18 }}
            className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur-2xl shadow-[0_24px_80px_rgba(4,8,20,0.3)]"
          >
            <p className="text-xs uppercase tracking-[0.32em] text-white/45">AI interpretation style</p>
            <div className="mt-5 rounded-[1.6rem] border border-white/10 bg-black/20 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-[#F5C6EC]">Sample reflection</p>
              <p className="mt-4 border-l-2 border-[#7C6CF6]/80 pl-4 text-base leading-8 text-white/82">
                It may feel like your dreaming mind is trying to soften something you have been carrying alone.
                The symbols that keep returning are less about prediction and more about emotional truth:
                what still wants to be felt, named, and gently understood.
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] border border-white/10 bg-black/15 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Tone</p>
                <p className="mt-2 text-white/84">Warm, reflective, therapist-like</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-black/15 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Experience</p>
                <p className="mt-2 text-white/84">Calm, safe, personal, gently modern</p>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </PageTransition>
  );
}
