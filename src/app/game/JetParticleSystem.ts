import type { Ticker } from "pixi.js";
import { Container, Graphics } from "pixi.js";

interface Particle {
  gfx: Graphics;
  vx: number;
  vy: number;
  life: number;
  hasGravity?: boolean; // Optional: apply gravity to this particle
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

  /**
   * Surge effect: small golden particles rising from below the ship (item pickup).
   * Narrow upward cone — energetic but understated.
   */
  public surge(worldX: number, worldY: number): void {
    for (let i = 0; i < 8; i++) {
      // Narrow upward cone (±0.25 rad from straight up)
      const spread = (Math.random() - 0.5) * 0.5;
      const angle = -Math.PI / 2 + spread;
      const speed = 4 + Math.random() * 4;
      const size = 2.25 + Math.random() * 1.5;

      const gfx = new Graphics();
      gfx.circle(0, 0, size).fill(0xffe040);
      // Spawn at foot level (~22px below ship center)
      gfx.position.set(
        worldX + (Math.random() - 0.5) * 10,
        worldY + 18 + Math.random() * 8,
      );
      this.addChild(gfx);

      this.particles.push({
        gfx,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.9,
      });
    }
  }

  /**
   * Smoke effect: gray particles drifting upward from ship center (health damage).
   */
  public spawnSmoke(worldX: number, worldY: number, count: number): void {
    for (let i = 0; i < count; i++) {
      // Upward spread with slight randomness
      const spread = (Math.random() - 0.5) * 0.6;
      const angle = -Math.PI / 2 + spread;
      const speed = 1 + Math.random() * 2;
      const size = 1.5 + Math.random() * 2;

      const gfx = new Graphics();
      gfx.circle(0, 0, size).fill(0x8b7d8b);
      gfx.alpha = 0.6;
      gfx.position.set(
        worldX + (Math.random() - 0.5) * 8,
        worldY + (Math.random() - 0.5) * 8,
      );
      this.addChild(gfx);

      this.particles.push({
        gfx,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.8,
      });
    }
  }

  /**
   * Explosion effect: yellow particles in straight lines, black particles with parabolic trajectory.
   */
  public spawnExplosion(worldX: number, worldY: number, count: number): void {
    for (let i = 0; i < count; i++) {
      // Alternate between yellow and black colors
      const isYellow = Math.random() > 0.5;
      const color = isYellow ? 0xffdd00 : 0x222222; // Yellow or black
      // Yellow: large (8-18px), Black: 1/3 size (2.7-6px)
      const size = isYellow
        ? 8 + Math.random() * 10
        : (8 + Math.random() * 10) / 3;

      // 45-degree angles: upper-left (-135°) and upper-right (-45°)
      const direction = Math.random() > 0.5 ? -135 : -45;
      const directionRad = (direction * Math.PI) / 180;
      const spread = (Math.random() - 0.5) * 30; // Add some spread around the angle
      const angle = directionRad + (spread * Math.PI) / 180;

      // Yellow: slower (1.5-3.5), Black: 2x faster (3-7)
      const baseSpeed = 1.5 + Math.random() * 2;
      const speed = isYellow ? baseSpeed : baseSpeed * 2;

      const gfx = new Graphics();
      gfx.circle(0, 0, size).fill(color);
      gfx.position.set(
        worldX + (Math.random() - 0.5) * 10,
        worldY + (Math.random() - 0.5) * 10,
      );
      this.addChild(gfx);

      this.particles.push({
        gfx,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 3.5, // Much longer lifetime (3.5s)
        hasGravity: !isYellow, // Black particles have gravity (parabolic), yellow ones don't (straight line)
      });
    }
  }

  public update(ticker: Ticker): void {
    const dt = ticker.deltaTime;
    const gravity = 0.25; // Apply gravity to particles (same as ship physics)
    const toRemove: Particle[] = [];

    for (const p of this.particles) {
      // Apply gravity only if this particle has gravity enabled
      if (p.hasGravity) {
        p.vy += gravity * dt;
      }
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
