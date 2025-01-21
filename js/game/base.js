import { ctx, canvas } from './ctx.js';
import Assets from './helper/assets.js';
import Drawer from './helper/drawer.js';

class Base {
    constructor() {
        this.background = null;
        this.loadBackground();
    }

    async loadBackground() {
        this.background = await Drawer.loadImage(() => Assets.getBackgroundBase());
        if (this.background) {
            this.startAnimation();
        }
    }

    startAnimation() {
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (this.background && this.background.images[0]) {
            const img = this.background.images[0];
            const aspectRatio = img.width / img.height;
            const scaledWidth = canvas.height * aspectRatio;
            
            Drawer.drawBackground(
                img,
                0,
                canvas.height,
                scaledWidth,
                canvas.height
            );
        }

        // Add any base scene animations or interactions here

        requestAnimationFrame(this.gameLoop.bind(this));
    }
}

// Start the base scene
const base = new Base();
