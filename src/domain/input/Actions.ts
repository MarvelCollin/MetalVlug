export const Action = {
  Left: 1,
  Right: 2,
  Up: 4,
  Down: 8,
  Fire: 16,
  Jump: 32,
  Bomb: 64,
  Exit: 128,
  Start: 256,
  Pause: 512,
} as const;

export type ActionBit = (typeof Action)[keyof typeof Action];

export class InputFrame {
  private current = 0;
  private previous = 0;

  push(mask: number): void {
    this.previous = this.current;
    this.current = mask;
  }

  held(action: ActionBit): boolean {
    return (this.current & action) !== 0;
  }

  pressed(action: ActionBit): boolean {
    return (this.current & action) !== 0 && (this.previous & action) === 0;
  }

  released(action: ActionBit): boolean {
    return (this.current & action) === 0 && (this.previous & action) !== 0;
  }

  get axisX(): -1 | 0 | 1 {
    const l = this.held(Action.Left);
    const r = this.held(Action.Right);
    return l === r ? 0 : l ? -1 : 1;
  }

  get mask(): number {
    return this.current;
  }

  clear(): void {
    this.current = 0;
    this.previous = 0;
  }
}
