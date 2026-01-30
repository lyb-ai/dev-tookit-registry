import { useRef, useMemo } from 'react';

/**
 * Hook that returns a memoized version of the function that persists across renders
 * but always has access to the latest state/props.
 *
 * @param fn The function to memoize
 * @returns The memoized function
 */
export function useMemoizedFn<T extends (...args: any[]) => any>(fn: T): T {
  const fnRef = useRef(fn);

  // Update the ref each render if fn changes
  fnRef.current = useMemo(() => fn, [fn]);

  const memoizedFn = useRef((...args: Parameters<T>): ReturnType<T> => {
    return fnRef.current(...args);
  });

  return memoizedFn.current as T;
}
