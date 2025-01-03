import { ctx, canvas, scaleX, scaleY } from './ctx.js'; 
import Player from './player/player.js';
import Camera from './camera/camera.js';
import { debugConfig } from './helper/debug.js';
import Assets from './helper/assets.js';
import Drawer from './helper/drawer.js';
import { Obstacle, defaultObstacles } from './world/obstacle.js';

let player;
let camera;
let obstacles = [];
const activeKeys = new Set();
let lastTimestamp = 0;

async function loadBackground() {
    const background = await Drawer.loadImage(() => Assets.getBackground());
    return new Promise((resolve, reject) => {
        if (background && background.images && background.images[0]) {
            const img = background.images[0];
            const aspectRatio = img.width / img.height;
            const scaledWidth = canvas.height * aspectRatio;
            
            camera.setWorldSize(scaledWidth, canvas.height);
            const groundY = canvas.height - 50;
            player.y = groundY;
            player.initialY = groundY;
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
        
        Drawer.drawToCanvas(
            img,
            0,
            canvas.height,
            'background',
            0,
            scaledWidth,
            canvas.height,
            false,
            'ONCE'
        );
    }

    ctx.scale(scaleX, scaleY);

    player.update(deltaTime); // Pass deltaTime
    player.draw();

    obstacles.forEach(obstacle => obstacle.draw(ctx));

    ctx.restore();

    requestAnimationFrame(gameLoop);
}

function handleKeyDown(event) {
    if (event.repeat) return;
    activeKeys.add(event.key);
    updatePlayerFromKeys();
}

function handleKeyUp(event) {
    activeKeys.delete(event.key);
    updatePlayerFromKeys();
}

function updatePlayerFromKeys() {
    if (activeKeys.has('a') || activeKeys.has('d')) {
        const direction = activeKeys.has('a') ? 'runLeft' : 'runRight';
        player.handleInput(direction);
    } else {
        player.handleInput('idle');
    }

    if (activeKeys.has(' ')) {
        player.handleInput('jump');
    }

    if (activeKeys.has('Control')) {
        player.handleInput('shoot');
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