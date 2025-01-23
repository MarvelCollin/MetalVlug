export const ACHIEVEMENTS = {
    MISSION_COMPLETE: {
        id: 'mission_complete',
        name: 'Mission Accomplished',
        description: 'Complete your first mission',
        symbol: '🎯',
        target: 1,
        reward: 1000
    },
    ENEMY_KILLS: {
        id: 'enemy_kills',
        name: 'Enemy Terminator',
        description: 'Defeat 100 enemies',
        symbol: '💀',
        target: 100,
        reward: 500
    },
    RUMI_BUYS_5: {
        id: 'rumi_buys_5',
        name: 'Loyal Customer I',
        description: 'Buy from Rumi 5 times',
        symbol: '🛍️',
        target: 5,
        reward: 50
    },
    RUMI_BUYS_10: {
        id: 'rumi_buys_10',
        name: 'Loyal Customer II',
        description: 'Buy from Rumi 10 times',
        symbol: '🛍️',
        target: 10,
        reward: 100
    },
    RUMI_BUYS_20: {
        id: 'rumi_buys_20',
        name: 'Loyal Customer III',
        description: 'Buy from Rumi 20 times',
        symbol: '🛍️',
        target: 20,
        reward: 200
    },
    RUMI_BUYS_50: {
        id: 'rumi_buys_50',
        name: 'Loyal Customer IV',
        description: 'Buy from Rumi 50 times',
        symbol: '🛍️',
        target: 50,
        reward: 500
    },
    RUMI_BUYS_100: {
        id: 'rumi_buys_100',
        name: 'Loyal Customer V',
        description: 'Buy from Rumi 100 times',
        symbol: '🛍️',
        target: 100,
        reward: 1000
    },
    CHEAT_1: {
        id: 'cheat_1',
        name: 'Just One Cheat',
        description: 'Use a cheat code once',
        symbol: '🕵️',
        target: 1,
        reward: 100
    },
    CHEAT_3: {
        id: 'cheat_3',
        name: 'Cheat Master',
        description: 'Use a cheat code 3 times',
        symbol: '🕵️',
        target: 3,
        reward: 300
    },
    MISSION_EASY: {
        id: 'mission_easy',
        name: 'Easy Mission',
        description: 'Complete an easy mission',
        symbol: '🎯',
        target: 1,
        reward: 100
    },
    MISSION_NORMAL: {
        id: 'mission_normal',
        name: 'Normal Mission',
        description: 'Complete a normal mission',
        symbol: '🎯',
        target: 1,
        reward: 200
    },
    MISSION_HARD: {
        id: 'mission_hard',
        name: 'Hard Mission',
        description: 'Complete a hard mission',
        symbol: '🎯',
        target: 1,
        reward: 300
    },
    MISSION_ASIAN: {
        id: 'mission_asian',
        name: 'Asian Mission',
        description: 'Complete an Asian mission',
        symbol: '🎯',
        target: 1,
        reward: 500
    },
    ARCADE_5: {
        id: 'arcade_5',
        name: 'Arcade Novice',
        description: 'Complete 5 arcade waves',
        symbol: '👾',
        target: 5,
        reward: 50
    },
    ARCADE_10: {
        id: 'arcade_10',
        name: 'Arcade Player',
        description: 'Complete 10 arcade waves',
        symbol: '👾',
        target: 10,
        reward: 100
    },
    ARCADE_20: {
        id: 'arcade_20',
        name: 'Arcade Enthusiast',
        description: 'Complete 20 arcade waves',
        symbol: '👾',
        target: 20,
        reward: 200
    },
    ARCADE_50: {
        id: 'arcade_50',
        name: 'Arcade Master',
        description: 'Complete 50 arcade waves',
        symbol: '👾',
        target: 50,
        reward: 500
    },
    ARCADE_100: {
        id: 'arcade_100',
        name: 'Arcade Legend',
        description: 'Complete 100 arcade waves',
        symbol: '👾',
        target: 100,
        reward: 1000
    },
    COINS_10K: {
        id: 'coins_10k',
        name: 'Coin Collector I',
        description: 'Collect 10,000 coins',
        symbol: '💰',
        target: 10000,
        reward: 100
    },
    COINS_50K: {
        id: 'coins_50k',
        name: 'Coin Collector II',
        description: 'Collect 50,000 coins',
        symbol: '💰',
        target: 50000,
        reward: 500
    },
    COINS_100K: {
        id: 'coins_100k',
        name: 'Coin Collector III',
        description: 'Collect 100,000 coins',
        symbol: '💰',
        target: 100000,
        reward: 1000
    },
    KILL_10: {
        id: 'kill_10',
        name: 'Novice Slayer',
        description: 'Defeat 10 enemies',
        symbol: '💀',
        target: 10,
        reward: 50
    },
    KILL_50: {
        id: 'kill_50',
        name: 'Skilled Slayer',
        description: 'Defeat 50 enemies',
        symbol: '💀',
        target: 50,
        reward: 250
    },
    KILL_100: {
        id: 'kill_100',
        name: 'Expert Slayer',
        description: 'Defeat 100 enemies',
        symbol: '💀',
        target: 100,
        reward: 500
    },
    KILL_200: {
        id: 'kill_200',
        name: 'Master Slayer',
        description: 'Defeat 200 enemies',
        symbol: '💀',
        target: 200,
        reward: 1000
    },
    KILL_500: {
        id: 'kill_500',
        name: 'Legendary Slayer',
        description: 'Defeat 500 enemies',
        symbol: '💀',
        target: 500,
        reward: 2500
    }
};

