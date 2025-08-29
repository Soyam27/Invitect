
import { motion } from "framer-motion";

export default function GlassCard({ title, description, children }) {
  return (
    <motion.div
      className="relative min-w-3xs  bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6 sm:min-w-2xs flex flex-col justify-between mx-auto"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
        <div>

      <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4">{description}</p>
        </div>
      {/* Title */}

      {/* Slot for extra content like button, icons, etc. */}
      <div>{children}</div>
    </motion.div>
  );
}
