export interface Poolable {
  active: boolean;
}

export class ObjectPool<T extends Poolable> {
  private readonly items: T[] = [];

  constructor(
    private readonly create: () => T,
    private readonly onRelease: (item: T) => void = () => {},
    private readonly max = Infinity,
  ) {}

  acquire(): T | null {
    for (const item of this.items) if (!item.active) return item;
    if (this.items.length >= this.max) return null;
    const item = this.create();
    this.items.push(item);
    return item;
  }

  release(item: T): void {
    if (!item.active) return;
    item.active = false;
    this.onRelease(item);
  }

  releaseAll(): void {
    for (const item of this.items) this.release(item);
  }

  forEachActive(fn: (item: T) => void): void {
    for (const item of this.items) if (item.active) fn(item);
  }

  get size(): number {
    return this.items.length;
  }

  get activeCount(): number {
    let n = 0;
    for (const item of this.items) if (item.active) n++;
    return n;
  }
}
