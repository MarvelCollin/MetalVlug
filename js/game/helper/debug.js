import Drawer from "./drawer.js";

const debugConfig = {
    enabled: true,
    cursor: false,
    actionPlayer: false,
    collisionDetail: false,
    enemyDetail: true,
    playerStat: false,
    showShadow: false,
    showEnemyType: true,    
    showSpriteInfo: true, 
    rocketGunner: true  
};

function drawDebugBorder(ctx, x, y, width, height) {
    if (debugConfig.enabled) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    }
}

function logCursorPosition(event) {
    if (debugConfig.cursor) {
        const rect = event.target.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        console.log(`Cursor Position: x=${x}, y=${y}`);
    }
}

export { debugConfig, drawDebugBorder, logCursorPosition };
 