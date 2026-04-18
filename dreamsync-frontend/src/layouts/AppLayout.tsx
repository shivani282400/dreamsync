import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { motion } from "framer-motion";

export default function AppLayout() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#2a235a_0%,#17162f_35%,#0b0b14_70%,#06060b_100%)] text-textPrimary">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[-8rem] h-[24rem] w-[24rem] rounded-full bg-[#7C6CF6]/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-[8rem] h-[22rem] w-[22rem] rounded-full bg-[#F5C6EC]/14 blur-3xl" />
        <motion.div
          animate={{ opacity: [0.45, 0.72, 0.45], scale: [1, 1.06, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-12rem] left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[#7C6CF6]/12 blur-3xl"
        />
      </div>
      <Navbar />
      <main className="relative px-4 pb-28 pt-20 md:px-6 md:pb-12 md:pt-28">
        <Outlet />
      </main>
    </div>
  );
}
