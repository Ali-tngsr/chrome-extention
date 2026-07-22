/**
 * Storage abstraction.
 * Uses chrome.storage.sync when running inside a Chrome Extension,
 * otherwise falls back to localStorage (used during local dev via Vite).
 */

const hasChromeStorage =
  typeof chrome !== "undefined" &&
  !!chrome.storage &&
  !!chrome.storage.sync;

export function isExtension(): boolean {
  return hasChromeStorage;
}

export async function storageGet<T>(key: string): Promise<T | null> {
  if (hasChromeStorage) {
    return new Promise((resolve) => {
      chrome.storage.sync.get([key], (result) => {
        const value = result[key];
        resolve(value === undefined ? null : (value as T));
      });
    });
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function storageSet<T>(key: string, value: T): Promise<void> {
  if (hasChromeStorage) {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ [key]: value }, () => resolve());
    });
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
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

/** Adapter for zustand/middleware persist. */
export const chromeStorageAdapter = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await storageGet<string>(name);
    return value ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await storageSet(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await storageRemove(name);
  },
};
