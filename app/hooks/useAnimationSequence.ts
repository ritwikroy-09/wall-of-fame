import { useState, useCallback } from "react";

export function useAnimationSequence() {
  const [isSidebarAnimating, setIsSidebarAnimating] = useState(false);
  const [isContentFadingOut, setIsContentFadingOut] = useState(false);
  const [isContentFadingIn, setIsContentFadingIn] = useState(false);

  const startAnimationSequence = useCallback(async () => {
    setIsSidebarAnimating(true);

    // Wait for sidebar animation (400ms)
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsSidebarAnimating(false);

    // Start content fade out
    setIsContentFadingOut(true);

    // Wait for fade out (500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsContentFadingOut(false);

    // Start content fade in
    setIsContentFadingIn(true);

    // Wait for fade in (500ms)
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsContentFadingIn(false);
  }, []);

  return {
    isSidebarAnimating,
    isContentFadingOut,
    isContentFadingIn,
    startAnimationSequence,
  };
}
