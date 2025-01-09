
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
            try {
                const assets = await this.fetchAssets();
                return assets.BACKGROUND;
            } catch (error) {
                console.error('Error in getBackground:', error);
                return null;
            }
        }

        async getPlayerMarcoExplode() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.EXPLODE;
            } catch (error) {
                console.error('Error in getPlayerMarcoExplode:', error);
                return null;
            }
        }

        async getPlayerMarcoMachinegunWin() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.MACHINEGUN.WIN;
            } catch (error) {
                console.error('Error in getPlayerMarcoMachinegunWin:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolDashIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.DASH.IDLE;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolDashIdle:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolDashShoot() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.DASH.SHOOT;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolDashShoot:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolJumpIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.JUMP.IDLE;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolJumpIdle:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolJumpShoot() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.JUMP.SHOOT;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolJumpShoot:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolMoveShoot() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.MOVE.SHOOT;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolMoveShoot:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolSneakIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.SNEAK.IDLE;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolSneakIdle:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolSneakMelee() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.SNEAK.MELEE;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolSneakMelee:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolSneakMove() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.SNEAK.MOVE;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolSneakMove:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolSneakShoot() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.SNEAK.SHOOT;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolSneakShoot:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolSneakThrow() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.SNEAK.THROW;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolSneakThrow:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolSpawn() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.SPAWN;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolSpawn:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolStandIdleNormal() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.STAND.IDLE.NORMAL;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolStandIdleNormal:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolStandIdleSleep() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.STAND.IDLE.SLEEP;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolStandIdleSleep:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolStandMelee() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.STAND.MELEE;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolStandMelee:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolStandRun() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.STAND.RUN;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolStandRun:', error);
                return null;
            }
        }

        async getPlayerMarcoPistolStandShoot() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.MARCO.PISTOL.STAND.SHOOT;
            } catch (error) {
                console.error('Error in getPlayerMarcoPistolStandShoot:', error);
                return null;
            }
        }

        async getPlayerOtherBullet() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.OTHER.BULLET;
            } catch (error) {
                console.error('Error in getPlayerOtherBullet:', error);
                return null;
            }
        }

        async getPlayerOtherGrenade() {
            try {
                const assets = await this.fetchAssets();
                return assets.PLAYER.OTHER.GRENADE;
            } catch (error) {
                console.error('Error in getPlayerOtherGrenade:', error);
                return null;
            }
        }

        async getSoldierNormalDie() {
            try {
                const assets = await this.fetchAssets();
                return assets.SOLDIER.NORMAL.DIE;
            } catch (error) {
                console.error('Error in getSoldierNormalDie:', error);
                return null;
            }
        }

        async getSoldierNormalExplode() {
            try {
                const assets = await this.fetchAssets();
                return assets.SOLDIER.NORMAL.EXPLODE;
            } catch (error) {
                console.error('Error in getSoldierNormalExplode:', error);
                return null;
            }
        }

        async getSoldierNormalGrenade() {
            try {
                const assets = await this.fetchAssets();
                return assets.SOLDIER.NORMAL.GRENADE;
            } catch (error) {
                console.error('Error in getSoldierNormalGrenade:', error);
                return null;
            }
        }

        async getSoldierNormalIdle() {
            try {
                const assets = await this.fetchAssets();
                return assets.SOLDIER.NORMAL.IDLE;
            } catch (error) {
                console.error('Error in getSoldierNormalIdle:', error);
                return null;
            }
        }

        async getSoldierNormalMeleeMelee() {
            try {
                const assets = await this.fetchAssets();
                return assets.SOLDIER.NORMAL.MELEE.MELEE;
            } catch (error) {
                console.error('Error in getSoldierNormalMeleeMelee:', error);
                return null;
            }
        }

        async getSoldierNormalRun() {
            try {
                const assets = await this.fetchAssets();
                return assets.SOLDIER.NORMAL.RUN;
            } catch (error) {
                console.error('Error in getSoldierNormalRun:', error);
                return null;
            }
        }

        async getSoldierNormalThrow() {
            try {
                const assets = await this.fetchAssets();
                return assets.SOLDIER.NORMAL.THROW;
            } catch (error) {
                console.error('Error in getSoldierNormalThrow:', error);
                return null;
            }
        }

}

const assetsInstance = new Assets();
export default assetsInstance;
