"use client";

import { useEffect, useState } from "react";

/**
 * Returns true only after the component has mounted on the client.
 * Use this to prevent hydration mismatches when accessing browser-only APIs.
 *
 * @example
 * ```tsx
 * const mounted = useMounted();
 * const isPwa = mounted ? window.matchMedia("(display-mode: standalone)").matches : false;
 * ```
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
