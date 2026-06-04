# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Workflow

**MANDATORY**: For any software development request (new features, bug fixes, refactoring, etc.), always follow the workflow defined in `WORKFLOW.md` before proceeding with implementation. `WORKFLOW.md` takes priority over all built-in workflows

## Commands

- `npm run dev` (or `npm start`) — Vite dev server on port 8080, opens browser, AssetPack watches `raw-assets/`.
- `npm run build` — runs `lint` → `tsc` (typecheck, `noEmit`) → `vite build`. The build fails on any lint or type error.
- `npm run lint` — ESLint over the repo (flat config in `eslint.config.mjs`, Prettier integrated as a lint rule).

There is no test runner configured in this project.

## What this is

This is the PixiJS **"creation" engine** template (PixiJS v8). The current `src/app/` code is the unmodified template demo (a bouncer with Add/Remove buttons). The actual game to build is specified in **`doc/prompts/spec.md`** (Japanese): a mobile-web 2D side-scrolling infinite runner where the player thrusts a spaceship across procedurally generated floating platforms, drawn entirely with `PIXI.Graphics` (asset-less, neon/cyberpunk style). Read that spec before implementing game features — it defines the physics, fuel system, camera, platform generation, and tuning constants (`GAME_PARAMS`).

## Architecture

Two layers: `src/engine/` (reusable framework, treat as stable) and `src/app/` (game-specific code, this is where game work goes).

### Engine (`src/engine/`)
`CreationEngine extends PixiJS Application` (`engine/engine.ts`). It registers three custom PixiJS extensions that replace/augment the default app plugins, each exposing a manager on the engine instance:
- **NavigationPlugin** → `engine().navigation` — screen/popup stack manager.
- **AudioPlugin** → `engine().audio` — `audio.bgm` (single looping track with fade) and `audio.sfx` (one-shots), each with independent volume.
- **ResizePlugin** → drives `resize(w, h)` propagation.

Access the engine from anywhere via `engine()` from `src/app/getEngine.ts` (a global singleton set once in `main.ts`).

### Screen lifecycle (`engine/navigation/navigation.ts`)
Screens and popups are plain `Container` subclasses that opt into lifecycle hooks by implementing optional methods of the `AppScreen` interface: `prepare()`, `show()`, `hide()`, `pause()`, `resume()`, `reset()`, `update(ticker)`, `resize(w, h)`, `blur()`, `focus()`, `onLoad(progress)`. Navigation calls only the methods that exist.

Key behaviors to rely on:
- `navigation.showScreen(Ctor)` swaps the current screen; `presentPopup`/`dismissPopup` overlay popups (presenting a popup auto-calls the screen's `pause()`).
- If a screen has an `update` method it is **auto-registered on the ticker** while shown and removed when hidden — this is the game loop hook.
- Screens are pooled via `BigPool`, so `reset()` must restore a screen to a reusable state.
- A screen declares its required asset bundles with a `static assetBundles = ["..."]` property; navigation loads that bundle (showing progress via `onLoad`) before the screen appears.
- Window visibility changes call `navigation.blur()`/`focus()` and pause/resume all sounds (see `engine.ts`); `MainScreen.blur()` auto-presents the pause popup.

`main.ts` is the entry sequence: create engine → `init()` → `userSettings.init()` → show `LoadScreen` then `MainScreen`.

### Assets (AssetPack)
Do **not** hand-edit asset manifests. Drop source assets into `raw-assets/` using AssetPack's folder/tag convention:
- `{m}` on a folder = a **bundle** (e.g. `main{m}/`, `preload{m}/`) — the folder name (minus tag) becomes the bundle name referenced in `assetBundles`.
- `{tps}` = pack folder into a texture atlas; `{m}` on textures, etc.

AssetPack (wired in via `scripts/assetpack-vite-plugin.ts`) generates `src/manifest.json` and outputs processed assets to `public/assets/`. Both are build artifacts — in dev they regenerate on file changes; never commit them as source. The `preload` bundle loads eagerly at startup; all other bundles background-load and are awaited on demand by `showScreen`. Reference assets by the path/alias shown in the manifest (e.g. `"main/sounds/bgm-main.mp3"`, `"icon-pause.png"`).

### Persistence
`engine/utils/storage.ts` wraps `localStorage`; `app/utils/userSettings.ts` is the typed settings layer (currently volumes). Game state like high score (per the spec) should follow this pattern.

## Conventions
- TypeScript strict mode with `noUnusedLocals`/`noUnusedParameters` — unused vars fail the build; use `_`-prefixed names or an `eslint-disable` line as the existing code does.
- Prettier formatting is enforced through ESLint; run `npm run lint` before considering work done.
- Spine support (`@esotericsoftware/spine-pixi-v8`) is installed but its import in `main.ts` is commented out — uncomment to enable.
- UI animations use the `motion` library (`animate(...)`), as in `MainScreen.show()` and `audio.ts`.

### AI-DLC documentation (`aidlc-docs/`)

Workflow artifacts generated by the AI-DLC process (requirements, plans, audit log). Not application code — do not import from here
