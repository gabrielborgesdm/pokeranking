"use client";

import { useEffect, useState } from "react";

export function usePlatform() {
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsAndroid(/Android/i.test(ua));
    setIsIOS(/iPad|iPhone|iPod/.test(ua));
  }, []);

  return { isAndroid, isIOS };
}
