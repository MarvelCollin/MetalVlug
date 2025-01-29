import Drawer from '../../game/helper/drawer.js';
import assetsInstance from '../../game/helper/assets.js';
import { EnemyUfoCanvas } from './enemyUfo.js';
import { webCtx } from './webctx.js';

export class UfoCanvas {
    constructor() {
        this.ufoStates = {
            afraid: null,
            laugh: null,
            wave: null
        };
        this.ufos = []; 
        this.ufoCount = 8;  
        this.isDay = false;
        this.isReady = false; 
        this.enemyUfo = null;
        this.explosions = [];
        this.effects = [];
        this.explodeState = null;
        this.effectState = null;
        
        // Remove canvas initialization from constructor
        this.initializeCanvas();
    }

    async initializeCanvas() {
        try {
            if (!webCtx.initialized) {
                await webCtx.initialize();
            }

            this.canvas = webCtx.getCanvas();
            this.ctx = webCtx.getContext();
            
            if (!this.canvas || !this.ctx) {
                throw new Error('Canvas context not available');
            }

            await this.init(); // Move init() call here
        } catch (error) {
            console.error('Failed to initialize UfoCanvas:', error);
        }
    }

    createUfo() {
        const spawnSide = Math.floor(Math.random() * 4); 
        let x, y;
        const margin = 100;

        switch(spawnSide) {
            case 0: 
                x = Math.random() * window.innerWidth;
                y = -margin;
                break;
            case 1: 
                x = window.innerWidth + margin;
                y = Math.random() * (window.innerHeight / 2);
                break;
            case 2: 
                x = Math.random() * window.innerWidth;
                y = window.innerHeight/2 + margin;
                break;
            case 3: 
                x = -margin;
                y = Math.random() * (window.innerHeight / 2);
                break;
        }

        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 3;
        const angle = Math.atan2(centerY - y, centerX - x);
        const speed = 2 + Math.random() * 2;

        return {
            x: x,
            y: y,
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed,
            scale: 1.8,
            state: 'afraid',
            dayState: Math.random() < 0.5 ? 'laugh' : 'wave',
            isEntering: true 
        };
    }

