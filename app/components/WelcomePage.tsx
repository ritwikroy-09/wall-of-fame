"use client";

import { motion } from "framer-motion";

interface WelcomePageProps {
  isLoading?: boolean;
}

export default function WelcomePage({ isLoading = true }: WelcomePageProps) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: isLoading ? 0 : "-100%" }}
      transition={{
        duration: 1.2,
        delay: 0.2, 
        ease: [0.22, 1, 0.36, 1],
      }}
      className="fixed inset-0 bg-white z-[60] flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="space-y-4 text-center"
      >
        <motion.h1
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-black tracking-wider"
        >
          Welcome to
        </motion.h1>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="space-y-2"
        >
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold bg-gradient-to-r from-black via-neutral-800 to-black bg-clip-text text-transparent">
            MUJ CSE DEPT
          </h2>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display italic text-neutral-700">
            Wall of Fame
          </h2>
        </motion.div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="pt-8"
        >
          <div className="w-16 h-16 mx-auto relative">
            <motion.div
              animate={{
                y: [0, -12, 0],
                scale: [1, 0.8, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
              className="absolute inset-0"
            >
              <svg
                className="w-full h-full text-black/80"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-12"
        >
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
            />
            <span className="text-sm text-neutral-600">
              Loading achievements...
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
