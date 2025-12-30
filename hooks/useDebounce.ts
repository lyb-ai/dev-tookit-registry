import { useState, useEffect } from "react";

/**
 * Delays updating a value until a specified time has passed since the last change.
 * Useful for reducing the frequency of expensive operations such as API calls or heavy calculations.
 *
 * @template T The type of the value to debounce.
 * @param {T} value The value to be debounced.
 * @param {number} delay The delay in milliseconds.
 * @returns {T} The debounced value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
