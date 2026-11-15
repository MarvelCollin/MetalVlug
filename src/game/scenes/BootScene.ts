import { GameObjects, Scene } from "phaser";
import { DATA, FONT, FONT_BIG, TEX } from "../assets/keys";
import { registerAnimations } from "../assets/Animations";
import { AudioService } from "../audio/AudioService";
import { Settings } from "../settings/Settings";

interface FontMeta {
  cellW: number;
  cellH: number;
  bigW: number;
  bigH: number;
  chars: string;
}

export class BootScene extends Scene {
  constructor() {
    super("boot");
  }

  preload(): void {
    this.load.setPath("assets/");
    this.load.atlas(TEX.atlas, "atlas.png", "atlas.json");
    this.load.json(DATA.anchors, "anchors.json");
    this.load.atlas(TEX.fx, "fx.png", "fx.json");
    this.load.json(DATA.fxMeta, "fx-meta.json");
    this.load.json(DATA.fontMeta, "font.json");
    this.load.image(TEX.font, "font.png");
    this.load.image(TEX.fontBig, "font_big.png");
    this.load.image(TEX.sky, "bg_sky.png");
    this.load.image(TEX.far, "bg_far.png");
    this.load.image(TEX.mid, "bg_mid.png");
    const bar = this.add.rectangle(92, 106, 0, 4, 0xf8d25a).setOrigin(0, 0.5);
    this.load.on("progress", (v: number) => bar.setSize(200 * v, 4));
  }

  create(): void {
    const meta = this.cache.json.get(DATA.fontMeta) as FontMeta;
    const parse = (image: string, width: number, height: number) =>
      GameObjects.RetroFont.Parse(this, {
        image, width, height, chars: meta.chars, charsPerRow: meta.chars.length,
        "offset.x": 0, "offset.y": 0, "spacing.x": 0, "spacing.y": 0, lineSpacing: 2,
      });
    this.cache.bitmapFont.add(FONT, parse(TEX.font, meta.cellW, meta.cellH));
    this.cache.bitmapFont.add(FONT_BIG, parse(TEX.fontBig, meta.bigW, meta.bigH));
    registerAnimations(this);
    if (!this.game.registry.has("settings")) {
      const settings = new Settings();
      this.game.registry.set("settings", settings);
      new AudioService(settings).register(this);
    }
    this.scene.start(new URLSearchParams(location.search).has("skip") ? "mission" : "title");
  }
}
