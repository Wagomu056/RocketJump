# Unit 3: Item System — Implementation Summary

## Overview

Successfully implemented a flexible two-type item system with tunable parameters for size, spawn frequency, and effect magnitude.

## Files Created

### 1. `src/app/game/Item.ts`
- **Purpose**: Base class for all item types
- **Key Features**:
  - Generic item initialization with ItemParams
  - Size-scaled rendering (diamond shape in neon pink)
  - Size-scaled collision detection via `getCollisionRadius()`
  - Pulse animation (sine wave alpha)
  - Collection effect application via `collect(ship)`
- **Dependencies**: PixiJS Graphics, Ship class

### 2. `src/app/game/GroundItem.ts`
- **Purpose**: Ground item subclass (currently minimal, extends Item base)
- **Characteristics**:
  - Default size: 1.0x
  - Default effect: +10 to fuel max
  - Spawned on platform surfaces by PlatformGenerator

### 3. `src/app/game/AirItem.ts`
- **Purpose**: Air item subclass (currently minimal, extends Item base)
- **Characteristics**:
  - Default size: 1.5x (50% larger)
  - Default effect: +25 to fuel max
  - Spawned in gaps between platforms by GameScreen

## Files Modified

### 1. `src/app/config/GameParams.ts`
- **Added**: `items` configuration object with:
  - `pickupRadius: 30` — Base collision radius (multiplied by item size)
  - `groundItem`: { size, spawnFrequency, effectAmount }
  - `airItem`: { size, spawnFrequency, effectAmount }
- **Removed**: Old `fuelMaxUpgradeAmount` (now per-item in config)
- **Note**: All parameters are tunable; adjust to balance difficulty and reward

### 2. `src/app/game/PlatformGenerator.ts`
- **Changed**: Return type from `FuelItem[]` to `Item[]`
- **Updated**: Import to use `GroundItem` instead of `FuelItem`
- **Modified Spawn Logic**:
  - Now uses `GAME_PARAMS.items.groundItem.spawnFrequency`
  - Creates `GroundItem` with params and pickup radius from config
  - Positioned at platform center, -25px above (same as old FuelItem)

### 3. `src/app/screens/GameScreen.ts`
- **Added**: Separate arrays for `groundItems` and `airItems`
- **Added**: `platformsWithoutAirItem` Set for tracking which platforms have received air items
- **Updated Item Animation Loop**:
  - Calls `update(ticker)` on both ground and air items
- **Added Air Item Spawning**:
  - After platform generation, checks gaps between consecutive platforms
  - Spawns air items with configurable frequency in gap center
  - Tracks which platforms already have air items (prevents duplicates)
- **Updated Collision Detection**:
  - Generic `checkItemCollision()` function handles both types
  - Uses `item.getCollisionRadius()` for size-scaled collision
  - Both item types trigger particle effects on collection
- **Updated Cleanup**:
  - `clearEntities()` manages both groundItems and airItems arrays
  - `pruneEntities()` removes off-screen and collected items from both arrays

### 4. `src/app/game/FuelItem.ts`
- **Deleted**: Old FuelItem class is no longer needed (replaced by Item hierarchy)

## Key Design Decisions

1. **Unified Item Base Class**: Both item types inherit from `Item` class, sharing:
   - Drawing logic (size-scaled diamond)
   - Animation (pulse effect)
   - Collection mechanism
   - Collision detection

2. **Size-Scaled Collision**: Collision radius scales linearly with item size:
   - Ground item: 30 * 1.0 = 30px
   - Air item: 30 * 1.5 = 45px
   - Larger items have larger pickup zones (easier to collect, more visually distinct)

3. **Parameter Centralization**: All tunable values in `GAME_PARAMS.items`:
   - Easy to adjust without code changes
   - Spawn frequencies, effect amounts, and sizes all configurable
   - Backward compatible (same structure, just organized differently)

4. **Air Item Spawning Strategy**:
   - Iterates through consecutive platform pairs
   - Spawns in computed gap bounds (random x between platforms, random y within vertical span)
   - Tracks which platforms have air items to avoid duplication in same gap

## Testing Verification

✓ **Build**: `npm run build` passes all checks (lint + tsc + vite)
✓ **Type Safety**: TypeScript strict mode, no errors
✓ **Code Style**: Prettier formatting compliant
✓ **Dev Server**: Running on port 8080 for manual testing

## Manual Test Checklist

- [ ] Ground items appear on platforms (size 1.0, visible below platforms)
- [ ] Air items appear between platforms (size 1.5, larger than ground items)
- [ ] Ground items spawn with ~40% frequency per platform
- [ ] Air items spawn with ~40% frequency per gap
- [ ] Collecting ground item increases fuel max by 10
- [ ] Collecting air item increases fuel max by 25
- [ ] Both item types trigger particle effect on collection
- [ ] Item sizes match expected visual ratio (1.5x vs 1.0x)
- [ ] Collision detection works for both types
- [ ] Off-screen items are properly cleaned up
- [ ] No memory leaks (items removed after collection)

## Performance Impact

- **Memory**: Two separate arrays instead of one (negligible — O(n) items on screen at any time)
- **CPU**: Item spawning is O(platforms) per frame (minimal, ~100 platforms typical)
- **Rendering**: Same as before (item count unchanged, just split into two types)

## Future Extensibility

The design allows easy addition of more item types:
1. Create new subclass extending `Item` (e.g., `PowerUpItem`)
2. Add configuration to `GAME_PARAMS.items`
3. Add spawning logic in `GameScreen` or `PlatformGenerator`
4. Collision detection already generic (uses `Item` base class interface)

## Breaking Changes

- Removed `FuelItem` class (now `GroundItem` for ground items)
- Removed `GAME_PARAMS.fuelMaxUpgradeAmount` (now in `items.groundItem.effectAmount` and `items.airItem.effectAmount`)
- Changed PlatformGenerator return type to `Item[]` (not `FuelItem[]`)

## Backward Compatibility

- Ship's `addMaxFuel()` method unchanged (still accepts amount parameter)
- All existing game mechanics remain the same
- Only internal item system refactored

---

**Implementation Status**: ✓ Complete
**Build Status**: ✓ Passing
**Ready for Testing**: ✓ Yes
