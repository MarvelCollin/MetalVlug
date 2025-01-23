import { ACHIEVEMENTS } from './achievement.js';

export class AdminPanel {
    constructor(achievementSystem) {
        this.achievementSystem = achievementSystem;
        this.secretCode = '';
        this.setupSecretCode();
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

            if (this.secretCode.includes('kolin')) {
                this.showAdminModal();
                this.secretCode = '';
                clearTimeout(resetTimer);
            }
        });
    }

    createAdminModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay admin-modal';
        modal.id = 'adminModal';
        
        modal.innerHTML = `
            <div class="admin-panel">
                <div class="modal-title">Admin Panel</div>
                <div class="admin-buttons">
                    <button class="admin-btn reset-achievements">Reset All Achievements</button>
                    <button class="admin-btn unlock-all">Unlock All Achievements</button>
                    <button class="admin-btn close-admin">Close Panel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupAdminListeners(modal);
    }

    setupAdminListeners(modal) {
        const resetBtn = modal.querySelector('.reset-achievements');
        const unlockAllBtn = modal.querySelector('.unlock-all');
        const closeBtn = modal.querySelector('.close-admin');

        resetBtn.onclick = () => {
            
            localStorage.removeItem('achievements');
            
            
            const oldAchievements = this.achievementSystem.achievements;
            this.achievementSystem.achievements = this.achievementSystem.loadAchievements();
            
            
            Object.keys(this.achievementSystem.achievements).forEach(id => {
                if (oldAchievements[id]?.rewardClaimed) {
                    this.achievementSystem.achievements[id].rewardClaimed = oldAchievements[id].rewardClaimed;
                }
            });
            
            this.achievementSystem.saveAchievements();
            this.achievementSystem.updateUI();
            this.showNotification('Achievements Reset');
        };

        unlockAllBtn.onclick = () => {
            const currentAchievements = this.achievementSystem.achievements;
            
            Object.values(ACHIEVEMENTS).forEach(achievement => {
                
                const rewardClaimed = currentAchievements[achievement.id]?.rewardClaimed || false;
                this.achievementSystem.achievements[achievement.id] = {
                    progress: achievement.target,
                    completed: true,
                    rewardClaimed: rewardClaimed 
                };
            });
            
            this.achievementSystem.saveAchievements();
            this.achievementSystem.updateUI();
            this.showNotification('All Achievements Unlocked!');
        };

        closeBtn.onclick = () => this.hideAdminModal();
        modal.onclick = (e) => {
            if (e.target === modal) this.hideAdminModal();
        };
    }

    showAdminModal() {
        const existingModal = document.getElementById('adminModal');
        if (!existingModal) {
            this.createAdminModal();
        }
        const modal = document.getElementById('adminModal');
        modal.style.display = 'flex';
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }

    hideAdminModal() {
        const modal = document.getElementById('adminModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'admin-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }, 100);
    }
}
