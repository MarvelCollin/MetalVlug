import { type GameObjects, Scene } from "phaser";
import { VIEW_H, VIEW_W } from "../../config/display";
import { MULE } from "../../config/tuning";
import { TEX } from "../assets/keys";
import { RetroText } from "../ui/RetroText";
import type { MissionScene } from "./MissionScene";

const BOX_X = 112;
const BAR_W = 44;

export class HudScene extends Scene {
  private mission!: MissionScene;
  private score!: RetroText;
  private arms!: RetroText;
  private bombLabel!: RetroText;
  private bombs!: RetroText;
  private timer!: RetroText;
  private tinkers!: RetroText;
  private banner!: RetroText;
  private sub!: RetroText;
  private center!: RetroText;
  private tip!: RetroText;
  private tipBar!: GameObjects.Rectangle;
  private tipTime = 0;
  private lifeIcons: GameObjects.Image[] = [];
  private barBack!: GameObjects.Image;
  private barFill!: GameObjects.Image;
  private go!: GameObjects.Sprite;
  private bannerTime = 0;
  private goTime = 0;
  private tallyTime = -1;
  private tallyParts: GameObjects.GameObject[] = [];
  private tallyIcons: GameObjects.Image[] = [];
  private tallyBonus!: RetroText;
  private tallyTotal!: RetroText;
  private tallyPrompt!: RetroText;
  private tallyShown = 0;
  private tallyTick = 0;

  constructor() {
    super("hud");
  }

