"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Achievement } from "@/app/types/achievements";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "../types/categories";
import Image from "next/image";
import { format } from "date-fns";
import { achievementFormFields } from "../types/achievementFields";

interface EditAchievementModalProps {
  achievement: Achievement;
  isOpen: boolean;
  onClose: () => void;
  onSave: (achievement: Achievement) => void;
}

export default function EditAchievementModal({
  achievement,
  isOpen,
  onClose,
  onSave,
}: EditAchievementModalProps) {
  const [editedAchievement, setEditedAchievement] = useState<Achievement>({
    ...achievement,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedAchievement((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (value: string) => {
    setEditedAchievement((prev) => ({
      ...prev,
      achievementCategory: value,
    }));
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setEditedAchievement((prev) => ({
      ...prev,
      [field]: checked,
    }));
  };

  const handleSave = () => {
    // Create an object with only the _id and modified fields
    const changedFields: Partial<Record<keyof Achievement, Achievement[keyof Achievement]>> = { _id: achievement._id };
    
    // Compare original and edited achievement to find changed fields
    Object.keys(editedAchievement).forEach((key) => {
      const typedKey = key as keyof Achievement;
      if (achievement[typedKey] !== editedAchievement[typedKey]) {
        changedFields[typedKey] = editedAchievement[typedKey];
      }
    });
    
    // Send only the changed fields to the parent component
    onSave(changedFields as Achievement);
    // Don't call onClose() here as it will be handled by the parent
  };
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

  // Function to render dynamic fields based on achievement category
  const renderCategoryFields = () => {
    const category = editedAchievement.achievementCategory;
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
              <div key={field.name}>
                <p className="text-gray-500 text-sm">{field.label}:</p>
                {(editedAchievement as Record<string, any>)[field.name] ? (
                  <Button
                    variant="outline"
                    className="w-full bg-white hover:bg-blue-50 border-2 border-blue-200 text-blue-600 hover:text-blue-700 transition-colors duration-200 flex items-center justify-center gap-2 py-3"
                    onClick={() => {
                      const url = createDocumentURL((editedAchievement as Record<string, any>)[field.name]);
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
                    View {field.label}
                  </Button>
                ) : (
                  <p className="text-gray-500">No document available</p>
                )}
              </div>
            );
          } else if (field.type === "option" && field.options) {
            return (
              <div key={field.name} className="col-span-1">
                <Label htmlFor={field.name}>{field.label}</Label>
                <Select
                  value={String(editedAchievement[field.name as keyof Achievement] || "")}
                  onValueChange={(value) => {
                    setEditedAchievement(prev => ({
                      ...prev,
                      [field.name]: value
                    }));
                  }}
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
                    value={String(editedAchievement[field.name as keyof Achievement] || "")}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="min-h-[60px]"
                  />
                ) : (
                  <Input
                    id={field.name}
                    name={field.name}
                    value={String(editedAchievement[field.name as keyof Achievement] || "")}
                    onChange={handleInputChange}
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose(); // Only handle the closing event
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Achievement</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Student Image and Basic Info */}
          <div className="flex items-start gap-4">
            <div className="relative h-24 w-24 rounded-md overflow-hidden">
              <div className="absolute inset-0 border border-black/10 z-10 rounded-md" />
              {editedAchievement.imageUrl && (
                <Image
                  src={editedAchievement.imageUrl}
                  alt={editedAchievement.fullName}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="fullName">Student Name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={editedAchievement.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="registrationNumber">Registration No.</Label>
                  <Input
                    id="registrationNumber"
                    name="registrationNumber"
                    value={editedAchievement.registrationNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="mobileNumber">Mobile Number</Label>
                  <Input
                    id="mobileNumber"
                    name="mobileNumber"
                    value={editedAchievement.mobileNumber}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="grid grid-cols-1">
            <Label htmlFor="studentMail">Email</Label>
            <Input
              id="studentMail"
              name="studentMail"
              value={editedAchievement.studentMail || ""}
              onChange={handleInputChange}
            />
          </div>

          {/* Achievement Details */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="title">Achievement Title</Label>
              <Input
                id="title"
                name="title"
                value={editedAchievement.title}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="description">Achievement Description</Label>
              <Textarea
                id="description"
                name="description"
                value={editedAchievement.description}
                onChange={handleInputChange}
                className="min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={editedAchievement.achievementCategory}
                onValueChange={handleCategoryChange}
                disabled={true} // Enable the category selection
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.slice(1).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dynamic Category Fields */}
          {renderCategoryFields()}

          {/* Status Information */}
          <div className="grid grid-cols-1 gap-4 pt-2 border-t">
            <div className="flex flex-col gap-2">
              <Label className="font-medium text-sm text-gray-500">
                Status Information
              </Label>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overAllTop10"
                  checked={editedAchievement.overAllTop10}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("overAllTop10", checked as boolean)
                  }
                />
                <Label htmlFor="overAllTop10" className="cursor-pointer">
                  Include in Top 10
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="archived"
                  checked={editedAchievement.archived}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange("archived", checked as boolean)
                  }
                />
                <Label htmlFor="archived" className="cursor-pointer">
                  Archive Achievement
                </Label>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-sm text-gray-500">
              <p>
                Submitted:{" "}
                {format(
                  new Date(editedAchievement.submissionDate),
                  "MMM dd, yyyy"
                )}
              </p>
              <p>
                Status:{" "}
                {editedAchievement.approved ? (
                  <>
                    Approved on{" "}
                    {format(
                      new Date(editedAchievement.approved),
                      "MMM dd, yyyy"
                    )}
                  </>
                ) : (
                  <>Pending Approval</>
                )}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={(e) => {
            e.preventDefault(); // Prevent any default dialog behavior
            handleSave();
          }}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
