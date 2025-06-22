"use client";

import { motion } from "framer-motion";

export default function SubmitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <motion.div
      key="submit-layout"
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: "0%", opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      }}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}
