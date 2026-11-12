import type { Cameras } from "phaser";
import { VIEW_W } from "../../config/display";
import { CAMERA } from "../../config/tuning";

export class CameraDirector {
  private lockAt: number | null = null;
  private scroll = 0;

  constructor(
    private readonly cam: Cameras.Scene2D.Camera,
    private readonly levelEnd: number,
    private readonly lead = VIEW_W * 0.42,
  ) {
    cam.setBounds(0, 0, levelEnd, cam.height);
  }

  get left(): number {
    return this.scroll;
  }

  get right(): number {
    return this.scroll + VIEW_W;
  }

  get locked(): boolean {
    return this.lockAt !== null;
  }

  follow(x: number, dt: number): void {
    const limit = Math.min(this.lockAt ?? Infinity, this.levelEnd - VIEW_W);
    const target = Math.max(0, Math.min(Math.max(this.scroll, x - this.lead), limit));
    const gap = target - this.scroll;
    if (gap > 0) this.scroll += Math.min(gap, Math.max(CAMERA.minSpeed, gap * CAMERA.ease) * dt);
    this.cam.scrollX = Math.round(this.scroll);
  }

  snapTo(scroll: number): void {
    this.scroll = scroll;
    this.cam.scrollX = Math.round(scroll);
  }

  lock(at: number): void {
    this.lockAt = at;
  }

  unlock(): void {
    this.lockAt = null;
  }

  clampX(x: number, margin = 10): number {
    return Math.min(Math.max(x, this.left + margin), this.right - margin);
  }

  visible(x: number, pad = 0): boolean {
    return x > this.left - pad && x < this.right + pad;
  }

  shake(intensity: number, duration: number): void {
    this.cam.shake(duration * 1000, intensity / 216, false);
  }
}
