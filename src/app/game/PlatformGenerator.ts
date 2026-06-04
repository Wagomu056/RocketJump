import { GAME_PARAMS } from "../config/GameParams";

import { FuelItem } from "./FuelItem";
import { Platform } from "./Platform";

export class PlatformGenerator {
  private nextSpawnX: number;
  private lastPlatformY: number;
  private readonly screenH: number;

  constructor(
    initialRightX: number,
    initialY: number,
    _screenW: number,
    screenH: number,
  ) {
    this.nextSpawnX = initialRightX;
    this.lastPlatformY = initialY;
    this.screenH = screenH;
  }

  /**
   * Spawn new platforms/items to fill ahead of the camera.
   * Returns newly created objects; caller adds them to the world.
   */
  public step(
    worldX: number,
    screenW: number,
    score: number,
  ): { platforms: Platform[]; items: FuelItem[] } {
    const platforms: Platform[] = [];
    const items: FuelItem[] = [];

    const cameraRight = -worldX + screenW;
    const spawnUntil = cameraRight + GAME_PARAMS.worldBuffer;

    while (this.nextSpawnX < spawnUntil) {
      const baseGap =
        GAME_PARAMS.initialGapMin + score * GAME_PARAMS.gapGrowthPerMeter;
      const gap = Math.max(
        GAME_PARAMS.initialGapMin,
        Math.min(GAME_PARAMS.maxGap, baseGap + (Math.random() * 60 - 30)),
      );

      const platformW =
        GAME_PARAMS.platformWidthMin +
        Math.random() *
          (GAME_PARAMS.platformWidthMax - GAME_PARAMS.platformWidthMin);

      const x = this.nextSpawnX + gap;

      const yMin = this.screenH * GAME_PARAMS.platformYMarginTop;
      const yMax = this.screenH * (1 - GAME_PARAMS.platformYMarginBottom);
      const yShift = (Math.random() * 2 - 1) * this.screenH * 0.25;
      const y = Math.max(yMin, Math.min(yMax, this.lastPlatformY + yShift));

      platforms.push(new Platform(x, y, platformW));

      if (Math.random() < GAME_PARAMS.itemSpawnChance) {
        items.push(new FuelItem(x + platformW / 2, y - 25));
      }

      this.lastPlatformY = y;
      this.nextSpawnX = x + platformW;
    }

    return { platforms, items };
  }
}
