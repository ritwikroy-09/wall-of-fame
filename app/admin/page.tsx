"use client";
import { useState, useEffect, useMemo } from "react";
import { categories } from "../types/categories";
import Header from "../components/Header";
import AdminSidebar from "./AdminSidebar";
import AdminAchievementGrid from "./AdminAchievementGrid";
import EditAchievementModal from "./EditAchievementModal";
import ArchiveModal from "./ArchiveModal";
import { useAnimationSequence } from "../hooks/useAnimationSequence";
import { Button } from "@/components/ui/button";
import {
  Download,
  Search,
  RefreshCcw,
  Filter,
  X,
  ArrowUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Achievement } from "@/app/types/achievements";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Admin-specific categories
const adminCategories = [
  "All Achievements",
  "Top 10",
  "Pending Students",
  "Archived",
  ...categories,
];

// Rejection date constant - matches the specific timestamp used to mark rejections
const REJECTION_DATE = new Date("1999-12-31T18:30:00.000Z");

// Helper function to determine if an achievement is rejected, pending, or approved
const getApprovalStatus = (achievement: Achievement): 'rejected' | 'pending' | 'approved' => {
  if (typeof achievement.approved === "string") {
    achievement.approved = new Date(achievement.approved);}
  if (achievement.approved instanceof Date && 
      Math.abs(achievement.approved.getTime() - REJECTION_DATE.getTime()) < 10000) { // Allow 16 min tolerance
    return 'rejected';
  } else if (achievement.approved === null) {
    return 'pending';
  } else {
    return 'approved';
  }
};

// Sort options
type SortOption = {
  label: string;
  value: string;
};

type swapOptions={
  id: string;
  name: string;
  fromIndex: number;
  toIndex: number;
  originalOrder: number;
}

const sortOptions: SortOption[] = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Name (A-Z)", value: "name_asc" },
  { label: "Name (Z-A)", value: "name_desc" },
];

// Enhanced filter type with negation support
type FilterState = {
  id: string;
  active: boolean;
  negated: boolean;
  label: string;
};

