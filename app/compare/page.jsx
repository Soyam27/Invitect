"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function CompareVideos() {
  const [url1, setUrl1] = useState("");
  const [url2, setUrl2] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url1, url2 }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col items-center justify-center p-6">
      {/* Title */}
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-extrabold text-white mb-8 drop-shadow-lg"
      >
        ⚖️ Video Sentiment Comparison
      </motion.h1>

      {/* Input Section */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg w-full max-w-2xl p-6 space-y-4"
      >
        <input
          type="text"
          placeholder="Paste Video 1 URL..."
          className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-400 border-b border-gray-600 focus:outline-none"
          value={url1}
          onChange={(e) => setUrl1(e.target.value)}
        />
        <input
          type="text"
          placeholder="Paste Video 2 URL..."
          className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-400 border-b border-gray-600 focus:outline-none"
          value={url2}
          onChange={(e) => setUrl2(e.target.value)}
        />
        <button
          onClick={handleCompare}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          {loading ? "Comparing..." : "Compare"}
        </button>
      </motion.div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl"
        >
          {/* Video 1 */}
          <div
            className={`rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg border
              ${result.video1.positive >= result.video2.positive
                ? "bg-blue-500/20 border-blue-400"
                : "bg-red-500/20 border-red-400"
              }`}
          >
            <img
              src={result.video1.thumbnail}
              alt="Video 1"
              className="w-full h-52 object-cover"
            />
            <div className="p-6 text-white">
              <h2 className="text-2xl font-bold mb-3">{result.video1.title}</h2>
              <p>✅ Positive: <span className="font-bold text-green-400">{result.video1.positive}%</span></p>
              <p>😐 Neutral: <span className="font-bold text-yellow-300">{result.video1.neutral}%</span></p>
              <p>❌ Negative: <span className="font-bold text-red-400">{result.video1.negative}%</span></p>
            </div>
          </div>

          {/* Video 2 */}
          <div
            className={`rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg border
              ${result.video2.positive > result.video1.positive
                ? "bg-blue-500/20 border-blue-400"
                : "bg-red-500/20 border-red-400"
              }`}
          >
            <img
              src={result.video2.thumbnail}
              alt="Video 2"
              className="w-full h-52 object-cover"
            />
            <div className="p-6 text-white">
              <h2 className="text-2xl font-bold mb-3">{result.video2.title}</h2>
              <p>✅ Positive: <span className="font-bold text-green-400">{result.video2.positive}%</span></p>
              <p>😐 Neutral: <span className="font-bold text-yellow-300">{result.video2.neutral}%</span></p>
              <p>❌ Negative: <span className="font-bold text-red-400">{result.video2.negative}%</span></p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recommendation */}
      {result && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="mt-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 max-w-lg text-center"
        >
          <h3 className="text-xl font-bold text-white drop-shadow-md">
            {result.recommendation}
          </h3>
        </motion.div>
      )}
    </div>
  );
}
