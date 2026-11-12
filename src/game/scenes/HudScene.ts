import { type GameObjects, Scene } from "phaser";
import { VIEW_H, VIEW_W } from "../../config/display";
import { TEX } from "../assets/keys";
import { RetroText } from "../ui/RetroText";
import type { MissionScene } from "./MissionScene";

export class HudScene extends Scene {
  private mission!: MissionScene;
  private score!: RetroText;
  private arms!: RetroText;
  private bombs!: RetroText;
  private timer!: RetroText;
  private tinkers!: RetroText;
  private banner!: RetroText;
  private sub!: RetroText;
  private center!: RetroText;
  private lifeIcons: GameObjects.Image[] = [];
  private armour: GameObjects.Image[] = [];
  private go!: GameObjects.Sprite;
  private bannerTime = 0;
  private goTime = 0;

  constructor() {
    super("hud");
  }

  create(): void {
    this.mission = this.scene.get("mission") as MissionScene;
    this.add.rectangle(0, 0, VIEW_W, 26, 0x1b1626, 0.45).setOrigin(0);
    new RetroText(this, 6, 3, "1UP");
    this.score = new RetroText(this, 30, 3, "0");
    this.lifeIcons = [0, 1, 2, 3, 4].map((i) => this.add.image(8 + i * 11, 20, TEX.atlas, "life_0").setScrollFactor(0));
    new RetroText(this, 120, 3, "ARMS");
    this.arms = new RetroText(this, 152, 3, "");
    this.add.image(124, 18, TEX.atlas, "bombicon_0").setScrollFactor(0);
    this.bombs = new RetroText(this, 132, 14, "10");
    this.timer = new RetroText(this, VIEW_W / 2 + 30, 6, "60", [0.5, 0]);
    this.timer.setScale(2);
    this.add.image(VIEW_W - 44, 9, TEX.atlas, "tinkericon_0").setScrollFactor(0);
    this.tinkers = new RetroText(this, VIEW_W - 36, 5, "X0");
    this.armour = [0, 1, 2].map((i) => this.add.image(VIEW_W - 44 + i * 10, 21, TEX.atlas, "armour_0").setScrollFactor(0).setVisible(false));
    this.banner = new RetroText(this, VIEW_W / 2, 84, "", [0.5, 0.5]);
    this.banner.setScale(2);
    this.sub = new RetroText(this, VIEW_W / 2, 106, "", [0.5, 0.5]);
    this.center = new RetroText(this, VIEW_W / 2, VIEW_H / 2 + 34, "", [0.5, 0.5]);
    this.go = this.add.sprite(VIEW_W - 46, 70, TEX.atlas, "go_0").setScrollFactor(0).setVisible(false);
    const ev = this.mission.events2;
    ev.on("banner", (b) => {
      this.banner.set(b.text);
      this.sub.set(b.sub ?? "");
      this.bannerTime = b.seconds ?? 2;
    });
    ev.on("weapon", (w) => {
      this.sub.set(w.label);
      this.banner.set("");
      this.bannerTime = 1.2;
    });
    ev.on("waveCleared", () => {
      this.goTime = 2.5;
      this.go.play("go");
    });
  }

  update(_t: number, dms: number): void {
    const dt = dms / 1000;
    const s = this.mission.state;
    if (!s) return;
    this.score.set(String(s.score.score));
    this.lifeIcons.forEach((img, i) => img.setVisible(i < Math.max(0, s.lives.remaining)));
    const ammo = s.loadout.ammo;
    this.arms.set(Number.isFinite(ammo) ? String(ammo) : "*");
    this.bombs.set(String(s.piloting ? s.muleShells : s.loadout.bombs));
    const units = s.clock.display;
    this.timer.set(String(units));
    this.timer.view.setTint(units <= 10 ? 0xff6655 : 0xffffff);
    this.tinkers.set(`X${s.score.tinkers}`);
    this.armour.forEach((img, i) => {
      img.setVisible(s.piloting);
      img.setFrame(i < s.muleArmour ? "armour_1" : "armour_0");
    });
    if (this.bannerTime > 0) {
      this.bannerTime -= dt;
      if (this.bannerTime <= 0) {
        this.banner.set("");
        this.sub.set("");
      }
    }
    if (this.goTime > 0) {
      this.goTime -= dt;
      this.go.setVisible(this.goTime > 0);
    }
    if (s.phase === "gameover") {
      this.banner.set("GAME OVER");
      this.center.set(`CONTINUE? ${Math.max(0, s.continueCount)}  PRESS ENTER`);
      this.bannerTime = 0.1;
    } else if (s.phase === "complete") {
      const t = s.score.tally();
      this.center.set(`TINKERS ${t.tinkers} X ${t.perTinker} = ${t.bonus}`);
    } else this.center.set("");
  }
}
