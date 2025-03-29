import Drawer from "../../game/helper/drawer.js";
import assetsInstance from "../../game/helper/assets.js";
import { webCtx } from './webctx.js';

export class EnemyUfoCanvas {
  constructor() {
    if (!webCtx.initialized) {
      console.error('WebCtx not initialized');
      return;
    }
    
    this.canvas = webCtx.getCanvas();
    this.ctx = webCtx.getContext();
    
    if (!this.canvas || !this.ctx) {
      console.error('Canvas or context not available');
      return;
    }

    this.enemyUfos = []; 
    this.bullets = [];
    this.targetUfo = null;
    this.shootCooldown = 0;
    this.movingLeft = false;
    this.changeDirectionTimer = 0;
    this.state = "stop";
    this.stateTimer = 0;
    this.stateDuration = {
      stop: 180, 
      move: 240, 
      chase: 180, 
    };
    this.shootDelay = 180; 
    this.lastShotTime = Date.now();
    this.shootCooldown = 3000; 
    this.yCheckThreshold = 40; 
    this.isDay = false;
    this.isExiting = false;
    this.enemyData = null; 
    this.ufoCount = 2; 
    this.enemyUfos = [];
    this.isInitialized = false;
    this.init();
  }

  async init() {
    if (!this.canvas || !this.ctx) {
      console.error('Cannot initialize without canvas context');
      return false;
    }

    try {
      const [enemyData, bulletData] = await Promise.all([
        Drawer.loadImage(assetsInstance.getWebUfoEnemy.bind(assetsInstance)),
        Drawer.loadImage(assetsInstance.getWebUfoBullet.bind(assetsInstance)),
      ]);

      this.enemyData = enemyData; 

      
      this.enemyUfos = [];
      for (let i = 0; i < this.ufoCount; i++) {
        const enemyUfo = this.createEnemyUfo(enemyData);
        
        enemyUfo.x =
          i === 0 ? window.innerWidth * 0.25 : window.innerWidth * 0.75;
        enemyUfo.y = window.innerHeight * 0.2;
        this.enemyUfos.push(enemyUfo);
      }

      this.bulletData = {
        images: bulletData.images,
        delay: bulletData.delay,
      };

      this.isInitialized = true;
      this.startAnimation();
      return true; 
    } catch (error) {
      console.error("Error loading enemy UFO images:", error);
      return false;
    }
  }

  createEnemyUfo(enemyData, spawnAtTop = false) {
    const x = spawnAtTop
      ? Math.random() * (window.innerWidth - 100) + 50 
      : Math.random() * window.innerWidth;
    const y = spawnAtTop
      ? -50 
      : Math.random() * (window.innerHeight / 3);

    return {
      images: enemyData.images,
      delay: enemyData.delay,
      x: x,
      y: y,
      speedX: (Math.random() - 0.5) * 1.5, 
      speedY: spawnAtTop ? 0.3 + Math.random() : (Math.random() - 0.5) * 1, 
      scale: 1.5,
      glowIntensity: 0.8 + Math.random() * 0.4,
      glowColor: '#FF5722',
      facingLeft: false,
      state: "stop",
      stateTimer: Math.random() * 120,
      lastShotTime: 0,
      baseSpeed: 0.3 + Math.random() * 0.3, 
      movementPattern: Math.floor(Math.random() * 3),
      patternTimer: 0,
      amplitude: 50 + Math.random() * 50,
      isEntering: spawnAtTop,
      currentGlowIntensity: 0.8 + Math.random() * 0.4,
      targetGlowIntensity: 0.8 + Math.random() * 0.4,
      glowTransitionSpeed: 0.05,
    };
  }

  createBullet(enemyUfo) {
    const direction = enemyUfo.facingLeft ? -1 : 1;
    return {
      x: enemyUfo.x + (direction > 0 ? 32 : -32),
      y: enemyUfo.y + 8, 
      speedX: 8 * direction, 
      scale: 1,
      facingLeft: enemyUfo.facingLeft,
    };
  }

