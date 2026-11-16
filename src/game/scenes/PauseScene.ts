import { Scene } from "phaser";
import { VIEW_H, VIEW_W } from "../../config/display";
import { Action } from "../../domain/input/Actions";
import { audioOf } from "../audio/AudioService";
import { InputSystem } from "../input/InputSystem";
import { Menu } from "../ui/Menu";
import { RetroText } from "../ui/RetroText";

export class PauseScene extends Scene {
  private input2!: InputSystem;
  private menu!: Menu;

  constructor() {
    super("pause");
  }

  create(): void {
    this.add.rectangle(0, 0, VIEW_W, VIEW_H, 0x1b1626, 0.6).setOrigin(0);
    new RetroText(this, VIEW_W / 2, 64, "PAUSE", [0.5, 0.5], true);
    this.input2 = new InputSystem(this);
    const audio = audioOf(this);
    const leave = (target: "resume" | "restart" | "title") => {
      this.scene.stop();
      if (target === "resume") {
        this.scene.resume("mission");
        return;
      }
      this.scene.stop("hud");
      if (target === "restart") this.scene.get("mission").scene.restart();
      else {
        this.scene.stop("mission");
        this.scene.start("title");
      }
    };
    this.menu = new Menu(this, [
      { label: () => "RESUME", select: () => leave("resume") },
      { label: () => "RESTART MISSION", select: () => leave("restart") },
      { label: () => "QUIT TO TITLE", select: () => leave("title") },
    ], VIEW_W / 2, 100, 16, () => audio.request("clank"));
  }

  update(_t: number, dms: number): void {
    const input = this.input2.poll();
    if (input.pressed(Action.Pause)) {
      this.scene.stop();
      this.scene.resume("mission");
      return;
    }
    this.menu.update(input, dms / 1000);
    audioOf(this).flush();
  }
}