export default function AdminPanel() {
  const [achievements, setAchievements] =
    useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(adminCategories[0]);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveOperation, setArchiveOperation] = useState<
    "archive" | "unarchive"
  >("archive");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);
  
  // Replace the simple string array with a more complex filter state
  const [filters, setFilters] = useState<FilterState[]>([
    { id: "pending", active: false, negated: false, label: "Pending" },
    { id: "rejected", active: false, negated: false, label: "Rejected" },
    { id: "top10", active: false, negated: false, label: "Top 10" },
  ]);

  const {
    isSidebarAnimating,
    isContentFadingOut,
    isContentFadingIn,
    startAnimationSequence,
  } = useAnimationSequence();

  // Handle window resize
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Remove dummyAchievements and fetch real data from backend
  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/achievements");
      if (!response.ok) {
        throw new Error("Failed to fetch achievements");
      }
      const data: Achievement[] = await response.json().then((res) => res.achievements);

      // Ensure the data is an array and process images
      if (Array.isArray(data)) {
        const processedData = data.map((achievement) => {
          if (achievement.userImage?.data) {
            achievement.imageUrl = `data:${achievement.userImage.contentType};base64,${achievement.userImage.data}`;
          }
          return achievement;
        });
        setAchievements(processedData);
      } else {
        console.error("Invalid data format: Expected an array");
        setAchievements([]); // Fallback to an empty array
      }
    } catch (error) {
      console.error("Error fetching achievements:", error);
      setAchievements([]); // Fallback to an empty array in case of error
    } finally {
      setLoading(false);
    }
  };
  
  // Update the useEffect to show loading state
  useEffect(() => {
    setLoading(true); // Start loading state immediately
    fetchAchievements();
  }, []);

  // Filter achievements based on selected category and search query
  const filteredAchievements = useMemo(() => {
    let filtered = achievements;
    
    // Filter by search query first
// Filter by search query first
if (searchQuery) {
  const query = searchQuery.toLowerCase();
  filtered = filtered.filter((a) => {
    try {
      return (
        a.fullName?.toLowerCase().includes(query) ||
        a.title?.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.registrationNumber?.toLowerCase().includes(query)
      );
    } catch (error) {
      console.error("Error during filtering for item:", a);
      console.error("Error:", error);
      return false; // Exclude items that cause errors
    }
  });
}
      // Filter by category
      if (selectedCategory === "Top 10") {
        filtered = filtered.filter((a) => a.overAllTop10 && !a.archived);
      } else if (selectedCategory === "Pending Students") {
        filtered = filtered.filter((a) => getApprovalStatus(a) === 'pending');
      } else if (selectedCategory === "Archived") {
        filtered = filtered.filter((a) => a.archived);
      } else if (selectedCategory === "All Achievements") {
        filtered = filtered.filter((a) => true);

        // Apply filters with support for negation
        filters.forEach(filter => {
          if (!filter.active) return;
  
          if (filter.id === "pending") {
            filtered = filtered.filter((a) => 
              filter.negated ? getApprovalStatus(a) !== 'pending' : getApprovalStatus(a) === 'pending'
            );
          }
          else if (filter.id === "rejected") {
            filtered = filtered.filter((a) => 
              filter.negated ? getApprovalStatus(a) !== 'rejected' : getApprovalStatus(a) === 'rejected'
            );
          }
          else if (filter.id === "top10") {
            filtered = filtered.filter((a) => 
              filter.negated ? !a.overAllTop10 : a.overAllTop10
            );
          }
        });
      } else {
        // For specific categories
        filtered = filtered.filter(
          (a) => a.achievementCategory === selectedCategory && !a.archived
        );


        // Make sure Top 10 are at the beginning
        filtered.sort((a, b) => {
          if (a.overAllTop10 && !b.overAllTop10) return -1;
          if (!a.overAllTop10 && b.overAllTop10) return 1;
          return 0;
        });
      }

      return filtered;
  }, [achievements, selectedCategory, searchQuery, filters]);

  const handleSelectCategory = (category: string) => {
    startAnimationSequence();
    setTimeout(() => {
      setSelectedCategory(category);
      // Reset filters when changing categories
      setFilters(filters.map(f => ({ ...f, active: false, negated: false })));
    }, 900);
  };

  const handleAchievementClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsEditModalOpen(true);
  };

  const handleEditAchievement = (updatedAchievement: Achievement) => {
    setAchievements((prev) =>
      prev.map((a) =>{
        if (a._id === updatedAchievement._id) {
          fetch(`/api/achievements`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedAchievement),
          })
          return { ...a, ...updatedAchievement };
        }
        return a;
      })
    );
    setIsEditModalOpen(false);
    setSelectedAchievement(null);
  };

  const handleToggleArchive = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setArchiveOperation(achievement.archived ? "unarchive" : "archive");
    setIsArchiveModalOpen(true);
  };

  const handleConfirmArchiveOperation = () => {
    if (!selectedAchievement) return;

    setAchievements((prev) =>
      prev.map((a) => {
        if (a._id === selectedAchievement._id) {
          fetch(`/api/achievements`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ _id: a._id, archived: archiveOperation === "archive" }),
          })
          return { ...a, archived: archiveOperation === "archive" };
        }
        return a;
      })
    );

    setIsArchiveModalOpen(false);
    setSelectedAchievement(null);
  };

  const handleToggleTop10 = (achievement: Achievement) => {
    setAchievements((prev) => {
      // Check if we're trying to add to top 10
      if (!achievement.overAllTop10) {
        const top10Count = prev.filter((item) => item.overAllTop10).length;
        if (top10Count >= 10) {
          alert("You can only have 10 top 10 achievements. Please remove one before adding another.");
          return prev; // Return unchanged state
        }
      }
  
      // If we're here, we can proceed with the toggle
      return prev.map((a) => {
        if (a._id === achievement._id) {
          //SEND A POST REQUEST TO /api/achievements to update the elemnet with _id same to toggle its overalltop10
          fetch(`/api/achievements`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ _id: a._id, overAllTop10: !a.overAllTop10 }),
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Failed to update achievement");
              }
              return response.json();
            })
            .then((data) => {
              console.log("Achievement updated successfully:", data);
            })
            .catch((error) => {
              console.error("Error updating achievement:", error);
            });
          return { ...a, overAllTop10: !a.overAllTop10 };
        }
        return a;
      });
    });
  };
  
