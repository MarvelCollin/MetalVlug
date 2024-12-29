class PlayerIdleState {
    constructor() {
        this.idleImages = [];
    }

    loadFrames(path, frameCount, callback) {
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.onload = () => {
                this.idleImages.push(img);
                if (this.idleImages.length === frameCount) callback();
            };
            img.src = `${path}${i}.png`;
        }
    }
}

export default PlayerIdleState;