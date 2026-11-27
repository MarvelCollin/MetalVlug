export interface Boss {
  readonly name: string;
  readonly present: boolean;
  readonly state: string;
  readonly left: number;
  start(): void;
  tick(dt: number): void;
}
