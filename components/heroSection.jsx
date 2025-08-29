'use client'
import { useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "./card";
import { useAuth } from "../context/authContext";
import LoginModal from "./LoginModal";
import { useRouter } from "next/navigation";

export default function VideoBackground() {
    const { user } = useAuth();
    const router = useRouter();
    const [loginOpen, setLoginOpen] = useState(false);

    // handle navigation with login check
    const handleNavigation = (path) => {
        if (!user) {
            setLoginOpen(true);
        } else {
            router.push(path);
        }
    };

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
                        className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        🎯 Analyze a Video
                    </motion.button>
                    <p className="text-gray-400/80 text-[8px] sm:text-xs mt-4">
                        Analyze ● Compare ● Detect ● Summarize
                    </p>
                </div>

                {/* Cards Section */}
                <div className="mb-20 hidden sm:flex justify-center gap-6 w-full max-w-6xl px-4">
                    <GlassCard
                        title="📝 Summary of Comments"
                        description="Get a quick summary of thousands of comments instantly."
                    >
                        <button
                            onClick={() => handleNavigation('/summarize')}
                            className="flex justify-center mt-3 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-md text-center"
                        >
                            Summarize
                        </button>
                    </GlassCard>

                    <GlassCard
                        title="🎯 Smart Suggestions"
                        description="Get better video recommendations after deep analysis."
                    >
                        <button
                            onClick={() => handleNavigation('/recommendation')}
                            className="flex justify-center mt-3 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-md text-center"
                        >
                            Discover
                        </button>
                    </GlassCard>

                    <GlassCard
                        title="⚖️ Comparison Mode"
                        description="Compare multiple videos side by side for satisfaction score."
                    >
                        <button
                            onClick={() => handleNavigation('/compare')}
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
                            onClick={() => handleNavigation('/spamdetection')}
                            className="flex justify-center mt-3 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-medium shadow-md text-center"
                        >
                            Detect
                        </button>
                    </GlassCard>
                </div>
            </section>

            {/* Login Modal */}
            <LoginModal open={loginOpen} setOpen={setLoginOpen} />
        </div>
    );
}
