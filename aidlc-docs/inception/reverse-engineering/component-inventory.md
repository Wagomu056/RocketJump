# Reverse Engineering — Component Inventory (Concise)

## Engine (`src/engine/`) — stable, reused as-is
| Component | Path | Role |
|---|---|---|
| CreationEngine | engine/engine.ts | PIXI.Application subclass; registers plugins |
| NavigationPlugin / navigation | engine/navigation/ | Screen & popup stack, ticker wiring, pooling |
| AudioPlugin / audio | engine/audio/ | BGM + SFX with volumes & fades |
| ResizePlugin / resize | engine/resize/ | Resize propagation |
| storage | engine/utils/storage.ts | localStorage wrapper |
| maths / random / waitFor / getResolution | engine/utils/ | Helpers |

## App (`src/app/`) — current = template demo (to be replaced/extended)
| Component | Path | Disposition |
|---|---|---|
| getEngine | app/getEngine.ts | Keep (singleton accessor) |
| LoadScreen | app/screens/LoadScreen.ts | Keep / adapt |
| MainScreen | app/screens/main/MainScreen.ts | Replace demo content with game |
| Bouncer, Logo | app/screens/main/ | Remove (demo) |
| PausePopup, SettingsPopup | app/popups/ | Keep / adapt |
| Button, Label, RoundedBox, VolumeSlider | app/ui/ | Reuse for game UI |
| userSettings | app/utils/userSettings.ts | Extend with high score |

## New game components (to be created)
TitleScreen, GameScreen (gameplay loop), ScoreScreen, and game entities (Ship, Platform, FuelItem, Background/Starfield, JetParticles), plus a physics/fuel/world model. Defined precisely in later stages.
