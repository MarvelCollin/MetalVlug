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

test("Mule vulcan hits an enemy pressed against the hull", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(120); mv.warp(1560);");
  await page.waitForTimeout(400);
  await hold(page, "ArrowRight", 700);
  expect((await snap(page)).piloting).toBe(true);
  await run(page, "sc.enemies.list.forEach((e) => e.alive && e.fsm.change('gone')); sc.enemies.spawn({ type: 'grunt', x: sc.mule.x + 14, y: 184, idle: 'none', hold: true, group: -6, facing: -1 });");
  await page.waitForTimeout(150);
  await hold(page, "KeyJ", 700);
  await page.waitForTimeout(200);
  expect(await run<boolean>(page, "return sc.enemies.list.filter((e) => e.group === -6).every((e) => !e.alive);")).toBe(true);
});

test("Mule point blank fire covers facing left and crouching but not behind or straight up", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(120); mv.warp(1560);");
  await page.waitForTimeout(400);
  await hold(page, "ArrowRight", 700);
  expect((await snap(page)).piloting).toBe(true);
  const spawn = (dx: number, group: number) => run(page, `sc.enemies.list.forEach((e) => e.alive && e.group > -7 && e.fsm.change('gone')); sc.enemies.spawn({ type: 'grunt', x: sc.mule.x + ${dx}, y: 184, idle: 'none', hold: true, group: ${group}, facing: 1 });`);
  const alive = (group: number) => run<boolean>(page, `return sc.enemies.list.some((e) => e.group === ${group} && e.alive);`);
  await spawn(-14, -7);
  await page.keyboard.down("ArrowUp");
  await page.waitForTimeout(500);
  await hold(page, "KeyJ", 500);
  await page.keyboard.up("ArrowUp");
  expect(await alive(-7)).toBe(true);
  await hold(page, "KeyJ", 500);
  expect(await alive(-7)).toBe(true);
  await tap(page, "ArrowLeft", 60);
  await page.waitForTimeout(400);
  await page.keyboard.down("ArrowDown");
  await page.waitForTimeout(300);
  await hold(page, "KeyJ", 700);
  await page.keyboard.up("ArrowDown");
  await page.waitForTimeout(200);
  expect(await alive(-7)).toBe(false);
});

test("bazooka rockets fly over a crouching player and hit a standing one", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(0); " + KILL_ALL + " const e = sc.enemies.spawn({ type: 'bazooka', x: sc.player.x + 160, y: 184, idle: 'none', hold: true, group: -8, facing: -1 }); e.cooldown.trigger(0);");
  await page.keyboard.down("ArrowDown");
  await page.waitForFunction("window.__mv.scene.ctx.projectiles.count('enemyRocket') > 0", null, { timeout: 5_000 });
  await page.waitForFunction("window.__mv.scene.ctx.projectiles.count('enemyRocket') === 0", null, { timeout: 5_000 });
  expect((await snap(page)).playerState).toBe("alive");
  await page.keyboard.up("ArrowDown");
  await page.waitForFunction("window.__mv.scene.ctx.projectiles.count('enemyRocket') > 0", null, { timeout: 6_000 });
  await page.waitForFunction("window.__mv.snapshot().playerState !== 'alive'", null, { timeout: 5_000 });
});

