import { ctx, canvas, scaleX, scaleY } from './ctx.js'; 
import Player from './player/player.js';
import Camera from './camera/camera.js';
import { debugConfig } from './helper/debug.js';
import Assets from './assets.js';
import Drawer from './helper/drawer.js';

let player;
let camera;

async function loadBackground() {
    const background = await Drawer.loadImage(() => Assets.getBackground());
    return new Promise((resolve, reject) => {
        if (background && background.images && background.images[0]) {
            const img = background.images[0];
            const aspectRatio = img.width / img.height;
            const newHeight = canvas.height;
            const newWidth = newHeight * aspectRatio;
            camera.setWorldSize(newWidth, newHeight);
            const groundY = newHeight - 50;
            player.y = groundY;
            player.initialY = groundY;
            resolve({ width: newWidth, height: newHeight, background });
        } else {
            reject(new Error('Failed to load background'));
        }
    });
}

async function startAnimation() {
    player = new Player(100, 300);
    camera = new Camera(player);
    const bgData = await loadBackground();
    gameState.background = bgData.backgrou  ;
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    camera.follow();
    const viewport = camera.getViewport();

    ctx.save();
    ctx.translate(-viewport.x, -viewport.y);

    if (gameState.background) {
        const aspectRatio = canvas.width / canvas.height;
        const newHeight = canvas.height;
        const newWidth = newHeight * aspectRatio;
        Drawer.drawToCanvas(
            gameState.background.images[0],
            0,
            newHeight,
            'background',
            0,
            newWidth,
            newHeight,
            false,
            'ONCE'
        );
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

const gameState = {
    background: null
};

export { 
    startAnimation, 
    getPlayerPosition 
};