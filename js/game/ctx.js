export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');

const GAME_WIDTH = 700;
const GAME_HEIGHT = 365;

function resizeCanvas() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    let scale = Math.min(
        (windowWidth) / GAME_WIDTH,
        (windowHeight) / GAME_HEIGHT
    );
    
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    
    const displayWidth = Math.round(GAME_WIDTH * scale);
    const displayHeight = Math.round(GAME_HEIGHT * scale);
    
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);

    return { scaleX: 1, scaleY: 1 };
}

const { scaleX, scaleY } = resizeCanvas();
window.addEventListener('resize', resizeCanvas);

export { scaleX, scaleY, GAME_WIDTH, GAME_HEIGHT };
