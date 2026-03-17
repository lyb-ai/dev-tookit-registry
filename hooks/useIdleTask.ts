import { DependencyList, useEffect } from 'react';
import { IdleTaskOptions, scheduleIdleTask } from '@/utils/idleTask';

/**
 * A task function that can optionally return a cleanup function.
 */
type IdleTask = () => void | (() => void);

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
