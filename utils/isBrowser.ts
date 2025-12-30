/**
 * Checks if the code is running in a browser environment.
 *
 * @returns {boolean} True if window and document are defined, otherwise false.
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.document !== "undefined";
}
