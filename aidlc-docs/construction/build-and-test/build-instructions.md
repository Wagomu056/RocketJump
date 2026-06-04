# Build Instructions

## Prerequisites
- **Runtime**: Node.js ≥ 18 (ESM support required)
- **Package manager**: npm
- **Build tool**: Vite ^6 + AssetPack ^1 (bundled in devDependencies)

## Build Steps

### 1. Install dependencies
```bash
npm install
```

### 2. Development server (hot-reload, opens browser)
```bash
npm run dev
# → http://localhost:8080
```
AssetPack watches `raw-assets/` and regenerates `src/manifest.json` + `public/assets/` on change.

### 3. Production build
```bash
npm run build
```
Pipeline: `eslint .` → `tsc --noEmit` (type-check only) → `vite build`
- AssetPack processes `raw-assets/` → `public/assets/` + `src/manifest.json`
- Vite bundles TypeScript → `dist/`

### 4. Verify build success
Expected output in `dist/`:
- `index.html`
- `assets/index-*.js` (~414 kB, gzip ~130 kB)
- Several code-split PixiJS renderer chunks

## Troubleshooting

### `eslint: command not found`
```bash
npm install   # re-install devDependencies
```

### `Cannot find module '../manifest.json'`
The `@ts-ignore` comment in `engine.ts` suppresses this during `tsc`. The manifest is generated at `vite build` time by AssetPack's `buildStart` hook. If it appears at dev-time, run `npm run dev` once to generate it.

### Asset changes not reflected
Delete the AssetPack cache and rebuild:
```bash
rm -rf .assetpack && npm run build
```
