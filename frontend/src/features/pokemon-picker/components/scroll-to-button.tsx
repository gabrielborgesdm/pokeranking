"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScrollToButtonProps {
  /** Ref to the scrollable container (optional - uses window if not provided) */
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  /** Optional className for positioning/styling */
  className?: string;
}

/**
 * ScrollToButton - A floating action button that scrolls to top or bottom
 *
 * Shows "scroll to bottom" when near the top, "scroll to top" when scrolled down.
 * Auto-hides when no scrolling is possible.
 * Works with either a specific scroll container or the window.
 */
export function ScrollToButton({
  scrollRef,
  className,
}: ScrollToButtonProps) {
  const [showButton, setShowButton] = useState(false);
  const [isNearTop, setIsNearTop] = useState(true);

  useEffect(() => {
    const scrollElement = scrollRef?.current;
    const useWindow = !scrollElement;

    const handleScroll = () => {
      if (useWindow) {
        // Window scroll
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        const scrollableHeight = scrollHeight - clientHeight;

        // Hide button if content is not scrollable
        if (scrollableHeight <= 10) {
          setShowButton(false);
          return;
        }

        setShowButton(true);

        // Consider "near top" if scrolled less than 20% down
        const scrollPercentage = scrollTop / scrollableHeight;
        setIsNearTop(scrollPercentage < 0.2);
      } else {
        // Container scroll
        const { scrollTop, scrollHeight, clientHeight } = scrollElement;
        const scrollableHeight = scrollHeight - clientHeight;

        // Hide button if content is not scrollable
        if (scrollableHeight <= 10) {
          setShowButton(false);
          return;
        }

        setShowButton(true);

        // Consider "near top" if scrolled less than 20% down
        const scrollPercentage = scrollTop / scrollableHeight;
        setIsNearTop(scrollPercentage < 0.2);
      }
    };

    // Initial check
    handleScroll();

    if (useWindow) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [scrollRef]);

  const scrollToTop = () => {
    if (scrollRef?.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToBottom = () => {
    if (scrollRef?.current) {
      const scrollElement = scrollRef.current;
      scrollElement.scrollTo({
        top: scrollElement.scrollHeight,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  if (!showButton) return null;

  return (
    <Button
      variant="secondary"
      size="icon"
      className={cn(
        "fixed bottom-6 right-6 z-50 h-10 w-10 rounded-full shadow-lg transition-opacity hover:opacity-90",
        "md:bottom-6 md:right-6",
        className
      )}
      onClick={isNearTop ? scrollToBottom : scrollToTop}
      aria-label={isNearTop ? "Scroll to bottom" : "Scroll to top"}
    >
      {isNearTop ? (
        <ArrowDown className="h-5 w-5" />
      ) : (
        <ArrowUp className="h-5 w-5" />
      )}
    </Button>
  );
}
