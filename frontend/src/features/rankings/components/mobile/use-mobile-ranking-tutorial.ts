"use client";

import { useState, useCallback } from "react";

export function useMobileRankingTutorial() {
  const [isOpen, setIsOpen] = useState(false);

  const openTutorial = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeTutorial = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    openTutorial,
    closeTutorial,
  };
}
