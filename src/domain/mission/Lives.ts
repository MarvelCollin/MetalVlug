export class Lives {
  private left: number;
  private continues = 0;

  constructor(private readonly perCredit: number) {
    this.left = perCredit;
  }

  get remaining(): number {
    return this.left;
  }

  get continuesUsed(): number {
    return this.continues;
  }

  lose(): "respawn" | "gameover" {
    this.left -= 1;
    return this.left >= 0 ? "respawn" : "gameover";
  }

  continueGame(): void {
    this.left = this.perCredit;
    this.continues += 1;
  }
}
