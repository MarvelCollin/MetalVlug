import { describe, expect, it, vi } from "vitest";
import { EventBus } from "../../src/core/events/EventBus";
import { StateMachine } from "../../src/core/fsm/StateMachine";
import { ObjectPool } from "../../src/core/pool/ObjectPool";
import { Rng } from "../../src/core/random/Rng";
import { Cooldown } from "../../src/core/time/Cooldown";

describe("EventBus", () => {
  it("delivers payloads and unsubscribes", () => {
    const bus = new EventBus<{ hit: number }>();
    const fn = vi.fn();
    const off = bus.on("hit", fn);
    bus.emit("hit", 3);
    off();
    bus.emit("hit", 4);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });

  it("once fires a single time", () => {
    const bus = new EventBus<{ go: void }>();
    const fn = vi.fn();
    bus.once("go", fn);
    bus.emit("go", undefined);
    bus.emit("go", undefined);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(bus.count("go")).toBe(0);
  });
});

describe("StateMachine", () => {
  it("runs enter, update transitions and exit with elapsed time", () => {
    const log: string[] = [];
    const fsm = new StateMachine({}, {
      idle: { enter: () => log.push("enter idle"), update: (_c, _dt, t) => (t >= 1 ? "run" : undefined), exit: () => log.push("exit idle") },
      run: { enter: (_c, from) => log.push(`enter run from ${from}`) },
    }, "idle");
    fsm.update(0.5);
    expect(fsm.current).toBe("idle");
    fsm.update(0.6);
    expect(fsm.current).toBe("run");
    expect(fsm.elapsed).toBe(0);
    expect(log).toEqual(["enter idle", "exit idle", "enter run from idle"]);
  });
});

describe("ObjectPool", () => {
  it("reuses released items and respects max", () => {
    let made = 0;
    const pool = new ObjectPool<{ active: boolean; id: number }>(() => ({ active: false, id: made++ }), () => {}, 2);
    const a = pool.acquire()!;
    a.active = true;
    const b = pool.acquire()!;
    b.active = true;
    expect(pool.acquire()).toBeNull();
    pool.release(a);
    const c = pool.acquire()!;
    expect(c).toBe(a);
    expect(made).toBe(2);
    expect(pool.activeCount).toBe(1);
  });
});

describe("Rng", () => {
  it("is deterministic per seed and stays in range", () => {
    const a = new Rng(42);
    const b = new Rng(42);
    for (let i = 0; i < 100; i++) {
      const v = a.next();
      expect(v).toBe(b.next());
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
    const r = new Rng(7);
    for (let i = 0; i < 100; i++) {
      const n = r.int(2, 5);
      expect(n).toBeGreaterThanOrEqual(2);
      expect(n).toBeLessThanOrEqual(5);
    }
  });
});

describe("Cooldown", () => {
  it("blocks until the duration passes", () => {
    const cd = new Cooldown(0.5);
    expect(cd.tryTrigger()).toBe(true);
    expect(cd.tryTrigger()).toBe(false);
    cd.tick(0.3);
    expect(cd.ready).toBe(false);
    cd.tick(0.25);
    expect(cd.ready).toBe(true);
  });
});
