class Assets {
    static instance = null;
    static assets = null;

    constructor() {
        if (Assets.instance) {
            return Assets.instance;
        }
        Assets.instance = this;
    }

    async fetchAssets() {
        if (Assets.assets) {
            return Assets.assets;
        }
        const response = await fetch('../assets/assets.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        Assets.assets = await response.json();
        return Assets.assets;
    }

    async getPlayerMarcoIdle() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.IDLE;
    }

    async getPlayerMarcoRun() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.RUN;
    }

    async getPlayerMarcoShoot() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.SHOOT;
    }

    async getPlayerMarcoSpawn() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.SPAWN;
    }

    async getBackground() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.BACKGROUND;
    }

    async getBullet() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.BULLET;
    }


}

const assetsInstance = new Assets();
export default assetsInstance;
