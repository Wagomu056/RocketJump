# Code Generation Plan — Unit 1: Foundation + Screens

## Unit Context
- **Unit**: Foundation + Screens
- **Dependencies**: `src/engine/` (stable, untouched)
- **Must complete before**: Unit 2 (GameScreen) which imports GAME_PARAMS, userSettings.highScore, TitleScreen, ScoreScreen

## Requirements Covered
FR-1.1, FR-1.2, FR-1.3, FR-1.4, FR-9.1, NFR-4, NFR-6

## Key Design Notes
- **No image assets used**: All game screens declare `static assetBundles = []`. The existing `Button` component requires `button.png` (main bundle) so game screens use `PIXI.Graphics` for buttons instead.
- **No audio**: Game is silent this iteration; no audio calls in game screens.
- **Pause**: GameScreen will implement pause as a simple `paused` flag in `blur()`/`focus()` — no PausePopup used in game screens, avoiding main-bundle dependency.
- **Neon glow on title**: Achieved with TextStyle `dropShadow` (built-in to PixiJS text, no filter package needed).
- **automation-friendly `data-testid`**: N/A — PixiJS renders to Canvas; interactive elements are display objects, not DOM nodes.

---

## Generation Steps

### Step 1: Create `src/app/config/GameParams.ts`
- [x] Create new file
- [ ] Export `GAME_PARAMS` const object with all spec §7 values plus camera and platform generation constants

### Step 2: Modify `src/app/utils/userSettings.ts`
- [x] Add `KEY_HIGH_SCORE` string constant
- [x] Add `getHighScore(): number` method (default 0)
- [x] Add `setHighScore(value: number): void` method

### Step 3: Delete demo files
- [x] Delete `src/app/screens/main/MainScreen.ts`
- [x] Delete `src/app/screens/main/Bouncer.ts`
- [x] Delete `src/app/screens/main/Logo.ts`

### Step 4: Create `src/app/screens/TitleScreen.ts`
- [x] Extend `Container`, implement `AppScreen` lifecycle
- [x] `static assetBundles = []`
- [x] Constructor: create title text (cyan, neon glow via dropShadow), high score label, START button (PIXI.Graphics)
- [x] `show()`: fade in elements with motion `animate`
- [x] `hide()`: fade out
- [x] `reset()`: refresh high score label from userSettings
- [x] `resize(w, h)`: reposition all elements to screen center
- [x] START button `pointerdown` → `engine().navigation.showScreen(GameScreen)`

### Step 5: Create `src/app/screens/ScoreScreen.ts`
- [x] Extend `Container`, implement `AppScreen` lifecycle
- [x] `static assetBundles = []`
- [x] Score read from `userSettings.lastScore` in `show()` (replaces setScore approach)
- [x] Constructor: create score label, new-record label (hidden by default), RETRY button, TITLE button
- [x] `show()`: compare score to highScore, update if beaten, show/hide new-record label, animate in
- [x] `hide()`: fade out
- [x] `reset()`: clear score
- [x] `resize(w, h)`: reposition elements
- [x] RETRY button → `engine().navigation.showScreen(GameScreen)`
- [x] TITLE button → `engine().navigation.showScreen(TitleScreen)`

### Step 6: Modify `src/main.ts`
- [x] Remove import of `MainScreen`
- [x] Add import of `TitleScreen`
- [x] Change `showScreen(MainScreen)` → `showScreen(TitleScreen)`
- [x] Update background to `"#0a0a12"` (dark space, matches neon aesthetic)

### Step 7: Create documentation summary
- [x] Create `aidlc-docs/construction/unit1-foundation-screens/code/summary.md`

---

## Helper: NeonButton Factory (inline, not a separate file)

Each screen creates buttons using this pattern (inlined, not shared, since only 1-2 buttons per screen):

```typescript
function makeButton(label: string, w = 220, h = 60): Container {
    const btn = new Container();
    const bg = new Graphics();
    bg.roundRect(-w / 2, -h / 2, w, h, 8);
    bg.fill({ color: 0x00e5ff, alpha: 0.1 });
    bg.stroke({ color: 0x00e5ff, width: 2 });
    const txt = new Text({ text: label, style: { fill: '#00e5ff', fontSize: 28, fontWeight: 'bold' } });
    txt.anchor.set(0.5);
    btn.addChild(bg, txt);
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    return btn;
}
```
