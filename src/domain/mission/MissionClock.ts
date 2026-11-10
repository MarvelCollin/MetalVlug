export type ClockEvent = "none" | "alarm" | "timeout";

export class MissionClock {
  private seconds = 0;
  private alarmed = false;
  private stopped = false;

  constructor(
    private readonly units: number,
    private readonly secondsPerUnit: number,
    private readonly alarmAt: number,
  ) {}

  get display(): number {
    return Math.max(0, this.units - Math.floor(this.seconds / this.secondsPerUnit));
  }

  get running(): boolean {
    return !this.stopped;
  }

  tick(dt: number): ClockEvent {
    if (this.stopped) return "none";
    this.seconds += dt;
    const left = this.display;
    if (left <= 0) {
      this.stopped = true;
      return "timeout";
    }
    if (!this.alarmed && left <= this.alarmAt) {
      this.alarmed = true;
      return "alarm";
    }
    return "none";
  }

  reset(): void {
    this.seconds = 0;
    this.alarmed = false;
    this.stopped = false;
  }

  pause(): void {
    this.stopped = true;
  }

  resume(): void {
    if (this.display > 0) this.stopped = false;
  }
}
