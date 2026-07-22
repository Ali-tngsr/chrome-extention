# New Tab Dashboard — Chrome Extension

A beautiful, minimal, production-ready Chrome Extension (Manifest V3) that replaces Chrome's New Tab page with a modern productivity dashboard. Inspired by Arc, Linear, Raycast, Vercel, and Notion.

این پروژه یک **اکسشنشن کروم** (Manifest V3) است که صفحه New Tab کروم را با یک داشبورد شخصیِ مینیمال و حرفه‌ای جایگزین می‌کند.

![manifest](https://img.shields.io/badge/manifest-v3-success) ![react](https://img.shields.io/badge/react-18-61dafb) ![vite](https://img.shields.io/badge/vite-5-646cff) ![ts](https://img.shields.io/badge/typescript-5-3178c6)

---

## ✨ Features / امکانات

- **Command-style search bar** — Google / DuckDuckGo / Bing / Brave / Ecosia / Custom search + smart URL detection. Type `github` → opens `https://github.com`.
- **نوار جستجوی هوشمند** — پشتیبانی از چند موتور جستجو + تشخیص خودکار URL.
- **Unlimited categories** — Development, AI, Work, Research, Reading, … Each is an expandable card with a Lucide icon and optional accent color. **Drag & drop reordering.**
- **دسته‌بندی نامحدود** — با قابلیت تغییر ترتیب با کشیدن و رها کردن (Drag & Drop).
- **Shortcut tiles** — favicon-powered (multi-provider fallback chain), drag & drop reordering, add / edit / delete / duplicate, move between categories, bulk multi-select.
- **کاشی‌های میان‌بر وب‌سایت‌ها** — با آیکونfavicon، مرتب‌سازی با درگ، ویرایش/حذف/کپی، انتقال دسته‌ای.
- **Context menu** — right-click any shortcut for Edit / Delete / Duplicate / Move.
- **منوی راست‌کلیک** روی هر میان‌بر.
- **Command palette** (`Ctrl/⌘+K`) — global actions: navigate, create, switch theme, search, open shortcuts.
- **پنل فرمان** با `Ctrl/⌘+K`.
- **Favorites bar** — quick-access your most-opened shortcuts.
- **نوار علاقه‌مندی‌ها** — دسترسی سریع به پراستفاده‌ترین سایت‌ها.
- **Settings** — Dark / Light / System theme, 8 accent presets + custom color, card radius, grid density, columns, animations, clock, background style (Aurora / Mesh / Dots / Plain), glass intensity.
- **تنظیمات کامل** — تم تیره/روشن/سیستمی، رنگ accent، شعاع کارت، چگالی گرید، ستون‌ها، انیمیشن، ساعت، پس‌زمینه، و شدت glass.
- **Import / Export** — full JSON backup & restore.
- **وارد/خروج گرفتن داده‌ها** به‌صورت JSON.
- **Keyboard shortcuts** — `/`, `Ctrl/⌘+K`, `Esc`, `↑↓`, `g d/s`, `n`, `c`, `Ctrl/,`.
- **میان‌برهای صفحه‌کلید** کامل.
- **Synced storage** — everything saved to `chrome.storage.sync`.
- **ذخیره‌سازی همگام** via `chrome.storage.sync`.

---

## 🧱 Tech Stack / تکنولوژی‌ها

| Layer        | Choice                          |
| ------------ | ------------------------------- |
| Framework    | React 18 + TypeScript           |
| Build tool   | Vite 5                          |
| Styling      | TailwindCSS 3                   |
| State        | Zustand (persisted)             |
| Animations   | Framer Motion                   |
| Icons        | Lucide React                    |
| Drag & drop  | @dnd-kit                        |
| Storage      | `chrome.storage.sync` (MV3)     |
| Manifest     | Chrome Extension Manifest V3    |

---

## 📁 Repository Structure / ساختار مخزن

```
.
├── chrome-extension/        # ← The actual loadable Chrome Extension (Vite + React + MV3)
│   ├── manifest.json
│   ├── newtab.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── public/icons/        # 16/48/128 PNG icons
│   ├── scripts/gen-icons.cjs
│   ├── src/
│   │   ├── main.tsx
│   │   ├── NewTabApp.tsx
│   │   ├── index.css
│   │   ├── types/index.ts
│   │   ├── lib/             # storage, url, search-focus
│   │   ├── store/useStore.ts
│   │   ├── hooks/           # useTheme, useKeyboardShortcuts
│   │   └── components/      # Sidebar, SearchBar, CategoryCard, ShortcutGrid, ...
│   └── README.md            # Extension-specific guide
│
├── src/                     # Next.js live preview (same dashboard, for browser testing)
│   ├── app/                 # Next.js App Router (route `/`)
│   ├── components/newtab/   # Mirror of the extension components
│   ├── lib/                 # storage (localStorage fallback), url utils
│   ├── store/               # Zustand store
│   ├── hooks/               # theme + keyboard shortcuts
│   └── types/newtab.ts
│
├── package.json             # Next.js preview deps
└── README.md                # ← You are here
```

> **The Chrome Extension deliverable lives in `chrome-extension/`.** The root `src/` is a Next.js preview used to test the dashboard in a normal browser tab (it falls back to `localStorage` when `chrome.storage.sync` is unavailable).

---

## 🚀 Installation / نصب

### Option A — Use the built extension (recommended)

1. **Build the extension / بیلد اکسشنشن:**

   ```bash
   cd chrome-extension
   npm install
   npm run build
   ```

   This produces a `chrome-extension/dist/` folder containing `manifest.json`, `newtab.html`, assets, and icons.

   خروجی در پوشه `chrome-extension/dist/` شامل `manifest.json` و `newtab.html` و آیکون‌ها خواهد بود.

2. **Open Chrome extensions / باز کردن صفحه اکسشنشن‌ها:**

   Navigate to `chrome://extensions` in Chrome (or Edge `edge://extensions`, Brave `brave://extensions`).

   در کروم به آدرس `chrome://extensions` بروید و **Developer mode** را فعال کنید.

3. **Enable Developer mode** (top-right toggle).

4. **Load unpacked / بارگذاری اکسشنشن:**

   Click **"Load unpacked"** and select the `chrome-extension/dist` folder.

   روی **"Load unpacked"** کلیک کنید و پوشه `chrome-extension/dist` را انتخاب کنید.

5. **Open a new tab** — your dashboard appears. 🎉

   یک تب جدید باز کنید — داشبورد شما نمایش داده می‌شود.

### Option B — Run the Next.js preview (for development/testing)

```bash
npm install
npm run dev      # http://localhost:3000
```

The preview uses `localStorage` instead of `chrome.storage.sync`, so it works in any browser tab.

---

## 🛠️ Development / توسعه

```bash
cd chrome-extension

npm install
npm run dev      # Vite dev server with HMR (http://localhost:5173)
npm run build    # type-check + production build → dist/
npm run lint     # tsc --noEmit
```

Regenerate icons / تولید مجدد آیکون‌ها:

```bash
node scripts/gen-icons.cjs
```

---

## ⌨️ Keyboard Shortcuts / میان‌برهای صفحه‌کلید

| Shortcut       | Action                              | عملکرد                       |
| -------------- | ----------------------------------- | ---------------------------- |
| `/`            | Focus the search bar                | فوکوس نوار جستجو             |
| `Ctrl/⌘ + K`   | Open command palette                | باز کردن پنل فرمان           |
| `↑` / `↓`      | Navigate search suggestions         | جابجایی در پیشنهادها         |
| `Enter`        | Open selected result                | باز کردن مورد انتخاب‌شده     |
| `Esc`          | Close dialog / blur search          | بستن دیالوگ                  |
| `g` then `d`   | Go to Dashboard                     | رفتن به داشبورد              |
| `g` then `s`   | Go to Settings                      | رفتن به تنظیمات              |
| `n`            | New shortcut                        | میان‌بر جدید                 |
| `c`            | New category                        | دسته‌بندی جدید               |
| `Ctrl/⌘ + ,`   | Go to settings                      | رفتن به تنظیمات              |

---

## 🎨 Customization / شخصی‌سازی

- **Theme**: Settings → Appearance → Light / Dark / System.
- **Accent**: 8 presets or a custom hex color (live preview everywhere).
- **Card radius**: 0.25rem → 2rem slider.
- **Density**: Comfortable / Compact.
- **Columns**: 3 → 10 per row on desktop.
- **Background**: Aurora / Mesh / Dots / Plain.
- **Glass intensity**: 0% → 100% backdrop blur.
- **Per-category color & icon**: edit a category to customize it.
- **Category reordering**: drag the grip handle on any category card.

All settings sync via `chrome.storage.sync`.

---

## 📦 Import / Export / وارد و خارج کردن داده‌ها

Open the sidebar → **Export** to download a `newtab-backup-YYYY-MM-DD.json` file. Use **Import** to restore from a file or pasted JSON.

از نوار کناری روی **Export** بزنید تا یک فایل JSON دانلود شود، و با **Import** داده‌ها را بازیابی کنید.

---

## 🔒 Permissions / دسترسی‌ها

| Permission | Why                                      |
| ---------- | ---------------------------------------- |
| `storage`  | Persist & sync your dashboard data       |

No host permissions, no network calls, no tracking. Favicons are loaded via Google's public favicon service.

---

## 📄 License

MIT — use it, fork it, ship it.
