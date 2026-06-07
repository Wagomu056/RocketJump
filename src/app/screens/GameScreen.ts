import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import type { FederatedPointerEvent, Ticker } from "pixi.js";
import { Container, Text } from "pixi.js";

import { GAME_PARAMS } from "../config/GameParams";
import { engine } from "../getEngine";
import { AirItem } from "../game/AirItem";
import { GroundItem } from "../game/GroundItem";
import type { Item } from "../game/Item";
import { JetParticleSystem } from "../game/JetParticleSystem";
import { Platform } from "../game/Platform";
import { PlatformGenerator } from "../game/PlatformGenerator";
import { Ship, SHIP_HALF_W, SHIP_LEG_BOTTOM } from "../game/Ship";
import { Starfield } from "../game/Starfield";
import { userSettings } from "../utils/userSettings";

import { ScoreScreen } from "./ScoreScreen";

export class GameScreen extends Container {
  public static assetBundles: string[] = [];

  // Layers
  private starfield!: Starfield;
  private worldContainer: Container;
  private hudContainer: Container;

  // Game entities
  private ship!: Ship;
  private particles!: JetParticleSystem;
  private platformGen!: PlatformGenerator;
  private platforms: Platform[] = [];
  private groundItems: GroundItem[] = [];
  private airItems: AirItem[] = [];

  // HUD elements
  private scoreLabel: Text;

  // Input state
  private isPointerDown = false;
  private pointerX = 0;
  private pointerY = 0;

  // Game state
  private score = 0;
  private totalScrolled = 0;
  private paused = false;
  private screenW = 390;
  private screenH = 640;
  private gameOver = false;

  constructor() {
    super();

    this.worldContainer = new Container();
    this.hudContainer = new Container();

    // Starfield placeholder (rebuilt in initGame)
    this.starfield = new Starfield(390, 640);
    this.addChild(this.starfield);
    this.addChild(this.worldContainer);
    this.addChild(this.hudContainer);

    // HUD
    this.scoreLabel = new Text({
      text: "0m",
      style: { fontFamily: "Arial", fontSize: 26, fill: "#ffffff" },
    });
    this.scoreLabel.position.set(16, 16);
    this.hudContainer.addChild(this.scoreLabel);
  }

  // ─── AppScreen lifecycle ────────────────────────────────────────────────

  public async show(): Promise<void> {
    this.alpha = 0;
    this.gameOver = false;
    this.initGame();
    this.registerPointerEvents();
    await animate(this, { alpha: 1 } as ObjectTarget<this>, {
      duration: 0.3,
    });
  }

  public async hide(): Promise<void> {
    this.unregisterPointerEvents();
    await animate(this, { alpha: 0 } as ObjectTarget<this>, {
      duration: 0.2,
    });
  }

  public reset(): void {
    this.clearEntities();
    this.score = 0;
    this.totalScrolled = 0;
    this.worldContainer.x = 0;
    this.isPointerDown = false;
    this.paused = false;
    this.gameOver = false;
  }

  public async pause(): Promise<void> {
    this.paused = true;
  }

  public async resume(): Promise<void> {
    this.paused = false;
  }

  public async blur(): Promise<void> {
    this.paused = true;
  }

  public async focus(): Promise<void> {
    this.paused = false;
  }

  public resize(w: number, h: number): void {
    this.screenW = w;
    this.screenH = h;
    this.scoreLabel.position.set(16, 16);
  }

  // ─── Game loop ──────────────────────────────────────────────────────────

