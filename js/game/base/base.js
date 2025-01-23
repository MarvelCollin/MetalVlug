import { ctx, canvas } from "../ctx.js";
import Assets from "../helper/assets.js";
import Drawer from "../helper/drawer.js";
import Player from "../player/player.js";
import Camera from "../world/camera.js";
import PlayerInputHandler from "../player/components/playerInputHandler.js";
import { debugConfig } from "../helper/debug.js";
import { baseObstacles } from '../world/obstacles/baseObstacles.js';
import { RumiAikawa } from './npc/rumiAikawa.js';
import { SilverSoldier } from './npc/silverSoldier.js';
import { Ralf } from './npc/ralf.js';
import { Agent } from './npc/agent.js';

class Base {
  constructor() {
    this.background = null;
    this.camera = new Camera(null);
    this.player = new Player(1400, 1000);
    this.camera.setTarget(this.player); 
    this.lastTimestamp = 0;
    this.playerInput = new PlayerInputHandler(this.player);
    this.obstacles = [...baseObstacles];
    this.npcs = [
      new RumiAikawa(150, 605, this.camera),   
      new SilverSoldier(1800, 923, this.camera),
      new Ralf(200  , 923, this.camera),
      new Agent(1000, 385, this.camera, this.camera.achievementSystem)
    ];
    this.loadAssets();
    this.setupEventListeners();
    this.setupMenuListeners();
  }

  async loadAssets() {
    try {
      this.background = await Drawer.loadImage(() =>
        Assets.getBackgroundBase()
      );

      if (this.background && this.background.images[0]) {
        const img = this.background.images[0];
        const aspectRatio = img.width / img.height;
        const scaledWidth = canvas.height * aspectRatio;
        this.camera.setWorldSize(scaledWidth, canvas.height);

        this.player.minX = 100;
        this.player.maxX = scaledWidth - 100;
      }

      const idleSprite = await Drawer.loadImage(() =>
        Assets.getPlayerMarcoPistolStandIdleNormal()
      );
      this.player.currentSprite = idleSprite;

      this.startAnimation();
    } catch (error) {
      console.error("Failed to load base assets:", error);
    }
  }

  setupEventListeners() {
    document.addEventListener("keydown", (e) => {
      if (e.code === "Enter") {
        this.npcs.forEach(npc => {
          if (npc.isInteracting) {
            npc.onInteract();
          }
        });
      }
    });
  }

  setupMenuListeners() {
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('silverSoldierMenu');
      if (!menu.contains(e.target) && !this.npcs[1].isInteracting) {
        menu.style.display = 'none';
      }
    });

    const menuItems = document.querySelectorAll('.hover-menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', (e) => {
        switch(e.target.textContent) {
          case 'Start Mission':
            window.location.href = './game.html';
            break;
          case 'View Objectives':
            break;
          case 'Cancel':
            document.getElementById('silverSoldierMenu').style.display = 'none';
            break;
        }
      });
    });
  }

  startAnimation() {
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  gameLoop(timestamp) {
    const deltaTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.camera.follow();
    const viewport = this.camera.getViewport();

    ctx.save();
    ctx.translate(-viewport.x, -viewport.y);

    if (this.background && this.background.images[0]) {
      const img = this.background.images[0];
      const aspectRatio = img.width / img.height;
      const scaledWidth = canvas.height * aspectRatio;

      Drawer.drawBackground(img, 0, canvas.height, scaledWidth, canvas.height);
    }

    this.obstacles.forEach(obstacle => obstacle.draw(ctx));

    this.player.update();
    this.player.draw();

    this.npcs.forEach(npc => {
      npc.update(this.player);
      npc.draw();
    });

    ctx.restore();

    // Draw UI after restoring context so it stays fixed on screen
    if (this.camera.ui) {
      this.camera.ui.draw();
    }

    requestAnimationFrame(this.gameLoop.bind(this));
  }
}

const base = new Base();
