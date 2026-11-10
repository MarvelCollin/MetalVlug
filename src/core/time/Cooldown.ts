export class Cooldown {
  private remaining = 0;

  constructor(public duration: number) {}

  get ready(): boolean {
    return this.remaining <= 0;
  }

  get progress(): number {
    return this.duration <= 0 ? 1 : 1 - Math.max(0, this.remaining) / this.duration;
  }

  tick(dt: number): void {
    if (this.remaining > 0) this.remaining -= dt;
  }

  trigger(duration = this.duration): void {
    this.remaining = duration;
  }

  tryTrigger(duration = this.duration): boolean {
    if (!this.ready) return false;
    this.trigger(duration);
    return true;
  }

  reset(): void {
    this.remaining = 0;
  }
}
