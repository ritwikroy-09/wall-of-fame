"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Achievement } from "@/app/types/achievements";
import React from "react";
import { Button } from "@/components/ui/button";
import { Archive, Star, Pencil } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface AdminAchievementCardProps {
  achievement: Achievement;
  onClick: () => void;
  onToggleArchive: () => void;
  onToggleTop10: () => void;
  approvalStatus: string;
}

function AdminAchievementCard({
  achievement,
  onClick,
  onToggleArchive,
  onToggleTop10,
  approvalStatus,
}: AdminAchievementCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: achievement._id,
    data: achievement,
  });

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      whileHover={{
        y: -5,
        transition: { duration: 0.2 },
      }}
      className="relative rounded-xl overflow-hidden cursor-pointer bg-white"
      style={{
        ...sortableStyle,
        width: "100%",
        aspectRatio: "3/4",
        boxShadow:
          "0 10px 30px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.06)",
      }}
    >
<div
  className={cn(
    "absolute top-3 left-3 z-40 p-1 rounded-md backdrop-blur-sm",
    approvalStatus === "approved"
      ? "bg-emerald-500"
      : approvalStatus === "pending"
      ? "bg-amber-500"
      : "bg-red-500",
    achievement.archived && "bg-gray-400"
  )}
  {...listeners}
>
  <div className="w-5 h-5 flex flex-col justify-between">
    <div className="h-0.5 w-full bg-white rounded-full"></div>
    <div className="h-0.5 w-full bg-white rounded-full"></div>
    <div className="h-0.5 w-full bg-white rounded-full"></div>
  </div>
</div>

      {/* Top 10 badge */}
      {(
        <div className="absolute top-3 right-3 z-10">
          <div className="h-8 w-8 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
            <p>{achievement.order}</p>
          </div>
        </div>
      )}

      {/* Image with gradient overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80 z-10" />
        {achievement.imageUrl && (
          <Image
            src={achievement.imageUrl}
            alt={achievement.fullName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority={true}
          />
        )}
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20 text-white">
        <h3 className="font-medium text-base mb-1 truncate">
          {achievement.fullName}
        </h3>
        <p className="text-sm text-white/90 line-clamp-2 mb-3">
          {achievement.title}
        </p>

        {/* Show approval status*/}
        <p className="text-xs text-white/80 mb-2">
          Status: {approvalStatus || "unknown"}
        </p>

        {/* Action buttons */}
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white h-8"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Edit
          </Button>

          <div className="flex space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30",
                      achievement.overAllTop10 &&
                        "bg-amber-500/70 hover:bg-amber-500"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTop10();
                    }}
                  >
                    <Star
                      className={cn(
                        "h-3.5 w-3.5",
                        achievement.overAllTop10 && "fill-white"
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>
                    {achievement.overAllTop10 ? "Remove from" : "Add to"} Top 10
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleArchive();
                    }}
                  >
                    <Archive className={cn(
                        "h-3.5 w-3.5",
                        achievement.archived && "fill-white"
                      )} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>
                    {achievement.archived ? "Unarchive" : "Archive"} achievement
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Card overlay - makes the entire card clickable for edit */}
      <div className="absolute inset-0 z-9" onClick={onClick} />
    </motion.div>
  );
}

// Use React.memo to prevent unnecessary re-renders
export default React.memo(AdminAchievementCard);
