import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

interface Particle {
  gfx: Graphics;
  vx: number;
  vy: number;
  life: number;
}

export class JetParticleSystem extends Container {
  private particles: Particle[] = [];

  /**
   * Spawn particles at world position (nx, ny).
   * angle = jet angle θ (towards touch); particles fly in θ direction (exhaust).
   */
  public spawnParticles(
    nx: number,
    ny: number,
    angle: number,
    count: number,
  ): void {
    for (let i = 0; i < count; i++) {
      const spread = (Math.random() - 0.5) * 0.8;
      const particleAngle = angle + spread;
      const speed = 2 + Math.random() * 3;
      const size = 2 + Math.random() * 3;

      const gfx = new Graphics();
      gfx.circle(0, 0, size).fill(0x00e5ff);
      gfx.position.set(nx, ny);
      this.addChild(gfx);

      this.particles.push({
        gfx,
        vx: Math.cos(particleAngle) * speed,
        vy: Math.sin(particleAngle) * speed,
        life: 1,
      });
    }
  }

  /** Burst yellow particles in all directions (item pickup effect). */
  public burst(worldX: number, worldY: number, count: number): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      const size = 3 + Math.random() * 3;

      const gfx = new Graphics();
      gfx.circle(0, 0, size).fill(0xffee00);
      gfx.position.set(worldX, worldY);
      this.addChild(gfx);

      this.particles.push({
        gfx,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.2,
      });
    }
  }

  public update(ticker: Ticker): void {
    const dt = ticker.deltaTime;
    const toRemove: Particle[] = [];

    for (const p of this.particles) {
      p.gfx.x += p.vx * dt;
      p.gfx.y += p.vy * dt;
      p.life -= 0.04 * dt;
      p.gfx.alpha = Math.max(0, p.life);
      p.gfx.scale.set(Math.max(0, p.life));
      if (p.life <= 0) toRemove.push(p);
    }

    for (const p of toRemove) {
      this.removeChild(p.gfx);
      p.gfx.destroy();
      this.particles.splice(this.particles.indexOf(p), 1);
    }
  }

  public clear(): void {
    for (const p of this.particles) {
      this.removeChild(p.gfx);
      p.gfx.destroy();
    }
    this.particles = [];
  }
}
