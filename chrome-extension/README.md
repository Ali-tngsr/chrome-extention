# New Tab Dashboard — Chrome Extension

A beautiful, minimal, production-ready Chrome Extension (Manifest V3) that replaces Chrome's New Tab page with a modern productivity dashboard.

This is the **standalone Chrome Extension** version, built with Vite + React + TypeScript.

---

## ✨ Features

- **Search bar** — Google search + URL detection + live suggestions
- **Categories** — unlimited, drag & drop reordering, expand/collapse
- **Shortcuts** — favicon (multi-provider fallback), context menu (Edit/Delete/Duplicate/Move), drag & drop reorder
- **Quick Launch** — configurable site chips under the search bar (add/remove in Settings)
- **Insights** — usage analytics (most-opened ranking + recent activity)
- **Settings** — theme (dark/light/system), accent color, card radius, grid density, columns, animations, clock format, background style, glass intensity, Import/Export, keyboard shortcuts reference
- **Keyboard shortcuts** — `/`, `n`, `c`, `?`, `g d/s`, `Ctrl+,`
- **Storage** — `chrome.storage.sync` (syncs across devices)

---

## 🚀 Build & Install

### Prerequisites
- [Node.js](https://nodejs.org/) 18+
- npm

### Build

```bash
cd chrome-extension
npm install
npm run build
```

This produces a `dist/` folder containing `manifest.json`, `newtab.html`, assets, and icons.

> **Note:** The build script uses `shx cp` (cross-platform) to copy `manifest.json` into `dist/`. This works on Windows, macOS, and Linux.

### Install in Chrome

1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode** (top-right toggle)
3. Click **"Load unpacked"**
4. Select the `dist/` folder
5. Open a new tab — your dashboard appears 🎉

---

## 🛠️ Development

```bash
npm install
npm run dev      # Vite dev server with HMR (http://localhost:5173)
npm run build    # type-check + production build → dist/
npm run lint     # tsc --noEmit
```

### Regenerate icons

```bash
node scripts/gen-icons.cjs
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut     | Action                  |
| ------------ | ----------------------- |
| `/`          | Focus search            |
| `Enter`      | Open selected result    |
| `Esc`        | Close dialog            |
| `n`          | New shortcut            |
| `c`          | New category            |
| `?`          | Show shortcuts help     |
| `g` then `d` | Go to dashboard         |
| `g` then `s` | Go to settings          |
| `Ctrl + ,`   | Go to settings          |

---

## 📁 Project Structure

```
chrome-extension/
├── manifest.json              # MV3 manifest
├── newtab.html                # New Tab page entry
├── index.html                 # placeholder
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── public/icons/              # 16/48/128 PNG icons
├── scripts/gen-icons.cjs      # regenerate icons
└── src/
    ├── main.tsx               # entry point
    ├── index.css              # Tailwind 3 + theme tokens
    ├── types/newtab.ts
    ├── lib/                   # storage, url, search-focus, utils
    ├── store/newtab-store.ts  # Zustand (persisted)
    ├── hooks/                 # use-keyboard-shortcuts, use-newtab-theme
    └── components/
        ├── newtab/            # all dashboard components
        └── ui/                # shadcn/ui components
```

---

## 🔒 Permissions

| Permission | Why |
| ---------- | --- |
| `storage`  | Persist & sync dashboard data |

No host permissions, no tracking.

## 📄 License

MIT
