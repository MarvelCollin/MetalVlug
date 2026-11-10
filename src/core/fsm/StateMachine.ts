export interface State<Ctx, Key extends string> {
  enter?(ctx: Ctx, from: Key | null): void;
  update?(ctx: Ctx, dt: number, elapsed: number): Key | void;
  exit?(ctx: Ctx, to: Key): void;
}

export type StateTable<Ctx, Key extends string> = Record<Key, State<Ctx, Key>>;

export class StateMachine<Ctx, Key extends string> {
  private key: Key;
  private time = 0;

  constructor(
    private readonly ctx: Ctx,
    private readonly states: StateTable<Ctx, Key>,
    initial: Key,
  ) {
    this.key = initial;
    this.states[initial].enter?.(ctx, null);
  }

  get current(): Key {
    return this.key;
  }

  get elapsed(): number {
    return this.time;
  }

  is(...keys: Key[]): boolean {
    return keys.includes(this.key);
  }

  change(next: Key): void {
    const from = this.key;
    this.states[from].exit?.(this.ctx, next);
    this.key = next;
    this.time = 0;
    this.states[next].enter?.(this.ctx, from);
  }

  update(dt: number): void {
    this.time += dt;
    const next = this.states[this.key].update?.(this.ctx, dt, this.time);
    if (next !== undefined && next !== this.key) this.change(next);
  }
}
