import { type GameObjects, Scene } from "phaser";
import { VIEW_H, VIEW_W } from "../../config/display";
import { Action } from "../../domain/input/Actions";
import { TEX, bgKey } from "../assets/keys";
import { audioOf, type AudioService } from "../audio/AudioService";
import { InputSystem } from "../input/InputSystem";
import { settingsOf, type Settings } from "../settings/Settings";
import { Menu, type MenuItem } from "../ui/Menu";
import { RetroText } from "../ui/RetroText";

type Mode = "press" | "main" | "options" | "credits";

const CREDITS = [
  "DESIGN, CODE AND PIXELS",
  "MADE WITH PHASER 4",
  "EFFECTS BAKED FROM PIXELFX (MIT)",
  "SPRITE FUSION VFX BY HUGO DUPREZ (MIT)",
  "MUSIC AND SOUND SYNTHESIZED IN CODE",
  "",
  "PRESS FIRE TO GO BACK",
];

export class TitleScene extends Scene {
  private input2!: InputSystem;
  private audio!: AudioService;
  private settings!: Settings;
  private prompt!: RetroText;
  private main!: Menu;
  private options!: Menu;
  private credits: RetroText[] = [];
  private mode: Mode = "press";
  private t = 0;
  private far!: GameObjects.TileSprite;
  private mid!: GameObjects.TileSprite;

  constructor() {
    super("title");
  }

  create(): void {
    this.mode = "press";
    this.t = 0;
    this.audio = audioOf(this);
    this.settings = settingsOf(this.game.registry);
    this.add.image(0, 0, bgKey("sky", "harbour")).setOrigin(0);
    this.far = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, bgKey("far", "harbour")).setOrigin(0);
    this.mid = this.add.tileSprite(0, 0, VIEW_W, VIEW_H, bgKey("mid", "harbour")).setOrigin(0);
    this.add.rectangle(0, 0, VIEW_W, VIEW_H, 0x1b1626, 0.3).setOrigin(0);
    this.add.tileSprite(0, VIEW_H - 24, VIEW_W, 16, TEX.atlas, "dock_0").setOrigin(0);
    this.add.tileSprite(0, VIEW_H - 8, VIEW_W, 8, TEX.atlas, "fill_0").setOrigin(0);
    new RetroText(this, VIEW_W / 2, 34, "METALVLUG", [0.5, 0.5], true);
    new RetroText(this, VIEW_W / 2, 52, "THE LANTERN BRIGADE", [0.5, 0.5]);
    const pipLegs = this.add.sprite(70, VIEW_H - 24, TEX.atlas, "pip_legs_run_0").setOrigin(0.5, 1).play("pip_legs_run");
    const pipTorso = this.add.sprite(70, VIEW_H - 24, TEX.atlas, "pip_heavy_fwd_0").setOrigin(0.5, 1);
    this.tweens.add({ targets: [pipLegs, pipTorso], x: 110, duration: 2600, yoyo: true, repeat: -1, ease: "Sine.inOut", onYoyo: () => { pipLegs.setFlipX(true); pipTorso.setFlipX(true); }, onRepeat: () => { pipLegs.setFlipX(false); pipTorso.setFlipX(false); } });
    this.add.sprite(VIEW_W - 70, VIEW_H - 24, TEX.atlas, "grunt_read_0").setOrigin(0.5, 1).setFlipX(true).play("grunt_read");
    this.add.sprite(VIEW_W - 110, VIEW_H - 24, TEX.atlas, "grunt_idle_0").setOrigin(0.5, 1).setFlipX(true).play("grunt_idle");
    this.prompt = new RetroText(this, VIEW_W / 2, 118, "PRESS ENTER", [0.5, 0.5]);
    new RetroText(this, VIEW_W / 2, 206, "ARROWS MOVE  J FIRE  K JUMP  L BOMB  ESC PAUSE", [0.5, 0.5]).view.setAlpha(0.85);
    this.input2 = new InputSystem(this);
    const tick = () => this.audio.request("clank");
    const start = (level: "lowtide" | "camp") => {
      this.audio.request("weapon");
      this.audio.flush();
      this.scene.start("mission", { level });
    };
    this.main = new Menu(this, [
      { label: () => "START MISSION", select: () => start("lowtide") },
      { label: () => "TRAINING CAMP", select: () => start("camp") },
      { label: () => "OPTIONS", select: () => this.setMode("options") },
      { label: () => "CREDITS", select: () => this.setMode("credits") },
    ], VIEW_W / 2, 92, 14, tick);
    const level = (v: number) => `${Math.round(v * 10)}`.padStart(2, " ");
    const step = (key: "music" | "sfx") => (d: -1 | 1) =>
      this.settings.set(key, Math.min(1, Math.max(0, Math.round((this.settings.values[key] + d * 0.1) * 10) / 10)));
    const flip = (key: "shake" | "flashes" | "easy") => () => this.settings.set(key, !this.settings.values[key]);
    const onOff = (v: boolean) => (v ? "ON" : "OFF");
    const items: MenuItem[] = [
      { label: () => `MUSIC  < ${level(this.settings.values.music)} >`, adjust: step("music") },
      { label: () => `SOUND  < ${level(this.settings.values.sfx)} >`, adjust: step("sfx") },
      { label: () => `SCREEN SHAKE  ${onOff(this.settings.values.shake)}`, select: flip("shake"), adjust: flip("shake") },
      { label: () => `FLASHES  ${onOff(this.settings.values.flashes)}`, select: flip("flashes"), adjust: flip("flashes") },
      { label: () => `EASY MODE  ${onOff(this.settings.values.easy)}`, select: flip("easy"), adjust: flip("easy") },
      { label: () => "BACK", select: () => this.setMode("main") },
    ];
    this.options = new Menu(this, items, VIEW_W / 2, 78, 13, tick);
    this.credits = CREDITS.map((line, i) => new RetroText(this, VIEW_W / 2, 74 + i * 12, line, [0.5, 0.5]));
    this.setMode("press");
    this.audio.music("title");
  }

  private setMode(mode: Mode): void {
    this.mode = mode;
    this.prompt.view.setVisible(mode === "press");
    this.main.setVisible(mode === "main");
    this.options.setVisible(mode === "options");
    for (const c of this.credits) c.view.setVisible(mode === "credits");
  }

  update(_t: number, dms: number): void {
    const dt = dms / 1000;
    this.t += dt;
    this.far.tilePositionX += dt * 4;
    this.mid.tilePositionX += dt * 10;
    const input = this.input2.poll();
    if (this.mode === "press") {
      this.prompt.view.setVisible(Math.floor(this.t * 2) % 2 === 0);
      if (input.pressed(Action.Start) || input.pressed(Action.Fire)) {
        this.audio.request("go");
        this.setMode("main");
      }
    } else if (this.mode === "main") this.main.update(input, dt);
    else if (this.mode === "options") {
      this.options.update(input, dt);
      if (input.pressed(Action.Pause)) this.setMode("main");
    } else if (input.pressed(Action.Fire) || input.pressed(Action.Start) || input.pressed(Action.Pause)) this.setMode("main");
    this.audio.flush();
  }
}