  create(): void {
    this.tallyTime = -1;
    this.tallyShown = 0;
    this.tallyIcons = [];
    this.tallyParts = [];
    this.bannerTime = 0;
    this.goTime = 0;
    this.tipTime = 0;
    this.mission = this.scene.get("mission") as MissionScene;
    new RetroText(this, 6, 3, "1UP");
    this.score = new RetroText(this, 104, 3, "0", [1, 0]);
    const face = `life_${this.mission.character.id}_0`;
    this.lifeIcons = [0, 1, 2, 3, 4].map((i) => this.add.image(13 + i * 15, 22, TEX.atlas, face).setScrollFactor(0));
    this.barBack = this.add.image(8, 14, TEX.atlas, "hud_bar_0").setOrigin(0).setScrollFactor(0).setVisible(false);
    this.barFill = this.add.image(8, 14, TEX.atlas, "hud_bar_1").setOrigin(0).setScrollFactor(0).setVisible(false);
    this.add.image(BOX_X, 2, TEX.atlas, "hud_box_0").setOrigin(0).setScrollFactor(0);
    new RetroText(this, BOX_X + 21, 5, "ARMS", [0.5, 0]).view.setTint(0xc9b8e0);
    this.bombLabel = new RetroText(this, BOX_X + 63, 5, "BOMB", [0.5, 0]);
    this.bombLabel.view.setTint(0xc9b8e0);
    this.arms = new RetroText(this, BOX_X + 21, 14, "", [0.5, 0]);
    this.bombs = new RetroText(this, BOX_X + 63, 14, "10", [0.5, 0]);
    this.arms.view.setTint(0xffe08a);
    this.bombs.view.setTint(0xffe08a);
    this.timer = new RetroText(this, BOX_X + 116, 4, "60", [0.5, 0], true);
    this.add.image(VIEW_W - 44, 9, TEX.atlas, "tinkericon_0").setScrollFactor(0);
    this.tinkers = new RetroText(this, VIEW_W - 36, 5, "X0");
    this.banner = new RetroText(this, VIEW_W / 2, 84, "", [0.5, 0.5], true);
    this.sub = new RetroText(this, VIEW_W / 2, 106, "", [0.5, 0.5]);
    this.center = new RetroText(this, VIEW_W / 2, VIEW_H / 2 + 34, "", [0.5, 0.5]);
    this.tipBar = this.add.rectangle(0, VIEW_H - 18, VIEW_W, 14, 0x1b1626, 0.65).setOrigin(0).setScrollFactor(0).setVisible(false);
    this.tip = new RetroText(this, VIEW_W / 2, VIEW_H - 11, "", [0.5, 0.5]);
    this.tip.view.setTint(0xffe08a);
    this.go = this.add.sprite(VIEW_W - 46, 70, TEX.atlas, "go_0").setScrollFactor(0).setVisible(false);
    const ev = this.mission.events2;
    ev.on("banner", (b) => {
      this.banner.set(b.text);
      this.sub.set(b.sub ?? "");
      this.bannerTime = b.seconds ?? 2;
    });
    ev.on("tip", (t) => {
      this.tip.set(t.text);
      this.tipTime = t.seconds;
      this.tipBar.setVisible(true);
      this.tip.view.setVisible(true);
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

  private updateTally(dt: number): void {
    const s = this.mission.state;
    const t = s.tally;
    if (!t) return;
    const cx = VIEW_W / 2;
    if (this.tallyTime < 0) {
      this.tallyTime = 0;
      this.tallyShown = 0;
      this.tallyParts = [this.add.rectangle(cx, 140, 300, 78, 0x1b1626, 0.8).setStrokeStyle(1, 0x5c4a7a)];
      const head = new RetroText(this, cx, 110, `TINKERS RESCUED  ${t.tinkers}`, [0.5, 0.5]);
      head.view.setTint(0xc9b8e0);
      this.tallyBonus = new RetroText(this, cx, 144, "", [0.5, 0.5]);
      this.tallyTotal = new RetroText(this, cx, 156, "", [0.5, 0.5]);
      this.tallyTotal.view.setTint(0xffe08a);
      this.tallyPrompt = new RetroText(this, cx, 170, "PRESS ENTER", [0.5, 0.5]);
      this.tallyPrompt.view.setVisible(false);
      this.tallyParts.push(head.view, this.tallyBonus.view, this.tallyTotal.view, this.tallyPrompt.view);
      const shown = Math.min(t.tinkers, 16);
      const step = 15;
      this.tallyIcons = Array.from({ length: shown }, (_, i) => this.add.image(cx - ((shown - 1) * step) / 2 + i * step, 127, TEX.atlas, "tinkericon_0").setVisible(false));
    }
    this.tallyTime += dt;
    const iconStart = 1;
    const iconGap = 0.3;
    while (this.tallyShown < this.tallyIcons.length && this.tallyTime >= iconStart + this.tallyShown * iconGap) {
      this.tallyIcons[this.tallyShown]!.setVisible(true);
      this.tallyShown++;
      this.mission.events2.emit("sound", "clank");
    }
    const countStart = iconStart + this.tallyIcons.length * iconGap + 0.3;
    const k = Math.max(0, Math.min(1, (this.tallyTime - countStart) / 1));
    if (this.tallyTime >= countStart) {
      this.tallyBonus.set(`BONUS  ${t.tinkers} X ${t.perTinker} = ${Math.round(t.bonus * k)}`);
      this.tallyTick -= dt;
      if (k < 1 && t.bonus > 0 && this.tallyTick <= 0) {
        this.tallyTick = 0.08;
        this.mission.events2.emit("sound", "pickup");
      }
    }
    if (k >= 1) {
      this.tallyTotal.set(`SCORE  ${t.total}`);
      this.tallyPrompt.view.setVisible(Math.floor(this.tallyTime * 2) % 2 === 0);
      s.tallyDone = true;
    }
  }

  update(_t: number, dms: number): void {
    const dt = dms / 1000;
    const s = this.mission.state;
    if (!s) return;
    this.score.set(String(s.score.score));
    const piloting = s.piloting;
    this.lifeIcons.forEach((img, i) => img.setVisible(!piloting && i < Math.max(0, s.lives.remaining)));
    this.barBack.setVisible(piloting);
    this.barFill.setVisible(piloting);
    if (piloting) {
      const w = Math.round((Math.max(0, s.muleArmour) / MULE.armour) * BAR_W);
      this.barFill.setCrop(0, 0, w + 1, 6);
      this.barFill.setAlpha(s.muleArmour <= 1 && Math.floor(this.time.now / 150) % 2 ? 0.4 : 1);
    }
    const ammo = s.loadout.ammo;
    this.arms.set(piloting ? "*" : Number.isFinite(ammo) ? String(ammo) : "*");
    this.bombLabel.set(piloting ? "SHELL" : "BOMB");
    this.bombs.set(String(piloting ? s.muleShells : s.loadout.bombs));
    const units = s.clock.display;
    this.timer.set(s.clockEnabled ? String(units) : "--");
    this.timer.view.setTint(units <= 10 && Math.floor(this.time.now / 250) % 2 ? 0xff6655 : 0xffffff);
    this.tinkers.set(`X${s.score.tinkers}`);
    if (this.bannerTime > 0) {
      this.bannerTime -= dt;
      if (this.bannerTime <= 0) {
        this.banner.set("");
        this.sub.set("");
      }
    }
    if (this.tipTime > 0) {
      this.tipTime -= dt;
      if (this.tipTime <= 0) {
        this.tipBar.setVisible(false);
        this.tip.view.setVisible(false);
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
      this.center.set("");
      this.updateTally(dt);
    } else this.center.set("");
  }
}
