"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Achievement } from "@/app/types/achievements";
import React from "react";

interface PolaroidCardProps {
  achievement: Achievement;
  onClick: () => void;
}

function PolaroidCardComponent({ achievement, onClick }: PolaroidCardProps) {
  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        y: -5,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative cursor-pointer bg-white p-3 pb-8"
      onClick={onClick}
      style={{
        width: "200px", // Smaller width
        height: "280px", // Adjusted height for proportion
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Image container */}
      <motion.div
        className="relative w-full h-[200px] bg-gray-100"
        layoutId={`image-container-${achievement._id}`}
      >
        {achievement.imageUrl && (
          <Image
            src={achievement.imageUrl}
            alt={achievement.fullName}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            className="object-cover"
            priority={true}
          />
        )}
      </motion.div>

      {/* Polaroid strip with text */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-2 bg-white text-center"
        layoutId={`content-${achievement._id}`}
      >
        <motion.h3
          className="font-medium text-sm text-gray-800 truncate"
          layoutId={`name-${achievement._id}`}
        >
          {achievement.fullName}
        </motion.h3>

        <motion.p
          className="text-xs text-gray-600 line-clamp-1 mt-0.5"
          layoutId={`title-${achievement._id}`}
        >
          {achievement.title}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// Use React.memo with custom comparison
export default React.memo(PolaroidCardComponent, (prev, next) => {
  return prev.achievement._id === next.achievement._id;
});
