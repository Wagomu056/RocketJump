# Reverse Engineering — Architecture (Concise)

> Scope: This is the existing PixiJS v8 "creation" engine template. The game will be built in `src/app/`. The `src/engine/` layer is treated as a stable, reusable framework and is **not** modified.

## Layered Structure
- **`src/engine/`** — Reusable framework. `CreationEngine extends PIXI.Application` and registers three plugins:
  - **NavigationPlugin** → `engine().navigation`: screen/popup stack manager.
  - **AudioPlugin** → `engine().audio`: `audio.bgm` (looping, fade) + `audio.sfx` (one-shots), independent volumes.
  - **ResizePlugin** → drives `resize(w, h)` propagation.
- **`src/app/`** — Game-specific code (current content is an unmodified bouncer demo to be replaced).

## Screen Lifecycle (engine/navigation/navigation.ts)
Screens/popups are `Container` subclasses implementing optional `AppScreen` hooks: `prepare()`, `show()`, `hide()`, `pause()`, `resume()`, `reset()`, `update(ticker)`, `resize(w, h)`, `blur()`, `focus()`, `onLoad(progress)`.

Key behaviors:
- `navigation.showScreen(Ctor)` swaps the current screen; `presentPopup` / `dismissPopup` overlay popups (presenting auto-`pause()`s the screen).
- A screen with an `update` method is **auto-registered on the ticker** while shown — this is the game-loop hook.
- Screens are pooled via `BigPool`; `reset()` must restore reusable state.
- `static assetBundles = ["..."]` declares required asset bundles, loaded (with `onLoad` progress) before the screen appears.
- Window visibility changes call `navigation.blur()`/`focus()`; `MainScreen.blur()` auto-presents the pause popup.

## Entry Sequence (main.ts)
create engine → `init()` → `userSettings.init()` → show `LoadScreen` then `MainScreen`. A global singleton is exposed via `engine()` from `src/app/getEngine.ts`.

## Persistence
`engine/utils/storage.ts` wraps `localStorage`; `app/utils/userSettings.ts` is the typed settings layer (volumes today). High score will follow this pattern.
