# Integration Test Instructions

## Purpose
Verify that all three game screens integrate correctly with the engine navigation system, and that the full gameplay loop works end-to-end.

## Test Environment
- **Browser**: Any modern browser (Chrome/Safari/Firefox) or Playwright headless Chromium
- **Server**: `npm run dev` → `http://localhost:8080`
- **Platform**: Test on a mobile viewport (390×844) to match the target

## Test Scenarios

### Scenario 1: Full Screen Flow (Title → Game → Score → Retry)

**Setup**: `npm run dev`, open `http://localhost:8080`

**Steps**:
1. Wait for LoadScreen (PixiJS logo + progress circle) to complete
2. Verify TitleScreen appears: "ROCKET JUMP" title fully visible, "BEST: 0m", START button
3. Tap/click START
4. Verify GameScreen: ship on platform, starfield, "0m" score, full cyan fuel gauge
5. Hold finger/mouse lower-left of screen to thrust ship right
6. Verify score label increases as ship crosses camera dead-zone
7. Let ship fall into the abyss (gap between platforms)
8. Verify ScoreScreen: distance in meters, "NEW RECORD!" on first run, RETRY + TITLE buttons
9. Tap RETRY → verify fresh GameScreen with ship on initial platform
10. Tap TITLE → verify TitleScreen with updated high score

**Expected**: All 10 steps pass without JS errors.

### Scenario 2: Fuel System

**Setup**: Start a game, thrust continuously

**Steps**:
1. Hold thrust continuously — observe fuel gauge draining (blue → red)
2. When fuel empty, verify thrust stops (ship coasts, no particles)
3. Release touch — wait 1 second — verify fuel bar starts filling
4. Touch again during cooldown (< 1s after release) — verify cooldown resets, fuel consumed again
5. Wait full cooldown + charge — verify fuel gauge returns to cyan/full

### Scenario 3: High Score Persistence

**Setup**: Play two sessions

**Steps**:
1. Play session 1, note the score shown on Score screen
2. Tap TITLE → Title screen shows "BEST: [score]m"
3. Refresh the browser (`F5`)
4. TitleScreen again shows "BEST: [score]m" (from localStorage)
5. Play session 2 with a lower score — Score screen should NOT show "NEW RECORD!"
6. Play session 2 with a higher score — Score screen SHOULD show "NEW RECORD!" and update BEST

## Playwright Automated Integration Test

```bash
# Install once
npm install --save-dev @playwright/test
npx playwright install chromium

# Run the verification script
node aidlc-docs/construction/build-and-test/playwright-verify.cjs
```

See `playwright-verify.cjs` for the automated script used during Build & Test. Key assertions verified:
- Title screen renders with neon title, high score, START
- GameScreen renders with ship, platform, HUD
- Score increases during rightward thrust (81m+ after 3s)
- ScoreScreen shows distance + NEW RECORD! on first run
- RETRY navigates back to GameScreen