test("shield soldiers block pistol fire from the front but fall to the knife and to grenades", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(60); " + KILL_ALL + " const e = sc.enemies.spawn({ type: 'shield', x: sc.player.x + 70, y: 184, idle: 'none', hold: true, group: -9, facing: -1 }); e.cooldown.trigger(30);");
  await page.waitForTimeout(300);
  for (let i = 0; i < 12; i++) await tap(page, "KeyJ", 30), await page.waitForTimeout(90);
  await page.waitForTimeout(400);
  expect(await run<number>(page, "return sc.enemies.list.find((e) => e.group === -9).hp;")).toBe(4);
  await page.keyboard.down("ArrowRight");
  await page.waitForFunction("Math.abs(window.__mv.scene.enemies.list.find((e) => e.group === -9).x - window.__mv.scene.player.x) < 20", null, { timeout: 4_000, polling: 16 });
  await page.keyboard.up("ArrowRight");
  await tap(page, "KeyJ", 40);
  await page.waitForTimeout(500);
  expect(await run<boolean>(page, "return sc.enemies.list.find((e) => e.group === -9).alive;")).toBe(false);
  await run(page, "const e = sc.enemies.spawn({ type: 'shield', x: sc.player.x + 90, y: 184, idle: 'none', hold: true, group: -10, facing: -1 }); e.cooldown.trigger(30);");
  await page.keyboard.down("ArrowLeft");
  await page.waitForTimeout(250);
  await page.keyboard.up("ArrowLeft");
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(30);
  await page.keyboard.up("ArrowRight");
  await tap(page, "KeyL", 40);
  await page.waitForTimeout(1600);
  expect(await run<boolean>(page, "return sc.enemies.list.find((e) => e.group === -10).alive;")).toBe(false);
});

test("one furnace fireball burns through a line of soldiers and can be aimed up", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(60); " + KILL_ALL + " sc.state.loadout.pickWeapon('furnace'); for (const dx of [60, 85, 110]) sc.enemies.spawn({ type: 'grunt', x: sc.player.x + dx, y: 184, idle: 'none', hold: true, group: -11, facing: -1 }).cooldown.trigger(30);");
  await page.waitForTimeout(250);
  await tap(page, "KeyJ", 40);
  await page.waitForTimeout(900);
  expect(await run<number>(page, "return sc.enemies.list.filter((e) => e.group === -11 && e.alive).length;")).toBe(0);
  expect((await snap(page)).ammo).toBe(29);
  await page.keyboard.down("ArrowUp");
  await page.waitForTimeout(60);
  await tap(page, "KeyJ", 40);
  await page.waitForTimeout(60);
  await page.keyboard.up("ArrowUp");
  expect(await run<number>(page, "let vy = 0; sc.ctx.projectiles.pool.forEachActive((p) => { if (p.type2 === 'flame') vy = p.vy; }); return vy;")).toBeLessThan(0);
});

test("the arc lance beam pierces a riot shield, drains ammo while held and vanishes on release", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(60); " + KILL_ALL + " sc.state.loadout.pickWeapon('lance'); sc.enemies.spawn({ type: 'shield', x: sc.player.x + 90, y: 184, idle: 'none', hold: true, group: -12, facing: -1 }).cooldown.trigger(30); sc.enemies.spawn({ type: 'grunt', x: sc.player.x + 140, y: 184, idle: 'none', hold: true, group: -12, facing: -1 }).cooldown.trigger(30);");
  await page.waitForTimeout(250);
  await page.keyboard.down("KeyJ");
  await page.waitForTimeout(500);
  expect(await run<boolean>(page, "return sc.player.beam.visible;")).toBe(true);
  await page.waitForTimeout(500);
  await page.keyboard.up("KeyJ");
  await page.waitForTimeout(100);
  expect(await run<number>(page, "return sc.enemies.list.filter((e) => e.group === -12 && e.alive).length;")).toBe(0);
  expect((await snap(page)).ammo).toBeLessThan(195);
  expect(await run<boolean>(page, "return sc.player.beam.visible;")).toBe(false);
});

test("the announcer calls out a weapon pickup and stays quiet when switched off", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(60); " + KILL_ALL + " window.__game.registry.get('settings').set('voice', true); sc.ctx.pickups.spawn('furnace', sc.player.x, sc.player.y - 20, 0);");
  await page.waitForFunction("window.__game.registry.get('audio').lastSaid === 'powerUp'", null, { timeout: 4_000 });
  await run(page, "window.__game.registry.get('settings').set('voice', false); sc.ctx.pickups.spawn('lance', sc.player.x, sc.player.y - 20, 0);");
  await page.waitForFunction("window.__mv.snapshot().weapon === 'lance'", null, { timeout: 4_000 });
  expect(await run<string>(page, "return window.__game.registry.get('audio').lastSaid;")).toBe("powerUp");
  await run(page, "window.__game.registry.get('settings').set('voice', true);");
});

