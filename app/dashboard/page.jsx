'use client';
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../components/LoaderComponent";
import FloatingGlassMorphNavbar from "../../components/Navbar";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [hits, setHits] = useState([]);
  const [expandedHit, setExpandedHit] = useState(null);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/");
        return;
      }

      setUserInfo({ name: user.displayName || "User", email: user.email || "" });

      try {
        const token = await user.getIdToken();
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL+"/dashboard"}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const fetchedHits = data.hits || [];

        const mappedHits = fetchedHits.map((hit) => {
          const defaultThumbnail = "/default-thumbnail.png";

          const video1 = hit.video1
            ? {
                title: hit.video1.title || hit.video1.videoTitle || "Unknown Video",
                thumbnail: hit.video1.thumbnail || defaultThumbnail,
                positive: hit.video1.analysis?.positive ?? 0,
                neutral: hit.video1.analysis?.neutral ?? 0,
                negative: hit.video1.analysis?.negative ?? 0,
              }
            : null;

          const video2 = hit.video2
            ? {
                title: hit.video2.title || hit.video2.videoTitle || "Unknown Video",
                thumbnail: hit.video2.thumbnail || defaultThumbnail,
                positive: hit.video2.analysis?.positive ?? 0,
                neutral: hit.video2.analysis?.neutral ?? 0,
                negative: hit.video2.analysis?.negative ?? 0,
              }
            : null;

          const recommended = (hit.recommended || []).map((video) => ({
            title: video.title || video.videoTitle || "Unknown Video",
            thumbnail: video.thumbnail || defaultThumbnail,
          }));

          return {
            id: hit.id || hit._id || Math.random().toString(),
            actionType: hit.actionType,
            timestamp: hit.timestamp || { seconds: Date.now() / 1000 },
            userInfo: hit.userInfo,
            summary: hit.summary || hit.summaryText,
            analysis: hit.analysis,
            spam_results: hit.spam_results,
            examples: hit.examples,
            video1,
            video2,
            recommended,
            videoTitle:
              hit.actionType === "Compare"
                ? (video1?.title || video2?.title || "Unknown Video")
                : hit.videoTitle || hit.videoUrl || hit.actionType,
            thumbnail: hit.thumbnail || video1?.thumbnail || video2?.thumbnail || recommended[0]?.thumbnail || defaultThumbnail,
          };
        });

        setHits(mappedHits.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds));
      } catch (err) {
        console.error("Error fetching hits:", err);
      }

      setLoading(false);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [mounted, router]);

  if (!mounted || !authChecked || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <FloatingGlassMorphNavbar />
      <div className="min-h-screen p-6 bg-gray-900 text-white">
        {/* User Info */}
        <div className="mt-20 flex items-center gap-4 mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 border border-white/20 rounded-2xl p-6 shadow-lg">
          <div className="text-white">
            <h2 className="text-2xl font-bold">{userInfo.name}</h2>
            <p className="text-gray-200">{userInfo.email}</p>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center mt-4">📊 Dashboard</h1>

        {!hits.length ? (
          <div className="flex flex-col justify-center items-center mt-10">
            <div className="bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg text-center">
              <h2 className="text-2xl font-bold mb-2">📭 No hits yet!</h2>
              <p className="text-gray-300">You haven't made any requests yet. Start analyzing videos now!</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {hits.map((hit) => (
              <motion.div
                key={hit.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/10 border border-white/20 rounded-2xl p-4 cursor-pointer shadow-lg"
                onClick={() => setExpandedHit(expandedHit?.id === hit.id ? null : hit)}
              >
                {/* Header */}
                <div className="flex items-center gap-4">
                  {hit.thumbnail && (
                    <img
                      src={hit.thumbnail}
                      alt={hit.videoTitle ?? hit.actionType}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{hit.videoTitle!="Unknown title"?hit.videoTitle:hit.recommended[0]['title']}</p>
                    <p className="text-sm text-gray-300">{hit.actionType}</p>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {expandedHit?.id === hit.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 p-4 bg-white/5 rounded-xl"
                    >
                      {renderHitDetails(hit)}
                      <div className="text-gray-400 text-xs mt-2">
                        {new Date(hit.timestamp.seconds * 1000).toLocaleString()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );

  function renderHitDetails(hit) {
    const defaultThumbnail = "/default-thumbnail.png";

    switch (hit.actionType) {
      case "Analysis":
        if (!hit.analysis) return null;
        return (
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="p-2 bg-green-500/20 rounded-xl">
              <span className="font-bold text-green-400 text-lg">{hit.analysis.positive ?? 0}%</span>
              <p className="text-gray-300">Positive</p>
            </div>
            <div className="p-2 bg-yellow-500/20 rounded-xl">
              <span className="font-bold text-yellow-400 text-lg">{hit.analysis.neutral ?? 0}%</span>
              <p className="text-gray-300">Neutral</p>
            </div>
            <div className="p-2 bg-red-500/20 rounded-xl">
              <span className="font-bold text-red-400 text-lg">{hit.analysis.negative ?? 0}%</span>
              <p className="text-gray-300">Negative</p>
            </div>
          </div>
        );

      case "Compare":
        return (
          <div className="space-y-4">
            {["video1", "video2"].map((v) => {
              const video = hit[v];
              if (!video) return null;
              return (
                <div key={v} className="flex items-center gap-4 p-2 bg-white/5 rounded-xl">
                  <img
                    src={video.thumbnail || defaultThumbnail}
                    alt={video.title || "Unknown Video"}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{video.title || "Unknown Video"}</p>
                    <div className="grid grid-cols-3 gap-2 text-center mt-1">
                      <span>👍 {video.positive ?? 0}%</span>
                      <span>😐 {video.neutral ?? 0}%</span>
                      <span>👎 {video.negative ?? 0}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );

      case "Summarize":
        return <div className="text-gray-300 text-sm">{hit.summary.summary ?? "No summary available."}</div>;

      case "SpamDetection":
        return (
          <div className="text-gray-300 text-sm">
            <p>Spam Comments: {hit.spam_results?.spam ?? 0}</p>
            <p>Not Spam: {(hit.spam_results?.total ?? 0) - (hit.spam_results?.spam ?? 0)}</p>
            {hit.examples?.length > 0 && (
              <ul className="list-disc ml-5 mt-2">
                {hit.examples.map((ex, idx) => <li key={idx}>{ex}</li>)}
              </ul>
            )}
          </div>
        );

      case "Recommend":
        return (
          <div className="space-y-4">
            {hit.recommended?.map((video, idx) => (
              <div key={idx} className="flex items-center gap-4 p-2 bg-white/5 rounded-xl">
                <img
                  src={video.thumbnail || defaultThumbnail}
                  alt={video.title || "Unknown Video"}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <p className="font-semibold text-white">{video.title || "Unknown Video"}</p>
              </div>
            ))}
          </div>
        );

      default:
        return <p className="text-gray-300 text-sm">No additional data available.</p>;
    }
  }
}
