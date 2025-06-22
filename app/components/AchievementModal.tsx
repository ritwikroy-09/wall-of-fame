"use client";

import { useEffect, useState } from "react";
import { Achievement } from "@/app/types/achievements";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { achievementFormFields } from "../types/achievementFields";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";


interface AchievementModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AchievementModal({
  achievement,
  isOpen,
  onClose,
}: AchievementModalProps) {
  console.log(achievement);
  const [processedAchievement, setProcessedAchievement] =
    useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to create object URL from certificate data - identical to StudentDetailsModal
  const createObjectURL = (certificateData: any) => {
    if (!certificateData) return null;
    const { data, contentType } = certificateData;
    const blob = new Blob([Buffer.from(data, "base64")], { type: contentType });
    return URL.createObjectURL(blob);
  };
  // Function to render dynamic fields based on achievement category
  const renderCategoryFields = () => {
    if (!achievement) return null;
    const category = achievement.achievementCategory;
    if (!category || !achievementFormFields[category]) return null;
    
    // Skip title and description fields as they're already in the main form
    const fields = achievementFormFields[category].filter(
      field => field.name !== "title" && field.name !== "description"
    );
    
    if (fields.length === 0) return null;
    
    return (
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="col-span-2">
          <Label className="font-medium text-sm text-gray-500">
            Category-specific Information
          </Label>
        </div>
        
        {fields.map((field) => {
          if (field.type === "document") {
            // For document fields, just show a read-only display of the filename
            return (
              <div key={field.name} className="col-span-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                <div className="text-sm text-gray-500 mt-1">
                  {achievement[field.name as keyof Achievement] ? 
                    "Document uploaded" : "No document available"}
                </div>
              </div>
            );
          } else if (field.type === "option" && field.options) {
            return (
              <div key={field.name} className="col-span-1">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Select
                  value={String(achievement[field.name as keyof Achievement] || "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          } else {
            // For text fields
            return (
              <div key={field.name} className={field.name === "description" ? "col-span-2" : "col-span-1"}>
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.name === "description" ? (
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={String(achievement[field.name as keyof Achievement] || "")}
                    placeholder={field.placeholder}
                    className="min-h-[60px]"
                  />
                ) : (
                  <Input
                    id={field.name}
                    name={field.name}
                    value={String(achievement[field.name as keyof Achievement] || "")}
                    placeholder={field.placeholder}
                  />
                )}
              </div>
            );
          }
        })}
      </div>
    );
  };

  // Handle image and certificate processing - same approach as StudentDetailsModal
  useEffect(() => {
    if (!isOpen || !achievement) {
      setProcessedAchievement(null);
      setIsLoading(true);
      return;
    }

    const processedData = { ...achievement };

    // Process image if needed
    if (achievement.userImage?.data && !achievement.imageUrl) {
      processedData.imageUrl = `data:${achievement.userImage.contentType};base64,${achievement.userImage.data}`;
    }

    // Process certificate if needed
    if (achievement.certificateProof?.data) {
      const url = createObjectURL(achievement.certificateProof);
      if (url) {
        processedData.certificateUrl = url;
      }
    }

    setProcessedAchievement(processedData);
    setIsLoading(false);
  }, [isOpen, achievement]);

  // Handle cleanup of certificate URLs
  useEffect(() => {
    return () => {
      if (
        processedAchievement?.certificateUrl &&
        processedAchievement.certificateUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(processedAchievement.certificateUrl);
      }
    };
  }, [processedAchievement?.certificateUrl]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);
  const parseAchievementData = (data: Record<string, any> | string): Record<string, any> => {
    if (!data) return {};
    
    // If data is already an object, return it
    if (typeof data === 'object' && !Array.isArray(data)) {
      return data;
    }
    
    // If data is a string, try to parse it
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        // Make sure the result is actually an object
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          return parsed;
        } else {
          console.error("Parsed data is not an object:", parsed);
          return {};
        }
      } catch (error) {
        console.error("Failed to parse AchievementData:", error);
        return {};
      }
    }
    
    // If we get here, data is neither an object nor a valid JSON string
    console.error("AchievementData is in an unexpected format:", data);
    return {};
  };
  const getFieldType = (category: string, fieldName: string): string => {
    const field = achievementFormFields[category]?.find(f => f.name === fieldName);
    return field ? field.type : "text"; // Default to text if not found
  };
    // Function to get field label
    const getFieldLabel = (category: string, fieldName: string): string => {
      const fields = achievementFormFields[category];
      if (!fields) return fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1');
      
      const field = fields.find(field => field.name === fieldName);
      return field?.label || fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace(/([A-Z])/g, ' $1');
    };
  
    // Function to create document URL
    const createDocumentURL = (documentData: any) => {
      if (!documentData) return null;
      try {
        const { data, contentType } = documentData;
        if (!data || !contentType) return null;
        const blob = new Blob([Buffer.from(data, "base64")], { type: contentType });
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error("Failed to create document URL:", error);
        return null;
      }
    };
  
  
  if (!achievement) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
              className="relative w-full bg-card rounded-lg overflow-hidden max-h-[90vh] md:max-w-4xl shadow-xl"
            >
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-50 p-2 rounded-full bg-background/50 hover:bg-background/80 text-primary hover:text-primary/80 transition-colors"
              >
                ✕
              </button>

              {isLoading ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  <p className="text-gray-600">Loading details...</p>
                </div>
              ) : (
                <div className="flex flex-col md:grid md:grid-cols-2 max-h-[90vh] overflow-y-auto">
                  <motion.div
                    layoutId={`image-container-${achievement._id}`}
                    transition={{
                      type: "spring",
                      bounce: 0.2,
                      duration: 0.6,
                    }}
                    className="relative w-full h-[35vh] md:h-[600px] shrink-0"
                  >
                    <Image
                      src={achievement.imageUrl}
                      alt={achievement.fullName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="p-6 md:p-8 bg-card"
                  >
                    <div className="space-y-4">
                      <div>
                        <motion.h2
                          layoutId={`name-${achievement._id}`}
                          className="text-2xl md:text-3xl font-bold mb-2 text-primary"
                        >
                          {achievement.fullName}
                        </motion.h2>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm md:text-base text-muted-foreground"
                        >
                          {achievement.achievementCategory}
                        </motion.p>
                      </div>

                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3"
                      >
                        <h3 className="text-lg md:text-xl font-semibold text-primary">
                          {achievement.title}
                        </h3>
                        <p className="text-foreground/80 text-sm md:text-base leading-relaxed">
                          {achievement.description}
                        </p>
                      </motion.div>

                      {/* //Certificate section - with identical styling from StudentDetailsModal
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-50 p-4 rounded-lg mt-4"
                      >
                        <h3 className="font-semibold mb-2">
                          Certificate/Proof
                        </h3>
                        {processedAchievement?.certificateUrl ? (
                          <Button
                            variant="outline"
                            className="w-full bg-white hover:bg-blue-50 border-2 border-blue-200 text-blue-600 hover:text-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 py-4"
                            onClick={() => {
                              if (processedAchievement.certificateUrl) {
                                window.open(
                                  processedAchievement.certificateUrl,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                              }
                            }}
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            View Certificate
                          </Button>
                        ) : (
                          <p className="text-gray-500">
                            No certificate available
                          </p>
                        )}
                      </motion.div> */}
                      {/* {renderCategoryFields()} */}
                      {achievement.AchievementData && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-semibold mb-2">Achievement Details</h3>
                          <div className="space-y-3">
                            {Object.entries(parseAchievementData(achievement.AchievementData)).map(([key, value]) => {
                              const fieldType = getFieldType(achievement.achievementCategory, key);
                              const fieldLabel = getFieldLabel(achievement.achievementCategory, key);
                              
                              // Don't display title and description as they're already shown in the form
                              if (key === 'title' || key === 'description') return null;
                              // console.log(key, (student as Record<string, any>)[key]);
                              return (
                                <div key={key} className="space-y-1">
                                  <p className="text-gray-500 text-sm">{fieldLabel}:</p>
                                  
                                  {fieldType === "document" ? (
                                    // For document type fields
                                    (achievement as Record<string, any>)[key] ? (
                                      <Button
                                        variant="outline"
                                        className="w-full bg-white hover:bg-blue-50 border-2 border-blue-200 text-blue-600 hover:text-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 py-3"
                                        onClick={() => {
                                          const url = createDocumentURL((achievement as Record<string, any>)[key]);
                                          if (url) {
                                            window.open(url, "_blank", "noopener,noreferrer");
                                          }
                                        }}
                                      >
                                        <svg
                                          className="w-5 h-5"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                          />
                                        </svg>
                                        View {fieldLabel}
                                      </Button>
                                    ) : (
                                      <p className="text-gray-500">No document available</p>
                                    )
                                  ) : fieldType === "option" ? (
                                    // For option type fields
                                    <p className="text-gray-800 font-medium bg-blue-50 px-3 py-1.5 rounded">
                                      {String(value)}
                                    </p>
                                  ) : (
                                    // For text type and other fields
                                    <p className="text-gray-800">{String(value)}</p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}


                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
