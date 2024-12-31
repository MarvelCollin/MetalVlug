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
            throw new Error('bang gabisa bang ga konek bang bang bang capek bang bang bang capek' + response.statusText);
        }
        Assets.assets = await response.json();
        return Assets.assets;
    }

    async getPlayerMarcoExplode() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.EXPLODE;
    }

    async getPlayerMarcoMachinegunWin() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.MACHINEGUN.WIN;
    }

    async getPlayerMarcoPistolDashIdle() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.PISTOL.DASH.IDLE;
    }

    async getPlayerMarcoPistolDashShoot() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.PISTOL.DASH.SHOOT;
    }

    async getPlayerMarcoPistolJumpIdle() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.PISTOL.JUMP.IDLE;
    }

    async getPlayerMarcoPistolJumpShoot() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.PISTOL.JUMP.SHOOT;
    }

    async getPlayerMarcoPistolSneakIdle() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.PISTOL.SNEAK.IDLE;
    }

    async getPlayerMarcoPistolSneakMelee() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.PISTOL.SNEAK.MELEE;
    }

    async getPlayerMarcoPistolSneakMove() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.PISTOL.SNEAK.MOVE;
    }

    async getPlayerMarcoPistolSneakShoot() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.PISTOL.SNEAK.SHOOT;
    }

    async getPlayerMarcoPistolSneakThrow() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.PISTOL.SNEAK.THROW;
    }

    async getPlayerMarcoPistolSpawn() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.PISTOL.SPAWN;
    }

    async getPlayerMarcoPistolStandIdleNormal() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.PISTOL.STAND.IDLE.NORMAL;
    }

    async getPlayerMarcoPistolStandIdleSleep() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.PISTOL.STAND.IDLE.SLEEP;
    }

    async getPlayerMarcoPistolStandMelee() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.PISTOL.STAND.MELEE;
    }

    async getPlayerMarcoPistolStandRun() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.PISTOL.STAND.RUN;
    }

    async getPlayerMarcoPistolStandShoot() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.MARCO.PISTOL.STAND.SHOOT;
    }

    async getPlayerOther() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.OTHER;
    }

}

const assetsInstance = new Assets();
export default assetsInstance;
