import { ctx, canvas } from './ctx.js'; 
import Player from './player/player.js';
import Camera from './camera/camera.js';
import { debugConfig } from './helper/debug.js';
import Assets from './assets.js';
import Drawer from './helper/drawer.js';

const backgroundImage = new Image();
let player;
let camera;

async function loadBackground() {
    const backgroundAsset = await Assets.getBackground();
    backgroundImage.src = backgroundAsset.PATH;
    return new Promise((resolve, reject) => {
        backgroundImage.onload = () => {
            camera.setWorldSize(backgroundImage.width, backgroundImage.height);
            player.y = backgroundImage.height - 50;
            resolve({ width: backgroundImage.width, height: backgroundImage.height });
        };
        backgroundImage.onerror = reject;
    });
}

async function startAnimation() {
  player = new Player(100, 300);
  camera = new Camera(player);
  const bgDimensions = await loadBackground();
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    camera.follow();
    const viewport = camera.getViewport();

    ctx.save();
    ctx.translate(-viewport.x, -viewport.y);

    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, backgroundImage.width, backgroundImage.height);
    }

    player.update();
    player.draw();

    ctx.restore();

    requestAnimationFrame(gameLoop);
 
}

function handleKeyDown(event) {
    switch (event.key) {
        case 'ArrowLeft':
            player.handleInput('runLeft');
            break;
        case 'ArrowRight':
            player.handleInput('runRight');
            break;
        case 'Control':
            player.handleInput('shoot');
            break;
    }
}

function handleKeyUp(event) {
    switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
            player.handleInput('idle');
            break;
    }
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

startAnimation();