import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Navbar() {
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const isAuthenticated = Boolean(token);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-30 h-14 px-6
                 flex items-center justify-between
                 bg-background/80 backdrop-blur
                 border-b border-white/10"
    >
      {/* Brand */}
      <Link to="/" className="font-serif text-lg tracking-wide">
        DreamSync
      </Link>
      <Link
  to="/insights"
  className="text-white/60 hover:text-white transition"
>
  Insights
</Link>

      {/* Navigation */}
      <div className="flex items-center gap-6 text-sm text-textMuted">
        <Link
          to="/community"
          className="hover:text-textPrimary transition"
        >
          Explore
        </Link>

        {isAuthenticated && (
          <Link
            to="/write"
            className="hover:text-textPrimary transition"
          >
            Journal
          </Link>
        )}

        {isAuthenticated ? (
          <>
            <Link
              to="/profile"
              className="hover:text-textPrimary transition"
            >
              Profile
            </Link>

            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="hover:text-textPrimary transition"
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="hover:text-textPrimary transition"
          >
            Log in
          </Link>
        )}
      </div>
    </nav>
  );
}
