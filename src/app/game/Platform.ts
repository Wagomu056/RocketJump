import { Container, Graphics } from "pixi.js";

export const PLATFORM_HEIGHT = 20;

export class Platform extends Container {
  public readonly platformWidth: number;

  constructor(worldX: number, worldY: number, width: number) {
    super();
    this.platformWidth = width;
    this.x = worldX;
    this.y = worldY;
    this.draw();
  }

  private draw(): void {
    const g = new Graphics();
    // Body
    g.roundRect(0, 0, this.platformWidth, PLATFORM_HEIGHT, 4).fill(0x4a5568);
    // Neon green top surface
    g.rect(0, 0, this.platformWidth, 4).fill(0x39ff14);
    this.addChild(g);
  }

  public right(): number {
    return this.x + this.platformWidth;
  }

  public getTopY(): number {
    return this.y;
  }
}
