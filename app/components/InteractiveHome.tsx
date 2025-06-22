"use client";
import { categories } from "../types/categories";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface InteractiveHomeClientProps {
  isReturning?: boolean;
}
import { Button } from "@/components/ui/button";
import { useAnimationSequence } from "../hooks/useAnimationSequence";
import { teamMembers } from "../data/team";
import { Achievement } from "@/app/types/achievements";

import Header from "./Header";
import Sidebar from "./Sidebar";
import WelcomePage from "./WelcomePage";
import FloatingTeamButton from "./FloatingTeamButton";
import {
  MobileAchievementGrid,
  DesktopAchievementGrid,
} from "./AchievementGrid";
import TeamModal from "./TeamModal";
import AchievementModal from "./AchievementModal";

export default function InteractiveHomeClient({
  isReturning = false,
}: InteractiveHomeClientProps) {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(
    isReturning ? "Overall TOP 10" : categories[0]
  );
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [showContent, setShowContent] = useState(isReturning);
  const [showTeamModal, setShowTeamModal] = useState(false);

  const [showWelcome, setShowWelcome] = useState(!isReturning);
  const [minimumTimeElapsed, setMinimumTimeElapsed] = useState(false);

  const {
    isSidebarAnimating,
    isContentFadingOut,
    isContentFadingIn,
    startAnimationSequence,
  } = useAnimationSequence();

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isReturning) {
      const timer = setTimeout(() => {
        setMinimumTimeElapsed(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isReturning]);

  useEffect(() => {
    if (!isReturning && dataLoaded && minimumTimeElapsed) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 200); // Small delay to ensure smooth transition
      return () => clearTimeout(timer);
    }
  }, [isReturning, dataLoaded, minimumTimeElapsed]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch(
          `/api/achievements?approved=2001-01-01&archived=false`
        );
        const data = await response.json();
        if (response.ok) {
          const achievementsWithImages = data.achievements.map(
            (achievement: Achievement) => {
              // Convert user image to base64 URL if it exists
              if (achievement.userImage?.data) {
                achievement.imageUrl = `data:${achievement.userImage.contentType};base64,${achievement.userImage.data}`;
              }
              // Convert certificate to base64 URL if it exists
              if (achievement.certificateProof?.data) {
                achievement.certificateUrl = `data:${achievement.certificateProof.contentType};base64,${achievement.certificateProof.data}`;
              }
              return achievement;
            }
          );
          setAchievements(achievementsWithImages);
        } else {
          console.error("Failed to fetch achievements:", data.error);
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
        setDataLoaded(true); // Set dataLoaded to true after fetch completes
      }
    };

    fetchAchievements();
  }, []);

  // Add this useEffect to handle body scroll
  useEffect(() => {
    if (selectedAchievement) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedAchievement]);

  const filteredAchievements = useMemo(() => {
    if (loading) return [];
    if (selectedCategory === "Overall TOP 10") {
      return achievements
        .filter((a) => a.overAllTop10)
        .slice(0, 10)
        .sort((a, b) => (a.order || Infinity) - (b.order || Infinity));
    }
    return achievements
      .filter((a) => a.achievementCategory === selectedCategory)
      .sort((a, b) => {
        // First prioritize overAllTop10
        if (a.overAllTop10 && !b.overAllTop10) return -1;
        if (!a.overAllTop10 && b.overAllTop10) return 1;
        // Then sort by order
        return (a.order || Infinity) - (b.order || Infinity);
      });
  }, [selectedCategory, achievements, loading]);

  const calculatePosition = useCallback(
    (index: number) => {
      const isMobile = windowWidth < 768;
      const isTablet = windowWidth >= 768 && windowWidth < 1024;
      if (isMobile) return null;

      const itemsPerRow = isTablet ? 3 : 5;
      const row = Math.floor(index / itemsPerRow);
      const col = index % itemsPerRow;

      // Calculate grid dimensions
      const totalItems = filteredAchievements.length;
      const totalRows = Math.ceil(totalItems / itemsPerRow);

      // Increased grid width and adjusted spacing
      const gridWidth = isTablet ? 80 : 85; // Increased from 75/80
      const cellWidth = gridWidth / itemsPerRow;
      const gridLeft = (100 - gridWidth) / 2;
      const horizontalOffset = isTablet ? -2 : -4;

      // Increased row height for more vertical spacing
      const rowHeight = 45; // Increased from 30
      const startFromTop = 0;
      const baseTop = startFromTop + row * rowHeight;

      const baseLeft =
        gridLeft + col * cellWidth + cellWidth / 2 + horizontalOffset;

      // Reduced random variations to prevent overlapping
      const randomX = (Math.random() - 0.5) * 0.8; // Reduced from 1
      const randomY = (Math.random() - 0.5) * 0.8; // Reduced from 1
      const rotate = (Math.random() - 0.5) * 2; // Reduced from 3

      return {
        top: `${baseTop + randomY}%`,
        left: `${baseLeft + randomX}%`,
        transform: `rotate(${rotate}deg) translate3d(-50%, -50%, 0)`,
        willChange: "transform, opacity",
      };
    },
    [windowWidth, filteredAchievements.length]
  );

  const handleSelectCategory = useCallback(
    (category: string) => {
      startAnimationSequence();
      setTimeout(() => {
        setSelectedCategory(category);
      }, 900);
    },
    [startAnimationSequence]
  );

  const handleAchievementClick = useCallback((achievement: Achievement) => {
    setSelectedAchievement(achievement);
  }, []);

  // Slower animation config
  const staggerDuration = 0.05; // Increased from 0.03
  const animationConfig = {
    initial: { opacity: 0, y: 50, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    transition: {
      type: "spring",
      stiffness: 200, // Reduced from 300
      damping: 25, // Adjusted for smoother motion
      mass: 1,
      duration: 0.6, // Increased from 0.4
    },
  };

  return (
    <>
      {showWelcome && (
        <WelcomePage isLoading={!dataLoaded || !minimumTimeElapsed} />
      )}
      {(isReturning || (dataLoaded && showContent)) && (
        <div
          className={`min-h-screen fancy-bg relative overflow-x-hidden ${
            selectedAchievement ? "overflow-y-hidden" : ""
          }`}
        >
          <Sidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
            onSubmit={() => router.push("/submit")}
          />
          <Button
            onClick={() => router.push("/submit")}
            className="fixed top-8 right-4 z-50 bg-black text-white hover:bg-black/90 hidden sm:flex"
          >
            <Plus className="w-4 h-4 mr-2" />
            Submit Achievement
          </Button>

          <Header />

          <div className="relative w-full min-h-[calc(100vh-120px)] sm:min-h-[calc(100vh-140px)] max-w-7xl mx-auto px-4 sm:px-4 pt-[140px] md:pt-[160px]">
            <MobileAchievementGrid
              achievements={filteredAchievements}
              showContent={showContent}
              isContentFadingOut={isContentFadingOut}
              selectedCategory={selectedCategory}
              isReturning={isReturning}
              calculatePosition={calculatePosition}
              onAchievementClick={handleAchievementClick}
            />

            <DesktopAchievementGrid
              achievements={filteredAchievements}
              showContent={showContent}
              isContentFadingOut={isContentFadingOut}
              selectedCategory={selectedCategory}
              isReturning={isReturning}
              calculatePosition={calculatePosition}
              onAchievementClick={handleAchievementClick}
            />
          </div>

          <FloatingTeamButton onClick={() => setShowTeamModal(true)} />

          <TeamModal
            isOpen={showTeamModal}
            onClose={() => setShowTeamModal(false)}
            teamMembers={teamMembers}
          />

          <AchievementModal
            achievement={selectedAchievement}
            isOpen={!!selectedAchievement}
            onClose={() => setSelectedAchievement(null)}
          />
        </div>
      )}
    </>
  );
}
