# Reverse Engineering — Technology Stack (Concise)

| Layer | Technology |
|---|---|
| Language | TypeScript (strict mode, `noUnusedLocals`/`noUnusedParameters`) |
| Rendering | PixiJS v8 (`pixi.js` ^8.8.1), `PIXI.Graphics` for all game art (asset-less) |
| UI toolkit | `@pixi/ui` ^2.2.2 |
| Audio | `@pixi/sound` ^6.0.1 (via engine AudioPlugin) |
| Animation | `motion` ^12.4.7 (`animate(...)`) |
| Build / dev | Vite ^6.2.0, AssetPack ^1.4.0 (asset pipeline) |
| Lint / format | ESLint ^9 flat config + Prettier (enforced as lint rule) |
| Spine (optional) | `@esotericsoftware/spine-pixi-v8` (installed, import commented out) |
| Persistence | Browser `localStorage` via `engine/utils/storage.ts` |
| Tests | None configured (no test runner in project) |

## Build commands
- `npm run dev` — Vite dev server on port 8080, AssetPack watches `raw-assets/`.
- `npm run build` — `lint` → `tsc --noEmit` → `vite build` (fails on any lint/type error).
- `npm run lint` — ESLint over the repo.

## Constraints relevant to the game
- **Asset-less**: all visuals via `PIXI.Graphics` (neon/cyberpunk). No image assets needed.
- **Target**: mobile-web; touch/drag input is the primary control.
