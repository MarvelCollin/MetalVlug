import { ctx, canvas } from '../ctx.js';
import Assets from '../assets.js';

class Drawer {
    static instance = null;

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
            img.src = `${asset.PATH}${i}.png`;
            images.push(img);
        }
        return images;
    }

    static drawToCanvas(image, x, y, width, height) {
        ctx.drawImage(image, x, y, width, height);
    }
}

// Example usage:
(async () => {
    try {
        let marcoImages = await Drawer.loadImage(Assets.getPlayerMarcoIdle());
        Drawer.drawToCanvas(marcoImages[0], 100, 100, 50, 50); // Draw the first frame
    } catch (error) {
        console.error('There was a problem loading the images:', error);
    }
})();

export default new Drawer();