  updateState(enemyUfo) {
    enemyUfo.stateTimer++;
    enemyUfo.patternTimer++;

    
    if (enemyUfo.state !== "chase" && Math.random() < 0.001) {
      
      enemyUfo.state = "chase";
      enemyUfo.stateTimer = 0;
      return;
    }

    switch (enemyUfo.state) {
      case "stop":
        if (enemyUfo.stateTimer >= this.stateDuration.stop) {
          enemyUfo.state = Math.random() < 0.2 ? "chase" : "move"; 
          enemyUfo.stateTimer = 0;
          enemyUfo.speedX = (Math.random() - 0.5) * 3; 
          enemyUfo.speedY = (Math.random() - 0.5) * 2; 
        }
        break;

      case "move":
        if (enemyUfo.stateTimer >= this.stateDuration.move) {
          enemyUfo.state = "stop";
          enemyUfo.stateTimer = 0;
        }
        break;

      case "chase":
        if (enemyUfo.stateTimer >= this.stateDuration.chase) {
          enemyUfo.state = "stop";
          enemyUfo.stateTimer = 0;
        }
        break;
    }
  }

  setDayTime(isDay) {
    if (this.isDay !== isDay) {
      this.isDay = isDay;
      const margin = 50;
      
      if (isDay) {
        this.enemyUfos.forEach((enemyUfo) => {
          enemyUfo.isExiting = true;
          enemyUfo.speedY = -8;
          enemyUfo.speedX = (Math.random() - 0.5) * 4;
          enemyUfo.targetGlowIntensity = 0;
        });
      } else {
        this.enemyUfos = [];
        for (let i = 0; i < this.ufoCount; i++) {
          const x = margin + Math.random() * (window.innerWidth - 2 * margin);
          const enemyUfo = {
            images: this.enemyData.images,
            delay: this.enemyData.delay,
            x: x,
            y: -50,
            speedX: (Math.random() - 0.5) * 4,
            speedY: 2 + Math.random() * 2,
            isEntering: true,
            scale: 1.5,
            facingLeft: false,
            state: "stop",
            stateTimer: Math.random() * 120,
            lastShotTime: 0,
            baseSpeed: 2 + Math.random() * 2,
            movementPattern: Math.floor(Math.random() * 3),
            patternTimer: 0,
            amplitude: 50 + Math.random() * 50,
            glowIntensity: 0.8 + Math.random() * 0.4,
            glowColor: '#FF5722',
            currentGlowIntensity: 0,
            targetGlowIntensity: 0.8 + Math.random() * 0.4,
            glowTransitionSpeed: 0.05,
          };
          this.enemyUfos.push(enemyUfo);
        }
      }
    }
  }

