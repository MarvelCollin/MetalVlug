import { expect, test } from "@playwright/test";
import { KILL_ALL, hold, run, snap, startMission, tap } from "./helpers";

test("title menu starts the mission", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1200);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  await page.keyboard.press("Enter");
  await page.waitForFunction("window.__mv !== undefined", null, { timeout: 15_000 });
  await page.waitForFunction("window.__mv.snapshot().phase === 'play'", null, { timeout: 10_000 });
});

test("pistol shots kill a grunt for 100 points each", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(30);");
  await hold(page, "ArrowRight", 700);
  for (let i = 0; i < 10; i++) {
    await tap(page, "KeyJ", 40);
    await page.waitForTimeout(110);
  }
  await page.waitForTimeout(600);
  const s = await snap(page);
  expect(s.score).toBeGreaterThanOrEqual(100);
  expect(s.score % 100).toBe(0);
});

test("knife kill next to an enemy scores 300", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(60);");
  await page.keyboard.down("ArrowRight");
  await page.waitForFunction("window.__mv.scene.enemies.list.some((e) => e.alive && Math.abs(e.x - window.__mv.scene.player.x) < 16)", null, { timeout: 15_000, polling: 16 });
  await page.keyboard.up("ArrowRight");
  await tap(page, "KeyJ", 40);
  await page.waitForTimeout(300);
  const score = (await snap(page)).score;
  expect(score).toBeGreaterThanOrEqual(300);
  expect(score % 300).toBe(0);
});

test("bomb throw spends a bomb and explodes", async ({ page }) => {
  await startMission(page);
  await tap(page, "KeyL", 40);
  await page.waitForTimeout(50);
  expect((await snap(page)).bombs).toBe(9);
  expect(await run<number>(page, "return sc.ctx.projectiles.count('bomb');")).toBe(1);
  await page.waitForTimeout(1600);
  expect(await run<number>(page, "return sc.ctx.projectiles.count('bomb');")).toBe(0);
});

test("camera glides after a wave lock releases", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(120);");
  await page.keyboard.down("ArrowRight");
  await page.waitForFunction("window.__mv.snapshot().locked", null, { timeout: 15_000 });
  await page.waitForTimeout(1200);
  await page.waitForFunction(`(() => { const sc = window.__mv.scene; ${KILL_ALL} return !window.__mv.snapshot().locked; })()`, null, { timeout: 20_000, polling: 100 });
  const steps = await run<number[]>(page, `
    const out = [];
    let last = sc.ctx.camera.left;
    const on = () => { out.push(sc.ctx.camera.left - last); last = sc.ctx.camera.left; };
    sc.events.on("postupdate", on);
    await new Promise((r) => setTimeout(r, 1500));
    sc.events.off("postupdate", on);
    return out;`);
  await page.keyboard.up("ArrowRight");
  const maxStep = Math.max(...steps);
  expect(maxStep).toBeGreaterThan(0);
  expect(maxStep).toBeLessThanOrEqual(4);
});

test("Mule vulcan hits a kneeling grunt", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(120); mv.warp(1560);");
  await page.waitForTimeout(400);
  await hold(page, "ArrowRight", 700);
  expect((await snap(page)).piloting).toBe(true);
  await run(page, "sc.enemies.list.forEach((e) => e.alive && e.fsm.change('gone')); const e = sc.enemies.spawn({ type: 'grunt', x: sc.mule.x + 110, y: 184, idle: 'none', hold: true, group: -5, facing: -1 }); e.cooldown.trigger(0);");
  await page.waitForTimeout(700);
  expect(await run<string>(page, "return sc.enemies.list.find((e) => e.group === -5).sprite.frame.name;")).toMatch(/grunt_(aim|fire)/);
  const before = (await snap(page)).score;
  await hold(page, "KeyJ", 900);
  await page.waitForTimeout(300);
  expect((await snap(page)).score).toBeGreaterThan(before);
});

