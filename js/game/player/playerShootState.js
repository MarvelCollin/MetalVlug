class PlayerShootState {
    constructor() {
        this.shootImages = [];
    }

    loadFrames(path, frameCount, callback) {
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.onload = () => {
                this.shootImages.push(img);
                if (this.shootImages.length === frameCount) callback();
            };
            img.src = `${path}${i}.png`;
        }
    }
}

export default PlayerShootState;