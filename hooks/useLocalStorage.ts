import { useState } from "react";
import { isBrowser } from "@/utils/isBrowser";

/**
 * Persists state to localStorage with synchronization.
 * Handles SSR environments gracefully by returning the initial value.
 *
 * @template T The type of the state.
 * @param {string} key The key used to store the value in localStorage.
 * @param {T} initialValue The initial value to use if the key does not exist.
 * @returns {[T, (value: T | ((val: T) => T)) => void]} A tuple containing the stored value and a setter function.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isBrowser()) {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (isBrowser()) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
