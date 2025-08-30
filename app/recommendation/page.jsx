'use client'
import { useState } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "../../components/ProtectedRoute";
import FloatingGlassMorphNavbar from "../../components/Navbar";
import { getAuth } from "firebase/auth";

export default function RecommendedVideos() {
  const [videoUrl, setVideoUrl] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRecommend = async () => {
    if (!videoUrl) return alert("Please enter a YouTube URL");
    setLoading(true);
    setRecommendations([]);

    try {
     const auth = getAuth();
           const user = auth.currentUser;
           const token = user ? await user.getIdToken() : "";
     
           const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL+"/recommend"}`, {
             method: "POST",
             headers: { 
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}` // Pass Firebase ID token
             },
        body: JSON.stringify({ url: videoUrl, max_results: 6 }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setRecommendations(data.recommended);
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching recommendations.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <FloatingGlassMorphNavbar/>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col items-center px-4 py-10 text-white">
      <motion.h1
        className="mt-20 text-3xl md:text-5xl font-bold mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        🎯 Video Recommendations
      </motion.h1>

      {/* Input Section */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mb-10">
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Enter YouTube video URL"
          className="flex-1 px-4 py-3 rounded-2xl bg-white/10 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
        <button
          onClick={handleRecommend}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-semibold shadow-lg transition duration-300"
        >
          {loading ? "Loading..." : "Get Recommendations"}
        </button>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <motion.div
          className="w-full max-w-6xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {recommendations.map((video, i) => (
            <motion.a
              key={video.videoId}
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/5 backdrop-blur-lg rounded-3xl overflow-hidden shadow-xl hover:shadow-indigo-500/40 transition transform hover:-translate-y-1 hover:scale-105 duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {/* Thumbnail */}
              <div className="relative w-full h-52 overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <span className="absolute bottom-3 right-3 bg-black/70 text-xs px-2 py-1 rounded-md">
                  ▶ Watch
                </span>
              </div>

              {/* Video Info */}
              <div className="p-5 flex flex-col gap-2">
                <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors duration-300">
                  {video.title}
                </h3>
                <p className="text-gray-300 text-sm line-clamp-3">
                  {video.description || "No description available."}
                </p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      )}

      {loading && <p className="mt-6 text-gray-400">Fetching recommendations...</p>}
    </div>
    </ProtectedRoute>
  );
}
