import { isBrowser } from './isBrowser';

/**
 * Retrieves all query parameters from the current URL as an object.
 * Useful for destructuring: const { id, name } = getUrlParam();
 */
export function getUrlParam(): Record<string, string>;

/**
 * Retrieves a specific query parameter value from the current URL.
 * @param key The name of the parameter to retrieve.
 */
export function getUrlParam(key: string): string | null;

/**
 * Retrieves a specific query parameter value from a provided URL string.
 * @param key The name of the parameter to retrieve.
 * @param url The URL string to parse.
 */
export function getUrlParam(key: string, url: string): string | null;

/**
 * Retrieves all query parameters from a provided URL string as an object.
 * @param key Pass null or undefined to retrieve all parameters.
 * @param url The URL string to parse.
 */
export function getUrlParam(key: null | undefined, url: string): Record<string, string>;

/**
 * Implementation of getUrlParam
 */
export function getUrlParam(
  key?: string | null,
  url?: string
): string | null | Record<string, string> {
  // SSR Guard
  if (!isBrowser() && !url) {
    return key ? null : {};
  }

  let params: URLSearchParams;

  if (url) {
    try {
      // Use a dummy base to handle relative URLs safely
      const urlObj = new URL(url, 'http://dummy.base');
      params = urlObj.searchParams;
      
      // Also check if there's a hash with query params (e.g. /path#/sub?id=1)
      if (urlObj.hash.includes('?')) {
        const hashSearch = urlObj.hash.split('?')[1];
        const hashParams = new URLSearchParams(hashSearch);
        hashParams.forEach((value, k) => params.set(k, value));
      }
    } catch (e) {
      // Fallback: try parsing directly (e.g. if input is just "id=1&name=2")
      params = new URLSearchParams(url);
    }
  } else {
    // Current window location
    params = new URLSearchParams(window.location.search);
    
    // Merge hash params (HashRouter support)
    const hash = window.location.hash;
    const hashQueryIndex = hash.indexOf('?');
    if (hashQueryIndex !== -1) {
      const hashParams = new URLSearchParams(hash.slice(hashQueryIndex));
      hashParams.forEach((value, k) => params.set(k, value));
    }
  }

  // Mode 1: Return specific value
  if (key) {
    return params.get(key);
  }

  // Mode 2: Return all values as object (for destructuring)
  const result: Record<string, string> = {};
  params.forEach((value, k) => {
    result[k] = value;
  });
  
  return result;
}
