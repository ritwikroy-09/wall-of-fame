"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Menu,
  Shield,
  Award,
  ArchiveIcon,
  Clock,
  Users,
  Home,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AdminSidebarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function AdminSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleCategorySelect = (category: string) => {
    onSelectCategory(category);
    setIsCollapsed(true);
  };

  // Get icon for special categories
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "All Achievements":
        return <Award className="w-4 h-4 mr-3" />;
      case "Top 10":
        return <Users className="w-4 h-4 mr-3" />;
      case "Pending Students":
        return <Clock className="w-4 h-4 mr-3" />;
      case "Archived":
        return <ArchiveIcon className="w-4 h-4 mr-3" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "fixed left-4 top-24 z-50 h-10 w-10 rounded-full bg-white shadow-md border border-gray-200",
          !isCollapsed && "hidden"
        )}
        onClick={() => setIsCollapsed(false)}
      >
        <Menu className="h-5 w-5 text-gray-700" />
      </Button>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isCollapsed ? "-100%" : "0%",
          boxShadow: isCollapsed ? "none" : "5px 0 25px rgba(0,0,0,0.1)",
        }}
        transition={{
          type: "spring",
          bounce: 0.15,
          duration: 0.5,
        }}
        className="fixed top-0 left-0 h-full w-[280px] bg-white z-50 border-r border-gray-100"
      >
        <div className="flex flex-col h-full p-5">
          {/* Header */}
          <div className="flex justify-between items-center py-6 mb-4">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2.5 text-black" />
              <h2 className="text-xl font-bold text-black tracking-tight">
                Admin Panel
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setIsCollapsed(true)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Main categories */}
          <nav className="space-y-1 mb-6">
            {["All Achievements", "Top 10", "Pending Students", "Archived"].map(
              (category) => (
                <Button
                  key={category}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left font-medium text-sm h-11",
                    selectedCategory === category
                      ? "bg-gray-100 text-black"
                      : "text-gray-600 hover:text-black hover:bg-gray-50"
                  )}
                  onClick={() => handleCategorySelect(category)}
                >
                  {getCategoryIcon(category)}
                  {category}
                </Button>
              )
            )}
          </nav>

          {/* Category divider */}
          <div className="flex items-center py-2 mb-2">
            <div className="h-px flex-1 bg-gray-100"></div>
            <span className="px-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Categories
            </span>
            <div className="h-px flex-1 bg-gray-100"></div>
          </div>

          {/* Achievement categories */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 space-y-0.5">
            {categories
              .filter(
                (category) =>
                  ![
                    "All Achievements",
                    "Top 10",
                    "Overall TOP 10",
                    "Pending Students",
                    "Archived",
                  ].includes(category)
              )
              .map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left text-sm font-normal h-9 px-4",
                    selectedCategory === category
                      ? "bg-gray-100 text-black"
                      : "text-gray-600 hover:text-black hover:bg-gray-50"
                  )}
                  onClick={() => handleCategorySelect(category)}
                >
                  <span className="ml-7">{category}</span>
                </Button>
              ))}
          </div>

          {/* Footer actions */}
          <div className="pt-4 mt-6 border-t border-gray-100">
            <div className="space-y-1">
              <Link href="/" passHref>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50"
                >
                  <Home className="w-4 h-4 mr-3" />
                  Public View
                </Button>
              </Link>
              <Link href="/dashboard" passHref>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50"
                >
                  <Users className="w-4 h-4 mr-3" />
                  Professor Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="w-full justify-start text-left text-sm font-medium text-gray-600 hover:text-black hover:bg-gray-50"
                // In a real app, this would handle logout functionality
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
