import { ctx, canvas } from "../ctx.js";
import Assets from "../helper/assets.js";
import Drawer from "../helper/drawer.js";
import { Inventory } from '../ui/inventory.js';
import { INVENTORY_ITEMS } from '../ui/items.js';
import { AchievementSystem } from './achievement.js';  // Add this import
import { AdminPanel } from './admin.js';
import { CheatHandler } from './cheatcode.js';

export const UI_IMAGES = {
  ITEMS: {
    APPLE: "../assets/world/items/inventory/apple.png",
    APPLES: "../assets/world/items/inventory/apples.png",
    BANANA: "../assets/world/items/inventory/banana.png",
    BAKPAO_LEGEND: "../assets/world/items/inventory/bakpao_legend.png",
  },
};  

export class UI {
    constructor(player, camera) {
        this.player = player;
        this.camera = camera;
        this.gameCanvas = document.getElementById('gameCanvas');
        this.uiElement = null;
        this.inventory = new Inventory(this.gameCanvas);
        this.inventory.setPlayer(player); 
        this.images = {}; 
        this.achievementSystem = new AchievementSystem();
        this.achievementSystem.onAchievementUnlocked = this.showAchievementNotification.bind(this);
        this.adminPanel = new AdminPanel(this.achievementSystem);
        this.cheatHandler = new CheatHandler(this.achievementSystem);
        this.init();
        this.setupMedalListener();
    }

    setupMedalListener() {
        document.addEventListener('medalUpdate', (e) => {
            if (this.medalCount) {
                this.medalCount.textContent = e.detail.medals;
            }
        });
    }

    async init() {
        try {
            await this.loadUI();
            this.setupControls();
        } catch (err) {
            console.error('Failed to initialize UI:', err);
        }
    }

    async loadSprites() {
        
        this.images = {
            ammo: await Drawer.loadImage(() => Assets.getWorldItemsAmmo()),
            bomb: await Drawer.loadImage(() => Assets.getWorldItemsBomb()),
            coin: await Drawer.loadImage(() => Assets.getWorldItemsCoin()),
            medal: await Drawer.loadImage(() => Assets.getWorldItemsMedal()) // Add medal
        };
    }

    async loadUI() {
        try {
            
            await this.loadSprites();

            const response = await fetch('../html/ui.html');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            
            
            document.querySelectorAll('.game-ui, .inventory-modal').forEach(el => el.remove());
            
            
            const container = document.createElement('div');
            container.innerHTML = html;
            
            
            const canvasRect = this.gameCanvas.getBoundingClientRect();
            
            
            while (container.firstChild) {
                document.body.appendChild(container.firstChild);
            }

            
            this.uiElement = document.querySelector('.game-ui');
            this.ammoCount = document.querySelector('.ammo-count');
            this.bombCount = document.querySelector('.bomb-count');
            this.scoreCount = document.querySelector('.score-count');
            this.medalCount = document.querySelector('.medal-count'); // Add this line
            this.healthFill = document.querySelector('.health-fill');

            
            if (this.uiElement) {
                this.uiElement.style.width = `${canvasRect.width}px`;
                this.uiElement.style.height = `${canvasRect.height}px`;
                this.uiElement.style.left = `${canvasRect.left}px`;
                this.uiElement.style.top = `${canvasRect.top}px`;
            }

            window.addEventListener('resize', () => this.handleResize());

            
            await Promise.all(
                Object.entries(this.images).map(([type, sprite]) => {
                    if (sprite) {
                        const elements = document.querySelectorAll(`.${type}-icon`);
                        return Promise.all(
                            Array.from(elements).map(element => 
                                this.setupUIAsync(element, sprite)
                            )
                        );
                    }
                })
            );

            await this.inventory.initialize(this.player);

            const slots = document.querySelectorAll('.inventory-slot');
            this.inventory.populateInventory(
              ['APPLE', 'BANANA', 'RED_POTION', 'CHICKEN', 'LETTUCE', 'BAKPAO_LEGEND'],
              slots
            );

            console.log('UI setup complete');
        } catch (error) {
            console.error('Error in loadUI:', error);
            throw error;
        }
    }

    setupUI(element, imagePath) {
        if (!element) return;
        const img = new Image();
        img.src = imagePath;
        element.width = 32;
        element.height = 32;
        img.onload = () => {
            const ctx = element.getContext('2d');
            ctx.clearRect(0, 0, element.width, element.height);
            ctx.drawImage(img, 0, 0, element.width, element.height);
        };
    }

    
    async setupUIAsync(element, sprite) {
        if (!element || !sprite?.images?.[0]) return;
        
        element.width = 32;
        element.height = 32;
        const ctx = element.getContext('2d');
        ctx.clearRect(0, 0, element.width, element.height);
        ctx.drawImage(sprite.images[0], 0, 0, element.width, element.height);
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'e') {
                this.inventory.toggle();
            }
            if (e.key === 'Escape' && this.inventory.isVisible) { 
                this.inventory.hide();
            }
        });

        
        document.addEventListener('click', (e) => {
            if (this.inventory.isVisible && 
                this.inventoryModal && 
                !e.target.closest('.inventory-container')) {
                this.inventory.hide();
            }
        });
    }

    handleResize() {
        const canvasRect = this.gameCanvas.getBoundingClientRect();
        
        if (this.uiElement) {
            this.uiElement.style.width = `${canvasRect.width}px`;
            this.uiElement.style.height = `${canvasRect.height}px`;
            this.uiElement.style.left = `${canvasRect.left}px`;
            this.uiElement.style.top = `${canvasRect.top}px`;
        }

        this.inventory.handleResize();
    }

    draw() {
        if (!this.uiElement) return;
        
        
        this.updateBasicUI();
    }

    updateBasicUI() {
        if (!this.uiElement) return; // Add safety check
        
        // Add null checks for all UI elements
        if (this.ammoCount) this.ammoCount.textContent = this.player.ammo || 50;
        if (this.bombCount) this.bombCount.textContent = this.player.bombs || 10;
        if (this.scoreCount) this.scoreCount.textContent = this.player.coins || 1000;
        if (this.medalCount) this.medalCount.textContent = this.player.medals || 0;
        if (this.healthFill) {
            const healthPercent = ((this.player.health || 100) / 100) * 100;
            this.healthFill.style.width = `${healthPercent}%`;
        }
    }

    showAchievementNotification(achievement) {
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
        
        // Trigger animation
        requestAnimationFrame(() => {
            notification.classList.add('show');
            
            // Play achievement sound
            const achievementSound = new Audio('../assets/sounds/achievement.mp3');
            achievementSound.volume = 0.5;
            achievementSound.play().catch(() => {}); // Ignore if sound fails to play
        });

        // Remove notification after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 600);
        }, 3000);
    }
}
