"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Achievement } from "@/app/types/achievements";
import AdminAchievementCard from "./AdminAchievementCard";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from "@dnd-kit/core";
import { 
  arrayMove,
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  horizontalListSortingStrategy
} from "@dnd-kit/sortable";
import {categories} from "@/app/types/categories"
import { SortableItem } from "@/app/admin/SortableItem";

type Category = (typeof categories)[number];

// Interface for categorized achievements
interface CategorizedAchievements {
  top10: Achievement[];
  unarchived: Achievement[];
  archived: Achievement[];
  categorizedUnarchived?: Record<string, Achievement[]>;
}

interface AdminAchievementGridProps {
  achievements: Achievement[];
  showContent: boolean;
  isContentFadingOut: boolean;
  selectedCategory: Category;
  onAchievementClick: (achievement: Achievement) => void;
  onToggleArchive: (achievement: Achievement) => void;
  onToggleTop10: (achievement: Achievement) => void;
  windowWidth: number;
  getApprovalStatus: (achievement: Achievement) => 'rejected' | 'pending' | 'approved';
  onReorder: (sectionType: 'top10' | 'unarchived' | 'archived', items: Achievement[]) => void;
}

export default function AdminAchievementGrid({
  achievements,
  showContent,
  isContentFadingOut,
  selectedCategory,
  onAchievementClick,
  onToggleArchive,
  onToggleTop10,
  windowWidth,
  getApprovalStatus,
  onReorder,
}: AdminAchievementGridProps) {
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum drag distance for activation
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper function to separate achievements into sections
  const getSectionedAchievements = (
    achievements: Achievement[],
    selectedCategory: string
  ): CategorizedAchievements => {
    // Skip sectioning for special categories
    if (
      ["Top 10", "Pending Students", "Archived"].includes(
        selectedCategory
      )
    ) {
      return { 
        top10: [], 
        unarchived: achievements.sort((a, b) => a.order - b.order), 
        archived: [] 
      };
    }
    
    // For "All Achievements" category, organize unarchived by categories
    if (selectedCategory === "All Achievements") {
      const top10 = achievements
        .filter((a) => a.overAllTop10)
        .sort((a, b) => a.order - b.order);
      
      const unarchived = achievements
        .filter((a) => !a.overAllTop10 && !a.archived)
        .sort((a, b) => a.order - b.order);
      
      const archived = achievements
        .filter((a) => !a.overAllTop10 && a.archived)
        .sort((a, b) => a.order - b.order);

      // Group unarchived achievements by category
      const categorizedUnarchived: Record<string, Achievement[]> = {};
      
      // Initialize with empty arrays for each category (except "Overall TOP 10")
      categories.slice(1).forEach(cat => {
        categorizedUnarchived[cat] = [];
      });

      // Populate categories
      unarchived.forEach(achievement => {
        const category = achievement.achievementCategory;
        if (category && category !== "Overall TOP 10") {
          if (!categorizedUnarchived[category]) {
            categorizedUnarchived[category] = [];
          }
          categorizedUnarchived[category].push(achievement);
        }
      });

      return { top10, unarchived, archived, categorizedUnarchived };
    }

    // For specific categories, separate into three sections
    const top10 = achievements
      .filter((a) => a.overAllTop10)
      .sort((a, b) => a.order - b.order);
    
    const unarchived = achievements
      .filter((a) => !a.overAllTop10 && !a.archived)
      .sort((a, b) => a.order - b.order);
    
    const archived = achievements
      .filter((a) => !a.overAllTop10 && a.archived)
      .sort((a, b) => a.order - b.order);

    return { top10, unarchived, archived };
  };
  
  // Separate achievements into sections when viewing a specific category
  const { top10, unarchived, archived, categorizedUnarchived } = getSectionedAchievements(
    achievements,
    selectedCategory
  );
  
  const hasTop10Section = top10.length > 0;
  const hasUnarchivedSection = unarchived.length > 0;
  const hasArchivedSection = archived.length > 0;
  const isAllAchievements = selectedCategory === "All Achievements";

  // Handle drag end event
  const handleDragEnd = (event: DragEndEvent, sectionType: 'top10' | 'unarchived' | 'archived', items: Achievement[]) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const activeIndex = items.findIndex((item) => item._id === active.id);
      const overIndex = items.findIndex((item) => item._id === over.id);
      
      // console.log(items);
      const newItems = arrayMove(items, activeIndex, overIndex);
      // console.log(newItems);
      
      // Call the onReorder callback with the updated items
      if (onReorder) {
        onReorder(sectionType, newItems);
      }
    }
  };

  // Mobile view with modern grid layout
  if (isMobile) {
    return (
      <div className="w-full pb-10">
        <AnimatePresence mode="wait">
          {showContent && !isContentFadingOut && (
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
              transition={{ duration: 0.4 }}
            >
              {achievements.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {/* Top 10 section */}
                  {hasTop10Section && (
                    <>
                      <SectionHeader title="Top 10 Achievements" />
                      <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, 'top10', top10)}
                      >
                        <div className="grid grid-cols-1 gap-6 mb-8">
                          <SortableContext 
                            items={top10.map(a => a._id)} 
                            strategy={verticalListSortingStrategy}
                          >
                            <AnimatedCards
                              achievements={top10}
                              onAchievementClick={onAchievementClick}
                              onToggleArchive={onToggleArchive}
                              onToggleTop10={onToggleTop10}
                              getApprovalStatus={getApprovalStatus}
                            />
                          </SortableContext>
                        </div>
                      </DndContext>
                      {(hasUnarchivedSection || hasArchivedSection) && (
                        <div className="border-t border-gray-100 my-8"></div>
                      )}
                    </>
                  )}

                  {/* Unarchived section */}
                  {hasUnarchivedSection && (
                    <>
                      {!isAllAchievements ? (
                        <>
                          <SectionHeader title="Unarchived Achievements" />
                          <DndContext 
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event) => handleDragEnd(event, 'unarchived', unarchived)}
                          >
                            <div className="grid grid-cols-1 gap-6 mb-6">
                              <SortableContext 
                                items={unarchived.map(a => a._id)} 
                                strategy={verticalListSortingStrategy}
                              >
                                <AnimatedCards
                                  achievements={unarchived}
                                  onAchievementClick={onAchievementClick}
                                  onToggleArchive={onToggleArchive}
                                  onToggleTop10={onToggleTop10}
                                  startIndex={top10.length}
                                  getApprovalStatus={getApprovalStatus}
                                />
                              </SortableContext>
                            </div>
                          </DndContext>
                        </>
                      ) : (
                        <>
                          <SectionHeader title="Unarchived Achievements" />
                          {categorizedUnarchived && categories.slice(1).map(category => {
                            const categoryAchievements = categorizedUnarchived[category] || [];
                            if (categoryAchievements.length === 0) return null;
                            
                            return (
                              <div key={category} className="mb-8">
                                <h3 className="text-lg font-medium text-gray-700 mb-4 ml-2">{category}</h3>
                                <DndContext 
                                  sensors={sensors}
                                  collisionDetection={closestCenter}
                                  onDragEnd={(event) => handleDragEnd(event, 'unarchived', unarchived)}
                                >
                                  <div className="grid grid-cols-1 gap-6 mb-6">
                                    <SortableContext 
                                      items={categoryAchievements.map(a => a._id)} 
                                      strategy={verticalListSortingStrategy}
                                    >
                                      <AnimatedCards
                                        achievements={categoryAchievements}
                                        onAchievementClick={onAchievementClick}
                                        onToggleArchive={onToggleArchive}
                                        onToggleTop10={onToggleTop10}
                                        getApprovalStatus={getApprovalStatus}
                                      />
                                    </SortableContext>
                                  </div>
                                </DndContext>
                              </div>
                            );
                          })}
                        </>
                      )}
                      {hasArchivedSection && (
                        <div className="border-t border-gray-100 my-8"></div>
                      )}
                    </>
                  )}

                  {/* Archived section */}
                  {hasArchivedSection && (
                    <>
                      <SectionHeader title="Archived Achievements" />
                      <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, 'archived', archived)}
                      >
                        <div className="grid grid-cols-1 gap-6 mb-6">
                          <SortableContext 
                            items={archived.map(a => a._id)} 
                            strategy={verticalListSortingStrategy}
                          >
                            <AnimatedCards
                              achievements={archived}
                              onAchievementClick={onAchievementClick}
                              onToggleArchive={onToggleArchive}
                              onToggleTop10={onToggleTop10}
                              startIndex={top10.length + unarchived.length}
                              getApprovalStatus={getApprovalStatus}
                            />
                          </SortableContext>
                        </div>
                      </DndContext>
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const strategy = isTablet ? horizontalListSortingStrategy : horizontalListSortingStrategy;

  // Tablet view with 2 columns
  if (isTablet) {
    return (
      <div className="w-full pb-10">
        <AnimatePresence mode="wait">
          {showContent && !isContentFadingOut && (
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
              transition={{ duration: 0.4 }}
            >
              {achievements.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  {/* Top 10 section */}
                  {hasTop10Section && (
                    <>
                      <SectionHeader title="Top 10 Achievements" />
                      <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, 'top10', top10)}
                      >
                        <div className="grid grid-cols-2 gap-6 mb-8">
                          <SortableContext 
                            items={top10.map(a => a._id)} 
                            strategy={strategy}
                          >
                            <AnimatedCards
                              achievements={top10}
                              onAchievementClick={onAchievementClick}
                              onToggleArchive={onToggleArchive}
                              onToggleTop10={onToggleTop10}
                              getApprovalStatus={getApprovalStatus}
                            />
                          </SortableContext>
                        </div>
                      </DndContext>
                      {(hasUnarchivedSection || hasArchivedSection) && (
                        <div className="border-t border-gray-100 my-8"></div>
                      )}
                    </>
                  )}

                  {/* Unarchived section */}
                  {hasUnarchivedSection && (
                    <>
                      {!isAllAchievements ? (
                        <>
                          <SectionHeader title="Unarchived Achievements" />
                          <DndContext 
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event) => handleDragEnd(event, 'unarchived', unarchived)}
                          >
                            <div className="grid grid-cols-2 gap-6 mb-6">
                              <SortableContext 
                                items={unarchived.map(a => a._id)} 
                                strategy={strategy}
                              >
                                <AnimatedCards
                                  achievements={unarchived}
                                  onAchievementClick={onAchievementClick}
                                  onToggleArchive={onToggleArchive}
                                  onToggleTop10={onToggleTop10}
                                  startIndex={top10.length}
                                  getApprovalStatus={getApprovalStatus}
                                />
                              </SortableContext>
                            </div>
                          </DndContext>
                        </>
                      ) : (
                        <>
                          <SectionHeader title="Unarchived Achievements" />
                          {categorizedUnarchived && categories.slice(1).map(category => {
                            const categoryAchievements = categorizedUnarchived[category] || [];
                            if (categoryAchievements.length === 0) return null;
                            
                            return (
                              <div key={category} className="mb-8">
                                <h3 className="text-lg font-medium text-gray-700 mb-4 ml-2">{category}</h3>
                                <DndContext 
                                  sensors={sensors}
                                  collisionDetection={closestCenter}
                                  onDragEnd={(event) => handleDragEnd(event, 'unarchived', unarchived)}
                                >
                                  <div className="grid grid-cols-2 gap-6 mb-6">
                                    <SortableContext 
                                      items={categoryAchievements.map(a => a._id)} 
                                      strategy={strategy}
                                    >
                                      <AnimatedCards
                                        achievements={categoryAchievements}
                                        onAchievementClick={onAchievementClick}
                                        onToggleArchive={onToggleArchive}
                                        onToggleTop10={onToggleTop10}
                                        getApprovalStatus={getApprovalStatus}
                                      />
                                    </SortableContext>
                                  </div>
                                </DndContext>
                              </div>
                            );
                          })}
                        </>
                      )}
                      {hasArchivedSection && (
                        <div className="border-t border-gray-100 my-8"></div>
                      )}
                    </>
                  )}

                  {/* Archived section */}
                  {hasArchivedSection && (
                    <>
                      <SectionHeader title="Archived Achievements" />
                      <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, 'archived', archived)}
                      >
                        <div className="grid grid-cols-2 gap-6 mb-6">
                          <SortableContext 
                            items={archived.map(a => a._id)} 
                            strategy={strategy}
                          >
                            <AnimatedCards
                              achievements={archived}
                              onAchievementClick={onAchievementClick}
                              onToggleArchive={onToggleArchive}
                              onToggleTop10={onToggleTop10}
                              startIndex={top10.length + unarchived.length}
                              getApprovalStatus={getApprovalStatus}
                            />
                          </SortableContext>
                        </div>
                      </DndContext>
                    </>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop view with 3-4 columns
  return (
    <div className="w-full pb-10">
      <AnimatePresence mode="wait">
        {showContent && !isContentFadingOut && (
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
            transition={{ duration: 0.4 }}
          >
            {achievements.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {/* Top 10 section */}
                {hasTop10Section && (
                  <>
                    <SectionHeader title="Top 10 Achievements" />
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, 'top10', top10)}
                    >
                      <div className="grid grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        <SortableContext 
                          items={top10.map(a => a._id)} 
                          strategy={strategy}
                        >
                          <AnimatedCards
                            achievements={top10}
                            onAchievementClick={onAchievementClick}
                            onToggleArchive={onToggleArchive}
                            onToggleTop10={onToggleTop10}
                            getApprovalStatus={getApprovalStatus}
                          />
                        </SortableContext>
                      </div>
                    </DndContext>
                    {(hasUnarchivedSection || hasArchivedSection) && (
                      <div className="border-t border-gray-100 my-12"></div>
                    )}
                  </>
                )}

                {/* Unarchived section */}
                {hasUnarchivedSection && (
                  <>
                    {!isAllAchievements ? (
                      <>
                        <SectionHeader title="Unarchived Achievements" />
                        <DndContext 
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event) => handleDragEnd(event, 'unarchived', unarchived)}
                        >
                          <div className="grid grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                            <SortableContext 
                              items={unarchived.map(a => a._id)} 
                              strategy={strategy}
                            >
                              <AnimatedCards
                                achievements={unarchived}
                                onAchievementClick={onAchievementClick}
                                onToggleArchive={onToggleArchive}
                                onToggleTop10={onToggleTop10}
                                startIndex={top10.length}
                                getApprovalStatus={getApprovalStatus}
                              />
                            </SortableContext>
                          </div>
                        </DndContext>
                      </>
                    ) : (
                      <>
                        <SectionHeader title="Unarchived Achievements" />
                        {categorizedUnarchived && categories.slice(1).map(category => {
                          const categoryAchievements = categorizedUnarchived[category] || [];
                          if (categoryAchievements.length === 0) return null;
                          
                          return (
                            <div key={category} className="mb-12">
                              <h3 className="text-lg font-medium text-gray-700 mb-4 ml-2">{category}</h3>
                              <DndContext 
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={(event) => handleDragEnd(event, 'unarchived', unarchived)}
                              >
                                <div className="grid grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                                  <SortableContext 
                                    items={categoryAchievements.map(a => a._id)} 
                                    strategy={strategy}
                                  >
                                    <AnimatedCards
                                      achievements={categoryAchievements}
                                      onAchievementClick={onAchievementClick}
                                      onToggleArchive={onToggleArchive}
                                      onToggleTop10={onToggleTop10}
                                      getApprovalStatus={getApprovalStatus}
                                    />
                                  </SortableContext>
                                </div>
                              </DndContext>
                            </div>
                          );
                        })}
                      </>
                    )}
                    {hasArchivedSection && (
                      <div className="border-t border-gray-100 my-12"></div>
                    )}
                  </>
                )}

                {/* Archived section */}
                {hasArchivedSection && (
                  <>
                    <SectionHeader title="Archived Achievements" />
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, 'archived', archived)}
                    >
                      <div className="grid grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                        <SortableContext 
                          items={archived.map(a => a._id)} 
                          strategy={strategy}
                        >
                          <AnimatedCards
                            achievements={archived}
                            onAchievementClick={onAchievementClick}
                            onToggleArchive={onToggleArchive}
                            onToggleTop10={onToggleTop10}
                            startIndex={top10.length + unarchived.length}
                            getApprovalStatus={getApprovalStatus}
                          />
                        </SortableContext>
                      </div>
                    </DndContext>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for displaying achievement cards with animations
function AnimatedCards({
  achievements,
  onAchievementClick,
  onToggleArchive,
  onToggleTop10,
  startIndex = 0,
  getApprovalStatus,
}: {
  achievements: Achievement[];
  onAchievementClick: (achievement: Achievement) => void;
  onToggleArchive: (achievement: Achievement) => void;
  onToggleTop10: (achievement: Achievement) => void;
  startIndex?: number;
  getApprovalStatus: (achievement: Achievement) => 'rejected' | 'pending' | 'approved';
}) {
  return (
    <>
      {achievements.map((achievement, index) => (
        <SortableItem key={achievement._id} id={achievement._id}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: (index + startIndex) * 0.05,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            <AdminAchievementCard
              achievement={achievement}
              onClick={() => onAchievementClick(achievement)}
              onToggleArchive={() => onToggleArchive(achievement)}
              onToggleTop10={() => onToggleTop10(achievement)}
              approvalStatus={getApprovalStatus(achievement)}
            />
          </motion.div>
        </SortableItem>
      ))}
    </>
  );
}

// Section header component
function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-xl font-medium text-gray-800 mb-5 tracking-tight">
      {title}
    </h2>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg
          className="h-8 w-8 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M18 12H6m9-9l-9 9 9 9"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-700">
        No achievements found
      </h3>
      <p className="text-gray-500 mt-2 max-w-md">
        Try changing your filters or search query to find what you're looking
        for.
      </p>
    </div>
  );
}
