import type { GameObjects, Scene } from "phaser";
import { Action, type InputFrame } from "../../domain/input/Actions";
import { TEX } from "../assets/keys";
import { RetroText } from "./RetroText";

export interface MenuItem {
  label: () => string;
  select?: () => void;
  adjust?: (dir: -1 | 1) => void;
}

export class Menu {
  private index = 0;
  private readonly rows: RetroText[];
  private readonly cursor: GameObjects.Image;
  private repeat = 0;

  constructor(
    scene: Scene,
    private readonly items: MenuItem[],
    x: number,
    private readonly y: number,
    private readonly gap = 14,
    private readonly onMove: () => void = () => {},
  ) {
    this.rows = items.map((it, i) => new RetroText(scene, x, y + i * gap, it.label(), [0.5, 0.5]));
    this.cursor = scene.add.image(0, 0, TEX.atlas, "hud_cursor_0").setScrollFactor(0);
    this.refresh();
  }

  get selected(): number {
    return this.index;
  }

  setVisible(v: boolean): void {
    for (const r of this.rows) r.view.setVisible(v);
    this.cursor.setVisible(v);
  }

  destroy(): void {
    for (const r of this.rows) r.view.destroy();
    this.cursor.destroy();
  }

  update(input: InputFrame, dt: number): void {
    this.repeat -= dt;
    const up = input.pressed(Action.Up) || (input.held(Action.Up) && this.repeat <= 0);
    const down = input.pressed(Action.Down) || (input.held(Action.Down) && this.repeat <= 0);
    if (up || down) {
      this.repeat = input.pressed(Action.Up) || input.pressed(Action.Down) ? 0.35 : 0.12;
      this.index = (this.index + (up ? -1 : 1) + this.items.length) % this.items.length;
      this.onMove();
    }
    const item = this.items[this.index]!;
    if (item.adjust && (input.pressed(Action.Left) || input.pressed(Action.Right))) {
      item.adjust(input.pressed(Action.Left) ? -1 : 1);
      this.onMove();
    }
    if (item.select && (input.pressed(Action.Start) || input.pressed(Action.Fire) || input.pressed(Action.Jump))) item.select();
    this.refresh();
  }

  private refresh(): void {
    this.items.forEach((it, i) => {
      this.rows[i]!.set(it.label());
      this.rows[i]!.view.setTint(i === this.index ? 0xffe08a : 0xffffff);
    });
    const row = this.rows[this.index]!.view;
    this.cursor.setPosition(row.x - 9, Math.round(this.y + this.index * this.gap));
  }
}
