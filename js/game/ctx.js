import { idleImages } from './game.js';

// ...existing code...
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let x = 100; // Example x position
let y = 100; // Example y position

let currentFrame = 0;
const frameDelay = 200; // Delay in milliseconds

function drawIdle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(idleImages[currentFrame], x, y);
    currentFrame = (currentFrame + 1) % idleImages.length;
    setTimeout(() => {
        requestAnimationFrame(drawIdle);
    }, frameDelay);
}

drawIdle();

// ...existing code...
