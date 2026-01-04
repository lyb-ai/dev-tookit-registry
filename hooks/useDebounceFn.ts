import { useRef, useEffect, useCallback, type DependencyList } from 'react';

/**
 * useDebounceFn
 * @description A hook that returns a debounced version of the passed function.
 * @template T The type of the function to debounce
 * @param {T} fn The function to be debounced
 * @param {number} delay The delay in milliseconds
 * @param {DependencyList} [dep=[]] The dependency list for the useCallback hook
 * @returns {(...args: Parameters<T>) => void} The debounced function
 * @example
 * const run = useDebounceFn(() => {
 *   console.log('debounced');
 * }, 500);
 */
export const useDebounceFn = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
  dep: DependencyList = []
) => {
  const { current } = useRef<{ fn: T; timer: ReturnType<typeof setTimeout> | null }>({
    fn,
    timer: null,
  });

  useEffect(() => {
    current.fn = fn;
  }, [fn]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (current.timer) {
        clearTimeout(current.timer);
      }
      current.timer = setTimeout(() => {
        current.fn(...args);
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    dep
  );
};
