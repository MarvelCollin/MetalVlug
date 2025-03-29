import { UfoCanvas } from "./canvas/ufo.js";
import { webCtx } from './canvas/webctx.js';

let ufoCanvas = null;

async function initGame() {
    try {
        await webCtx.initialize();
        
        if (!webCtx.getCanvas() || !webCtx.getContext()) {
            throw new Error('WebCtx initialization failed');
        }

        ufoCanvas = new UfoCanvas();
        
        await new Promise((resolve, reject) => {
            const checkInit = () => {
                if (ufoCanvas.isReady) {
                    resolve();
                } else if (ufoCanvas.initError) {
                    reject(ufoCanvas.initError);
                } else {
                    setTimeout(checkInit, 100);
                }
            };
            setTimeout(checkInit, 100);
        });
        
        return ufoCanvas;
    } catch (error) {
        console.error('Failed to initialize game:', error);
        const container = document.querySelector('.parallax-container');
        if (container) {
            const errorMsg = document.createElement('div');
            errorMsg.style.color = 'red';
            errorMsg.style.position = 'fixed';
            errorMsg.style.top = '50%';
            errorMsg.style.left = '50%';
            errorMsg.style.transform = 'translate(-50%, -50%)';
            errorMsg.textContent = 'Failed to load game resources';
            container.appendChild(errorMsg);
        }
        throw error;
    }
}

const init = async () => {
    await initGame();
    const maxScroll = 500;
    const darkGround = document.querySelector(".dark-ground");
    const lightGround = document.querySelector(".light-ground");
    const dayBg = document.querySelector(".day-bg");
    const container = document.querySelector(".parallax-container");
    const gameTitle = document.querySelector(".game-title");

    const scrollIndicator = document.querySelector(".scroll-indicator");
    let scrollTimeout;
    let hasScrolled = false;

    const showScrollIndicator = () => {
        if (!hasScrolled) {
            scrollIndicator.classList.add('visible');
        }
    };

    scrollTimeout = setTimeout(showScrollIndicator, 3000);

    function createStars(count) {
        for (let i = 0; i < count; i++) {
            const star = document.createElement("div");
            star.className =
                "star " + ["blue", "gold", "white"][Math.floor(Math.random() * 3)];
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.width = `${Math.random() * 3 + 1}px`;
            star.style.height = star.style.width;
            star.classList.add("fade-in");
            container.appendChild(star);
        }
    }

    function animateStars() {
        const stars = document.querySelectorAll(".star");
        stars.forEach((star) => {
            const delay = Math.random() * 5000;
            const duration = Math.random() * 3000 + 1000;
            star.style.animation = `blink ${duration}ms infinite`;
            star.style.animationDelay = `${delay}ms`;
            star.style.opacity = 1;
        });
    }

    createStars(80);
    animateStars();

    window.addEventListener("scroll", () => {
        const scrolled = Math.min(window.scrollY, maxScroll);
        const scrollProgress = scrolled / maxScroll;

        clearTimeout(scrollTimeout);
        hasScrolled = true;

        if (window.scrollY <= maxScroll) {
            dayBg.style.opacity = Math.pow(scrollProgress, 2);
            darkGround.style.opacity = 1 - Math.pow(scrollProgress, 2);
            lightGround.style.opacity = Math.pow(scrollProgress, 2);

            if (scrollProgress >= 0.35) {
                if (gameTitle.classList.contains('night')) {
                    gameTitle.classList.remove('day-to-night');
                    gameTitle.classList.add('night-to-day');
                    setTimeout(() => {
                        gameTitle.classList.remove('night');
                        gameTitle.classList.add('day');
                    }, 1500);
                }
            } else if (scrollProgress <= 0.25) {
                if (gameTitle.classList.contains('day')) {
                    gameTitle.classList.remove('night-to-day');
                    gameTitle.classList.add('day-to-night');
                    setTimeout(() => {
                        gameTitle.classList.remove('day');
                        gameTitle.classList.add('night');
                    }, 1500);
                }
            }

            if (ufoCanvas) {
                if (scrollProgress >= 0.35) {
                    ufoCanvas.setDayTime(true);
                } else if (scrollProgress <= 0.25) {
                    ufoCanvas.setDayTime(false);
                }
            }

            if (scrollProgress >= 0.3) {
                const stars = document.querySelectorAll(".star");
                stars.forEach((star) => star.remove());
                scrollIndicator.classList.remove('visible');
            } else if (
                scrollProgress <= 0.1 &&
                document.querySelectorAll(".star").length === 0
            ) {
                createStars(80);
                animateStars();
                hasScrolled = false;
                scrollTimeout = setTimeout(showScrollIndicator, 3000);
            }
        }
    });

    window.addEventListener("resize", () => {
        const scrollProgress = Math.min(window.scrollY, maxScroll) / maxScroll;
    });

    if ("scrollRestoration" in history) {
        history.scrollRestoration = "manual";
    }

    document.addEventListener("DOMContentLoaded", () => {
        window.scrollTo(0, 0);
    });

    window.addEventListener("load", () => {
        window.scrollTo(0, 0);

        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 50);

        hasScrolled = false;
        scrollTimeout = setTimeout(showScrollIndicator, 3000);
    });
};

init();
