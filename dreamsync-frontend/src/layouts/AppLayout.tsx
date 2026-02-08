import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background text-textPrimary">
      <Navbar />
      <main className="pt-16 px-4">
        <Outlet />
      </main>
    </div>
  );
}
