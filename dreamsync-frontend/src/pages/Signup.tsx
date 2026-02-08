import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition";
import GlassContainer from "../components/ui/GlassContainer";
import Logo from "../components/ui/Logo";
import { useAuthStore } from "../store/authStore";

export default function Signup() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(email, name, password);
      navigate("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageTransition>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">

        {/* Ambient glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[420px] h-[420px] bg-accent/10 blur-[130px] rounded-full" />
        </div>

        <GlassContainer className="relative z-10 w-full max-w-md space-y-8 text-center">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <Logo size={72} showText={false} />
            </div>

            <h1 className="font-serif text-2xl tracking-wide">
              Create your space
            </h1>

            <p className="text-sm text-textMuted">
              Begin your private dream journey.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="space-y-4 text-left">

            <div className="space-y-1">
              <label className="text-xs text-textMuted">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-2 rounded-xl
                           bg-white/[0.05] border border-white/[0.08]
                           text-sm outline-none
                           placeholder:text-textMuted
                           focus:ring-1 focus:ring-accent/40"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-textMuted">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@dreamsync.app"
                className="w-full px-4 py-2 rounded-xl
                           bg-white/[0.05] border border-white/[0.08]
                           text-sm outline-none
                           placeholder:text-textMuted
                           focus:ring-1 focus:ring-accent/40"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-textMuted">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-xl
                           bg-white/[0.05] border border-white/[0.08]
                           text-sm outline-none
                           placeholder:text-textMuted
                           focus:ring-1 focus:ring-accent/40"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-textMuted">
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-xl
                           bg-white/[0.05] border border-white/[0.08]
                           text-sm outline-none
                           placeholder:text-textMuted
                           focus:ring-1 focus:ring-accent/40"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

          {/* Actions */}
          <div className="space-y-4">

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl
                         bg-gradient-to-r from-accent to-accentSoft
                         text-black font-medium transition hover:opacity-90"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="text-xs text-textMuted">
              Already have an account?{" "}
              <Link to="/login" className="text-accent hover:underline">
                Log in
              </Link>
            </p>

          </div>

          </form>

        </GlassContainer>
      </div>
    </PageTransition>
  );
}
