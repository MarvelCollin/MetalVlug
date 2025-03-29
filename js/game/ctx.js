import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from './world/camera.js';
import { GAME_WIDTH, GAME_HEIGHT } from './config.js';

export let canvas;
export let ctx;

function initializeCanvas() {
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    ctx = canvas.getContext('2d');
    resizeCanvas();
}

function resizeCanvas() {
    if (!canvas) return;
    
    const scale = Math.min(
        window.innerWidth / GAME_WIDTH,
        window.innerHeight / GAME_HEIGHT
    );

    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
    const displayWidth = Math.floor(GAME_WIDTH * scale);
    const displayHeight = Math.floor(GAME_HEIGHT * scale);
    
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    canvas.style.position = 'absolute';
    canvas.style.left = `${(window.innerWidth - displayWidth) / 2}px`;
    canvas.style.top = `${(window.innerHeight - displayHeight) / 2}px`;

    if (ctx) {
        ctx.imageSmoothingEnabled = false;
    }
}

document.addEventListener('DOMContentLoaded', initializeCanvas);
window.addEventListener('resize', resizeCanvas);

window.addEventListener('keydown', function(event) {
    if (event.ctrlKey || event.metaKey) {
        if (['+', '-', '=', '_'].includes(event.key) || event.wheelDelta) {
            event.preventDefault();
        }
    }
});

window.addEventListener('wheel', function(event) {
    if (event.ctrlKey || event.metaKey) {
        event.preventDefault();
    }
}, { passive: false });
