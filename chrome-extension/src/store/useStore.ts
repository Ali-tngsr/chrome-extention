import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import type {
  Category,
  Shortcut,
  Settings,
  ViewKey,
  NewTabData,
  AccentPreset,
} from "@/types";
import { chromeStorageAdapter } from "@/lib/storage";

const STORAGE_KEY = "newtab-store-v1";

export const ACCENT_PRESETS: AccentPreset[] = [
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
  columns: 6,
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
  // dialog state (not persisted)
  shortcutDialog: { open: boolean; editId: string | null; categoryId?: string };
  categoryDialog: { open: boolean; editId: string | null };
  importExportDialog: { open: boolean; mode: "import" | "export" };
  contextMenu: {
    open: boolean;
    x: number;
    y: number;
    shortcutId: string | null;
  };

  // actions
  setView: (v: ViewKey) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
  setExpandedCategory: (id: string | null) => void;
  setSearchOpen: (v: boolean) => void;
  setActiveShortcut: (id: string | null) => void;
  openShortcutDialog: (editId: string | null, categoryId?: string) => void;
  closeShortcutDialog: () => void;
  openCategoryDialog: (editId: string | null) => void;
  closeCategoryDialog: () => void;
  openImportExport: (mode: "import" | "export") => void;
  closeImportExport: () => void;
  openContextMenu: (x: number, y: number, shortcutId: string) => void;
  closeContextMenu: () => void;

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

  updateSettings: (patch: Partial<Settings>) => void;
  resetAll: () => void;
  importData: (data: NewTabData) => void;
  exportData: () => NewTabData;
}

function nextOrder<T extends { order: number }>(items: T[]): number {
  return items.reduce((max, i) => Math.max(max, i.order), -1) + 1;
}

export const useStore = create<NewTabState>()(
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
      shortcutDialog: { open: false, editId: null },
      categoryDialog: { open: false, editId: null },
      importExportDialog: { open: false, mode: "export" },
      contextMenu: { open: false, x: 0, y: 0, shortcutId: null },

      setView: (v) => set({ view: v }),
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
      setExpandedCategory: (id) =>
        set((s) => ({
          expandedCategoryId: s.expandedCategoryId === id ? null : id,
        })),
      setSearchOpen: (v) => set({ searchOpen: v }),
      setActiveShortcut: (id) => set({ activeShortcutId: id }),

      openShortcutDialog: (editId, categoryId) =>
        set({ shortcutDialog: { open: true, editId, categoryId } }),
      closeShortcutDialog: () =>
        set({ shortcutDialog: { open: false, editId: null } }),
      openCategoryDialog: (editId) =>
        set({ categoryDialog: { open: true, editId } }),
      closeCategoryDialog: () =>
        set({ categoryDialog: { open: false, editId: null } }),
      openImportExport: (mode) =>
        set({ importExportDialog: { open: true, mode } }),
      closeImportExport: () =>
        set({ importExportDialog: { open: false, mode: "export" } }),
      openContextMenu: (x, y, shortcutId) =>
        set({ contextMenu: { open: true, x, y, shortcutId } }),
      closeContextMenu: () =>
        set((s) => ({ contextMenu: { ...s.contextMenu, open: false } })),

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
              const c = s.categories.find((x) => x.id === id);
              return c ? { ...c, order: i } : null;
            })
            .filter((c): c is Category => c !== null),
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

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),
      resetAll: () =>
        set(() => {
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
      partialize: (s) => ({
        categories: s.categories,
        shortcuts: s.shortcuts,
        settings: s.settings,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.shortcuts.length === 0) {
          state.shortcuts = seedShortcuts(state.categories);
        }
      },
    }
  )
);
