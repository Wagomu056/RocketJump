# Requirements — Spaceship Platform Runner

## Intent Analysis
- **User Request**: Build the game specified in `doc/prompts/spec.md` using the AI-DLC workflow.
- **Request Type**: New Feature / New Project (game built on existing reusable engine).
- **Scope Estimate**: Multiple Components (3 screens + game entities + physics/fuel/world model + UI), all within `src/app/`.
- **Complexity Estimate**: Moderate — real-time physics loop, procedural generation, and tuning, but well-specified and single-player/local.

## Source of Truth
`doc/prompts/spec.md` is the authoritative spec. This document captures requirements plus the decisions made during Requirements Analysis. Where this doc and spec.md agree, spec.md governs implementation detail.

## Confirmed Decisions (from verification questions)
| # | Decision |
|---|----------|
| Q1 | **Replace** the template bouncer demo entirely with a Title / Gameplay / Score screen flow. |
| Q2 | After LoadScreen, show the **Title screen** first; START begins gameplay. |
| Q3 | **Silent** — no BGM/SFX in this iteration (audio can be added later via the engine's AudioPlugin). |
| Q4 | Use spec.md §7 `GAME_PARAMS` values verbatim, centralized in one constants module for easy tuning. |
| Q5 | **Reuse** the engine pause mechanism (auto-pause on tab blur; pause popup). |
| Security ext | **Disabled** (prototype/game). |
| PBT ext | **Disabled** (no test runner configured; UI/visual-heavy). |

## Functional Requirements

### FR-1 Screen Flow & State
- FR-1.1 Three screens: **Title**, **Gameplay**, **Score**, managed via the engine NavigationPlugin.
- FR-1.2 Title → (START) → Gameplay. Gameplay → (fall into the abyss) → Score. Score → (RETRY) → Gameplay; Score → (TITLE) → Title.
- FR-1.3 Title shows the game title (glowing text) and the high score from localStorage.
- FR-1.4 Score shows the run's distance, a "new record" celebration when the high score is beaten, and RETRY / TITLE buttons.

### FR-2 Ship Control & Physics (spec §3 — highest priority)
- FR-2.1 Input is touch/mouse **hold & drag** (pointer events; mobile-first).
- FR-2.2 Jet direction = vector from ship center → pointer position; angle θ = atan2(touchY−shipY, touchX−shipX), **clamped to 0 ≤ θ ≤ π** (left half-circle).
- FR-2.3 Thrust applies the **reverse** of the jet direction: vx −= cos(θ)·thrustPower; vy −= sin(θ)·thrustPower (only while touching AND fuel > 0).
- FR-2.4 Every frame: gravity vy += G; friction vx ·= μx, vy ·= μy; then position += velocity.
- FR-2.5 Frame-rate independence: physics computed per spec assuming ~60fps; use the ticker's deltaTime scaling so behavior is stable across devices.

### FR-3 Fuel System (spec §3.3)
- FR-3.1 Thrusting consumes fuel at `fuelDecreaseRate`/frame; at fuel = 0 thrust stops even while held.
- FR-3.2 On release or fuel-empty, a **cooldown** (1.0s) starts; re-touching resets it to consuming.
- FR-3.3 After cooldown reaches 0, fuel auto-recovers at `fuelRecoverRate`/frame up to `maxFuel`, **including mid-flight** (landing not required).
- FR-3.4 Fuel gauge UI reflects current fuel / maxFuel.

### FR-4 Camera & World (spec §4)
- FR-4.1 Camera follows right: when ship.x exceeds 40% screen width (dead-zone), shift the world container left by the overflow.
- FR-4.2 Distance traveled = score (right progress).
- FR-4.3 Ship clips at the left screen edge if it ever back-tracks (no game over from going left).

### FR-5 Platform Generation (spec §4.2)
- FR-5.1 Floating rectangular platforms of varied width and y, generated procedurally off the right edge as the camera advances.
- FR-5.2 Gap width/difficulty increases with distance, but stays within reach of an inertial jump (never impossible).
- FR-5.3 Platforms scrolled fully off the left are destroyed and removed (memory release).

### FR-6 Collision & Landing (spec §4.3)
- FR-6.1 AABB between ship bottom and platform top; landing counts **only when descending** (vy > 0) onto a platform top → vy = 0, ship rests on top.
- FR-6.2 Landing with empty fuel is allowed; the ship can take off again after cooldown refuels it.
- FR-6.3 **Game over**: ship falls below the bottom of the screen (the abyss) → transition to Score.

### FR-7 Items (spec §5)
- FR-7.1 Fuel-tank items spawn on platforms at a random probability.
- FR-7.2 On pickup (ship overlaps item): refill fuel (large amount / full) AND increase `maxFuel` by `fuelMaxUpgradeAmount` (growth element).

### FR-8 Visuals (spec §6 — asset-less, neon/cyberpunk)
- FR-8.1 All drawn with `PIXI.Graphics`: Ship (cyan `#00e5ff` rocket/triangle), Platform (body `#1a1a24`, top line `#39ff14`), Item (glowing pink `#ff007f`/yellow), Background (white stars of varying brightness, parallax-friendly).
- FR-8.2 Jet particles: spawned from the nozzle each thrusting frame, ejected opposite the jet angle (θ+π) with random spread; shrink + fade over life; removed at alpha ≤ 0.
- FR-8.3 UI: score readout and fuel gauge during gameplay; glow on title text.

### FR-9 Persistence
- FR-9.1 High score (max distance) persisted in localStorage via the engine storage / userSettings pattern; read on Title, updated on Score.

## Non-Functional Requirements
- NFR-1 **Performance**: smooth ~60fps on mobile web; object pooling/cleanup for platforms and particles to avoid GC churn and unbounded growth.
- NFR-2 **Responsiveness**: adapt to resize/orientation via the engine ResizePlugin; dead-zone and layout computed from current screen size.
- NFR-3 **Input latency**: pointer-driven thrust must feel immediate (handle pointerdown/move/up on the game stage).
- NFR-4 **Maintainability/Tuning**: all tuning constants centralized (`GAME_PARAMS`); engine layer untouched; TypeScript strict (no unused locals/params) and lint/Prettier clean (`npm run build` passes).
- NFR-5 **Code style**: follow existing app conventions (screen lifecycle hooks, `engine()` accessor, `@pixi/ui` for buttons, `motion` for UI animation).
- NFR-6 **No external assets**: everything via `PIXI.Graphics`; no new files in `raw-assets/` required.

## Out of Scope (this iteration)
- Audio (BGM/SFX) — deferred (Q3=A).
- Online leaderboards / accounts / networking.
- Multiple ship types, levels, or monetization.
- Automated test suite (no runner configured; PBT disabled).

## Key Requirements Summary
A mobile-web, asset-less PixiJS infinite runner: thrust a ship across procedurally generated neon platforms using inertia + a limited, auto-recharging fuel jet; score by distance; fuel-tank items grow max fuel; game over on falling into the abyss; Title/Gameplay/Score flow with a persisted high score. Built entirely in `src/app/` on the stable engine, tuned via a single `GAME_PARAMS` constant, silent for now.
