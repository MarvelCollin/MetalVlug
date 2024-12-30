import { ctx, canvas } from './ctx.js'; 
import Player from './player/player.js';
import { debugConfig } from './helper/debug.js';

const backgroundImage = new Image();
let player;

async function startAnimation() {
    player = new Player(100, canvas.height - 100);
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    player.update();
    player.draw();

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