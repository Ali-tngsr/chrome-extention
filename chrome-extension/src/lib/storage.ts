/**
 * Storage abstraction.
 * Uses chrome.storage.sync when running inside a Chrome Extension,
 * otherwise falls back to localStorage (used by the live web preview).
 *
 * NOTE: The adapter below is a *raw string* StateStorage. Zustand's
 * `createJSONStorage` handles JSON serialization on top of it, so the
 * adapter must NOT JSON-encode/decode values itself (that caused
 * double-encoding bugs previously).
 */

const hasChromeStorage =
  typeof chrome !== "undefined" &&
  !!chrome.storage &&
  !!chrome.storage.sync;

export function isExtension(): boolean {
  return hasChromeStorage;
}

/** Reads a raw string value (no JSON parsing). */
export async function storageGetRaw(key: string): Promise<string | null> {
  if (hasChromeStorage) {
    return new Promise((resolve) => {
      chrome.storage.sync.get([key], (result) => {
        const value = result[key];
        resolve(value === undefined ? null : String(value));
      });
    });
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Writes a raw string value (no JSON encoding). */
export async function storageSetRaw(key: string, value: string): Promise<void> {
  if (hasChromeStorage) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: value }, () => resolve());
    });
  }
  try {
    localStorage.setItem(key, value);
  } catch {
    /* quota or serialization error — ignore */
  }
}

export async function storageRemove(key: string): Promise<void> {
  if (hasChromeStorage) {
    return new Promise((resolve) => {
      chrome.storage.sync.remove([key], () => resolve());
    });
  }
  localStorage.removeItem(key);
}

/**
 * Typed helpers for arbitrary JSON values (used outside zustand persist,
 * e.g. by feature modules that store their own JSON blobs).
 */
export async function storageGet<T>(key: string): Promise<T | null> {
  const raw = await storageGetRaw(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function storageSet<T>(key: string, value: T): Promise<void> {
  await storageSetRaw(key, JSON.stringify(value));
}

/**
 * Adapter for zustand/middleware persist. Operates on raw strings;
 * `createJSONStorage` does the JSON (de)serialization.
 */
export const chromeStorageAdapter = {
  getItem: async (name: string): Promise<string | null> => {
    return await storageGetRaw(name);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await storageSetRaw(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await storageRemove(name);
  },
};

