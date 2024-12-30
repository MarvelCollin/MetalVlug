const debugConfig = {
    enabled: true
};

function drawDebugBorder(ctx, x, y, width, height) {
    if (debugConfig.enabled) {
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, width, height);
    }
}

export { debugConfig, drawDebugBorder };
