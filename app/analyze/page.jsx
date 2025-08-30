'use client'

import { useState } from "react";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";
import ProtectedRoute from "../../components/ProtectedRoute";
import FloatingGlassMorphNavbar from "../../components/Navbar";

export default function AnalyzePage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!videoUrl) return alert("Please enter a YouTube URL");
    setLoading(true);
    setAnalysisResult(null); // reset previous results

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        alert("You must be logged in to analyze videos.");
        setLoading(false);
        return;
      }

      // Get Firebase ID token
      const idToken = await user.getIdToken(true);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL+"/analyze"}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}` // ✅ include token
        },
        body: JSON.stringify({ url: videoUrl, summary_type: "brief" }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      if (data && data.summary) {
        setAnalysisResult(data);
      } else {
        setAnalysisResult("No summary returned from server.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating summary. Make sure the video is valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <FloatingGlassMorphNavbar/>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center px-4 py-10 text-white">
        <motion.h1
          className="mt-20 text-4xl md:text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          💬 YouTube Comment Analysis
        </motion.h1>

        {/* Input Section */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="Paste YouTube video URL..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleAnalyze}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-semibold shadow-lg transition"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </motion.div>

        {/* Skeleton Loader */}
        {loading && (
          <motion.div
            className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-xl flex flex-col gap-8 animate-pulse"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="h-6 w-48 bg-white/20 rounded"></div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-white/10 rounded-xl h-20"></div>
              <div className="p-4 bg-white/10 rounded-xl h-20"></div>
              <div className="p-4 bg-white/10 rounded-xl h-20"></div>
            </div>
            <div className="bg-white/10 rounded-xl p-6 h-24"></div>
          </motion.div>
        )}

        {/* Result Section */}
        {analysisResult && !loading && (
          <motion.div
            className="w-full max-w-3xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl backdrop-blur-xl flex flex-col gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Sentiment Overview */}
            <h2 className="text-2xl font-bold text-indigo-400">📊 Sentiment Breakdown</h2>
            <p className="text-gray-300">{analysisResult.analysis.summary}</p>

            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-green-500/20 rounded-xl">
                <span className="text-3xl font-bold text-green-400">{analysisResult.analysis.positive ?? 0}%</span>
                <p className="mt-2 text-gray-300">Positive</p>
              </div>
              <div className="p-4 bg-yellow-500/20 rounded-xl">
                <span className="text-3xl font-bold text-yellow-400">{analysisResult.analysis.neutral ?? 0}%</span>
                <p className="mt-2 text-gray-300">Neutral</p>
              </div>
              <div className="p-4 bg-red-500/20 rounded-xl">
                <span className="text-3xl font-bold text-red-400">{analysisResult.analysis.negative ?? 0}%</span>
                <p className="mt-2 text-gray-300">Negative</p>
              </div>
            </div>

            {/* Summary of Comments */}
            <div className="bg-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-purple-400">📝 Top Comments Summary</h3>
              <p className="mt-2 text-gray-300">{analysisResult.summary.summary}</p>
            </div>
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}
