/* eslint-disable react-hooks/use-memo */
import { type DependencyList, useCallback, useEffect, useRef } from "react";

interface UseDebounceReturn<T extends (...args: any[]) => void> {
  debouncedCallback: T;
  cancel: () => void;
}

/**
 * Custom hook for debouncing a callback.
 * Returns a debounced version of the callback and a cancel function.
 * @param callback - The function to debounce (supports params).
 * @param delay - Delay in ms before executing.
 * @param deps - Dependencies for recreating the debouncer (optional).
 */
export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
  deps: DependencyList = []
): UseDebounceReturn<T> {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedCallback = useRef<T>(callback);

  // Update saved callback if it changes (for closure safety)
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Schedule new execution
      timeoutRef.current = setTimeout(() => {
        savedCallback.current(...args); // Pass args (e.g., your `value`)
      }, delay);
    },
    [delay, ...deps] // Recreate debounced fn if deps change
  ) as unknown as T;

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedCallback, cancel };
}
