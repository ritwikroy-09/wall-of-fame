import { motion, AnimatePresence } from "framer-motion";
import { Achievement } from "@/app/types/achievements";
import PolaroidCard from "./PolaroidCard";

interface AchievementGridProps {
  achievements: Achievement[];
  showContent: boolean;
  isContentFadingOut: boolean;
  selectedCategory: string;
  isReturning: boolean;
  calculatePosition: (index: number) => any;
  onAchievementClick: (achievement: Achievement) => void;
}

const staggerDuration = 0.05;
const animationConfig = {
  initial: { opacity: 0, y: 50, scale: 0.8 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: {
    type: "spring",
    stiffness: 200,
    damping: 25,
    mass: 1,
    duration: 0.6,
  },
};

export function MobileAchievementGrid({
  achievements,
  showContent,
  isContentFadingOut,
  selectedCategory,
  isReturning,
  onAchievementClick,
}: AchievementGridProps) {
  if (typeof window === "undefined") return null;

  return (
    <div className="md:hidden">
      <div className="grid grid-cols-2 gap-4 justify-items-center">
        <AnimatePresence mode="wait">
          {showContent &&
            !isContentFadingOut &&
            achievements.map((achievement, index) => (
              <motion.div
                key={achievement._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  delay: isReturning ? 0 : index * 0.1,
                  duration: 0.3,
                }}
              >
                <PolaroidCard
                  achievement={achievement}
                  onClick={() => onAchievementClick(achievement)}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function DesktopAchievementGrid({
  achievements,
  showContent,
  isContentFadingOut,
  selectedCategory,
  isReturning,
  onAchievementClick,
}: AchievementGridProps) {
  if (typeof window === "undefined") return null;

  return (
    <div className="hidden md:block">
      <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 justify-items-center mx-auto max-w-7xl">
        <AnimatePresence mode="wait">
          {showContent &&
            !isContentFadingOut &&
            achievements.map((achievement, index) => (
              <motion.div
                key={achievement._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  delay: isReturning ? 0 : index * 0.1,
                  duration: 0.3,
                }}
              >
                <PolaroidCard
                  achievement={achievement}
                  onClick={() => onAchievementClick(achievement)}
                />
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
