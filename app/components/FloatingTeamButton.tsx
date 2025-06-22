import { motion } from "framer-motion";
import Image from "next/image";

interface FloatingTeamButtonProps {
  onClick: () => void;
}

export default function FloatingTeamButton({
  onClick,
}: FloatingTeamButtonProps) {
  return (
    <motion.div
      onClick={onClick}
      className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 
      text-white px-6 py-3 rounded-full cursor-pointer shadow-lg hover:shadow-xl
      backdrop-blur-sm text-sm sm:text-base font-medium flex items-center gap-2
      border border-white/20"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-5 h-5 relative">
        <Image src="/logo.png" alt="SDC Logo" fill className="object-contain" />
      </div>
      Made by the SDC Team
      <motion.div
        className="absolute inset-0 bg-white rounded-full"
        style={{ mixBlendMode: "overlay" }}
        initial={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.5, opacity: 0.2 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}
