import Player from './player/player.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const player = new Player(ctx, canvas);

fetch('../../assets/assets.json')
    .then(response => response.json())
    .then(assets => {
        player.loadAssets(assets, startAnimation);
    });

function startAnimation() {
    requestAnimationFrame(gameLoop);
}

function gameLoop() {
    player.update();
    player.draw();

    requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => player.handleKeyDown(event));
window.addEventListener('keyup', (event) => player.handleKeyUp(event));