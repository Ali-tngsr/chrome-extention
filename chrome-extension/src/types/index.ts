export type ThemeMode = "dark" | "light" | "system";
export type Density = "comfortable" | "compact";
export type ViewKey = "dashboard" | "categories" | "settings";

export interface Category {
  id: string;
  name: string;
  /** Lucide icon name (see ICON_MAP) */
  icon: string;
  /** Optional accent override (hex) — falls back to global accent */
  color?: string;
  order: number;
  createdAt: number;
}

export interface Shortcut {
  id: string;
  categoryId: string;
  title: string;
  url: string;
  /** Optional custom icon URL; otherwise derived from favicon */
  icon?: string;
  /** Optional short label shown under the tile */
  description?: string;
  order: number;
  createdAt: number;
}

export interface Settings {
  theme: ThemeMode;
  accent: string;
  /** card radius in rem */
  radius: number;
  density: Density;
  animations: boolean;
  /** show greeting + clock */
  showClock: boolean;
  /** columns per row on desktop grid */
  columns: number;
}

export interface NewTabData {
  categories: Category[];
  shortcuts: Shortcut[];
  settings: Settings;
}

export interface AccentPreset {
  name: string;
  value: string;
}

/** Discriminated search suggestion shown in the SearchBar dropdown. */
export type SearchSuggestion =
  | { kind: "shortcut"; id: string; title: string; url: string }
  | { kind: "url"; url: string; label: string }
  | { kind: "search"; query: string };
