import Drawer from '../helper/drawer.js';
import Assets from '../helper/assets.js';
import { canvas } from '../ctx.js';

let background = null;
export let backgroundWidth = 0;
export let backgroundHeight = 0;

export async function loadBackground() {
    background = await Drawer.loadImage(() => Assets.getBackgroundArcade());
    if (background && background.images && background.images[0]) {
        const img = background.images[0];
        backgroundWidth = img.width;
        backgroundHeight = img.height;
    }
    return background;
}

export function drawBackground() {
    if (background && background.images[0]) {
        Drawer.drawBackground(
            background.images[0],
            0,
            backgroundHeight,
            backgroundWidth,
            backgroundHeight
        );
    }
}
