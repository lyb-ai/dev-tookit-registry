import { isBrowser } from './isBrowser';

/**
 * Checks if the current device is running Android.
 *
 * @returns {boolean} True if the device is Android, otherwise false.
 */
export const isAndroid = (): boolean => {
  if (!isBrowser()) {
    return false;
  }

  return /Android/i.test(window.navigator.userAgent);
};
