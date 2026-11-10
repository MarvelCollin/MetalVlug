import { describe, expect, it } from "vitest";
import { Action, InputFrame } from "../../src/domain/input/Actions";
import { Loadout } from "../../src/domain/weapons/Loadout";
import { ScoreKeeper } from "../../src/domain/scoring/ScoreKeeper";
import { MissionClock } from "../../src/domain/mission/MissionClock";
import { Lives } from "../../src/domain/mission/Lives";

describe("InputFrame", () => {
  it("detects pressed and released edges", () => {
    const f = new InputFrame();
    f.push(Action.Fire);
    expect(f.pressed(Action.Fire)).toBe(true);
    f.push(Action.Fire | Action.Left);
    expect(f.pressed(Action.Fire)).toBe(false);
    expect(f.held(Action.Fire)).toBe(true);
    expect(f.axisX).toBe(-1);
    f.push(0);
    expect(f.released(Action.Fire)).toBe(true);
  });
});

describe("Loadout", () => {
  it("starts with pistol and 10 bombs", () => {
    const l = new Loadout(10);
    expect(l.weapon.id).toBe("pistol");
    expect(l.ammo).toBe(Infinity);
    expect(l.bombs).toBe(10);
  });

  it("same weapon adds refill ammo, different weapon replaces", () => {
    const l = new Loadout(10);
    l.pickWeapon("rivet");
    expect(l.ammo).toBe(200);
    expect(l.pickWeapon("rivet")).toEqual({ kind: "refilled", weapon: "rivet" });
    expect(l.ammo).toBe(350);
    l.pickWeapon("scatter");
    expect(l.weapon.id).toBe("scatter");
    expect(l.ammo).toBe(30);
  });

  it("falls back to pistol when ammo runs out", () => {
    const l = new Loadout(10);
    l.pickWeapon("thumper");
    for (let i = 0; i < 30; i++) l.consumeShot();
    expect(l.weapon.id).toBe("pistol");
    expect(l.ammo).toBe(Infinity);
  });

  it("ammo item reloads half or gives points with the pistol", () => {
    const l = new Loadout(10);
    expect(l.reloadHalf(1000)).toEqual({ kind: "points", points: 1000 });
    l.pickWeapon("scatter");
    l.reloadHalf(1000);
    expect(l.ammo).toBe(45);
  });

  it("resets weapon and bombs for a new life", () => {
    const l = new Loadout(10);
    l.pickWeapon("rivet");
    l.useBomb();
    l.resetForLife();
    expect(l.weapon.id).toBe("pistol");
    expect(l.bombs).toBe(10);
  });

  it("cannot throw without bombs", () => {
    const l = new Loadout(1);
    expect(l.useBomb()).toBe(true);
    expect(l.useBomb()).toBe(false);
  });
});

describe("ScoreKeeper", () => {
  it("tallies tinkers, loses them on death and resets on continue", () => {
    const s = new ScoreKeeper(10000);
    s.add(300);
    s.rescue();
    s.rescue();
    expect(s.tally()).toEqual({ tinkers: 2, perTinker: 10000, bonus: 20000, total: 20300 });
    s.loseTinkers();
    expect(s.tinkers).toBe(0);
    s.rescue();
    expect(s.applyTally().total).toBe(10300);
    expect(s.score).toBe(10300);
    s.continueGame();
    expect(s.score).toBe(0);
  });
});

describe("MissionClock", () => {
  it("counts 60 units of 4 seconds, alarms at 10 and times out", () => {
    const c = new MissionClock(60, 4, 10);
    expect(c.display).toBe(60);
    expect(c.tick(4)).toBe("none");
    expect(c.display).toBe(59);
    expect(c.tick(4 * 49)).toBe("alarm");
    expect(c.display).toBe(10);
    expect(c.tick(40)).toBe("timeout");
    expect(c.tick(1)).toBe("none");
    c.reset();
    expect(c.display).toBe(60);
  });
});

describe("Lives", () => {
  it("allows 3 respawns then game over, continue refills", () => {
    const l = new Lives(3);
    expect(l.lose()).toBe("respawn");
    expect(l.lose()).toBe("respawn");
    expect(l.lose()).toBe("respawn");
    expect(l.lose()).toBe("gameover");
    l.continueGame();
    expect(l.remaining).toBe(3);
    expect(l.continuesUsed).toBe(1);
  });
});