    async init() {
        try {
            const [afraidData, laughData, waveData, explodeData, effectData] = await Promise.all([
                Drawer.loadImage(assetsInstance.getWebUfoAfraid.bind(assetsInstance)),
                Drawer.loadImage(assetsInstance.getWebUfoLaugh.bind(assetsInstance)),
                Drawer.loadImage(assetsInstance.getWebUfoWave.bind(assetsInstance)),
                Drawer.loadImage(assetsInstance.getWebUfoExplode.bind(assetsInstance)),
                Drawer.loadImage(assetsInstance.getWebUfoEffect.bind(assetsInstance))
            ]);

            this.ufoStates.afraid = { images: afraidData.images, delay: afraidData.delay };
            this.ufoStates.laugh = { images: laughData.images, delay: laughData.delay };
            this.ufoStates.wave = { images: waveData.images, delay: waveData.delay };
            this.explodeState = { images: explodeData.images, delay: explodeData.delay };
            this.effectState = { images: effectData.images, delay: effectData.delay };

            
            console.log("Creating initial UFOs:", this.ufoCount);
            this.ufos = []; 
            for (let i = 0; i < this.ufoCount; i++) {
                const ufo = this.createUfo();
                
                ufo.x = (window.innerWidth / (this.ufoCount + 1)) * (i + 1);
                ufo.y = Math.random() * (window.innerHeight / 3) + 100;
                this.ufos.push(ufo);
                console.log(`UFO ${i} created at:`, {x: ufo.x, y: ufo.y});
            }
            
            this.enemyUfo = new EnemyUfoCanvas();
            await this.enemyUfo.init(); 
            this.enemyUfo.setParentCanvas(this);
            
            this.isReady = true; 
            this.setDayTime(false);
            this.startAnimation();
        } catch (error) {
            console.error('Error in init:', error);
        }

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    setDayTime(isDay) {
        this.isDay = isDay;
        this.ufos.forEach(ufo => {
            ufo.state = isDay ? ufo.dayState : 'afraid';
        });
        
        this.enemyUfo.setDayTime(isDay);
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    updateUfoPositions() {
        if (!this.isReady || !this.enemyUfo) return;

        const margin = 50;
        const groundHeight = 200;
        const safeGroundMargin = 50;

        
        const activeUfos = this.ufos.filter(ufo => !ufo.isEntering);
        
        
        while (this.ufos.length < this.ufoCount) {
            console.log("Spawning new UFO from outside canvas");
            this.ufos.push(this.createUfo());
        }

        
        this.ufos.forEach(ufo => {
            if (ufo.isEntering) {
                
                ufo.x += ufo.speedX;
                ufo.y += ufo.speedY;

                
                if (ufo.x > margin && 
                    ufo.x < window.innerWidth - margin && 
                    ufo.y > margin && 
                    ufo.y < window.innerHeight/2) {
                    ufo.isEntering = false;
                    
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 1 + Math.random() * 2;
                    ufo.speedX = Math.cos(angle) * speed;
                    ufo.speedY = Math.sin(angle) * speed;
                }
                return;
            }

            
            const nextX = ufo.x + ufo.speedX;
            const nextY = ufo.y + ufo.speedY;

            if (nextX < margin || nextX > window.innerWidth - margin) {
                ufo.speedX *= -1;
            } else {
                ufo.x = nextX;
            }

            if (nextY < margin || nextY > window.innerHeight - groundHeight - safeGroundMargin) {
                ufo.speedY *= -1;
            } else {
                ufo.y = nextY;
            }

            if (Math.random() < 0.003) {
                ufo.speedX *= (Math.random() > 0.5 ? 1 : -1);
                ufo.speedY *= (Math.random() > 0.5 ? 1 : -1);
            }
        });

        this.enemyUfo.updatePositions(this.ufos);
    }

    handleCollision(ufo, bullet) {
        console.log(`UFO destroyed. Count before: ${this.ufos.length}`); 
        this.createExplosion(ufo.x, ufo.y);
        this.createEffect(bullet.x, bullet.y);
        
        this.ufos = this.ufos.filter(u => u !== ufo);
        
        this.ufos.push(this.createUfo());
        console.log(`New UFO spawned. Count after: ${this.ufos.length}`); 
    }

    createExplosion(x, y) {
        this.explosions.push({
            x, y,
            frame: 0,
            scale: 2,
            isFinished: false
        });
    }

    createEffect(x, y) {
        this.effects.push({
            x, y,
            frame: 0,
            scale: 1,
            isFinished: false
        });
    }

    startAnimation() {
        if (!this.isReady) return;
        
        const animate = () => {
            this.updateUfoPositions();
            this.draw();
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    draw() {
        if (!this.isReady || !this.ctx) return;
        
        // Clear canvas at the start of each frame
        webCtx.clearCanvas();

        if (this.ufoStates.afraid && this.ufos.length > 0) {
            this.ufos.forEach((ufo, index) => {
                const currentState = this.ufoStates[ufo.state];
                if (currentState?.images) {
                    Drawer.drawToCanvas(
                        currentState.images,
                        ufo.x,
                        ufo.y,
                        currentState.delay,
                        false,
                        ufo.scale,
                        'LOOP',
                        webCtx.getContext() // Use webCtx directly
                    );
                }
            });
        }

        // Draw explosions and effects
        this.explosions = this.explosions.filter(explosion => {
            if (explosion.isFinished) return false;
            
            Drawer.drawToCanvas(
                this.explodeState.images,
                explosion.x,
                explosion.y,
                this.explodeState.delay,
                false,
                explosion.scale,
                'ONCE',
                webCtx.getContext()
            );
            
            explosion.frame++;
            if (explosion.frame >= this.explodeState.images.length) {
                explosion.isFinished = true;
            }
            return !explosion.isFinished;
        });

        this.effects = this.effects.filter(effect => {
            if (effect.isFinished) return false;
            
            Drawer.drawToCanvas(
                this.effectState.images,
                effect.x,
                effect.y,
                this.effectState.delay,
                false,
                effect.scale,
                'ONCE',
                webCtx.getContext()
            );
            
            effect.frame++;
            if (effect.frame >= this.effectState.images.length) {
                effect.isFinished = true;
            }
            return !effect.isFinished;
        });

        // Draw enemy UFOs last
        if (this.enemyUfo) {
            this.enemyUfo.draw();
        }
    }
}