export class AchievementSystem {
    constructor() {
        this.achievements = this.loadAchievements();
        this.modal = document.getElementById('achievementsModal');
        this.secretCode = '';
        this.setupModal();
        this.setupSecretCode();
        this.notificationQueue = [];
        this.isShowingNotification = false;
        this.onAchievementUnlocked = null; 
        this.setupTestAchievement(); 
    }

    loadAchievements() {
        const saved = localStorage.getItem('achievements');
        if (saved) {
            return JSON.parse(saved);
        }

        const defaults = {};
        Object.keys(ACHIEVEMENTS).forEach(key => {
            defaults[ACHIEVEMENTS[key].id] = {
                progress: 0,
                completed: false
            };
        });
        return defaults;
    }

    saveAchievements() {
        localStorage.setItem('achievements', JSON.stringify(this.achievements));
    }

    updateProgress(achievementId, progress) {
        const achievement = this.achievements[achievementId];
        const achievementData = Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);
        
        if (!achievement || !achievementData) return;

        const wasNotCompleted = !achievement.completed;
        achievement.progress = Math.min(progress, achievementData.target);
        achievement.completed = achievement.progress >= achievementData.target;
        
        this.saveAchievements();
        this.updateUI();
        
        
        if (wasNotCompleted && achievement.completed) {
            
            if (this.onAchievementUnlocked) {
                this.onAchievementUnlocked(achievementData);
            }
            
            if (!achievement.rewardClaimed) {
                this.claimReward(achievementId);
            }
        }
    }

    setupModal() {
        const list = this.modal.querySelector('.achievements-list');
        
        Object.values(ACHIEVEMENTS).forEach(achievement => {
            const card = this.createAchievementCard(achievement);
            list.appendChild(card);
        });

        this.updateUI();
    }

    createAchievementCard(achievement) {
        const card = document.createElement('div');
        card.className = 'achievement-card';
        card.dataset.id = achievement.id;
        
        card.innerHTML = `
            <div class="achievement-icon">
                <span class="achievement-symbol">${achievement.symbol}</span>
            </div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
                <div class="achievement-progress">
                    <div class="achievement-progress-bar"></div>
                </div>
                <div class="achievement-status">
                    Progress: <span class="progress-text">0</span>/${achievement.target}
                </div>
                <button class="claim-reward-btn">
                    Claim ${achievement.reward} Coins
                </button>
            </div>
        `;

        
        const claimBtn = card.querySelector('.claim-reward-btn');
        claimBtn.style.display = 'none'; 
        claimBtn.onclick = () => this.claimReward(achievement.id);

        
        const savedAchievement = this.achievements[achievement.id];
        if (savedAchievement?.completed && !savedAchievement?.rewardClaimed) {
            claimBtn.style.display = 'block';
        }

        return card;
    }

    updateUI() {
        if (!this.modal) return;

        const cards = this.modal.querySelectorAll('.achievement-card');
        cards.forEach(card => {
            const id = card.dataset.id;
            const achievement = this.achievements[id];
            const achievementData = Object.values(ACHIEVEMENTS).find(a => a.id === id);

            if (!achievement || !achievementData) return;

            const progressBar = card.querySelector('.achievement-progress-bar');
            const progressText = card.querySelector('.progress-text');
            const claimBtn = card.querySelector('.claim-reward-btn');
            
            const progress = (achievement.progress / achievementData.target) * 100;

            progressBar.style.width = `${progress}%`;
            progressText.textContent = achievement.progress;

            card.classList.toggle('completed', achievement.completed);
            card.classList.toggle('locked', !achievement.completed);

            
            if (achievement.completed && !achievement.rewardClaimed) {
                claimBtn.style.display = 'block';
            } else {
                claimBtn.style.display = 'none';
            }
        });
    }

    showModal() {
        this.modal.style.display = 'flex';
        this.updateUI();
        requestAnimationFrame(() => {
            this.modal.classList.add('show');
        });
    }

    hideModal() {
        this.modal.classList.remove('show');
        setTimeout(() => {
            this.modal.style.display = 'none';
        }, 300);
    }

    claimReward(achievementId) {
        const achievement = this.achievements[achievementId];
        const achievementData = Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);
        
        if (!achievement || !achievementData || achievement.rewardClaimed) return;
        
        const currentBalance = parseInt(document.querySelector('.player-balance span:last-child').textContent);
        const newBalance = currentBalance + achievementData.reward;
        document.querySelector('.player-balance span:last-child').textContent = newBalance;
        
        achievement.rewardClaimed = true;
        this.saveAchievements();

        
        const claimNotice = document.createElement('div');
        claimNotice.className = 'achievement-claim-notice';
        claimNotice.textContent = 'Reward Claimed!';
        document.body.appendChild(claimNotice);

        
        requestAnimationFrame(() => {
            claimNotice.classList.add('show');
            setTimeout(() => {
                claimNotice.classList.remove('show');
                setTimeout(() => claimNotice.remove(), 300);
            }, 2000);
        });
    }

    setupSecretCode() {
        let resetTimer;
        const RESET_DELAY = 2000; 

        document.addEventListener('keydown', (e) => {
            clearTimeout(resetTimer);
            
            this.secretCode += e.key.toLowerCase();
            
            resetTimer = setTimeout(() => {
                this.secretCode = '';
            }, RESET_DELAY);

            if (this.secretCode.includes('kelarinbpwoi')) {
                this.updateProgress('secret_code', 1);
                
                const flash = document.createElement('div');
                flash.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: white;
                    z-index: 9999;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.3s;
                `;
                document.body.appendChild(flash);
                
                requestAnimationFrame(() => {
                    flash.style.opacity = '0.5';
                    setTimeout(() => {
                        flash.style.opacity = '0';
                        setTimeout(() => flash.remove(), 300);
                    }, 100);
                });

                
                this.secretCode = '';
                clearTimeout(resetTimer);
            }
        });
    }

    showNotification(achievement) {
        this.notificationQueue.push(achievement);
        if (!this.isShowingNotification) {
            this.processNotificationQueue();
        }
    }

    processNotificationQueue() {
        if (this.notificationQueue.length === 0) {
            this.isShowingNotification = false;
            return;
        }

        this.isShowingNotification = true;
        const achievement = this.notificationQueue.shift();
        
        const notification = document.createElement('div');
        notification.className = `achievement-notification ${achievement.id === 'secret_code' ? 'secret' : ''}`;
        notification.innerHTML = `
            <div class="notification-icon">${achievement.symbol}</div>
            <div class="notification-content">
                <div class="notification-title">Achievement Unlocked!</div>
                <div class="notification-message">${achievement.name}</div>
            </div>
        `;

        document.body.appendChild(notification);
        
        
        setTimeout(() => notification.classList.add('show'), 100);

        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
                this.processNotificationQueue();
            }, 600);
        }, 3000);
    }

    
    setupTestAchievement() {
        
        setTimeout(() => {
            this.updateProgress('mission_complete', 1);
        }, 2000);
    }
}
