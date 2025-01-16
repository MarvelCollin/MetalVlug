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

  static updateFrame(imagesKey, type, imagesLength) {
    switch (type) {
      case "LOOP":
        this.currentFrames[imagesKey] = (this.currentFrames[imagesKey] + 1) % imagesLength;
        break;

      case "HOLD":
        if (this.currentFrames[imagesKey] < imagesLength - 1) {
          this.currentFrames[imagesKey]++;
        }
        break;

      case "BACK":
        if (!this.isReversing[imagesKey]) {
          if (this.currentFrames[imagesKey] >= imagesLength - 1) {
            this.isReversing[imagesKey] = true;
            this.currentFrames[imagesKey]--;
          } else {
            this.currentFrames[imagesKey]++;
          }
        } else {
          if (this.currentFrames[imagesKey] <= 0) {
            this.isReversing[imagesKey] = false;
            this.currentFrames[imagesKey]++;
          } else {
            this.currentFrames[imagesKey]--;
          }
        }
        break;
    }
  }

  static drawToCanvas(
    images,
    x,
    y,
    delay,
    width,
    height,
    flip = false,
    type = "LOOP"
  ) {
    const imagesKey = images.toString();

    if (!this.currentFrames[imagesKey]) {
      this.currentFrames[imagesKey] = 0;
      this.isReversing[imagesKey] = false;
    }
    if (!this.frameTimers[imagesKey]) {
      this.frameTimers[imagesKey] = Date.now();
    }

    if (this.currentFrames[imagesKey] >= images.length) {
      this.currentFrames[imagesKey] = 0;
    }

    const img = Array.isArray(images) ? images[this.currentFrames[imagesKey]] : images;
    if (img) {
      const imgWidth = width || img.width;
      const imgHeight = height || img.height;

      const realX = x * scaleX;
      const realY = y * scaleY - imgHeight;

      if (flip) {
        ctx.save();
        ctx.translate(realX + imgWidth, realY);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
        ctx.restore();
      } else {
        ctx.drawImage(img, realX, realY, imgWidth, imgHeight);
      }

      if (type !== "ONCE") {
        const now = Date.now();
        if (now - this.frameTimers[imagesKey] >= delay) {
          this.updateFrame(imagesKey, type, images.length);
          this.frameTimers[imagesKey] = now;
        }
      }

      if (debugConfig.enabled) {
        drawDebugBorder(ctx, realX, realY, imgWidth, imgHeight);
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
          sprite.delay
        );
      }
    });
    requestAnimationFrame(() => this.drawMultiple(sprites));
  }
}

export default Drawer;
