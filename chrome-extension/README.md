# New Tab Dashboard — Chrome Extension

A beautiful, minimal, production-ready **New Tab** replacement for Chrome (Manifest V3).
It turns every new tab into a fast, elegant productivity dashboard focused on quick
website access — inspired by Arc, Linear, Raycast, Vercel and Notion.

![accent](https://img.shields.io/badge/accent-5E81F4-5E81F4) ![manifest](https://img.shields.io/badge/manifest-v3-success) ![react](https://img.shields.io/badge/react-18-61dafb) ![vite](https://img.shields.io/badge/vite-5-646cff)

---

## ✨ Features

- **Command-style search bar** — Google search + smart URL detection. Type `github`
  → opens `https://github.com`. Type a query → Google search. Live suggestions
  (matching shortcuts + recent items), arrow-key navigation.
- **Unlimited categories** — Development, AI, Work, Research, Reading, … Each is a
  beautiful expandable card with a Lucide icon and optional accent color.
- **Website shortcuts** — favicon-powered tiles in a responsive grid. Drag & drop
  reordering, add / edit / delete / duplicate, move between categories.
- **Context menu** — right-click any shortcut for Edit, Delete, Duplicate, Move.
- **Collapsible sidebar** — Dashboard, All Categories, Settings, Import, Export +
  live stats.
- **Settings** — Dark / Light / System theme, 8 accent presets + custom color,
  card radius slider, grid density, columns per row, animations on/off, clock toggle.
- **Import / Export** — full JSON backup & restore.
- **Keyboard shortcuts** — `/` focus search, `Ctrl/⌘+K` command search, `Esc` close,
  arrow keys navigate results, `g d / g c / g s` switch views.
- **Synced storage** — everything saved to `chrome.storage.sync` so it follows you
  across signed-in Chrome instances.
- **Premium visuals** — soft shadows, glass blur, ambient aurora glow, 200ms
  micro-interactions, custom scrollbars, fully responsive (laptop → ultrawide).

---

## 🧱 Tech Stack

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

## 📁 Folder Structure

```
chrome-extension/
├── manifest.json              # MV3 manifest (newtab override + storage permission)
├── package.json
├── vite.config.ts             # multi-page build (newtab.html)
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── newtab.html                # the page rendered for every new tab
├── index.html                 # placeholder (redirects to newtab)
├── public/
│   └── icons/                 # 16/48/128 PNG icons
├── scripts/
│   └── gen-icons.cjs          # regenerate icons from SVG
└── src/
    ├── main.tsx               # entry point
    ├── NewTabApp.tsx          # app shell + view routing
    ├── index.css              # Tailwind + theme tokens
    ├── types/index.ts         # Category, Shortcut, Settings, ...
    ├── lib/
    │   ├── storage.ts         # chrome.storage.sync adapter
    │   ├── url.ts             # URL detection + favicon helpers
    │   └── search-focus.ts    # global focus registry
    ├── store/useStore.ts      # Zustand store (persisted)
    ├── hooks/
    │   ├── useTheme.ts        # applies theme/accent/radius/density
    │   └── useKeyboardShortcuts.ts
    └── components/
        ├── Sidebar.tsx
        ├── SearchBar.tsx
        ├── Greeting.tsx
        ├── CategoryCard.tsx
        ├── ShortcutGrid.tsx
        ├── ShortcutTile.tsx
        ├── ContextMenu.tsx
        ├── SettingsPanel.tsx
        ├── IconMap.tsx
        └── dialogs/
            ├── _Dialog.tsx           # shared dialog primitives
            ├── ShortcutDialog.tsx
            ├── CategoryDialog.tsx
            └── ImportExportDialog.tsx
```

---

## 🚀 Installation (Load Unpacked)

1. **Build the extension**

   ```bash
   cd chrome-extension
   npm install
   npm run build
   ```

   This produces a `dist/` folder containing `manifest.json`, `newtab.html`,
   `assets/` and `icons/`.

2. **Open Chrome extensions**

   Navigate to `chrome://extensions` in Chrome (or any Chromium browser:
   Edge `edge://extensions`, Brave `brave://extensions`).

3. **Enable Developer mode** (top-right toggle).

4. **Load unpacked**

   Click **“Load unpacked”** and select the `chrome-extension/dist` folder.

5. **Open a new tab** — your dashboard appears. 🎉

> During development you can run `npm run dev` for hot-reload, but the
> new-tab override only applies to the built `dist/` loaded into Chrome.

---

## 🛠️ Development

```bash
npm install
npm run dev      # Vite dev server with HMR (http://localhost:5173)
npm run build    # type-check + production build → dist/
npm run lint     # tsc --noEmit
```

Regenerate icons:

```bash
node scripts/gen-icons.cjs
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut       | Action                          |
| -------------- | ------------------------------- |
| `/`            | Focus the search bar            |
| `Ctrl/⌘ + K`   | Open / focus search (command)   |
| `↑` / `↓`      | Navigate search suggestions     |
| `Enter`        | Open selected result            |
| `Esc`          | Close dialog / blur search      |
| `g` then `d`   | Go to Dashboard                 |
| `g` then `c`   | Go to All Categories            |
| `g` then `s`   | Go to Settings                  |

---

## 🎨 Customization

- **Theme**: Settings → Appearance → Light / Dark / System.
- **Accent**: 8 presets or a custom hex color (live preview everywhere).
- **Card radius**: 0.25rem → 2rem slider.
- **Density**: Comfortable / Compact (tighter grid spacing).
- **Columns**: 3 → 10 per row on desktop.
- **Animations**: toggle all transitions globally.
- **Per-category color**: edit a category to give it its own accent.

All settings sync via `chrome.storage.sync`.

---

## 📦 Import / Export

Open the sidebar → **Export** to download a `newtab-backup-YYYY-MM-DD.json` file
containing your categories, shortcuts and settings. Use **Import** to restore from
a file or pasted JSON.

---

## 🔒 Permissions

| Permission | Why                                      |
| ---------- | ---------------------------------------- |
| `storage`  | Persist & sync your dashboard data       |

No host permissions, no network calls, no tracking. Favicons are loaded via
Google’s public favicon service.

---

## 🌐 Live Web Preview

A feature-identical preview is also rendered by the host Next.js app at `/` so you
can try the dashboard in a normal browser tab. In that preview, `chrome.storage.sync`
falls back to `localStorage` automatically.

---

## 📄 License

MIT — use it, fork it, ship it.
