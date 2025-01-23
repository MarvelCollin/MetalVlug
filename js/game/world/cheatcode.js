export class CheatHandler {
    constructor(achievementSystem) {
        this.achievementSystem = achievementSystem;
        this.secretCode = '';
        this.setupCheatListener();
    }

    setupCheatListener() {
        let resetTimer;
        const RESET_DELAY = 2000;

        document.addEventListener('keydown', (e) => {
            clearTimeout(resetTimer);
            this.secretCode += e.key.toLowerCase();

            resetTimer = setTimeout(() => {
                this.secretCode = '';
            }, RESET_DELAY);

            if (this.checkCheat('blackout')) {
                console.log('blackout cheat');
                this.incrementCheatAchievements();
            }
            if (this.checkCheat('welovetiti')) {
                console.log('skipskip cheat');
                this.incrementCheatAchievements();
            }
            if (this.checkCheat('kepinkepankepon')) {
                console.log('rataampas cheat');
                this.incrementCheatAchievements();
            }
            if (this.checkCheat('omjerman')) {
                console.log('ninja cheat');
                this.incrementCheatAchievements();
            }
            if (this.checkCheat('smartwatch')) {
                console.log('ninja cheat');
                this.incrementCheatAchievements();
            }
            if (this.checkCheat("bebetganteng")) {
              console.log("ninja cheat");
              this.incrementCheatAchievements();
            }
            if (this.checkCheat("auysianslwjnska")) {
              console.log("ninja cheat");
              this.incrementCheatAchievements();
            }
        });
    }

    checkCheat(code) {
        const found = this.secretCode.includes(code);
        if (found) {
            this.secretCode = '';
        }
        return found;
    }

    incrementCheatAchievements() {
        if (!this.achievementSystem) return;
        const c1Progress = this.achievementSystem.achievements['cheat_1'].progress;
        const c3Progress = this.achievementSystem.achievements['cheat_3'].progress;
        this.achievementSystem.updateProgress('cheat_1', c1Progress + 1);
        this.achievementSystem.updateProgress('cheat_3', c3Progress + 1);
    }
}
