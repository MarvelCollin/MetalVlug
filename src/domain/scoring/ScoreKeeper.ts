export interface Tally {
  tinkers: number;
  perTinker: number;
  bonus: number;
  total: number;
}

export class ScoreKeeper {
  private points = 0;
  private rescued = 0;

  constructor(private readonly perTinker: number) {}

  get score(): number {
    return this.points;
  }

  get tinkers(): number {
    return this.rescued;
  }

  add(points: number): void {
    this.points += Math.max(0, Math.round(points));
  }

  rescue(): void {
    this.rescued += 1;
  }

  loseTinkers(): void {
    this.rescued = 0;
  }

  continueGame(): void {
    this.points = 0;
    this.rescued = 0;
  }

  tally(): Tally {
    const bonus = this.rescued * this.perTinker;
    return { tinkers: this.rescued, perTinker: this.perTinker, bonus, total: this.points + bonus };
  }

  applyTally(): Tally {
    const t = this.tally();
    this.points = t.total;
    this.rescued = 0;
    return t;
  }
}
