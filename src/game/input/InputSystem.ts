import { Input, type Scene } from "phaser";
import { Action, InputFrame } from "../../domain/input/Actions";
import { touchInput } from "./TouchControls";

const K = Input.Keyboard.KeyCodes;

const KEYMAP: ReadonlyArray<[number, number]> = [
  [K.LEFT, Action.Left], [K.A, Action.Left],
  [K.RIGHT, Action.Right], [K.D, Action.Right],
  [K.UP, Action.Up], [K.W, Action.Up],
  [K.DOWN, Action.Down], [K.S, Action.Down],
  [K.J, Action.Fire], [K.Z, Action.Fire],
  [K.K, Action.Jump], [K.X, Action.Jump], [K.SPACE, Action.Jump],
  [K.L, Action.Bomb], [K.C, Action.Bomb],
  [K.E, Action.Exit], [K.V, Action.Exit],
  [K.ENTER, Action.Start], [K.ESC, Action.Pause], [K.P, Action.Pause],
];

export class InputSystem {
  readonly frame = new InputFrame();
  private readonly keys: Array<[Input.Keyboard.Key, number]>;
  private forced = 0;
  private latched = 0;

  constructor(private readonly scene: Scene) {
    const kb = scene.input.keyboard;
    this.keys = kb ? KEYMAP.map(([code, bit]) => [kb.addKey(code, true, false), bit]) : [];
    for (const [key, bit] of this.keys) key.on("down", () => { this.latched |= bit; });
    scene.events.once("shutdown", () => { for (const [key] of this.keys) key.removeAllListeners("down"); });
  }

  inject(mask: number): void {
    this.forced = mask;
  }

  poll(): InputFrame {
    let mask = this.forced | this.latched | touchInput.held | touchInput.latched;
    this.latched = 0;
    touchInput.latched = 0;
    for (const [key, bit] of this.keys) if (key.isDown) mask |= bit;
    const pad = this.scene.input.gamepad?.getPad(0);
    if (pad) {
      const ax = pad.leftStick.x;
      const ay = pad.leftStick.y;
      if (pad.left || ax < -0.4) mask |= Action.Left;
      if (pad.right || ax > 0.4) mask |= Action.Right;
      if (pad.up || ay < -0.5) mask |= Action.Up;
      if (pad.down || ay > 0.5) mask |= Action.Down;
      if (pad.X) mask |= Action.Fire;
      if (pad.A) mask |= Action.Jump;
      if (pad.B) mask |= Action.Bomb;
      if (pad.Y) mask |= Action.Exit;
      if (pad.buttons[9]?.pressed) mask |= Action.Start | Action.Pause;
    }
    this.frame.push(mask);
    return this.frame;
  }
}
