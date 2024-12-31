import { ctx, canvas, scaleX, scaleY } from './ctx.js'; 
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
            const aspectRatio = backgroundImage.width / backgroundImage.height;
            const newHeight = canvas.height;
            const newWidth = newHeight * aspectRatio;
            camera.setWorldSize(newWidth, newHeight);
            const groundY = newHeight - 50;
            player.y = groundY;
            player.initialY = groundY; // Set initial Y position
            resolve({ width: newWidth, height: newHeight });
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
        const aspectRatio = backgroundImage.width / backgroundImage.height;
        const newHeight = canvas.height;
        const newWidth = newHeight * aspectRatio;
        ctx.drawImage(backgroundImage, 0, 0, newWidth, newHeight);
    }

    ctx.scale(scaleX, scaleY);

    player.update();
    player.draw();

    ctx.restore();

    requestAnimationFrame(gameLoop);
 
}

function handleKeyDown(event) {
    switch (event.code) {  
        case 'ArrowLeft':
            player.handleInput('runLeft');
            break;
        case 'ArrowRight':
            player.handleInput('runRight');
            break;
        case 'ControlLeft':
        case 'ControlRight':
            player.handleInput('shoot');
            break;
        case 'Space':  
            player.handleInput('jump');
            break;
    }
}

function handleKeyUp(event) {
    switch (event.code) {
        case 'ArrowLeft':
        case 'ArrowRight':
            player.handleInput('idle');
            break;
    }
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

startAnimation();

function getPlayerPosition() {
    return player ? player.getPosition() : null;
}

export { 
    startAnimation, 
    getPlayerPosition 
};