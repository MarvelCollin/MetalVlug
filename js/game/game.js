import { ctx, canvas } from './ctx.js'; 
import Player from './player/player.js';
import PlayerInputHandler from './player/components/playerInputHandler.js';
import Camera from './world/camera.js';
import { debugConfig, logCursorPosition } from './helper/debug.js';
import Assets from './helper/assets.js';
import Drawer from './helper/drawer.js';
import { Obstacle, defaultObstacles } from './world/obstacle.js';

let player;
let camera;
let obstacles = [];
let lastTimestamp = 0;

async function loadBackground() {
    const background = await Drawer.loadImage(() => Assets.getBackground());
    return new Promise((resolve, reject) => {
        if (background && background.images && background.images[0]) {
            const img = background.images[0];
            const aspectRatio = img.width / img.height;
            const scaledWidth = canvas.height * aspectRatio;
            
            camera.setWorldSize(scaledWidth, canvas.height);
            resolve({ width: scaledWidth, height: canvas.height, background });
        } else {
            reject(new Error('Failed to load background'));
        }
    });
}

function initializeObstacles() {
    obstacles = [...defaultObstacles];  
}

async function startAnimation() {
    player = new Player(100, 300);
    camera = new Camera(player);
    initializeObstacles();
    const bgData = await loadBackground();
    gameState.background = bgData.background;
    canvas.addEventListener('mousemove', logCursorPosition);
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    camera.follow();
    const viewport = camera.getViewport();

    ctx.save();
    ctx.translate(-viewport.x, -viewport.y);

    if (gameState.background) {
        const img = gameState.background.images[0];
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

    player.update(); 
    player.draw();

    obstacles.forEach(obstacle => obstacle.draw(ctx));

    ctx.restore();

    requestAnimationFrame(gameLoop);
}

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