  public update(ticker: Ticker): void {
    if (this.paused || this.gameOver) return;

    // 1. Ship physics + fuel FSM
    const touchXWorld = this.pointerX - this.worldContainer.x;
    const touchYWorld = this.pointerY - this.worldContainer.y;
    this.ship.update(ticker, this.isPointerDown, touchXWorld, touchYWorld);

    // 2. Particles
    this.particles.update(ticker);
    if (this.ship.isThrusting) {
      const count = 3 + Math.floor(Math.random() * 3);
      this.particles.spawnParticles(
        this.ship.nozzleX,
        this.ship.nozzleY,
        this.ship.lastJetAngle,
        count,
      );
    }

    // 3. Item animation
    for (const item of this.groundItems) {
      item.update(ticker);
    }
    for (const item of this.airItems) {
      item.update(ticker);
    }

    // 4. Collisions
    this.checkCollisions();

    // 5. Left-edge clip
    const cameraLeft = -this.worldContainer.x;
    const minShipX = cameraLeft + SHIP_HALF_W;
    if (this.ship.x < minShipX) {
      this.ship.x = minShipX;
      if (this.ship.vx < 0) this.ship.vx = 0;
    }

    // 6. Camera scroll
    const deadZoneX = this.screenW * GAME_PARAMS.cameraDeadZoneRatio;
    const shipScreenX = this.ship.x + this.worldContainer.x;
    if (shipScreenX > deadZoneX) {
      const scroll = shipScreenX - deadZoneX;
      this.worldContainer.x -= scroll;
      this.totalScrolled += scroll;
      this.starfield.scroll(scroll);
    }
    this.score = Math.floor(this.totalScrolled / GAME_PARAMS.pixelsPerMeter);

    // 7. Game over
    if (this.ship.y > this.screenH + 100) {
      this.gameOver = true;
      userSettings.lastScore = this.score;
      void engine().navigation.showScreen(ScoreScreen);
      return;
    }

    // 8. Platform generation + cleanup
    const { platforms: newPlatforms, items: newItems } = this.platformGen.step(
      this.worldContainer.x,
      this.screenW,
      this.score,
    );
    for (const p of newPlatforms) {
      this.platforms.push(p);
      this.worldContainer.addChild(p);

      // Spawn air item in gap between last platform and new platform (only once when new platform is created)
      const lastPlatIdx = this.platforms.length - 2;
      if (lastPlatIdx >= 0) {
        const lastPlat = this.platforms[lastPlatIdx];
        if (Math.random() < GAME_PARAMS.items.airItem.spawnFrequency) {
          const gapMinX = lastPlat.x + lastPlat.width;
          const gapMaxX = p.x;
          const gapMinY = Math.min(lastPlat.y, p.y);
          const gapMaxY = Math.max(lastPlat.y, p.y);

          const airItemX = gapMinX + Math.random() * (gapMaxX - gapMinX);
          const airItemY = gapMinY + Math.random() * (gapMaxY - gapMinY);

          const airItem = new AirItem(
            airItemX,
            airItemY,
            GAME_PARAMS.items.airItem,
            GAME_PARAMS.items.pickupRadius,
          );
          this.airItems.push(airItem);
          this.worldContainer.addChild(airItem);
        }
      }
    }
    for (const item of newItems) {
      if (item instanceof GroundItem) {
        this.groundItems.push(item);
      }
      this.worldContainer.addChild(item);
    }

    this.pruneEntities();

    // 9. HUD
    this.updateHUD();
  }

  // ─── Private helpers ────────────────────────────────────────────────────

  private initGame(): void {
    const sw = this.screenW;
    const sh = this.screenH;

    this.clearEntities();
    this.worldContainer.x = 0;
    this.totalScrolled = 0;
    this.score = 0;

    // Starfield (replaced at index 0)
    this.removeChild(this.starfield);
    this.starfield.destroy();
    this.starfield = new Starfield(sw, sh);
    this.addChildAt(this.starfield, 0);

    // Ship
    this.ship = new Ship();
    this.ship.x = sw * 0.15;
    this.ship.y = sh * 0.65 - 40;
    this.worldContainer.addChild(this.ship);

    // Particles (screen-space sibling of worldContainer keeps particles in world coords)
    this.particles = new JetParticleSystem();
    this.worldContainer.addChild(this.particles);

    // Initial platform
    const initW = sw * 0.6;
    const initY = sh * 0.65;
    const initPlat = new Platform(0, initY, initW);
    this.platforms.push(initPlat);
    this.worldContainer.addChild(initPlat);

    // Generator
    this.platformGen = new PlatformGenerator(initW, initY, sw, sh);
  }

