import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

import { GAME_PARAMS } from "../config/GameParams";
import type { Ship } from "./Ship";

export const ITEM_PICKUP_RADIUS = 30;

export class FuelItem extends Container {
  public collected = false;
  private pulseTime = 0;

  constructor(worldX: number, worldY: number) {
    super();
    this.x = worldX;
    this.y = worldY;
    this.draw();
  }

  private draw(): void {
    const g = new Graphics();
    // Outer glow diamond
    g.poly([0, -18, 18, 0, 0, 18, -18, 0]).fill({
      color: 0xff007f,
      alpha: 0.25,
    });
    // Inner solid diamond
    g.poly([0, -12, 12, 0, 0, 12, -12, 0])
      .fill(0xff007f)
      .stroke({ color: 0xff66aa, width: 1 });
    this.addChild(g);
  }

  public update(ticker: Ticker): void {
    if (this.collected) return;
    this.pulseTime += ticker.deltaTime * 0.05;
    this.alpha = 0.65 + 0.35 * (Math.sin(this.pulseTime) * 0.5 + 0.5);
  }

  public collect(ship: Ship): void {
    if (this.collected) return;
    this.collected = true;
    this.visible = false;
    ship.addMaxFuel(GAME_PARAMS.fuelMaxUpgradeAmount);
  }
}
