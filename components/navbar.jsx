'use client'
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "../firebase/firebaseConfig"; // adjust path to your firebase config

export default function FloatingGlassMorphNavbar({ openLogin }) {
  const [open, setOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleAuthClick = async () => {
    if (isLoggedIn) {
      await signOut(auth);
    } else {
      openLogin();
    }
    setOpen(false);
  };

  // Mobile links array
  const mobileLinks = [{ "Summarize": "/summarize" }, { "Discover": "/recommendation" }, { "Compare": "/compare" }, { "Detect": "/spamdetection" }];

  return (
    <div className="fixed top-4 left-0 w-full z-50">
      <div className="relative w-[95vw] max-w-7xl mx-auto rounded-2xl p-2 bg-white/5 border border-white/20 backdrop-blur-xl">
        <nav className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-lg text-white font-bold">
            Invitect
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-4 ml-auto items-center">
            <Link href="/" className="px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 transition">Home</Link>
            {isLoggedIn && (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl font-bold text-white bg-green-500 hover:bg-green-600 transition"
                onClick={() => setOpen(false)}
              >
                 Dashboard
              </Link>
            )}

            <button
              onClick={handleAuthClick}
              className={`px-4 py-2 rounded-xl font-bold text-white transition ${isLoggedIn ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              {isLoggedIn ? "Logout" : "Login"}
            </button>
          </div>

          {/* Hamburger for mobile */}
          <button
            className="ml-auto md:hidden flex flex-col gap-1.5 z-20"
            onClick={() => setOpen(!open)}
          >
            <span className="w-6 h-0.5 bg-white rounded-full"></span>
            <span className="w-6 h-0.5 bg-white rounded-full"></span>
            <span className="w-6 h-0.5 bg-white rounded-full"></span>
          </button>
        </nav>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-4 flex flex-col gap-2 md:hidden"
            >
              {mobileLinks.map((link) => (
                <Link
                  key={Object.keys(link)[0]}
                  href={link[Object.keys(link)[0]]}
                  className="px-3 py-2 rounded-lg text-white/90 hover:bg-white/10 transition"
                  onClick={() => setOpen(false)}
                >
                  {Object.keys(link)[0]}
                </Link>
              ))}

              <button
                onClick={handleAuthClick}
                className={`px-4 py-2 rounded-xl font-bold text-white text-center transition ${isLoggedIn ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}
              >
                {isLoggedIn ? "Logout" : "Login"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
