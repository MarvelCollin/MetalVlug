import { ctx, canvas } from './ctx.js'; 
import loadImage from './helper/drawer.js';
import Assets from './assets.js';

const backgroundImage = new Image();
let assetsLoaded = false;
let marcoImages = [];
let currentFrame = 0;

async function startAnimation() {
    marcoImages = await loadImage(Assets.getPlayerMarcoIdle());
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    if (marcoImages.length > 0) {
        ctx.drawImage(marcoImages[currentFrame], 100, 100); 
        currentFrame = (currentFrame + 1) % marcoImages.length;
    }

    requestAnimationFrame(gameLoop);
}

startAnimation();