import type { GameObjects, Scene } from "phaser";
import { FONT } from "../assets/keys";

export class RetroText {
  readonly view: GameObjects.BitmapText;
  private last = "";

  constructor(scene: Scene, private readonly x: number, private readonly y: number, text = "", private readonly origin: [number, number] = [0, 0]) {
    this.view = scene.add.bitmapText(x, y, FONT, text).setOrigin(0, 0).setScrollFactor(0);
    this.last = text;
    this.place();
  }

  set(text: string): this {
    if (text !== this.last) {
      this.last = text;
      this.view.setText(text);
      this.place();
    }
    return this;
  }

  setScale(s: number): this {
    this.view.setScale(s);
    this.place();
    return this;
  }

  private place(): void {
    const w = this.view.width;
    const h = this.view.height;
    this.view.setPosition(Math.round(this.x - w * this.origin[0]), Math.round(this.y - h * this.origin[1]));
  }
}
