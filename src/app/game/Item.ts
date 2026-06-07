import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

import type { Ship } from "./Ship";

export interface ItemParams {
  size: number; // Size multiplier (1.0, 1.5, etc.)
  spawnFrequency: number; // [0-1] probability
  effectAmount: number; // Fuel max increase
}

export class Item extends Container {
  public collected = false;
  protected pulseTime = 0;
  protected size: number;
  protected effectAmount: number;
  protected pickupRadius: number;

  constructor(
    worldX: number,
    worldY: number,
    params: ItemParams,
    pickupRadius: number,
  ) {
    super();
    this.x = worldX;
    this.y = worldY;
    this.size = params.size;
    this.effectAmount = params.effectAmount;
    this.pickupRadius = pickupRadius;
    this.draw();
  }

  protected draw(): void {
    const g = new Graphics();
    const baseSize = 12; // Base diamond size before scaling
    const scaledSize = baseSize * this.size;
    const glowSize = scaledSize + 6; // Outer glow

    // Outer glow diamond
    g.poly([0, -glowSize, glowSize, 0, 0, glowSize, -glowSize, 0]).fill({
      color: 0xff007f,
      alpha: 0.25,
    });

    // Inner solid diamond
    g.poly([0, -scaledSize, scaledSize, 0, 0, scaledSize, -scaledSize, 0])
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
    ship.addMaxFuel(this.effectAmount);
  }

  public getCollisionRadius(): number {
    return this.pickupRadius * this.size;
  }
}
