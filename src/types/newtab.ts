export type ThemeMode = "dark" | "light" | "system";
export type Density = "comfortable" | "compact";

export type SearchEngineId =
  | "google"
  | "duckduckgo"
  | "bing"
  | "brave"
  | "ecosia"
  | "custom";

export interface SearchEngine {
  id: SearchEngineId;
  name: string;
  /** search url template; `{q}` is replaced with the encoded query */
  template: string;
  /** favicon url for the engine badge */
  favicon: string;
  /** optional prefix shown as a hint */
  hint: string;
}

export interface Category {
  id: string;
  name: string;
  /** Lucide icon name (see ICON_MAP) */
  icon: string;
  /** Optional accent override (hex) — falls back to global accent */
  color?: string;
  order: number;
  createdAt: number;
  /** whether the user has manually pinned this category open/closed */
  collapsed?: boolean | null;
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
  /** incremented when the shortcut is opened (used for "frequently used") */
  opens?: number;
  lastOpened?: number;
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
  /** 12-hour or 24-hour clock format */
  clockFormat: "12h" | "24h";
  /** show seconds in the clock */
  showSeconds: boolean;
  /** columns per row on desktop grid */
  columns: number;
  /** selected search engine */
  searchEngine: SearchEngineId;
  /** custom search engine template (when searchEngine === "custom") */
  customSearchTemplate: string;
  /** custom search engine display name */
  customSearchName: string;
  /** background style: "aurora" | "mesh" | "plain" | "dots" */
  background: BackgroundStyle;
  /** show the quick-access favorites bar above categories */
  showFavoritesBar: boolean;
  /** expand all categories by default (overrides per-category collapse) */
  expandAll: boolean;
  /** glassmorphism intensity 0..100 */
  glassIntensity: number;
  /** custom greeting name (shown after "Good morning,") */
  userName: string;
  /** user-customizable quick-launch sites shown under the search bar */
  quickLaunchSites: QuickSite[];
  /** whether to show the quick-launch row at all */
  showQuickLaunch: boolean;
}

export interface QuickSite {
  title: string;
  url: string;
}

export type BackgroundStyle = "aurora" | "mesh" | "plain" | "dots";

export interface NewTabData {
  categories: Category[];
  shortcuts: Shortcut[];
  settings: Settings;
}

export type ViewKey = "dashboard" | "settings" | "insights";

export interface AccentPreset {
  name: string;
  value: string;
}