  private clearEntities(): void {
    for (const p of this.platforms) {
      this.worldContainer.removeChild(p);
      p.destroy();
    }
    this.platforms = [];

    for (const item of this.groundItems) {
      this.worldContainer.removeChild(item);
      item.destroy();
    }
    this.groundItems = [];

    for (const item of this.airItems) {
      this.worldContainer.removeChild(item);
      item.destroy();
    }
    this.airItems = [];

    this.particles?.clear();
  }

  private checkCollisions(): void {
    const sl = this.ship.left();
    const sr = this.ship.right();
    const sb = this.ship.y + SHIP_LEG_BOTTOM; // leg-tip contact point

    // Landing: descending-only, with tunnelling guard
    if (this.ship.vy > 0) {
      for (const plat of this.platforms) {
        if (sr > plat.x && sl < plat.right()) {
          const topY = plat.getTopY();
          if (sb >= topY && this.ship.prevBottom <= topY) {
            this.ship.land(topY);
          }
        }
      }
    }

    // Item pickup: circular proximity
    const checkItemCollision = (item: Item): void => {
      if (item.collected) return;
      const dx = this.ship.x - item.x;
      const dy = this.ship.y - item.y;
      const rSq = item.getCollisionRadius() ** 2;
      if (dx * dx + dy * dy < rSq) {
        item.collect(this.ship);
        this.particles.surge(this.ship.x, this.ship.y);
      }
    };

    for (const item of this.groundItems) {
      checkItemCollision(item);
    }
    for (const item of this.airItems) {
      checkItemCollision(item);
    }
  }

  private pruneEntities(): void {
    this.platforms = this.platforms.filter((p) => {
      if (p.right() + this.worldContainer.x < -50) {
        this.worldContainer.removeChild(p);
        p.destroy();
        return false;
      }
      return true;
    });

    this.groundItems = this.groundItems.filter((item) => {
      const offScreen = item.x + this.worldContainer.x < -50;
      if (item.collected || offScreen) {
        this.worldContainer.removeChild(item);
        item.destroy();
        return false;
      }
      return true;
    });

    this.airItems = this.airItems.filter((item) => {
      const offScreen = item.x + this.worldContainer.x < -50;
      if (item.collected || offScreen) {
        this.worldContainer.removeChild(item);
        item.destroy();
        return false;
      }
      return true;
    });
  }

  private updateHUD(): void {
    this.scoreLabel.text = `${this.score}m`;
    this.ship.updateFuelGauge();
  }

  // ─── Pointer events ─────────────────────────────────────────────────────

  private onPointerDown = (e: FederatedPointerEvent): void => {
    this.isPointerDown = true;
    this.pointerX = e.globalX;
    this.pointerY = e.globalY;
  };

  private onPointerMove = (e: FederatedPointerEvent): void => {
    if (!this.isPointerDown) return;
    this.pointerX = e.globalX;
    this.pointerY = e.globalY;
  };

  private onPointerUp = (): void => {
    this.isPointerDown = false;
  };

  private registerPointerEvents(): void {
    const stage = engine().stage;
    stage.eventMode = "static";
    // hitArea must cover the full canvas so events fire on empty space too
    stage.hitArea = engine().renderer.screen;
    stage.on("pointerdown", this.onPointerDown);
    stage.on("pointermove", this.onPointerMove);
    stage.on("pointerup", this.onPointerUp);
    stage.on("pointerupoutside", this.onPointerUp);
    stage.on("pointercancel", this.onPointerUp);
  }

  private unregisterPointerEvents(): void {
    const stage = engine().stage;
    stage.off("pointerdown", this.onPointerDown);
    stage.off("pointermove", this.onPointerMove);
    stage.off("pointerup", this.onPointerUp);
    stage.off("pointerupoutside", this.onPointerUp);
    stage.off("pointercancel", this.onPointerUp);
  }
}
