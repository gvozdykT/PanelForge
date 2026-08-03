# PanelForge

A browser-based **electrical panel designer** (PWA). Drag modules onto DIN rails, wire terminals (L/N/PE), view a panel schematic, run code checks, and export your project as JSON, PNG, or print/PDF.

Supports **Ukrainian**, **English**, **German**, and **Polish**.

---

## Requirements

- **Node.js** 18 or newer (20+ recommended)
- **npm** 9+ (comes with Node.js)

Check your versions:

```bash
node -v
npm -v
```

---

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/gvozdykT/PanelForge.git
cd PanelForge
```

### 2. Install dependencies

From the project root (where `package.json` lives):

```bash
npm install
```

This creates the `node_modules/` folder and installs all packages listed in `package.json`.

### 3. Run the development server

```bash
npm run dev
```

Vite starts a local dev server. Open the URL shown in the terminal (usually **http://localhost:5173**).

Changes under `src/` hot-reload automatically.

### 4. Build for production

```bash
npm run build
```

Output is written to `dist/`:

```
dist/
├── index.html
├── assets/
├── sw.js              # service worker (PWA)
└── manifest.webmanifest
```

### 5. Preview the production build

```bash
npm run preview
```

Serves the contents of `dist/` locally so you can test the production bundle before deploying.

---

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Type-check (`tsc`) and build to `dist/` |
| `npm run preview` | Serve the production build locally |

---

## Quick tour

1. Choose **phases**, **earthing system**, and **enclosure** in the left sidebar.
2. Drag a module from the **Module library** onto a DIN rail (or click to select, then click the rail).
3. Move modules by dragging them along the rail.
4. Switch to **Wiring** mode and connect two terminals of the same type (L, N, PE).
5. Use **Panel schematic** for a grouped single-line-style view.
6. Check **Code checks** (validation) in the sidebar.
7. Export via **PNG**, **Export JSON**, or **PDF / Print**.

### Demo project

Load the sample private-house diagram:

- Click **House (diagram)** in the toolbar, or
- Open `?demo=house` in the URL, e.g. `http://localhost:5173/?demo=house`

### Language

Use the **Language** selector in the header (uk / en / de / pl). The choice is saved in `localStorage`.

---

## Project structure

```
.
├── index.html              # App entry HTML
├── package.json
├── vite.config.ts          # Vite + PWA plugin
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx            # React entry point
    ├── App.tsx             # Main layout & views
    ├── App.css
    ├── components/
    │   ├── editor/         # DIN rail, modules, wires, schematic
    │   ├── library/        # Module catalog sidebar
    │   ├── panels/         # Toolbar, validation, properties, tags
    │   └── icons/
    ├── data/               # Enclosures, modules, wire colors, demos
    ├── hooks/              # useProject (state + autosave)
    ├── i18n/               # Translations (uk, en, de, pl)
    ├── lib/                # Geometry, wiring, validation, export
    └── types/              # TypeScript models
```

---

## Features

| Feature | Status |
|---------|--------|
| 1 / 2 / 3 phases | Yes |
| Earthing systems TN-S, TN-C-S, TN-C, TT, IT | Yes |
| 10 enclosures, multi-row DIN rails | Yes |
| 29 ElectroBoard device types + rating presets | Yes |
| Drag-and-drop on DIN rail | Yes |
| Interactive wiring mode | Yes |
| Panel schematic view | Yes |
| Orthogonal (90°) wire routing | Yes |
| Module replace (same category) | Yes |
| L1/L2/L3/N/PE color legend | Yes |
| N and PE busbars | Yes |
| Autosave (`localStorage`) | Yes |
| Import / export JSON (`.shield.json`) | Yes |
| PNG export (schematic or rail view) | Yes |
| Print / PDF specification | Yes |
| PWA (offline, installable) | Yes |
| Validation (TN-C + RCD, TT, selectivity, phase balance) | Yes |
| i18n: uk, en, de, pl | Yes |

---

## Deploying (static hosting)

After `npm run build`, upload everything inside `dist/` to any static host (GitHub Pages, Netlify, Cloudflare Pages, nginx, etc.).

Example with GitHub Pages (project site):

1. Set the Vite `base` in `vite.config.ts` if the app is not served from the domain root (e.g. `base: '/PanelForge/'`).
2. Run `npm run build`.
3. Publish the `dist/` folder (e.g. via GitHub Actions or the `gh-pages` branch).

---

## Standards referenced

- **Module width:** 18 mm per module (EN 60715)
- **DIN rail:** top-hat profile 35 × 7.5 mm
- **Wire colours:** IEC 60446 (L1 brown, L2 black, L3 grey, N blue, PE green-yellow)

---

## Tech stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite 6](https://vite.dev/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.io/)
- [html-to-image](https://github.com/niklasvh/html-to-image) (PNG export)

---

## License

MIT (add a `LICENSE` file when you choose a license).
