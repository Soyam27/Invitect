'use client'
import { motion } from "framer-motion";

export default function SummaryCard({ summary }) {
  if (!summary) return null;

  return (
    <motion.div
      className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-2xl p-6 mt-6 flex flex-col gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-xl font-bold">📝 Summary of Comments</h2>
      <p className="text-gray-200">{summary}</p>
    </motion.div>
  );
}
