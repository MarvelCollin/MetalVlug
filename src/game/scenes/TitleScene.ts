import { Scene } from "phaser";
import { VIEW_H, VIEW_W } from "../../config/display";
import { TEX } from "../assets/keys";
import { RetroText } from "../ui/RetroText";
import { InputSystem } from "../input/InputSystem";
import { Action } from "../../domain/input/Actions";
import { audioOf } from "../audio/AudioService";

export class TitleScene extends Scene {
  private input2!: InputSystem;
  private prompt!: RetroText;
  private t = 0;

  constructor() {
    super("title");
  }

  create(): void {
    this.add.image(0, 0, TEX.sky).setOrigin(0);
    this.add.tileSprite(0, 0, VIEW_W, VIEW_H, TEX.far).setOrigin(0);
    this.add.tileSprite(0, 0, VIEW_W, VIEW_H, TEX.mid).setOrigin(0).setTilePosition(120, 0);
    this.add.rectangle(0, 0, VIEW_W, VIEW_H, 0x1b1626, 0.35).setOrigin(0);
    new RetroText(this, VIEW_W / 2, 52, "METALVLUG", [0.5, 0.5], true);
    new RetroText(this, VIEW_W / 2, 82, "MISSION 1 LOWTIDE DOCKS", [0.5, 0.5]);
    this.add.sprite(VIEW_W / 2 - 60, 160, TEX.atlas, "pip_legs_stand_0").setOrigin(0.5, 1);
    this.add.sprite(VIEW_W / 2 - 60, 160, TEX.atlas, "pip_heavy_fwd_0").setOrigin(0.5, 1);
    this.add.sprite(VIEW_W / 2 + 60, 160, TEX.atlas, "grunt_idle_0").setOrigin(0.5, 1).setFlipX(true).play("grunt_idle");
    this.prompt = new RetroText(this, VIEW_W / 2, 182, "PRESS ENTER", [0.5, 0.5]);
    new RetroText(this, VIEW_W / 2, 200, "ARROWS MOVE  J FIRE  K JUMP  L BOMB", [0.5, 0.5]).view.setAlpha(0.8);
    this.input2 = new InputSystem(this);
    audioOf(this).music("title");
  }

  update(_t: number, dms: number): void {
    this.t += dms / 1000;
    this.prompt.view.setVisible(Math.floor(this.t * 2) % 2 === 0);
    const frame = this.input2.poll();
    if (frame.pressed(Action.Start) || frame.pressed(Action.Fire)) this.scene.start("mission");
  }
}
