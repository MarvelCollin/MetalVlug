class Assets {
    static instance = null;
    static assets = null;

    static async fetchAssets() {
        if (this.assets) {
            return this.assets;
        }
        const response = await fetch('../assets/assets.json');
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        this.assets = await response.json();
        return this.assets;
    }

    static async getPlayerMarcoIdle() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.IDLE;
    }

    static async getPlayerMarcoRun() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.RUN;
    }

    static async getPlayerMarcoShoot() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.SHOOT;
    }

    static async getPlayerMarcoSpawn() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.SPAWN;
    }

    static async getBackground() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.BACKGROUND;
    }
}

// Example usage:
Assets.getPlayerMarcoIdle().then(idle => {
    console.log(idle);
    // You can now use the idle object to access the idle path and frames
}).catch(error => {
    console.error('There was a problem with the fetch operation:', error);
});

// ...existing code...

export default Assets;
