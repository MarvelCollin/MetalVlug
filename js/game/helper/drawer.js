import { ctx, canvas } from '../ctx.js';
import { drawDebugBorder, debugConfig } from './debug.js';
import Assets from '../assets.js';

class Drawer {
    static instance = null;
    static currentFrames = {};
    static frameTimers = {};

    constructor() {
        if (Drawer.instance) {
            return Drawer.instance;
        }
        Drawer.instance = this;
    }

    static async loadImage(assetPromise) {
        const asset = await assetPromise;
        const images = [];
        for (let i = 0; i < asset.FRAMES; i++) {
            const img = new Image();
            img.src = `${asset.PATH}${i + 1}.png`;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            images.push(img);
        }
        return { images, delay: asset.DELAY };
    }

    static drawToCanvas(images, x, y, spriteId, delay) {
        if (!this.currentFrames[spriteId]) {
            this.currentFrames[spriteId] = 0;
        }
        if (!this.frameTimers[spriteId]) {
            this.frameTimers[spriteId] = Date.now();
        }

        if (images.length > 0 && images[this.currentFrames[spriteId]] && images[this.currentFrames[spriteId]].complete) {
            const now = Date.now();
            const img = images[this.currentFrames[spriteId]];
            const drawY = y - img.height;
            if (now - this.frameTimers[spriteId] >= delay) {
                ctx.drawImage(img, x, drawY);
                this.currentFrames[spriteId] = (this.currentFrames[spriteId] + 1) % images.length;
                this.frameTimers[spriteId] = now;
            } else {
                ctx.drawImage(img, x, drawY);
            }

            if (debugConfig.enabled) {
                drawDebugBorder(ctx, x, drawY, img.width, img.height);
            }
        }
    }

    static drawMultiple(sprites) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        sprites.forEach((sprite, index) => {
            if (sprite.images.length > 0) {
                this.drawToCanvas(sprite.images, sprite.x, sprite.y, index, sprite.delay);
            }
        });
        requestAnimationFrame(() => this.drawMultiple(sprites));
    }
}

export default Drawer;
