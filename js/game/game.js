import { ctx, canvas } from './ctx.js'; 
import Drawer from './helper/drawer.js';
import Assets from './assets.js';
import { debugConfig } from './helper/debug.js';

const backgroundImage = new Image();
let assetsLoaded = false;


async function startAnimation() {
    const marcoIdle = await Drawer.loadImage(Assets.getPlayerMarcoIdle());
    const marcoRun = await Drawer.loadImage(Assets.getPlayerMarcoRun());
    const marcoShoot = await Drawer.loadImage(Assets.getPlayerMarcoShoot());

    const sprites = [
        { images: marcoIdle.images, x: 100, y: canvas.height - 100, delay: marcoIdle.delay },
        { images: marcoRun.images, x: 200, y: canvas.height - 100, delay: marcoRun.delay }
    ];

    requestAnimationFrame(() => gameLoop(sprites, marcoShoot));
}

function gameLoop(sprites, marcoShoot) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    Drawer.drawMultiple(sprites);

    Drawer.drawToCanvas(marcoShoot.images, 300, canvas.height - 100, 'shoot', marcoShoot.delay);

    requestAnimationFrame(() => gameLoop(sprites, marcoShoot));
}

startAnimation();