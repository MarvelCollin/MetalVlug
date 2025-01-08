import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from './world/camera.js';

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let scale = Math.min(
        windowWidth / VIEWPORT_WIDTH,
        windowHeight / VIEWPORT_HEIGHT
    );
    
    canvas.width = VIEWPORT_WIDTH;
    canvas.height = VIEWPORT_HEIGHT;
    
    const displayWidth = Math.round(VIEWPORT_WIDTH * scale);
    const displayHeight = Math.round(VIEWPORT_HEIGHT * scale);
    
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    canvas.style.position = 'absolute';
    canvas.style.left = `${(windowWidth - displayWidth) / 2}px`;
    canvas.style.top = `${(windowHeight - displayHeight) / 2}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;

    return { scaleX: 1, scaleY: 1 };
}

const { scaleX, scaleY } = resizeCanvas();
window.addEventListener('resize', resizeCanvas);

export { scaleX, scaleY };