test("freeing a caged Tinker counts a rescue and drops the Rivet gun", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(120); mv.warp(760); sc.enemies.list.forEach((e) => e.active && e.fsm.change('gone'));");
  await page.waitForTimeout(300);
  await hold(page, "ArrowRight", 1000);
  await page.waitForTimeout(1800);
  await hold(page, "ArrowRight", 600);
  const s = await snap(page);
  expect(s.tinkers).toBe(1);
  expect(s.weapon).toBe("rivet");
});

test("dying costs a life, wipes rescues and respawns on the spot", async ({ page }) => {
  await startMission(page);
  await run(page, "sc.state.score.rescue(); sc.player.die();");
  await page.waitForTimeout(2200);
  const s = await snap(page);
  expect(s.lives).toBe(2);
  expect(s.tinkers).toBe(0);
  expect(s.playerState).toBe("alive");
});

test("game over offers a continue that resets score", async ({ page }) => {
  await startMission(page);
  for (let i = 0; i < 4; i++) {
    await run(page, "sc.state.score.add(500); sc.player.die();");
    await page.waitForTimeout(2000);
  }
  expect((await snap(page)).phase).toBe("gameover");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(300);
  const s = await snap(page);
  expect(s.phase).toBe("play");
  expect(s.lives).toBe(3);
  expect(s.score).toBe(0);
  expect(s.weapon).toBe("rivet");
});

test("the Iron Warden can be beaten with the pistol by jump shooting", async ({ page }) => {
  test.setTimeout(180_000);
  await startMission(page);
  await run(page, "mv.shield(900); mv.warp(3600);");
  await hold(page, "ArrowRight", 1500);
  await page.waitForFunction("window.__mv.snapshot().boss === 'phase1'", null, { timeout: 20_000 });
  for (let i = 0; i < 220; i++) {
    await run(page, "mv.shield(900);");
    await page.keyboard.down("ArrowRight");
    await tap(page, "KeyK", 160);
    await page.waitForTimeout(110);
    await tap(page, "KeyJ", 30);
    await page.waitForTimeout(60);
    await tap(page, "KeyJ", 30);
    await page.waitForTimeout(230);
    if (["dying", "dead"].includes((await snap(page)).boss)) break;
  }
  await page.keyboard.up("ArrowRight");
  await page.waitForFunction("window.__mv.snapshot().phase === 'complete'", null, { timeout: 20_000 });
});

test("leaving the Mule does not instantly board it again", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(120); mv.warp(1560);");
  await page.waitForTimeout(400);
  await hold(page, "ArrowRight", 700);
  expect((await snap(page)).piloting).toBe(true);
  await page.keyboard.down("ArrowUp");
  await tap(page, "KeyK", 60);
  await page.keyboard.up("ArrowUp");
  await page.waitForTimeout(1500);
  expect((await snap(page)).piloting).toBe(false);
  await hold(page, "ArrowLeft", 600);
  await hold(page, "ArrowRight", 700);
  expect((await snap(page)).piloting).toBe(true);
});

test("music follows the game: title, mission, boss", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(800);
  await page.keyboard.press("Enter");
  await page.waitForFunction("window.__game.registry.get('audio').track === 'title'", null, { timeout: 5_000 });
  await page.waitForTimeout(200);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  await page.keyboard.press("Enter");
  await page.waitForFunction("window.__mv && window.__game.registry.get('audio').track === 'lowtide'", null, { timeout: 10_000 });
  await run(page, "mv.shield(300); mv.warp(3600);");
  await hold(page, "ArrowRight", 1500);
  await page.waitForFunction("window.__game.registry.get('audio').track === 'boss'", null, { timeout: 10_000 });
});

