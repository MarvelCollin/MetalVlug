class PlayerSpawnState {
    constructor() {
        this.spawnImages = [];
    }

    loadFrames(path, frameCount, callback) {
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.onload = () => {
                this.spawnImages.push(img);
                if (this.spawnImages.length === frameCount) callback();
            };
            img.src = `${path}${i}.png`;
        }
    }
}

export default PlayerSpawnState;