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
        
        // Wait for UFO initialization to complete
        await new Promise(resolve => {
            const checkInit = () => {
                if (ufoCanvas.isReady) {
                    resolve();
                } else {
                    setTimeout(checkInit, 100);
                }
            };
            checkInit();
        });
        
        return ufoCanvas;
    } catch (error) {
        console.error('Failed to initialize game:', error);
    }
}

// Ensure initialization is complete before other operations
const init = async () => {
    await initGame();
    // Rest of your parallax code...
    const maxScroll = 500;
    const darkGround = document.querySelector(".dark-ground");
    const lightGround = document.querySelector(".light-ground");
    const dayBg = document.querySelector(".day-bg");
    const container = document.querySelector(".parallax-container");
    const gameTitle = document.querySelector(".game-title");

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

        if (window.scrollY <= maxScroll) {
            dayBg.style.opacity = scrollProgress;
            darkGround.style.opacity = 1 - scrollProgress;
            lightGround.style.opacity = scrollProgress;

            // Update title class based on scroll position
            if (scrollProgress >= 0.3) {
                gameTitle.classList.remove('night');
                gameTitle.classList.add('day');
            } else {
                gameTitle.classList.remove('day');
                gameTitle.classList.add('night');
            }

            if (ufoCanvas) {
                ufoCanvas.setDayTime(scrollProgress >= 0.3);
            }

            if (scrollProgress >= 0.3) {
                const stars = document.querySelectorAll(".star");
                stars.forEach((star) => star.remove());
            } else if (
                scrollProgress <= 0.1 &&
                document.querySelectorAll(".star").length === 0
            ) {
                createStars(80);
                animateStars();
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
    });
};

init();