  updatePositions(targetUfos) {
    if (!this.isInitialized) return; 
    const margin = 50;
    const groundHeight = 200;
    const safeGroundMargin = 50;
    const maxY = window.innerHeight - groundHeight - safeGroundMargin;

    this.enemyUfos = this.enemyUfos.filter((enemyUfo) => {
      if (enemyUfo.isExiting) {
        enemyUfo.x += enemyUfo.speedX;
        enemyUfo.y += enemyUfo.speedY;
        return enemyUfo.y > -100; 
      }

      if (enemyUfo.isEntering) {
        enemyUfo.y += enemyUfo.speedY;
        if (enemyUfo.y > margin) {
          enemyUfo.isEntering = false;
        }
        return true;
      }

      
      const nextX = enemyUfo.x + enemyUfo.speedX;
      if (nextX < margin) {
        enemyUfo.x = margin;
        enemyUfo.speedX = Math.abs(enemyUfo.speedX); 
        enemyUfo.facingLeft = false;
      } else if (nextX > window.innerWidth - margin) {
        enemyUfo.x = window.innerWidth - margin;
        enemyUfo.speedX = -Math.abs(enemyUfo.speedX); 
        enemyUfo.facingLeft = true;
      } else {
        enemyUfo.x = nextX;
      }

      
      const nextY = enemyUfo.y + enemyUfo.speedY;
      if (nextY < margin) {
        enemyUfo.y = margin;
        enemyUfo.speedY = Math.abs(enemyUfo.speedY); 
      } else if (nextY > maxY) {
        enemyUfo.y = maxY;
        enemyUfo.speedY = -Math.abs(enemyUfo.speedY); 
      } else {
        enemyUfo.y = nextY;
      }

      
      if (!this.isDay) {
        this.updateState(enemyUfo);

        
        switch (enemyUfo.movementPattern) {
          case 0: 
            enemyUfo.y +=
              (Math.sin(enemyUfo.patternTimer / 30) * enemyUfo.amplitude) / 20;
            break;
          case 1: 
            if (enemyUfo.state === "move") {
              const radius = enemyUfo.amplitude;
              enemyUfo.x += Math.cos(enemyUfo.patternTimer / 50) * 2;
              enemyUfo.y += Math.sin(enemyUfo.patternTimer / 50) * 2;
            }
            break;
          case 2: 
            if (Math.random() < 0.02) {
              
              enemyUfo.speedX = (Math.random() - 0.5) * 6;
              enemyUfo.speedY = (Math.random() - 0.5) * 4;
            }
            break;
        }

        
        let targetableUfos = targetUfos.filter((ufo) => {
          const yDiff = Math.abs(ufo.y - enemyUfo.y);
          return yDiff < 30; 
        });

        
        let closestUfo = null;
        let minDistance = Infinity;

        targetableUfos.forEach((ufo) => {
          const distance = Math.abs(ufo.x - enemyUfo.x); 
          if (distance < minDistance) {
            minDistance = distance;
            closestUfo = ufo;
          }
        });

        
        switch (enemyUfo.state) {
          case "stop":
            enemyUfo.y += Math.sin(Date.now() / 1000) * 0.5;
            
            if (closestUfo) {
              enemyUfo.state = "chase";
              enemyUfo.stateTimer = 0;
            }
            break;
          case "move":
            enemyUfo.x += enemyUfo.speedX;
            enemyUfo.y += Math.sin(Date.now() / 1000) * 2;
            
            if (closestUfo) {
              enemyUfo.state = "chase";
              enemyUfo.stateTimer = 0;
            }
            break;
          case "chase":
            if (closestUfo) {
              
              const dx = closestUfo.x - enemyUfo.x;
              const dy = closestUfo.y - enemyUfo.y;
              const angle = Math.atan2(dy, dx);

              
              enemyUfo.x += Math.cos(angle) * enemyUfo.baseSpeed * 0.4; 
              enemyUfo.y += Math.sin(angle) * enemyUfo.baseSpeed * 0.2; 
              enemyUfo.facingLeft = dx < 0;

              
              if (
                Math.abs(dy) < 40 && 
                Math.abs(dx) < 500 && 
                Date.now() - enemyUfo.lastShotTime > this.shootDelay * 16.67
              ) {
                
                if (Math.abs(dy) < 25) {
                  
                  this.bullets.push(this.createBullet(enemyUfo));
                  enemyUfo.lastShotTime = Date.now();
                }
              }
            } else {
              enemyUfo.state = "move";
              enemyUfo.stateTimer = 0;
            }
            break;
        }

        
        let potentialTargets = targetUfos.filter((ufo) => {
          const yDiff = Math.abs(ufo.y - enemyUfo.y);
          return yDiff < this.yCheckThreshold;
        });

        
        if (potentialTargets.length > 0) {
          potentialTargets.forEach((target) => {
            const dx = target.x - enemyUfo.x;
            const dy = target.y - enemyUfo.y;

            
            if (
              Math.abs(dy) < this.yCheckThreshold &&
              Math.abs(dx) < 600 && 
              Date.now() - enemyUfo.lastShotTime > this.shootDelay * 16.67
            ) {
              enemyUfo.facingLeft = dx < 0;
              this.bullets.push(this.createBullet(enemyUfo));
              enemyUfo.lastShotTime = Date.now();
            }
          });
        }

        
        const margin = 50;
        const groundHeight = 200;
        const safeGroundMargin = 50;
        const maxY = window.innerHeight - groundHeight - safeGroundMargin;

        if (enemyUfo.x < margin || enemyUfo.x > window.innerWidth - margin) {
          enemyUfo.speedX *= -1;
          enemyUfo.facingLeft = !enemyUfo.facingLeft;
        }
        if (enemyUfo.y < margin) {
          enemyUfo.y = margin;
        } else if (enemyUfo.y > maxY) {
          enemyUfo.y = maxY;
        }
      }

      if (enemyUfo.currentGlowIntensity !== enemyUfo.targetGlowIntensity) {
        if (enemyUfo.currentGlowIntensity < enemyUfo.targetGlowIntensity) {
          enemyUfo.glowIntensity = Math.min(
            enemyUfo.targetGlowIntensity,
            enemyUfo.currentGlowIntensity + enemyUfo.glowTransitionSpeed
          );
        } else {
          enemyUfo.glowIntensity = Math.max(
            enemyUfo.targetGlowIntensity,
            enemyUfo.currentGlowIntensity - enemyUfo.glowTransitionSpeed
          );
        }
        enemyUfo.currentGlowIntensity = enemyUfo.glowIntensity;
      }

      return true;
    });

    
    if (this.enemyUfos.length < this.ufoCount && !this.isDay) {
      this.enemyUfos.push(this.createEnemyUfo(this.enemyData, true));
    }

    
    let hitUfo = null;
    this.bullets = this.bullets.filter((bullet) => {
      let hasCollision = false;
      targetUfos.forEach((ufo) => {
        const dx = bullet.x - ufo.x;
        const dy = bullet.y - ufo.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 30) {
          
          hasCollision = true;
          hitUfo = ufo;
        }
      });

      if (hasCollision && this.parentUfoCanvas) {
        
        this.parentUfoCanvas.handleCollision(hitUfo, bullet);
        return false; 
      }

      bullet.x += bullet.speedX;
      return bullet.x > 0 && bullet.x < window.innerWidth; 
    });
  }

  draw() {
    if (!this.isInitialized) return; 
     
    
    this.enemyUfos.forEach((enemyUfo) => {
      const ctx = webCtx.getContext();
      ctx.save();

      ctx.globalAlpha = 0.8 * enemyUfo.glowIntensity;
      ctx.shadowBlur = 20;
      ctx.shadowColor = enemyUfo.glowColor;
      
      Drawer.drawToCanvas(
        enemyUfo.images,
        enemyUfo.x,
        enemyUfo.y,
        enemyUfo.delay,
        enemyUfo.facingLeft,
        enemyUfo.scale,
        "LOOP",
        ctx
      );
      
      ctx.restore();
    });

    
    this.bullets.forEach((bullet) => {
      const ctx = webCtx.getContext();
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#FF5722';
      ctx.globalAlpha = 0.8;
      
      Drawer.drawToCanvas(
        this.bulletData.images,
        bullet.x,
        bullet.y,
        this.bulletData.delay,
        bullet.facingLeft,
        bullet.scale,
        "LOOP",
        ctx
      );
      
      ctx.restore();
    });
  }

  startAnimation() {
    const animate = () => {
      this.updatePositions([]); 
      this.draw();
      requestAnimationFrame(animate);
    };
    animate();
  }

  setParentCanvas(parentCanvas) {
    this.parentUfoCanvas = parentCanvas;
  }
}
