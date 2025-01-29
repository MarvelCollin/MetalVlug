class WebCtx {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.initialized = false;
        this.initPromise = null;
    }

    initialize() {
        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = new Promise((resolve, reject) => {
            const init = () => {
                try {
                    this.setupCanvas();
                    if (!this.canvas || !this.ctx) {
                        reject(new Error('Canvas initialization failed'));
                        return;
                    }
                    this.initialized = true;
                    resolve(this);
                } catch (error) {
                    reject(error);
                }
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', init);
            } else {
                init();
            }
        });

        return this.initPromise;
    }

    setupCanvas() {
        this.canvas = document.getElementById('ufoCanvas');
        if (!this.canvas) {
            console.error('UFO Canvas not found');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.initialized = true;
        this.addResizeListener();
    }

    addResizeListener() {
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getContext() {
        return this.ctx;
    }

    getCanvas() {
        return this.canvas;
    }
}

const webCtx = new WebCtx();
export { webCtx };