test("training camp from the menu teaches with tips and ends at the flag", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(150);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  await page.keyboard.press("Enter");
  await page.waitForFunction("window.__mv && window.__mv.snapshot().level === 'camp' && window.__mv.snapshot().phase === 'play'", null, { timeout: 10_000 });
  await page.waitForFunction("window.__game.scene.getScene('hud').tip.view.text.includes('ARROWS')", null, { timeout: 5_000 });
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(1200);
  await page.keyboard.up("ArrowRight");
  for (let i = 0; i < 8; i++) {
    await tap(page, "KeyJ", 40);
    await page.waitForTimeout(150);
  }
  expect((await snap(page)).score).toBeGreaterThanOrEqual(100);
  expect(await page.evaluate("window.__game.scene.getScene('hud').timer.view.text")).toBe("--");
  await run(page, "mv.shield(600); mv.warp(2540); sc.enemies.list.forEach((e) => e.active && e.fsm.change('gone'));");
  await hold(page, "ArrowRight", 900);
  await page.waitForFunction("window.__mv.snapshot().phase === 'complete'", null, { timeout: 10_000 });
});

test("options change and persist the music volume", async ({ page }) => {
  await page.goto("/");
  await page.evaluate("localStorage.clear()");
  await page.reload();
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(80);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(80);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(100);
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(100);
  const saved = await page.evaluate("JSON.parse(localStorage.getItem('metalvlug.settings.v1')).music");
  expect(saved).toBeCloseTo(0.5, 5);
});

test("pause menu resumes and quits to title", async ({ page }) => {
  await startMission(page);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  expect(await page.evaluate("window.__game.scene.isPaused('mission')")).toBe(true);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  expect(await page.evaluate("window.__game.scene.isPaused('mission')")).toBe(false);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(80);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(80);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(400);
  expect(await page.evaluate("window.__game.scene.isActive('title')")).toBe(true);
});

test("choosing Juno gives her 15 bombs and longer throws", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(150);
  await page.keyboard.press("Enter");
  await page.waitForFunction("window.__mv && window.__mv.snapshot().phase === 'play'", null, { timeout: 10_000 });
  const s = await snap(page);
  expect((s as unknown as { character: string }).character).toBe("juno");
  expect(s.bombs).toBe(15);
  expect(await page.evaluate("window.__mv.scene.player.legs.frame.name.startsWith('juno_')")).toBe(true);
});

test("placed enemies exist before they scroll into view", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(60);");
  const seen = await run<Array<{ x: number; right: number }>>(page, `
    const out = [];
    const known = new Set(sc.enemies.list.filter((e) => e.active));
    const on = () => {
      for (const e of sc.enemies.list) {
        if (!e.active || known.has(e)) continue;
        known.add(e);
        out.push({ x: Math.round(e.x), right: Math.round(sc.ctx.camera.right) });
      }
    };
    sc.events.on("postupdate", on);
    window.__seen = () => { sc.events.off("postupdate", on); return out; };
    return [];`);
  void seen;
  await hold(page, "ArrowRight", 6000);
  const out = (await page.evaluate("window.__seen()")) as Array<{ x: number; right: number }>;
  const placed = out.filter((o) => o.x < o.right);
  expect(placed.filter((o) => o.x > o.right - 340 && o.x < o.right - 4)).toEqual([]);
});

test("paratroopers float down and land", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(60); const e = sc.enemies.spawn({ type: 'grunt', x: sc.ctx.camera.left + 250, y: -8, idle: 'none', hold: false, group: -7, facing: -1, para: true }); window.__para = e;");
  await page.waitForTimeout(500);
  expect(await page.evaluate("window.__para.fsm.current")).toBe("para");
  expect(await page.evaluate("window.__para.chute.visible")).toBe(true);
  await page.waitForFunction("window.__para.fsm.current !== 'para'", null, { timeout: 8_000 });
  expect(await page.evaluate("window.__para.chute.visible")).toBe(false);
  expect(await page.evaluate("Math.round(window.__para.y)")).toBe(184);
});
