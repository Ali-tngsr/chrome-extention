"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  Category,
  Shortcut,
  Settings,
  ViewKey,
  NewTabData,
  QuickSite,
} from "@/types/newtab";
import { chromeStorageAdapter } from "@/lib/storage";

const STORAGE_KEY = "newtab-store-v1";

export const ACCENT_PRESETS: { name: string; value: string }[] = [
  { name: "Iris", value: "#5e81f4" },
  { name: "Azure", value: "#38bdf8" },
  { name: "Emerald", value: "#10b981" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Pink", value: "#ec4899" },
];

export const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  accent: "#5e81f4",
  radius: 1,
  density: "comfortable",
  animations: true,
  showClock: true,
  clockFormat: "12h",
  showSeconds: false,
  columns: 6,
  searchEngine: "google",
  customSearchTemplate: "https://duckduckgo.com/?q={q}",
  customSearchName: "Custom",
  background: "aurora",
  showFavoritesBar: true,
  expandAll: false,
  glassIntensity: 70,
  userName: "",
  quickLaunchSites: [
    { title: "YouTube", url: "https://youtube.com" },
    { title: "Gmail", url: "https://mail.google.com" },
    { title: "GitHub", url: "https://github.com" },
    { title: "Maps", url: "https://maps.google.com" },
    { title: "Translate", url: "https://translate.google.com" },
    { title: "Drive", url: "https://drive.google.com" },
    { title: "Calendar", url: "https://calendar.google.com" },
    { title: "Wikipedia", url: "https://wikipedia.org" },
  ],
  showQuickLaunch: true,
};

function seedCategories(): Category[] {
  const now = Date.now();
  const base = [
    { name: "Development", icon: "Code2" },
    { name: "AI", icon: "Sparkles" },
    { name: "Work", icon: "Briefcase" },
    { name: "Research", icon: "Search" },
    { name: "Reading", icon: "BookOpen" },
  ];
  return base.map((c, i) => ({
    id: uuid(),
    name: c.name,
    icon: c.icon,
    order: i,
    createdAt: now + i,
  }));
}

function seedShortcuts(cats: Category[]): Shortcut[] {
  const now = Date.now();
  const byName: Record<string, string> = Object.fromEntries(
    cats.map((c) => [c.name, c.id])
  );
  const data: Array<[string, string, string, string]> = [
    ["GitHub", "https://github.com", "Development", "Code hosting"],
    ["Stack Overflow", "https://stackoverflow.com", "Development", "Q&A"],
    ["MDN", "https://developer.mozilla.org", "Development", "Docs"],
    ["Vercel", "https://vercel.com", "Development", "Deploy"],
    ["ChatGPT", "https://chat.openai.com", "AI", "Assistant"],
    ["Claude", "https://claude.ai", "AI", "Assistant"],
    ["Perplexity", "https://www.perplexity.ai", "AI", "Search"],
    ["Google Gemini", "https://gemini.google.com", "AI", "Assistant"],
    ["Gmail", "https://mail.google.com", "Work", "Email"],
    ["Google Drive", "https://drive.google.com", "Work", "Files"],
    ["Notion", "https://notion.so", "Work", "Notes"],
    ["Calendar", "https://calendar.google.com", "Work", "Schedule"],
    ["Google Scholar", "https://scholar.google.com", "Research", "Papers"],
    ["Wikipedia", "https://wikipedia.org", "Research", "Encyclopedia"],
    ["arXiv", "https://arxiv.org", "Research", "Preprints"],
    ["Hacker News", "https://news.ycombinator.com", "Reading", "News"],
    ["Reddit", "https://reddit.com", "Reading", "Forum"],
    ["Medium", "https://medium.com", "Reading", "Articles"],
  ];
  return data.map(([title, url, catName, description], i) => ({
    id: uuid(),
    categoryId: byName[catName],
    title,
    url,
    description,
    order: i,
    createdAt: now + i,
  }));
}

interface NewTabState {
  categories: Category[];
  shortcuts: Shortcut[];
  settings: Settings;
  // UI state (not persisted)
  view: ViewKey;
  sidebarCollapsed: boolean;
  expandedCategoryId: string | null;
  searchOpen: boolean;
  activeShortcutId: string | null;
  // actions
  setView: (v: ViewKey) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setExpandedCategory: (id: string | null) => void;
  setSearchOpen: (v: boolean) => void;
  setActiveShortcut: (id: string | null) => void;

