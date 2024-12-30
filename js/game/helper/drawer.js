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

    static appendImage(img, x, y, width, height) {
        if (img && img.complete) {
            if (width && height) {
                ctx.drawImage(img, x, y, width, height); // Remove the y - height adjustment for background
            } else {
                ctx.drawImage(img, x, y - img.height, img.width, img.height);
            }
        }
    }

    static drawToCanvas(images, x, y, spriteId, delay, width, height) {
        if (!this.currentFrames[spriteId]) {
            this.currentFrames[spriteId] = 0;
        }
        if (!this.frameTimers[spriteId]) {
            this.frameTimers[spriteId] = Date.now();
        }

        if (images.length > 0 && images[this.currentFrames[spriteId]] && images[this.currentFrames[spriteId]].complete) {
            const now = Date.now();
            const img = images[this.currentFrames[spriteId]];
            
            if (now - this.frameTimers[spriteId] >= delay) {
                this.appendImage(img, x, y, width, height);
                this.currentFrames[spriteId] = (this.currentFrames[spriteId] + 1) % images.length;
                this.frameTimers[spriteId] = now;
            } else {
                this.appendImage(img, x, y, width, height);
            }

            if (debugConfig.enabled) {
                const finalHeight = height || img.height;
                drawDebugBorder(ctx, x, y - finalHeight, width || img.width, finalHeight);
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
