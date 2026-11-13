import type { Page } from "@playwright/test";

export interface Snapshot {
  phase: string;
  x: number;
  score: number;
  bombs: number;
  lives: number;
  tinkers: number;
  weapon: string;
  piloting: boolean;
  boss: string;
  camLeft: number;
  locked: boolean;
  playerState: string;
  enemiesAlive: number;
}

export async function startMission(page: Page): Promise<void> {
  await page.goto("/?skip");
  await page.waitForFunction("window.__mv && window.__mv.snapshot().phase === 'play'", null, { timeout: 20_000 });
}

export async function snap(page: Page): Promise<Snapshot> {
  return (await page.evaluate("window.__mv.snapshot()")) as Snapshot;
}

export async function run<T = unknown>(page: Page, body: string): Promise<T> {
  return (await page.evaluate(`(async () => { const mv = window.__mv; const sc = mv.scene; ${body} })()`)) as T;
}

export async function tap(page: Page, key: string, ms = 50): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

export async function hold(page: Page, key: string, ms: number): Promise<void> {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

export const KILL_ALL = "sc.enemies.list.forEach((e) => e.alive && e.hit({ amount: 99, kind: 'bullet', from: 'player', x: 0, y: 0 }));";
