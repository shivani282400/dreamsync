import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import GlassContainer from "../components/ui/GlassContainer";
import Logo from "../components/ui/Logo";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassContainer className="w-full max-w-md p-8 space-y-6">
      <div className="flex justify-center">
        <Logo />
      </div>

      <div>
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-textMuted text-sm">
          Continue your private dream journey.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="text-sm text-textMuted">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@dreamsync.app"
            className="w-full mt-1 input"
            required
          />
        </div>

        <div>
          <label className="text-sm text-textMuted">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 input"
            required
          />
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>

      <p className="text-sm text-textMuted">
        New here?{" "}
        <Link to="/signup" className="text-textPrimary hover:underline">
          Create an account
        </Link>
      </p>
    </GlassContainer>
  );
}
