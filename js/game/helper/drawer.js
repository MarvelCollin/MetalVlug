import { ctx, canvas } from "../ctx.js";
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

  static updateFrameLoop(imagesKey, startIndex, endIndex) {
    if (this.currentFrames[imagesKey] >= endIndex) {
      this.currentFrames[imagesKey] = startIndex;
    } else {
      this.currentFrames[imagesKey]++;
    }
  }

  static drawImageFromBottom(img, x, y, flip = false, scale = 1) {
    const scaledWidth = img.width * scale;
    const scaledHeight = img.height * scale;
    const realX = x;
    const realY = y - scaledHeight;

    if(debugConfig.showShadow){
      ctx.save();
      ctx.globalAlpha = 0.7;
      if (flip) {
        ctx.translate(realX, y);
        ctx.scale(-1, 0.25);
        ctx.transform(1, 0, 0, 0.5, 0, 0); 
        ctx.filter = 'blur(2px) brightness(0%)';
        ctx.drawImage(img, -100, 0, scaledWidth, scaledHeight);
      } else {
        ctx.translate(realX, y);
        ctx.scale(1, 0.25);
        ctx.transform(1, 0, 0, 0.5, 0, 0); 
        ctx.filter = 'blur(2px) brightness(0%)';
        ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
      }
      ctx.restore();
    }

    if (flip) {
      ctx.save();
      ctx.translate(realX, realY);
      ctx.scale(-1, 1);
      ctx.drawImage(img, -100, 0, scaledWidth, scaledHeight);
      ctx.restore();
    } else {
      ctx.drawImage(img, realX, realY, scaledWidth, scaledHeight);
    }

    if (debugConfig.enabled) {
      drawDebugBorder(ctx, realX, realY, scaledWidth, scaledHeight);
    }
  }

  static drawToCanvas(
    images,
    x,
    y,
    delay,
    flip = false,
    scale = 1,
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
      this.drawImageFromBottom(img, x, y, flip, scale);

      if (type !== "ONCE") {
        const now = Date.now();
        if (now - this.frameTimers[imagesKey] >= delay) {
          this.updateFrame(imagesKey, type, images.length);
          this.frameTimers[imagesKey] = now;
        }
      }
    }
  }

  static drawLoop(
    images,
    x,
    y,
    delay,
    startIndex = 0,
    endIndex = null,
    flip = false,
    scale = 1
  ) {
    const imagesKey = images.toString() + startIndex + endIndex;

    if (!this.currentFrames[imagesKey]) {
      this.currentFrames[imagesKey] = startIndex;
    }
    if (!this.frameTimers[imagesKey]) {
      this.frameTimers[imagesKey] = Date.now();
    }

    // Set endIndex to last frame if not specified
    if (endIndex === null) {
      endIndex = images.length - 1;
    }

    // Validate indices
    startIndex = Math.max(0, Math.min(startIndex, images.length - 1));
    endIndex = Math.max(startIndex, Math.min(endIndex, images.length - 1));

    const img = Array.isArray(images) ? images[this.currentFrames[imagesKey]] : images;
    if (img) {
      this.drawImageFromBottom(img, x, y, flip, scale);

      const now = Date.now();
      if (now - this.frameTimers[imagesKey] >= delay) {
        this.updateFrameLoop(imagesKey, startIndex, endIndex);
        this.frameTimers[imagesKey] = now;
      }
    }
  }

}

export default Drawer;
