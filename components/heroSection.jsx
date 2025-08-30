"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "./Card";
import { useAuth } from "../context/authContext";
import LoginModal from "./LoginModal";
import { useRouter } from "next/navigation";

export default function  VideoBackground() {
  const { user } = useAuth();
  const router = useRouter();
  const [loginOpen, setLoginOpen] = useState(false);

  // handle navigation with login check

 const handleNavigation = (path) => {
  if (!user) {
    setLoginOpen(true);
  } else {
    setLoginOpen(false);
    router.push(path);
  }
};

useEffect(() => {
  if (user !== undefined) { // user is loaded
    if (!user) {
      setLoginOpen(true);
    } else {
      setLoginOpen(false);
      router.push("/"); // or wherever you want
    }
  }
}, [user]);



  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/bgvd.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black/40"></div>

      <section className="relative top-10 z-20 flex flex-col text-white min-h-[100vh] items-center justify-between px-6">
        {/* Hero Section */}
        <div className="max-w-3xl text-center mt-20">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold mb-6"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Know Before You Watch
          </motion.h1>

          <motion.p
            className="text-base md:text-xl text-gray-300 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Analyze YouTube comments instantly and see a video’s true
            satisfaction score. Recommendations await you after analysis.
          </motion.p>

          <motion.button
            onClick={() => handleNavigation("/analyze")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative inline-block bg-indigo-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg transition-transform duration-150"
            whileHover={{
              boxShadow: "0px 0px 12px rgba(99,102,241,0.5), 0px 0px 24px rgba(129,140,248,0.4)",
              transition: { duration: 0.5, ease: "linear" },
            }}
            whileTap={{ scale: 0.95 }}
          >
            🎯 Analyze a Video
          </motion.button>

        </div>

        {/* Cards Section with staggered reveal */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.25 } },
          }}
          className="mb-20 hidden lg:flex justify-center gap-6 w-full max-w-6xl px-4"
        >
          <GlassCard
            title="📝 Summary of Comments"
            description="Get a quick summary of thousands of comments instantly."
          >
            <button
              onClick={() => handleNavigation("/summarize")}
              className="flex justify-center mt-3 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md text-center"
            >
              Summarize
            </button>
          </GlassCard>

          <GlassCard
            title="🎯 Smart Suggestions"
            description="Get better video recommendations after deep analysis."
          >
            <button
              onClick={() => handleNavigation("/recommendation")}
              className="flex justify-center mt-3 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium shadow-md text-center"
            >
              Discover
            </button>
          </GlassCard>

          <GlassCard
            title="⚖️ Comparison Mode"
            description="Compare multiple videos side by side for satisfaction score."
          >
            <button
              onClick={() => handleNavigation("/compare")}
              className="flex justify-center mt-3 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-md text-center"
            >
              Compare
            </button>
          </GlassCard>

          <GlassCard
            title="🚫 Spam Detection"
            description="Spot misleading or spammy comments automatically."
          >
            <button
              onClick={() => handleNavigation("/spamdetection")}
              className="flex justify-center mt-3 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium shadow-md text-center"
            >
              Detect
            </button>
          </GlassCard>
        </motion.div>

      </section>

      {/* Login Modal */}
      <LoginModal open={loginOpen} setOpen={setLoginOpen} />
    </div>
  );
}
