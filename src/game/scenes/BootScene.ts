import { GameObjects, Scene } from "phaser";
import { DATA, FONT, TEX } from "../assets/keys";
import { registerAnimations } from "../assets/Animations";

interface FontMeta {
  cellW: number;
  cellH: number;
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
    this.load.json(DATA.fontMeta, "font.json");
    this.load.image(TEX.font, "font.png");
    this.load.image(TEX.sky, "bg_sky.png");
    this.load.image(TEX.far, "bg_far.png");
    this.load.image(TEX.mid, "bg_mid.png");
    const bar = this.add.rectangle(92, 106, 0, 4, 0xf8d25a).setOrigin(0, 0.5);
    this.load.on("progress", (v: number) => bar.setSize(200 * v, 4));
  }

  create(): void {
    const meta = this.cache.json.get(DATA.fontMeta) as FontMeta;
    const entry = GameObjects.RetroFont.Parse(this, {
      image: TEX.font,
      width: meta.cellW,
      height: meta.cellH,
      chars: meta.chars,
      charsPerRow: meta.chars.length,
      "offset.x": 0,
      "offset.y": 0,
      "spacing.x": 0,
      "spacing.y": 0,
      lineSpacing: 2,
    });
    this.cache.bitmapFont.add(FONT, entry);
    registerAnimations(this);
    this.scene.start(new URLSearchParams(location.search).has("skip") ? "mission" : "title");
  }
}
