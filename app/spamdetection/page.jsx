"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "../../components/ProtectedRoute";
import FloatingGlassMorphNavbar from "../../components/Navbar";
import { getAuth } from "firebase/auth";

export default function SpamDetection() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    setResult(null);
    try {
     const auth = getAuth();
           const user = auth.currentUser;
           const token = user ? await user.getIdToken() : "";
     
           const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL+"/spamdetection"}`, {
             method: "POST",
             headers: { 
               "Content-Type": "application/json",
               "Authorization": `Bearer ${token}` // Pass Firebase ID token
             },
        body: JSON.stringify({ url }),
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
    <ProtectedRoute>
      <FloatingGlassMorphNavbar/>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col items-center justify-center p-6">
      {/* Title */}
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-3xl md:text-4xl font-extrabold text-white mb-8 drop-shadow-lg"
      >
        🚫 Spam Detection
      </motion.h1>

      {/* Input box */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg overflow-hidden w-full max-w-lg"
      >
        <input
          type="text"
          placeholder="Paste YouTube URL..."
          className="flex-grow bg-transparent px-4 py-3 text-white placeholder-gray-400 focus:outline-none"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={handleCheck}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 transition disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check"}
        </button>
      </motion.div>

      {/* Result Card */}
      {result && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="mt-10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden backdrop-blur-lg border bg-blue-500/20 border-blue-400"
        >
          {/* Thumbnail */}
          <img
            src={result.thumbnail}
            alt="thumbnail"
            className="w-full h-52 object-cover"
          />

          {/* Content */}
          <div className="p-6 text-white space-y-6">
            <h2 className="text-2xl font-bold">{result.title}</h2>

            {/* Spam Comments Section */}
            <div className="bg-white/10 p-4 rounded-xl">
              <h3 className="font-semibold text-yellow-300 mb-2">💬 Spam Comments</h3>
              <p>
                🚨 Spam:{" "}
                <span className="font-bold text-red-400">{result.spam_comments}</span>
              </p>
              <p>
                ✅ Not Spam:{" "}
                <span className="font-bold text-green-400">{result.not_spam_comments}</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
    </ProtectedRoute>
  );
}
