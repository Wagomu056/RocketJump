import { Container, Graphics } from "pixi.js";

const PARALLAX = 0.2;

interface Star {
  gfx: Graphics;
  localX: number;
}

export class Starfield extends Container {
  private stars: Star[] = [];
  private spanW: number;

  constructor(screenW: number, screenH: number, count = 60) {
    super();
    this.spanW = screenW * 2;
    this.buildStars(screenW, screenH, count);
  }

  private buildStars(screenW: number, screenH: number, count: number): void {
    const span = screenW * 2;
    for (let i = 0; i < count; i++) {
      const radius = Math.random() < 0.2 ? 2 : 1;
      const alpha = 0.3 + Math.random() * 0.7;
      const gfx = new Graphics();
      gfx.circle(0, 0, radius).fill({ color: 0xffffff, alpha });
      const lx = Math.random() * span;
      const ly = Math.random() * screenH;
      gfx.position.set(lx, ly);
      this.stars.push({ gfx, localX: lx });
      this.addChild(gfx);
    }
  }

  /** Call with how many pixels the world scrolled this frame. */
  public scroll(dx: number): void {
    this.x -= dx * PARALLAX;

    for (const star of this.stars) {
      const screenX = star.gfx.x + this.x;
      if (screenX < -10) {
        star.gfx.x += this.spanW;
        star.localX = star.gfx.x;
      }
    }
  }

  public rebuild(screenW: number, screenH: number): void {
    this.removeChildren();
    this.stars = [];
    this.spanW = screenW * 2;
    this.x = 0;
    this.buildStars(screenW, screenH, 60);
  }
}
