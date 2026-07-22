/** Utilities for URL detection, normalization and favicon fetching. */
import type { SearchEngine, SearchEngineId } from "@/types/newtab";

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
    // ensure the TLD segment is at least 2 chars
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

/** Built-in search engines. */
export const SEARCH_ENGINES: Record<SearchEngineId, SearchEngine> = {
  google: {
    id: "google",
    name: "Google",
    template: "https://www.google.com/search?q={q}",
    favicon:
      "https://www.google.com/s2/favicons?sz=64&domain=google.com",
    hint: "google.com",
  },
  duckduckgo: {
    id: "duckduckgo",
    name: "DuckDuckGo",
    template: "https://duckduckgo.com/?q={q}",
    favicon:
      "https://www.google.com/s2/favicons?sz=64&domain=duckduckgo.com",
    hint: "duckduckgo.com",
  },
  bing: {
    id: "bing",
    name: "Bing",
    template: "https://www.bing.com/search?q={q}",
    favicon: "https://www.google.com/s2/favicons?sz=64&domain=bing.com",
    hint: "bing.com",
  },
  brave: {
    id: "brave",
    name: "Brave",
    template: "https://search.brave.com/search?q={q}",
    favicon: "https://www.google.com/s2/favicons?sz=64&domain=brave.com",
    hint: "search.brave.com",
  },
  ecosia: {
    id: "ecosia",
    name: "Ecosia",
    template: "https://www.ecosia.org/search?q={q}",
    favicon: "https://www.google.com/s2/favicons?sz=64&domain=ecosia.org",
    hint: "ecosia.org",
  },
  custom: {
    id: "custom",
    name: "Custom",
    template: "https://duckduckgo.com/?q={q}",
    favicon: "https://www.google.com/s2/favicons?sz=64&domain=duckduckgo.com",
    hint: "custom",
  },
};

export const SEARCH_ENGINE_LIST = Object.values(SEARCH_ENGINES);

/** Returns the effective search engine (resolving "custom" against user settings). */
export function getSearchEngine(
  id: SearchEngineId,
  customTemplate?: string,
  customName?: string
): SearchEngine {
  if (id === "custom") {
    return {
      ...SEARCH_ENGINES.custom,
      template: customTemplate || SEARCH_ENGINES.custom.template,
      name: customName || "Custom",
    };
  }
  return SEARCH_ENGINES[id];
}

/** Builds a search URL for the given engine. */
export function searchUrl(
  engine: SearchEngine,
  query: string
): string {
  return engine.template.replace("{q}", encodeURIComponent(query.trim()));
}

/** Resolves the action for the search bar — either a URL or a search. */
export function resolveSearchAction(
  input: string,
  engine: SearchEngine
): string {
  if (isUrlLike(input)) return normalizeUrl(input);
  return searchUrl(engine, input);
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
 * Returns a favicon URL for a given site URL using Google's favicon service.
 * Google is used as the primary source because it's reliable and works in
 * both the extension and the web preview.
 */
export function getFaviconUrl(url: string, size = 64): string {
  const host = getHostname(url);
  return `https://www.google.com/s2/favicons?sz=${size}&domain=${encodeURIComponent(
    host
  )}`;
}

/** Alternative favicon providers (fallback chain). */
export const FAVICON_PROVIDERS = {
  google: (url: string, size = 64) =>
    `https://www.google.com/s2/favicons?sz=${size}&domain=${encodeURIComponent(
      getHostname(url)
    )}`,
  duckduckgo: (url: string, size = 64) =>
    `https://icons.duckduckgo.com/ip3/${encodeURIComponent(
      getHostname(url)
    )}.ico`,
  clearbit: (url: string) =>
    `https://logo.clearbit.com/${encodeURIComponent(getHostname(url))}`,
  iconhorse: (url: string) =>
    `https://icon.horse/icon/${encodeURIComponent(getHostname(url))}`,
} as const;

/** Returns the favicon provider list (fallback chain). */
export function getFaviconChain(url: string, size = 64): string[] {
  return [
    FAVICON_PROVIDERS.google(url, size),
    FAVICON_PROVIDERS.duckduckgo(url, size),
    FAVICON_PROVIDERS.clearbit(url),
    FAVICON_PROVIDERS.iconhorse(url),
  ];
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