  addCategory: (data: Pick<Category, "name" | "icon" | "color">) => string;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (orderedIds: string[]) => void;

  addShortcut: (
    data: Pick<Shortcut, "title" | "url" | "categoryId" | "icon" | "description">
  ) => string;
  updateShortcut: (id: string, patch: Partial<Shortcut>) => void;
  deleteShortcut: (id: string) => void;
  duplicateShortcut: (id: string) => void;
  moveShortcut: (id: string, targetCategoryId: string) => void;
  reorderShortcuts: (categoryId: string, orderedIds: string[]) => void;
  recordShortcutOpen: (id: string) => void;
  bulkMoveShortcuts: (ids: string[], targetCategoryId: string) => void;
  bulkDeleteShortcuts: (ids: string[]) => void;

  toggleCategoryCollapse: (id: string) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  addQuickLaunchSite: (site: QuickSite) => void;
  removeQuickLaunchSite: (index: number) => void;
  resetAll: () => void;
  importData: (data: NewTabData) => void;
  exportData: () => NewTabData;
}

function nextOrder<T extends { order: number }>(items: T[]): number {
  return items.reduce((max, i) => Math.max(max, i.order), -1) + 1;
}

export const useNewTabStore = create<NewTabState>()(
  persist(
    (set, get) => ({
      categories: seedCategories(),
      shortcuts: [],
      settings: DEFAULT_SETTINGS,
      view: "dashboard",
      sidebarCollapsed: false,
      expandedCategoryId: null,
      searchOpen: false,
      activeShortcutId: null,

      setView: (v) => set({ view: v }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setExpandedCategory: (id) =>
        set((s) => ({
          expandedCategoryId:
            s.expandedCategoryId === id ? null : id,
        })),
      setSearchOpen: (v) => set({ searchOpen: v }),
      setActiveShortcut: (id) => set({ activeShortcutId: id }),

      addCategory: (data) => {
        const id = uuid();
        const cat: Category = {
          id,
          name: data.name,
          icon: data.icon || "Folder",
          color: data.color,
          order: nextOrder(get().categories),
          createdAt: Date.now(),
        };
        set((s) => ({ categories: [...s.categories, cat] }));
        return id;
      },
      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),
      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories
            .filter((c) => c.id !== id)
            .map((c, i) => ({ ...c, order: i })),
          shortcuts: s.shortcuts.filter((sc) => sc.categoryId !== id),
          expandedCategoryId:
            s.expandedCategoryId === id ? null : s.expandedCategoryId,
        })),
      reorderCategories: (orderedIds) =>
        set((s) => ({
          categories: orderedIds
            .map((id, i) => {
              const c = s.categories.find((x) => x.id === id)!;
              return { ...c, order: i };
            })
            .filter(Boolean),
        })),

      addShortcut: (data) => {
        const id = uuid();
        const sc: Shortcut = {
          id,
          categoryId: data.categoryId,
          title: data.title,
          url: data.url,
          icon: data.icon,
          description: data.description,
          order: nextOrder(
            get().shortcuts.filter((s) => s.categoryId === data.categoryId)
          ),
          createdAt: Date.now(),
        };
        set((s) => ({ shortcuts: [...s.shortcuts, sc] }));
        return id;
      },
      updateShortcut: (id, patch) =>
        set((s) => ({
          shortcuts: s.shortcuts.map((sc) =>
            sc.id === id ? { ...sc, ...patch } : sc
          ),
        })),
      deleteShortcut: (id) =>
        set((s) => ({
          shortcuts: s.shortcuts.filter((sc) => sc.id !== id),
          activeShortcutId:
            s.activeShortcutId === id ? null : s.activeShortcutId,
        })),
      duplicateShortcut: (id) =>
        set((s) => {
          const orig = s.shortcuts.find((sc) => sc.id === id);
          if (!orig) return s;
          const copy: Shortcut = {
            ...orig,
            id: uuid(),
            title: `${orig.title} (copy)`,
            order: orig.order + 0.5,
            createdAt: Date.now(),
          };
          const reordered = [...s.shortcuts, copy]
            .sort((a, b) => a.order - b.order)
            .map((sc, i) => ({ ...sc, order: i }));
          return { shortcuts: reordered };
        }),
      moveShortcut: (id, targetCategoryId) =>
        set((s) => {
          const sc = s.shortcuts.find((x) => x.id === id);
          if (!sc) return s;
          const order = nextOrder(
            s.shortcuts.filter((x) => x.categoryId === targetCategoryId)
          );
          return {
            shortcuts: s.shortcuts.map((x) =>
              x.id === id
                ? { ...x, categoryId: targetCategoryId, order }
                : x
            ),
          };
        }),
      reorderShortcuts: (categoryId, orderedIds) =>
        set((s) => ({
          shortcuts: s.shortcuts.map((sc) => {
            if (sc.categoryId !== categoryId) return sc;
            const idx = orderedIds.indexOf(sc.id);
            return idx === -1 ? sc : { ...sc, order: idx };
          }),
        })),
      recordShortcutOpen: (id) =>
        set((s) => ({
          shortcuts: s.shortcuts.map((sc) =>
            sc.id === id
              ? {
                  ...sc,
                  opens: (sc.opens || 0) + 1,
                  lastOpened: Date.now(),
                }
              : sc
          ),
        })),
      bulkMoveShortcuts: (ids, targetCategoryId) =>
        set((s) => {
          const idSet = new Set(ids);
          let order = nextOrder(
            s.shortcuts.filter((x) => x.categoryId === targetCategoryId)
          );
          return {
            shortcuts: s.shortcuts.map((x) =>
              idSet.has(x.id)
                ? { ...x, categoryId: targetCategoryId, order: order++ }
                : x
            ),
          };
        }),
      bulkDeleteShortcuts: (ids) =>
        set((s) => {
          const idSet = new Set(ids);
          return { shortcuts: s.shortcuts.filter((sc) => !idSet.has(sc.id)) };
        }),

      toggleCategoryCollapse: (id) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, collapsed: c.collapsed === true ? false : true } : c
          ),
          expandedCategoryId:
            s.expandedCategoryId === id ? null : s.expandedCategoryId,
        })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      addQuickLaunchSite: (site) =>
        set((s) => ({
          settings: {
            ...s.settings,
            quickLaunchSites: [...s.settings.quickLaunchSites, site],
          },
        })),
      removeQuickLaunchSite: (index) =>
        set((s) => ({
          settings: {
            ...s.settings,
            quickLaunchSites: s.settings.quickLaunchSites.filter(
              (_, i) => i !== index
            ),
          },
        })),
      resetAll: () =>
        set((s) => {
          const cats = seedCategories();
          return {
            categories: cats,
            shortcuts: seedShortcuts(cats),
            settings: DEFAULT_SETTINGS,
            expandedCategoryId: null,
            view: "dashboard",
          };
        }),
      importData: (data) =>
        set({
          categories: data.categories ?? [],
          shortcuts: data.shortcuts ?? [],
          settings: { ...DEFAULT_SETTINGS, ...data.settings },
          expandedCategoryId: null,
        }),
      exportData: () => {
        const { categories, shortcuts, settings } = get();
        return { categories, shortcuts, settings };
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => chromeStorageAdapter),
      version: 2,
      // Migrate legacy persisted state.
      // v0 (old adapter) was stored double-encoded: the raw value on disk
      // was JSON.stringify(jsonString). createJSONStorage parses once, so
      // `persistedState` arrives as a *string* that needs one more parse.
      // v2 (new adapter) is stored clean, so persistedState is already an object.
      migrate: (persistedState: unknown, version: number) => {
        if (version < 2 && typeof persistedState === "string") {
          try {
            const inner = JSON.parse(persistedState) as {
              state?: Partial<NewTabState>;
            };
            return (inner.state ?? inner) as Partial<NewTabState>;
          } catch {
            return {} as Partial<NewTabState>;
          }
        }
        return persistedState as Partial<NewTabState>;
      },
      // Persist only data, not transient UI state
      partialize: (s) => ({
        categories: s.categories,
        shortcuts: s.shortcuts,
        settings: s.settings,
      }),
      // Seed shortcuts only when no persisted data exists
      onRehydrateStorage: () => (state) => {
        if (state && state.shortcuts.length === 0) {
          state.shortcuts = seedShortcuts(state.categories);
        }
      },
    }
  )
);
