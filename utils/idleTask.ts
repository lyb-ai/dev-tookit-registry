import { DependencyList, useEffect } from 'react';

/**
 * Options for scheduling an idle task.
 */
export interface IdleTaskOptions {
  /**
   * The maximum time (in ms) to wait before the task is executed, even if the browser is busy.
   * Only used if requestIdleCallback is supported.
   * @default 1500
   */
  timeout?: number;
  /**
   * The delay (in ms) before executing the task as a fallback (using setTimeout) if requestIdleCallback is not supported.
   * @default 800
   */
  fallbackDelay?: number;
}

/**
 * A task function that can optionally return a cleanup function.
 */
type IdleTask = () => void | (() => void);

/**
 * Extended Window interface to support requestIdleCallback in TypeScript.
 */
type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

/**
 * Schedules a task to be executed during the browser's idle periods.
 * Uses requestIdleCallback if available, otherwise falls back to setTimeout.
 *
 * @param task The task function to be executed.
 * @param options Scheduling options including timeout and fallback delay.
 * @returns A function to cancel the scheduled task.
 */
export function scheduleIdleTask(task: () => void, options: IdleTaskOptions = {}) {
  const { timeout = 1500, fallbackDelay = 800 } = options;
  const win = window as WindowWithIdleCallback;

  if (win.requestIdleCallback) {
    const idleId = win.requestIdleCallback(() => {
      task();
    }, { timeout });

    return () => {
      if (win.cancelIdleCallback) {
        win.cancelIdleCallback(idleId);
      }
    };
  }

  // Fallback to setTimeout if requestIdleCallback is not supported
  const timer = window.setTimeout(() => {
    task();
  }, fallbackDelay);

  return () => {
    window.clearTimeout(timer);
  };
}

/**
 * A React hook that schedules an idle task whenever dependencies change.
 * The task will be automatically canceled if the component unmounts or dependencies change.
 *
 * @param task The task function to be executed during idle periods.
 * @param deps Dependency list that triggers the task when changed.
 * @param options Scheduling options for the idle task.
 * @param enabled Whether the idle task scheduling is enabled.
 * @example
 * ```tsx
 * useIdleTask(() => {
 *   console.log('Running background task...');
 *   // Optional cleanup logic
 *   return () => console.log('Cleaning up...');
 * }, [data], { timeout: 2000 });
 * ```
 */
export function useIdleTask(
  task: IdleTask,
  deps: DependencyList,
  options: IdleTaskOptions = {},
  enabled = true
) {
  const { timeout, fallbackDelay } = options;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cleanup: void | (() => void);
    const cancel = scheduleIdleTask(() => {
      cleanup = task();
    }, { timeout, fallbackDelay });

    return () => {
      cancel();
      if (cleanup) {
        cleanup();
      }
    };
  }, [enabled, timeout, fallbackDelay, ...deps]);
}
