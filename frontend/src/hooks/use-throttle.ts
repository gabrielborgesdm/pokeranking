import { useState, useEffect, useRef } from "react";

/**
 * Throttles a boolean value to prevent rapid flickering.
 * When the value becomes true, it immediately returns true.
 * When the value becomes false, it waits for the minimum delay before returning false.
 *
 * @param value - The boolean value to throttle
 * @param delay - Minimum time (in ms) to keep the value true
 * @returns The throttled boolean value
 */
export function useThrottle(value: boolean, delay: number): boolean {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastTrueTime = useRef<number | null>(null);

  useEffect(() => {
    if (value) {
      lastTrueTime.current = Date.now();
      setThrottledValue(true);
    } else {
      const elapsed = lastTrueTime.current
        ? Date.now() - lastTrueTime.current
        : delay;
      const remaining = Math.max(0, delay - elapsed);

      if (remaining === 0) {
        setThrottledValue(false);
      } else {
        const timer = setTimeout(() => {
          setThrottledValue(false);
        }, remaining);

        return () => clearTimeout(timer);
      }
    }
  }, [value, delay]);

  return throttledValue;
}
