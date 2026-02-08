import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import AppLayout from "../layouts/AppLayout";
import AuthLayout from "../layouts/AuthLayout";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import WriteDream from "../pages/WriteDream";
import Interpretation from "../pages/Interpretation";
import Community from "../pages/Community";
import MyDreams from "../pages/MyDreams";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";
import Insights from "../pages/Insights";
import InsightLetter from "../pages/InsightLetter";
import ErrorFallback from "../components/ErrorFallback";

export const router = createBrowserRouter([
  // -------- AUTH ROUTES --------
  {
    element: <AuthLayout />,
    errorElement: <ErrorFallback />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <Signup /> },
      { path: "*", element: <Navigate to="/login" replace /> },
    ],
  },

  // -------- APP ROUTES (PROTECTED ONCE) --------
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorFallback />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/community", element: <Community /> },
      { path: "/write", element: <WriteDream /> },

      // Interpretation page
      {
        path: "/interpretation/:dreamId",
        element: <Interpretation />,
      },

      { path: "/my-dreams", element: <MyDreams /> },
      { path: "/profile", element: <Profile /> },
      { path: "/settings", element: <Settings /> },
      { path: "/insights", element: <Insights /> },
      {
        path: "/insights/weekly/:period",
        element: <InsightLetter mode="weekly" />,
      },
      {
        path: "/insights/monthly/:period",
        element: <InsightLetter mode="monthly" />,
      },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);
