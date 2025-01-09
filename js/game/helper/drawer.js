import { ctx, canvas, scaleX, scaleY } from "../ctx.js";
import { drawDebugBorder, debugConfig } from "./debug.js";
import Assets from "./assets.js";

class Drawer {
  static instance = null;
  static currentFrames = {};
  static frameTimers = {};
  static isReversing = {};

  constructor() {
    if (Drawer.instance) {
      return Drawer.instance;
    }
    Drawer.instance = this;
  }

  static async loadImage(assetGetter) {
    try {
      const assetData = await assetGetter();
      if (!assetData?.PATH) return null;

      const totalFrames = assetData.FRAMES || 1;
      const images = [];

      if (assetData.TYPE === "SINGLE") {
        const img = new Image();
        await this.loadSingleImage(img, `${assetData.PATH}.png`);
        images.push(img);
      } else {
        for (let i = 1; i <= totalFrames; i++) {
          const img = new Image();
          await this.loadSingleImage(img, `${assetData.PATH}${i}.png`);
          images.push(img);
        }
      }

      return { images, delay: assetData.DELAY || 100 };
    } catch (error) {
      console.error("Failed to load assets:", error);
      return null;
    }
  }

  static loadSingleImage(img, path) {
    return new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => {
        console.error(`Failed to load image: ${path}`);
        reject(new Error(`Failed to load image: ${path}`));
      };
      img.src = path;
    });
  }

  static drawBackground(images, x, y, width, height) {
    const img = images;
    if (img) {
      const imgWidth = width || img.width;
      const imgHeight = height || img.height;
      ctx.drawImage(img, x, y - imgHeight, imgWidth, imgHeight);

      if (debugConfig.enabled) {
        drawDebugBorder(ctx, x, y - imgHeight, imgWidth, imgHeight);
      }
    }
  }

  static drawToCanvas(
    images,
    x,
    y,
    spriteId,
    delay,
    width,
    height,
    flip = false,
    type = "LOOP"
  ) {
    if (!this.currentFrames[spriteId]) {
      this.currentFrames[spriteId] = 0;
      this.isReversing[spriteId] = false;
    }
    if (!this.frameTimers[spriteId]) {
      this.frameTimers[spriteId] = Date.now();
    }

    if (this.currentFrames[spriteId] >= images.length) {
      this.currentFrames[spriteId] = 0;
    }

    const img = Array.isArray(images) ? images[this.currentFrames[spriteId]] : images;
    console.log(this.currentFrames)
    if(!img){
      console.log(this.currentFrames[spriteId]);
    }
    if (img) {
      const imgWidth = width || img.width;
      const imgHeight = height || img.height;

      if (flip) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, -30, -imgHeight, imgWidth, imgHeight);
        ctx.scale(1, 1);
        ctx.restore();
      } else {
        ctx.drawImage(img, x, y - imgHeight, imgWidth, imgHeight);
      }

      if (type !== "ONCE") {
        const now = Date.now();
        if (now - this.frameTimers[spriteId] >= delay) {
          const animationType = images.type || "LOOP";

          switch (animationType) {
            case "LOOP":
              this.currentFrames[spriteId] = (this.currentFrames[spriteId] + 1) % images.length;
              break;

            case "HOLD":
              if (this.currentFrames[spriteId] < images.length - 1) {
                this.currentFrames[spriteId] = this.currentFrames[spriteId] + 1;
              }
              break;

            case "BACK":
              if (!this.isReversing[spriteId]) {
                if (this.currentFrames[spriteId] >= images.length - 1) {
                  this.isReversing[spriteId] = true;
                  this.currentFrames[spriteId]--;
                } else {
                  this.currentFrames[spriteId]++;
                }
              } else {
                if (this.currentFrames[spriteId] <= 0) {
                  this.isReversing[spriteId] = false;
                  this.currentFrames[spriteId]++;
                } else {
                  this.currentFrames[spriteId]--;
                }
              }
              break;
          }

          this.frameTimers[spriteId] = now;
        }
      }

      if (debugConfig.enabled) {
        const debugX = flip ? x : x;
        drawDebugBorder(ctx, debugX, y - imgHeight, imgWidth, imgHeight);
      }
    }
  }

  static drawMultiple(sprites) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    sprites.forEach((sprite, index) => {
      if (sprite.images.length > 0) {
        this.drawToCanvas(
          sprite.images,
          sprite.x,
          sprite.y,
          index,
          sprite.delay
        );
      }
    });
    requestAnimationFrame(() => this.drawMultiple(sprites));
  }
}

export default Drawer;
