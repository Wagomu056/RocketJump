# Unit of Work — Feature / Requirement Story Map

> User Stories stage was skipped (solo developer, single spec). This map links functional requirements (from requirements.md) to units.

## Unit 1: Foundation + Screens

| Requirement | Feature | File |
|-------------|---------|------|
| FR-1.1 | Three screens managed via NavigationPlugin | TitleScreen, ScoreScreen, main.ts |
| FR-1.2 | Title → Gameplay → Score → RETRY/TITLE flow | main.ts + all 3 screens |
| FR-1.3 | Title shows game title + high score | TitleScreen |
| FR-1.4 | Score shows distance + new-record celebration + RETRY/TITLE | ScoreScreen |
| FR-9.1 | High score persisted in localStorage | userSettings.ts (highScore field) |
| NFR-4 | GAME_PARAMS centralised for tuning | GameParams.ts |
| NFR-4 | `npm run build` passes (no unused vars, lint clean) | all Unit 1 files |

## Unit 2: GameScreen

| Requirement | Feature | File |
|-------------|---------|------|
| FR-2.1 | Touch / drag input | GameScreen (pointer events) |
| FR-2.2 | Jet angle from ship → pointer, clamped 0..π | Ship.update() |
| FR-2.3 | Reverse-thrust: vx −= cos(θ)·thrust | Ship.update() |
| FR-2.4 | Gravity + friction each frame | Ship.update() |
| FR-2.5 | deltaTime-stable physics | Ship.update() (ticker.deltaTime) |
| FR-3.1 | Fuel consumed while thrusting | Ship (fuel FSM: CONSUMING) |
| FR-3.2 | Cooldown 1.0s on release before recharge | Ship (fuel FSM: COOLDOWN) |
| FR-3.3 | Auto-recharge after cooldown, mid-flight ok | Ship (fuel FSM: CHARGING) |
| FR-3.4 | Fuel gauge UI | GameScreen.updateFuelUI() |
| FR-4.1 | Camera: worldContainer.x shift at 40% dead-zone | GameScreen.updateCamera() |
| FR-4.2 | Score = distance scrolled right | GameScreen.updateScoreUI() |
| FR-4.3 | Ship clips at left edge (no game over) | GameScreen |
| FR-5.1 | Procedural platforms with varied width/y | PlatformGenerator, Platform |
| FR-5.2 | Gap difficulty scales with distance | PlatformGenerator |
| FR-5.3 | Off-screen platforms destroyed | PlatformGenerator.collectStale() |
| FR-6.1 | AABB descending-only landing; vy = 0 | GameScreen.checkCollisions() → Ship.land() |
| FR-6.2 | Land on empty fuel; take off after recharge | Ship (fuel FSM) + collision |
| FR-6.3 | Game over: ship falls below screen | GameScreen.checkGameOver() |
| FR-7.1 | Items spawn on platforms at random | PlatformGenerator, FuelItem |
| FR-7.2 | Item pickup: refill fuel + grow maxFuel | FuelItem.collect(ship) |
| FR-8.1 | Neon asset-less visuals (PIXI.Graphics) | Ship, Platform, FuelItem, Starfield |
| FR-8.2 | Jet particles from nozzle | JetParticleSystem |
| FR-8.3 | Score label + fuel gauge during play | GameScreen UI |
| NFR-1 | 60fps; platform/particle cleanup | PlatformGenerator + JetParticleSystem |
| NFR-2 | Resize-aware layout via ResizePlugin | GameScreen.resize() |
| NFR-3 | Immediate pointer response | GameScreen pointer events |
| NFR-5 | Pause reuses engine PausePopup | GameScreen.blur() |