test("a knife kill freezes the action for a moment", async ({ page }) => {
  await startMission(page);
  await run(page, "mv.shield(60); " + KILL_ALL + " sc.enemies.spawn({ type: 'grunt', x: sc.player.x + 14, y: 184, idle: 'none', hold: true, group: -13, facing: -1 }).cooldown.trigger(30);");
  await page.waitForTimeout(200);
  const before = await run<number>(page, "return sc.hitStops;");
  await tap(page, "KeyJ", 40);
  await page.waitForTimeout(300);
  expect(await run<number>(page, "return sc.hitStops;")).toBe(before + 1);
  expect(await run<boolean>(page, "return sc.enemies.list.find((e) => e.group === -13).alive;")).toBe(false);
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

test("the Warden core volleys can be dodged by standing still and jumping the skimmers", async ({ page }) => {
  test.setTimeout(90_000);
  await startMission(page);
  await run(page, "mv.shield(900); mv.warp(3600);");
  await hold(page, "ArrowRight", 1500);
  await page.waitForFunction("window.__mv.snapshot().boss === 'phase1'", null, { timeout: 20_000 });
  await run(page, "sc.warden.turrets.forEach((t) => t.hit({ amount: 999, kind: 'bullet', from: 'player', x: 0, y: 0 }));");
  await page.waitForFunction("window.__mv.snapshot().boss === 'phase2'", null, { timeout: 5_000 });
  const setup = "const w = sc.warden; w.mortarCd.trigger(999); w.rusherCd.trigger(999); w.core.hp = 30; " + KILL_ALL;
  await run(page, setup);
  await hold(page, "ArrowLeft", 500);
  await run(page, "mv.shield(0);");
  const livesBefore = (await snap(page)).lives;
  let skims = 0;
  let near = false;
  const end = Date.now() + 14_000;
  while (Date.now() < end) {
    const d = await run<number>(page, "let best = 999; const px = sc.player.x; sc.ctx.projectiles.pool.forEachActive((p) => { if (p.type2 === 'enemyBullet' && Math.abs(p.vy) < 1 && p.y > sc.level.groundY - 12 && p.x > px) best = Math.min(best, p.x - px); }); return best;");
    if (d < 26 && !near) {
      skims++;
      await tap(page, "KeyK", 320);
    }
    near = d < 26;
    await page.waitForTimeout(20);
  }
  expect(skims).toBeGreaterThanOrEqual(3);
  expect((await snap(page)).lives).toBe(livesBefore);
});

test("licensed music files load and play: buffered title loop and streamed stage track", async ({ page }) => {
  await page.goto("/?bg=0");
  await page.waitForTimeout(800);
  await page.keyboard.press("Enter");
  await page.waitForFunction("(() => { const f = window.__game.registry.get('audio').files; return f && f.sources.length > 0; })()", null, { timeout: 15_000 });
  await page.waitForFunction("(() => { const a = window.__game.registry.get('audio'); return a.samplesReady > 0 && a.samplesReady === a.samples.size; })()", null, { timeout: 15_000 });
  expect(await page.evaluate("window.__game.registry.get('audio').samplesReady")).toBeGreaterThanOrEqual(60);
  await page.goto("/?skip");
  await page.waitForFunction("window.__mv && window.__mv.snapshot().phase === 'play'", null, { timeout: 20_000 });
  await page.keyboard.press("ArrowRight");
  await page.waitForFunction("(() => { const f = window.__game.registry.get('audio').files; return f && f.media && !f.media.el.paused && f.media.el.currentTime > 0; })()", null, { timeout: 15_000 });
  expect(await page.evaluate("window.__game.registry.get('audio').files.media.el.src")).toContain("pounding-the-enemy-base.mp3");
});

test("the Railbreaker can be beaten with the pistol by jump shooting", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/?skip&level=railyard");
  await page.waitForFunction("window.__mv && window.__mv.snapshot().phase === 'play'", null, { timeout: 20_000 });
  await run(page, "mv.shield(900); mv.warp(4080);");
  await hold(page, "ArrowRight", 1500);
  await page.waitForFunction("window.__mv.snapshot().boss === 'phase1'", null, { timeout: 20_000 });
  for (let i = 0; i < 260; i++) {
    await run(page, "mv.shield(900);");
    await tap(page, "KeyK", 160);
    await page.waitForTimeout(110);
    await tap(page, "KeyJ", 30);
    await page.waitForTimeout(60);
    await tap(page, "KeyJ", 30);
    await page.waitForTimeout(230);
    if (["dying", "dead"].includes((await snap(page)).boss)) break;
  }
  await page.waitForFunction("window.__mv.snapshot().phase === 'complete'", null, { timeout: 20_000 });
});

test("the Railbreaker ram crushes a player in its path and stops short of the far left", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/?skip&level=railyard");
  await page.waitForFunction("window.__mv && window.__mv.snapshot().phase === 'play'", null, { timeout: 20_000 });
  await run(page, "mv.shield(900); mv.warp(4080);");
  await hold(page, "ArrowRight", 1500);
  await page.waitForFunction("window.__mv.snapshot().boss === 'phase1'", null, { timeout: 20_000 });
  await run(page, "sc.boss.turret.hit({ amount: 999, kind: 'bullet', from: 'player', x: 0, y: 0 }); sc.boss.troopCd.trigger(999); sc.boss.cannonCd.trigger(999);");
  await page.waitForFunction("window.__mv.snapshot().boss === 'phase2'", null, { timeout: 5_000 });
  await run(page, KILL_ALL + " sc.player.legs.x = sc.ctx.camera.left + 30; mv.shield(0);");
  await page.waitForFunction("window.__mv.scene.boss.ramming === 'hold'", null, { timeout: 12_000 });
  expect((await snap(page)).playerState).toBe("alive");
  expect(await run<number>(page, "return sc.boss.left - sc.ctx.camera.left;")).toBeGreaterThan(60);
  await page.waitForFunction("window.__mv.scene.boss.ramming === 'idle'", null, { timeout: 12_000 });
  await run(page, KILL_ALL + " sc.player.legs.x = sc.boss.left - 30; mv.shield(0);");
  await page.waitForFunction("window.__mv.snapshot().playerState !== 'alive'", null, { timeout: 12_000 });
});

