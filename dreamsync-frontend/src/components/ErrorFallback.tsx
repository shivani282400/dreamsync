import { useNavigate, useRouteError } from "react-router-dom";

export default function ErrorFallback() {
  const navigate = useNavigate();
  const error = useRouteError() as any;
  const message =
    error?.message ||
    error?.statusText ||
    "Something went wrong while rendering this route.";

  return (
    <div className="min-h-screen flex items-center justify-center text-center text-white/70">
      <div className="space-y-4">
        <p>Something went wrong.</p>
        <p className="text-xs text-white/40">{message}</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-white/10 rounded-lg"
        >
          Go home
        </button>
      </div>
    </div>
  );
}
