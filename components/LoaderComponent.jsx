// components/Loader.jsx
'use client';
import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
      <motion.div
        className="relative w-20 h-20"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        {/* Neon spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-b-purple-500 border-l-transparent border-r-transparent" />

        {/* Inner bouncing dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-4 h-4 bg-blue-400 rounded-full shadow-xl"
          style={{ translateX: '-50%', translateY: '-50%' }}
          animate={{
            y: [-5, -15, -5], // pixel values instead of percentages
            x: [-5, 5, -5],
          }}
          transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Optional loading text */}
      <motion.p
        className="absolute bottom-10 text-white text-lg tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        LOADING...
      </motion.p>
    </div>
  );
}
