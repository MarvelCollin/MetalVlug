import { ctx, canvas, scaleX, scaleY } from './ctx.js'; 
import Player from './player/player.js';
import Camera from './camera/camera.js';
import { debugConfig } from './helper/debug.js';
import Assets from './assets.js';
import Drawer from './helper/drawer.js';
import { Obstacle, defaultObstacles } from './world/obstacle.js';

let player;
let camera;
let obstacles = [];
const activeKeys = new Set();  // Add this to track active keys

async function loadBackground() {
    const background = await Drawer.loadImage(() => Assets.getBackground());
    return new Promise((resolve, reject) => {
        if (background && background.images && background.images[0]) {
            const img = background.images[0];
            // Calculate scaled width to maintain aspect ratio
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

function gameLoop() {
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
            scaledWidth,  // Use scaled width
            canvas.height,
            false,
            'ONCE'
        );
    }

    ctx.scale(scaleX, scaleY);

    player.update();
    player.draw();

    // Draw obstacles
    obstacles.forEach(obstacle => obstacle.draw(ctx));

    ctx.restore();

    requestAnimationFrame(gameLoop);
 
}

function handleKeyDown(event) {
    activeKeys.add(event.key);
    
    // Handle all active keys
    if (activeKeys.has('a')) {
        player.handleInput('runLeft');
    }
    if (activeKeys.has('d')) {
        player.handleInput('runRight');
    }
    if (activeKeys.has('Control')) {
        player.handleInput('shoot');
    }
    if (activeKeys.has(' ')) {
        player.handleInput('jump');
    }
}

function handleKeyUp(event) {
    activeKeys.delete(event.key);
    
    // Only set to idle if no movement keys are pressed
    if (!activeKeys.has('a') && !activeKeys.has('d')) {
        player.handleInput('idle');
    } else if (activeKeys.has('a')) {
        player.handleInput('runLeft');
    } else if (activeKeys.has('d')) {
        player.handleInput('runRight');
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