"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function useIsPwa() {
  const pathname = usePathname();
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    setIsPwa(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  return {
    isPwa,
    isPokedexPwa: isPwa && (pathname?.startsWith("/pokedex") ?? false),
  };
}
