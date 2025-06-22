"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Achievement } from "@/app/types/achievements";
import { Archive, ArchiveRestore } from "lucide-react";

interface ArchiveModalProps {
  achievement: Achievement;
  operation: "archive" | "unarchive";
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ArchiveModal({
  achievement,
  operation,
  isOpen,
  onClose,
  onConfirm,
}: ArchiveModalProps) {
  const isArchiving = operation === "archive";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isArchiving ? (
              <>
                <Archive className="h-5 w-5" /> Archive Achievement
              </>
            ) : (
              <>
                <ArchiveRestore className="h-5 w-5" /> Unarchive Achievement
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isArchiving
              ? "Archiving will remove this achievement from the public display. It can be unarchived later."
              : "Unarchiving will make this achievement visible in the public display again."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="font-medium">{achievement.fullName}</p>
          <p className="text-sm text-gray-500">{achievement.title}</p>
          <p className="text-sm text-gray-500 mt-1">
            {achievement.achievementCategory}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={isArchiving ? "default" : "secondary"}
            onClick={onConfirm}
          >
            {isArchiving ? "Archive" : "Unarchive"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
