"use client";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 16,
      duration: 0.45,
    },
  },
};

export default function GlassCard({ title, description, children }) {
  // Sticky button effect only
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 250, damping: 18 });
  const springY = useSpring(y, { stiffness: 250, damping: 18 });

  const buttonRef = useRef(null);

  function handleMouseMove(e) {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const offsetX = e.clientX - centerX;
    const offsetY = e.clientY - centerY;

    const distance = Math.sqrt(offsetX ** 2 + offsetY ** 2);
    const maxDistance = 250; // ⬅️ more radius so it reacts earlier
    const stickiness = Math.max(0, 1 - distance / maxDistance);

    // ⬅️ stronger pull (increased from 0.25 → 0.45)
    x.set(offsetX * 0.45 * stickiness);
    y.set(offsetY * 0.45 * stickiness);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{
        scale: 1.08,
        borderColor: "rgba(253,186,116,0.9)", // glowing orange border
        boxShadow: "0 0 25px rgba(253,186,116,0.7)", // glow instead of drop shadow
        transition: {
          duration: 0.25,
          ease: [0.23, 1, 0.32, 1],
        },
      }}
      className="relative min-w-3xs bg-white/10 backdrop-blur-lg border border-white/20 
                 rounded-2xl p-6 sm:min-w-2xs flex flex-col justify-between mx-auto"
    >
      {/* Title */}
      <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4">{description}</p>

      {/* Sticky button */}
      <motion.div
        ref={buttonRef}
        style={{ x: springX, y: springY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