const refreshData = async () => {
  // Simply call the existing fetchAchievements function
  fetchAchievements();
};

  const exportAchievements = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(filteredAchievements));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "achievements_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Updated filter toggle function that handles negation
  const toggleFilter = (filterId: string, negate = false) => {
    setFilters(prev => 
      prev.map(filter => {
        if (filter.id === filterId) {
          // If already active and we're pressing the same button (normal or negated)
          if (filter.active && filter.negated === negate) {
            return { ...filter, active: false, negated: false };
          }
          // Otherwise activate with the appropriate negation state
          return { ...filter, active: true, negated: negate };
        }
        return filter;
      })
    );
  };

  // Create a background gradient with a subtle pattern
  const bgStyle = {
    background: `
      linear-gradient(to bottom right, rgba(255, 255, 255, 0.9), rgba(240, 240, 250, 0.9)),
      url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 2 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2z' fill='%23bbb9f2' fill-opacity='0.07' fill-rule='evenodd'/%3E%3C/svg%3E")
    `,
  };

  const handleReorder = (sectionType: 'top10' | 'unarchived' | 'archived', items: Achievement[]) => {
    // Only allow reordering in Top 10 section
    // if (sectionType !== 'top10') {
    //   return;
    // }
    
    // console.log("Reordering items:", items.map(item => ({
    //   id: item._id,
    //   name: item.fullName,
    //   order: item.order
    // })));
    
    // Find which item moved by comparing current positions with previous positions
    const movedItem = items.find((item, index) => {
      // Find this item in the current achievements state
      const currentAchievement = achievements.find(a => a._id === item._id);
      
      // If this item has moved from its previous position
      return currentAchievement && 
        currentAchievement.order !== undefined && 
        currentAchievement.order !== index + 1;
    });
    
    if (!movedItem) {
      // console.log("No item was moved");
      return;
    }
    
    // console.log("Item moved:", movedItem.fullName);
    
    // Now we need to determine where it moved to and what item it displaced
    const oldIndex = achievements.findIndex(a => a._id === movedItem._id);
    const newIndex = items.findIndex(item => item._id === movedItem._id);
    
    // console.log(`Item moved from position ${oldIndex} to ${newIndex}`);
    
    // Create an updated achievements array with the new order
    // We'll assign new order values to maintain a consistent sequence
    const updatedAchievements = [...achievements];
    
    // Update the order for all affected items
    items.forEach((item, index) => {
      const achievementIndex = updatedAchievements.findIndex(a => a._id === item._id);
      if (achievementIndex !== -1) {
        const currentOrder = updatedAchievements[achievementIndex].order;
        const newOrder = index + 1; // 1-based indexing for order
        
        if (currentOrder !== newOrder) {
          // console.log(`Updating order for "${item.fullName}" from ${currentOrder} to ${newOrder}`);
          updatedAchievements[achievementIndex] = {
            ...updatedAchievements[achievementIndex],
            order: newOrder
          };
        }
      }
    });
    
    // Update the state with the new order
    setAchievements(updatedAchievements);
    
    // Prepare data for backend update - only send items with changed order
    const changedItems = items.map((item, index) => {
      const newOrder = index + 1; // 1-based indexing for order
      const oldOrder = achievements.find(a => a._id === item._id)?.order;
      
      return {
        _id: item._id,
        order: newOrder,
        hasChanged: newOrder !== oldOrder
      };
    }).filter(item => item.hasChanged);
    
    // Send update to backend if there are changes
    if (changedItems.length > 0) {
      try {
        fetch('/api/achievements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            changedItems.map(({_id, order}) => ({_id, order}))),
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to update achievement order');
          }
          return response.json();
        })
        .then(data => {
          console.log('Order updated successfully:', data);
        })
        .catch(error => {
          console.error('Error updating achievement order:', error);
        });
      } catch (error) {
        console.error('Error sending order update:', error);
      }
    }
    
    // Log the updated order for verification
    // console.log("New order:", items.map((item, index) => ({
    //   name: item.fullName,
    //   oldOrder: achievements.find(a => a._id === item._id)?.order,
    //   newOrder: index + 1
    // })));
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={bgStyle}>
      <AdminSidebar
        categories={adminCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      <Header />

      <div className="relative w-full min-h-[calc(100vh-120px)] max-w-7xl mx-auto px-4 pt-[140px] md:pt-[160px]">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            {selectedCategory}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and organize student achievements in one place
          </p>
        </div>

        {/* Admin toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-grow md:max-w-xs">
              <Input
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8 border-gray-200 focus-visible:ring-offset-0"
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={14} />
                </button>
              )}
              {!searchQuery && (
                <Search className="h-4 w-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
              )}
            </div>

            {/* Filter dropdown for "All Achievements" view */}
            {selectedCategory === "All Achievements" && (
              <div className="flex items-center space-x-2">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1.5 h-10 whitespace-nowrap"
                    >
                      <Filter className="h-3.5 w-3.5" />
                      <span>Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 z-[19]">
                    <div className="p-2">
                      {filters.map(filter => (
                        <div key={filter.id} className="mb-3 last:mb-0">
                          <div className="text-xs text-gray-500 font-medium mb-1">
                            {filter.label}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={filter.active && !filter.negated ? "default" : "outline"} 
                              className={cn(
                                "h-8 px-3 text-xs rounded-md",
                                filter.active && !filter.negated && "bg-emerald-500 text-white hover:bg-emerald-600"
                              )}
                                                          onClick={() => toggleFilter(filter.id, false)}
                            >
                              Yes
                            </Button>
                            <Button
                              size="sm"
                              variant={filter.active && filter.negated ? "destructive" : "outline"}
                              className="h-8 px-3 text-xs rounded-md"
                              onClick={() => toggleFilter(filter.id, true)}
                            >
                              No
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {filters.some(f => f.active) && (
                  <div className="hidden md:flex flex-wrap items-center gap-2">
                    {filters.filter(f => f.active).map((filter) => (
                      <Badge
                        key={filter.id}
                        variant={filter.negated ? "destructive" : "secondary"}
                        className={`flex items-center gap-1 px-2 py-1 ${
                          filter.negated 
                            ? "bg-red-100 hover:bg-red-200 text-red-700" 
                            : "bg-green-100 hover:bg-green-200"
                        }`}
                        onClick={() => toggleFilter(filter.id, filter.negated)}
                      >
                        {filter.negated ? `Not ${filter.label}` : filter.label}
                        <X size={12} className="cursor-pointer" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex space-x-2 w-full md:w-auto justify-between md:justify-end items-center">            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 h-10"
              onClick={refreshData}
              disabled={loading}
            >
              <RefreshCcw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        {/* Conditional mobile display of active filters */}
        {filters.some(f => f.active) &&
          selectedCategory === "All Achievements" && (
            <div className="md:hidden flex flex-wrap items-center gap-2 mb-4">
              {filters.filter(f => f.active).map((filter) => (
                <Badge
                  key={filter.id}
                  variant={filter.negated ? "destructive" : "secondary"}
                  className={`flex items-center gap-1 px-2 py-1 ${
                    filter.negated 
                      ? "bg-red-100 hover:bg-red-200 text-red-700" 
                      : "bg-green-100 hover:bg-green-200"
                  }`}
                  onClick={() => toggleFilter(filter.id, filter.negated)}
                >
                  {filter.negated ? `Not ${filter.label}` : filter.label}
                  <X size={12} className="cursor-pointer" />
                </Badge>
              ))}
            </div>
          )}

        <AdminAchievementGrid
          achievements={filteredAchievements}
          showContent={true}
          isContentFadingOut={isContentFadingOut}
          selectedCategory={selectedCategory}
          onAchievementClick={handleAchievementClick}
          onToggleArchive={handleToggleArchive}
          onToggleTop10={handleToggleTop10}
          windowWidth={windowWidth}
          getApprovalStatus={getApprovalStatus}
          onReorder={handleReorder}
        />

        {/* Show count of displayed achievements */}
        <div className="mt-6 mb-8 text-sm text-gray-500">
          Showing {filteredAchievements.length} achievement
          {filteredAchievements.length !== 1 && "s"}
          {selectedCategory !== "All Achievements"
            ? ` in "${selectedCategory}"`
            : ""}
          {searchQuery ? ` matching "${searchQuery}"` : ""}
        </div>
      </div>

      {/* Modals */}
      {selectedAchievement && (
        <>
          <EditAchievementModal
            achievement={selectedAchievement}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedAchievement(null);
            }}
            onSave={handleEditAchievement}
          />

          <ArchiveModal
            achievement={selectedAchievement}
            operation={archiveOperation}
            isOpen={isArchiveModalOpen}
            onClose={() => setIsArchiveModalOpen(false)}
            onConfirm={handleConfirmArchiveOperation}
          />
        </>
      )}
    </div>
  );
}
