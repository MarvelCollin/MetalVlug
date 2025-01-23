import { ctx, canvas } from "../ctx.js";
import Assets from "../helper/assets.js";
import Drawer from "../helper/drawer.js";
import { Inventory } from '../ui/inventory.js';
import { INVENTORY_ITEMS } from '../ui/items.js';

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
        this.images = {}; // Initialize empty images object
        
        this.init();
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
        // Load the basic UI sprites
        this.images = {
            ammo: await Drawer.loadImage(() => Assets.getWorldItemsAmmo()),
            bomb: await Drawer.loadImage(() => Assets.getWorldItemsBomb()),
            coin: await Drawer.loadImage(() => Assets.getWorldItemsCoin())
        };
    }

    async loadUI() {
        try {
            // Load sprites first
            await this.loadSprites();

            const response = await fetch('../html/ui.html');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const html = await response.text();
            
            // Clean up existing UI elements
            document.querySelectorAll('.game-ui, .inventory-modal').forEach(el => el.remove());
            
            // Create container and add to DOM
            const container = document.createElement('div');
            container.innerHTML = html;
            
            // Get canvas position
            const canvasRect = this.gameCanvas.getBoundingClientRect();
            
            // Add UI elements to DOM first
            while (container.firstChild) {
                document.body.appendChild(container.firstChild);
            }

            // Cache UI elements after they're in the DOM
            this.uiElement = document.querySelector('.game-ui');
            this.ammoCount = document.querySelector('.ammo-count');
            this.bombCount = document.querySelector('.bomb-count');
            this.scoreCount = document.querySelector('.score-count');
            this.healthFill = document.querySelector('.health-fill');

            // Set positions based on canvas
            if (this.uiElement) {
                this.uiElement.style.width = `${canvasRect.width}px`;
                this.uiElement.style.height = `${canvasRect.height}px`;
                this.uiElement.style.left = `${canvasRect.left}px`;
                this.uiElement.style.top = `${canvasRect.top}px`;
            }

            window.addEventListener('resize', () => this.handleResize());

            // Setup static images (using async version)
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

            // Initialize inventory
            await this.inventory.initialize(this.player);

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

    // Alternative approach using async/await
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
            if (e.key === 'Escape' && this.inventory.isVisible()) {
                this.inventory.hide();
            }
        });

        // Close inventory when clicking outside
        document.addEventListener('click', (e) => {
            if (this.inventory.isVisible() && !e.target.closest('.inventory-container')) {
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
        
        // Update basic UI elements (health, ammo, etc.)
        this.updateBasicUI();
    }

    updateBasicUI() {
        this.ammoCount.textContent = this.player.ammo || 50;
        this.bombCount.textContent = this.player.bombs || 10;
        this.scoreCount.textContent = this.player.coins || 1000;
        
        const healthPercent = ((this.player.health || 100) / 100) * 100;
        this.healthFill.style.width = `${healthPercent}%`;
    }
}