test("clearing mission 1 shows the tinker tally and carries score and lives into mission 2", async ({ page }) => {
  test.setTimeout(60_000);
  await startMission(page);
  await run(page, "mv.shield(60); sc.state.score.add(1234); sc.state.score.rescue(); sc.state.score.rescue(); sc.events2.emit('bossDefeated', undefined);");
  await page.waitForFunction("window.__mv.snapshot().phase === 'complete'", null, { timeout: 5_000 });
  await page.waitForFunction("window.__mv.scene.state.tallyDone === true", null, { timeout: 10_000 });
  expect(await page.evaluate("window.__game.scene.getScene('hud').tallyIcons.filter((i) => i.visible).length")).toBe(2);
  expect(await run<number>(page, "return sc.enemies.list.filter((e) => e.alive && !e.fsm.is('flee')).length;")).toBe(0);
  expect((await snap(page)).playerState).toBe("alive");
  const lives = (await snap(page)).lives;
  await page.keyboard.press("Enter");
  await page.waitForFunction("window.__mv && window.__mv.snapshot().level === 'railyard' && window.__mv.snapshot().phase !== 'complete'", null, { timeout: 10_000 });
  const s = await snap(page);
  expect(s.score).toBe(1234 + 2 * 10000);
  expect(s.lives).toBe(lives);
  expect(s.tinkers).toBe(0);
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

test("mission select from the title menu starts the railyard", async ({ page }) => {
  await page.goto("/");
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(150);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(150);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(200);
  await page.keyboard.press("Enter");
  await page.waitForFunction("window.__mv && window.__mv.snapshot().level === 'railyard' && window.__mv.snapshot().phase === 'play'", null, { timeout: 10_000 });
});

test("options change and persist the music volume", async ({ page }) => {
  await page.goto("/");
  await page.evaluate("localStorage.clear()");
  await page.reload();
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(80);
  }
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
