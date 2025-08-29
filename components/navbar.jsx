'use client';
import { useState } from "react";
import Link from "next/link";

export default function FloatingGlassMorphNavbar({ openLogin }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed w-full top-2 z-50">
      <div className="relative w-[95vw] max-w-7xl mx-auto rounded-2xl p-2 bg-white/5 border border-white/20 backdrop-blur-xl flex items-center justify-between">
        <Link href="#" className="text-white text-2xl font-bold">Invitect</Link>
        <div className="hidden md:flex gap-4">
          <Link href="#" className="text-white px-3 py-2 rounded-lg hover:bg-white/10">Home</Link>
          <button
            onClick={openLogin}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium"
          >
            Login
          </button>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white mb-1"></span>
          <span className="block w-6 h-0.5 bg-white"></span>
        </button>
      </div>
    </div>
  );
}
