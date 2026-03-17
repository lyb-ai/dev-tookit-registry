import { useCallback, useEffect, useRef } from 'react';

/**
 * A hook that throttles the execution of a function, ensuring it only runs once within a specified delay period.
 * @param {Function} fn The function to be throttled.
 * @param {number} delay The throttle delay in milliseconds.
 * @param {Array} [dep=[]] The dependency list for the useCallback hook.
 * @returns {Function} The throttled function.
 */

function useThrottle(fn, delay, dep = []) {
  const ref = useRef({ fn, timer: null });
  useEffect(
    function () {
      ref.current.fn = fn;
    },
    [fn],
  );

  return useCallback(
    function f(...args) {
      if (!ref.current.timer) {
        ref.current.timer = setTimeout(() => {
          delete ref.current.timer;
        }, delay);
        ref.current.fn.call(this, ...args);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, ...dep],
  );
}

export default useThrottle;
