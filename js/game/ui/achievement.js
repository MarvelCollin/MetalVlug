import { ACHIEVEMENTS, AchievementSystem } from '../world/achievement.js';

export class UIAchievementSystem extends AchievementSystem {
    constructor(game) {
        // Initialize the achievement system with proper error handling
        super();
        this.game = game;
        this.setupCloseButton();
    }
    
    setupModal() {
        this.modal = document.getElementById('achievementsModal');
        
        if (!this.modal) {
            console.error('Achievement modal not found in DOM');
            return;
        }
        
        const list = this.modal.querySelector('.achievements-list');
        if (!list) {
            console.error('Achievement list not found in modal');
            return;
        }
        
        Object.values(ACHIEVEMENTS).forEach(achievement => {
            const card = this.createAchievementCard(achievement);
            list.appendChild(card);
        });

        this.updateUI();
    }
    
    setupCloseButton() {
        const closeButton = document.getElementById('closeAchievementsButton');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hideModal();
                this.game.resume();
            });
        }
    }
    
    // Override the showModal method to also pause the game
    showModal() {
        if (!this.modal) {
            this.modal = document.getElementById('achievementsModal');
            if (!this.modal) {
                console.error('Achievement modal still not found in DOM');
                return;
            }
        }
        
        this.game.pause();
        this.modal.style.display = 'flex';
        this.updateUI();
        requestAnimationFrame(() => {
            this.modal.classList.add('show');
        });
    }
}
