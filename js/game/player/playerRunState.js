class PlayerRunState {
    constructor() {
        this.runImages = [];
    }

    loadFrames(path, frameCount, callback) {
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.onload = () => {
                this.runImages.push(img);
                if (this.runImages.length === frameCount) callback();
            };
            img.src = `${path}${i}.png`;
        }
    }
}

export default PlayerRunState;