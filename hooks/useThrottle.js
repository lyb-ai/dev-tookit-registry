import { useCallback, useEffect, useRef } from 'react';

/**
 * A hook that throttles the execution of a function, ensuring it only runs once within a specified delay period.
 * @param {Function} fn The function to be throttled.
 * @param {number} delay The throttle delay in milliseconds.
 * @param {Array} [dep=[]] The dependency list for the useCallback hook.
 * @returns {Function} The throttled function.
 */

function useThrottle(fn, delay, dep = []) {
  const { current } = useRef({ fn, timer: null });
  useEffect(
    function () {
      current.fn = fn;
    },
    [fn],
  );

  return useCallback(function f(...args) {
    if (!current.timer) {
      current.timer = setTimeout(() => {
        delete current.timer;
      }, delay);
      current.fn.call(this, ...args);
    }
  }, dep);
}

export default useThrottle;
