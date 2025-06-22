"use client";

import { toast as sonnerToast, Toaster as SonnerToaster } from "sonner";
import { ComponentProps } from "react";

/**
 * @typedef {Object} ToastProps
 * @property {string} [title]
 * @property {string} [description]
 * @property {React.ReactNode} [action]
 * @property {"default" | "destructive" | "success"} [variant]
 */
/**
 * @param {ToastProps} props
 */
export function toast({
  title,
  description,
  action,
  variant = "default",
  ...props
}) {
  // Map variants to Sonner's types
  const type =
    variant === "destructive"
      ? "error"
      : variant === "success"
      ? "success"
      : "default";

  return sonnerToast[type !== "default" ? type : "message"](title, {
    description,
    action,
    ...props,
  });
}

// Re-export dismiss functionality
export const dismiss = sonnerToast.dismiss;

// Create hook for backwards compatibility
export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}

// Export Toaster component
/**
 * @param {ComponentProps<typeof SonnerToaster>} props
 */
export function Toaster(props) {
  return (
    <SonnerToaster
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          title: "text-foreground font-semibold",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
        }
      }}
      {...props}
    />
  );
}
