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
            throw new Error('Waduh error nih: ' + response.statusText);
        }
        Assets.assets = await response.json();
        return Assets.assets;
    }

    async getBackground() {
        const assets = await this.fetchAssets();
        return assets.BACKGROUND;
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

    async getPlayerOtherBullet() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.OTHER.BULLET;
    }

    async getPlayerOtherGrenade() {
        const assets = await this.fetchAssets();
        return assets.PLAYER.OTHER.GRENADE;
    }

    async getSoldierNormalDie() {
        const assets = await this.fetchAssets();
        return assets.SOLDIER.NORMAL.DIE;
    }

    async getSoldierNormalExplode() {
        const assets = await this.fetchAssets();
        return assets.SOLDIER.NORMAL.EXPLODE;
    }

    async getSoldierNormalGrenade() {
        const assets = await this.fetchAssets();
        return assets.SOLDIER.NORMAL.GRENADE;
    }

    async getSoldierNormalIdle() {
        const assets = await this.fetchAssets();
        return assets.SOLDIER.NORMAL.IDLE;
    }

    async getSoldierNormalMeleeMelee() {
        const assets = await this.fetchAssets();
        return assets.SOLDIER.NORMAL.MELEE.MELEE;
    }

    async getSoldierNormalRun() {
        const assets = await this.fetchAssets();
        return assets.SOLDIER.NORMAL.RUN;
    }

    async getSoldierNormalThrow() {
        const assets = await this.fetchAssets();
        return assets.SOLDIER.NORMAL.THROW;
    }

}

const assetsInstance = new Assets();
export default assetsInstance;
