/** Utilities for URL detection, normalization and favicon fetching. */

const URL_LIKE =
  /^(https?:\/\/)?([a-z0-9-]+(\.[a-z0-9-]+)+)(:[0-9]+)?(\/[^\s]*)?$/i;

const LOCALHOST_LIKE = /^(https?:\/\/)?localhost(:[0-9]+)?(\/[^\s]*)?$/i;

const IP_LIKE =
  /^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}(:[0-9]+)?(\/[^\s]*)?$/i;

/** Returns true when the query looks like a URL or domain. */
export function isUrlLike(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;
  if (trimmed.includes(" ")) return false;
  if (LOCALHOST_LIKE.test(trimmed)) return true;
  if (IP_LIKE.test(trimmed)) return true;
  if (URL_LIKE.test(trimmed)) {
    const match = trimmed.match(URL_LIKE);
    if (match) {
      const domain = match[2];
      const parts = domain.split(".");
      return parts[parts.length - 1].length >= 2;
    }
  }
  return false;
}

/** Normalizes a user input into a full URL when it is url-like. */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

/** Builds a Google search URL. */
export function googleSearchUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;
}

/** Resolves the action for the search bar — either a URL or a Google search. */
export function resolveSearchAction(input: string): string {
  if (isUrlLike(input)) return normalizeUrl(input);
  return googleSearchUrl(input);
}

/** Extracts a clean hostname for favicon + display. */
export function getHostname(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/**
 * Returns a favicon URL for a given site URL.
 * Uses Google's favicon service.
 */
export function getFaviconUrl(url: string, size = 64): string {
  const host = getHostname(url);
  return `https://www.google.com/s2/favicons?sz=${size}&domain=${encodeURIComponent(
    host
  )}`;
}

/** Returns the first letter (uppercased) used as a fallback monogram. */
export function getMonogram(title: string): string {
  const t = title.trim();
  if (!t) return "?";
  return t[0].toUpperCase();
}

/** A deterministic pleasant color from a string (used for monogram tiles). */
export function colorFromString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 70% 55%)`;
}
