'use client';
import { useState } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "../../components/ProtectedRoute";
import FloatingGlassMorphNavbar from "../../components/Navbar";
import { getAuth } from "firebase/auth";

export default function VideoSummaryPage() {
  const [videoUrl, setVideoUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSummarize = async (summary_type) => {
    if (!videoUrl) return alert("Please enter a YouTube URL");
    setLoading(true);
    setResult(null);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL+"/summarize"}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // Pass Firebase ID token
        },
        body: JSON.stringify({ url: videoUrl, summary_type }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error generating summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <FloatingGlassMorphNavbar/>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col items-center justify-start px-4 py-10 text-white">
        <motion.h1 className="mt-20 text-3xl md:text-5xl font-bold mb-6 text-center drop-shadow-lg">
          🎬 Video Summarizer
        </motion.h1>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mb-6">
          <input
            type="text"
            value={videoUrl}
            onChange={(e) => { setVideoUrl(e.target.value); setResult(null); }}
            placeholder="Enter YouTube video URL"
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-md text-white placeholder-gray-400"
          />
        </div>

        <div className="flex gap-4 mb-6">
          <button onClick={() => handleSummarize("short")} className="px-6 py-3 rounded-lg bg-green-600">Crisp</button>
          <button onClick={() => handleSummarize("brief")} className="px-6 py-3 rounded-lg bg-yellow-600">Brief</button>
          <button onClick={() => handleSummarize("broad")} className="px-6 py-3 rounded-lg bg-red-600">Broad</button>
        </div>

        {loading && <p>Generating summary...</p>}
        {result && (
          <motion.div className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg border border-gray-700 bg-white/10">
            <img src={result.thumbnail} alt="Video Thumbnail" className="w-full h-56 object-cover" />
            <div className="p-6 text-white space-y-4">
              <h2 className="text-2xl font-bold">{result.title}</h2>
              <div className="bg-white/10 p-4 rounded-xl">
                <h3 className="font-semibold text-indigo-300 mb-2">📝 Summary</h3>
                <p>{result.summary.summary}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ProtectedRoute>
  );
}
