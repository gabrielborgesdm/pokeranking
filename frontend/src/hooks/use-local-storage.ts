"use client";

import { useState, useCallback, useEffect } from "react";

interface UseLocalStorageOptions<T> {
  key: string;
  initialValue: T;
}

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
  isLoaded: boolean;
}

export function useLocalStorage<T>({
  key,
  initialValue,
}: UseLocalStorageOptions<T>): UseLocalStorageReturn<T> {
  const [value, setValueState] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setValueState(JSON.parse(stored));
      }
    } catch (error) {
      console.warn(`Failed to load localStorage key "${key}":`, error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      setValueState((prev) => {
        const resolvedValue =
          typeof newValue === "function"
            ? (newValue as (prev: T) => T)(prev)
            : newValue;

        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(key, JSON.stringify(resolvedValue));
          } catch (error) {
            console.warn(`Failed to save localStorage key "${key}":`, error);
          }
        }

        return resolvedValue;
      });
    },
    [key]
  );

  const removeValue = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Failed to remove localStorage key "${key}":`, error);
      }
    }
    setValueState(initialValue);
  }, [key, initialValue]);

  return { value, setValue, removeValue, isLoaded };
}
