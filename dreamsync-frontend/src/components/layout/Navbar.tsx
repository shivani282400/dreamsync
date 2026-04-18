import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { motion } from "framer-motion";

export default function Navbar() {
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = Boolean(token);
  const items = [
    { to: "/", label: "Home", icon: "Home" },
    { to: "/community", label: "Explore", icon: "Explore" },
    { to: "/write", label: "Journal", icon: "Write" },
    { to: "/profile", label: "Profile", icon: "Profile" },
  ].filter((item) => (item.to === "/profile" || item.to === "/write" ? isAuthenticated : true));

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 hidden px-6 pt-5 md:block">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/15 bg-white/10 px-5 py-3 backdrop-blur-2xl shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#7C6CF6,#F5C6EC)] text-sm font-semibold text-slate-950 shadow-[0_10px_24px_rgba(124,108,246,0.32)]">
              DS
            </span>
            <div>
              <p className="font-serif text-lg tracking-wide text-white">DreamSync</p>
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                Journal. Reflect. Heal.
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/10 p-1.5">
            {items.map((item) => {
              const active =
                item.to === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative rounded-full px-4 py-2 text-sm transition ${
                    active ? "text-white" : "text-white/55 hover:text-white"
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="desktop-nav-pill"
                      className="absolute inset-0 rounded-full bg-white/12"
                      transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {isAuthenticated ? (
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/75 transition hover:bg-white/15 hover:text-white"
            >
              Log out
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/75 transition hover:bg-white/15 hover:text-white"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-5 md:hidden">
        <nav className="mx-auto grid max-w-md grid-cols-4 rounded-[1.75rem] border border-white/15 bg-white/12 px-2 py-2 backdrop-blur-2xl shadow-[0_22px_60px_rgba(3,6,18,0.42)]">
          {items.map((item) => {
            const active =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className="relative flex flex-col items-center gap-1 rounded-[1.25rem] px-2 py-2 text-center"
              >
                {active ? (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-[1.25rem] bg-[linear-gradient(135deg,rgba(124,108,246,0.36),rgba(245,198,236,0.28))]"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  />
                ) : null}
                <span className={`relative text-[11px] uppercase tracking-[0.22em] ${active ? "text-white" : "text-white/50"}`}>
                  {item.icon}
                </span>
                <span className={`relative text-xs ${active ? "text-white" : "text-white/65"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
