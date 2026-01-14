import { isBrowser } from './isBrowser';

/**
 * Checks if the current device is running iOS (iPhone, iPad, iPod).
 * Handles iPadOS 13+ which often reports as Macintosh.
 *
 * @returns {boolean} True if the device is iOS, otherwise false.
 */
export const isIOS = (): boolean => {
  if (!isBrowser()) {
    return false;
  }

  const userAgent = window.navigator.userAgent;

  // Checks for iPhone, iPad, iPod
  // Note: Modern iPads often identify as Macintosh, so we check for touch points
  return (
    /iPhone|iPad|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && window.navigator.maxTouchPoints > 1)
  );
};
