import {
    consumeEnergy,
    addMolotovCocktail,
    removeMolotovCocktail,
    setObstacleHit,
    addIncineratingObstacle,
    setCurrentObstacle,
    incrementObstaclesIncinerated,
    incrementTotalInGameIncinerations,
    incrementConsecutiveIncinerations
} from '../state-manager.js';
import { OBSTACLE_WIDTH, OBSTACLE_EMOJI_Y_OFFSET, OBSTACLE_HEIGHT, GROUND_Y, EASTER_EGG_EMOJI } from '../../constants.js';
import { checkMolotovCollision } from '../collision.js';
import { playAnimationSound } from '../../audio.js';
import { canvas } from '../../dom-elements.js';

export const molotovSkill = {
    config: {
        name: 'molotovCocktail',
        energyCost: 25,
    },

    activate: function(state) {
        if (!state.gameRunning || state.isPaused || state.jumpState.isJumping) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;

        playAnimationSound('molotov-cocktail-hurl');

        let targetObstacle = state.currentObstacle;
        const playerX = state.stickFigureFixedX;
        const playerY = state.stickFigureY;

        if (!targetObstacle) {
            targetObstacle = { x: playerX + 300, isDummy: true };
        }

        const targetX = targetObstacle.x + OBSTACLE_WIDTH / 2;
        const targetY = GROUND_Y - targetObstacle.x * Math.tan(state.raceSegments[state.currentSegmentIndex].angleRad) + OBSTACLE_EMOJI_Y_OFFSET - (OBSTACLE_HEIGHT / 2);

        const velocityX = 7;
        const gravity = 0.2;
        const time = (targetX - playerX) / velocityX;
        const velocityY = (targetY - playerY - 0.5 * gravity * time * time) / time;

        addMolotovCocktail({
            x: playerX,
            y: playerY,
            velocityX: velocityX,
            velocityY: velocityY,
            gravity: gravity,
            startTime: performance.now(),
            targetObstacle: targetObstacle,
            hasCollided: false,
            animationProgress: 0,
            isSmashing: false,
            isBursting: false,
            burstParticles: []
        });
    },

    update: function(cocktail, i, gameState, deltaTime) {
        if (cocktail.isBursting) {
            // Update burst particles
            for (let j = cocktail.burstParticles.length - 1; j >= 0; j--) {
                const p = cocktail.burstParticles[j];
                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.02;
                if (p.alpha <= 0) {
                    cocktail.burstParticles.splice(j, 1);
                }
            }
            // Check for collision during the burst
            const obstacle = cocktail.targetObstacle;
            if (obstacle && !obstacle.isDummy && !obstacle.hasBeenHit && Math.abs(obstacle.x - cocktail.x) < 50) {
                setObstacleHit(obstacle); // Mark as hit to prevent player collision
                addIncineratingObstacle({ ...obstacle, animationProgress: 0, startTime: performance.now(), animationType: 'molotov' });
                if (obstacle === gameState.currentObstacle) {
                    setCurrentObstacle(null);
                }
                if (obstacle.emoji !== EASTER_EGG_EMOJI) {
                    incrementObstaclesIncinerated();
                    incrementTotalInGameIncinerations();
                    incrementConsecutiveIncinerations();
                }
            }

            if (cocktail.burstParticles.length === 0) {
                removeMolotovCocktail(i);
            }
            return;
        }

        if (cocktail.isSmashing) {
            cocktail.animationProgress += deltaTime / 200; // 200ms smash animation
            if (cocktail.animationProgress >= 1) {
                cocktail.isSmashing = false;
                cocktail.isBursting = true;

                // Create burst particles
                for (let k = 0; k < 15; k++) { // Reduced from 30 to 15
                    const angle = Math.random() * Math.PI * 2;
                    const speed = Math.random() * 4 + 1; // Slightly reduced speed
                    cocktail.burstParticles.push({
                        x: cocktail.x,
                        y: cocktail.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        radius: Math.random() * 3 + 1, // Slightly smaller particles
                        alpha: 1
                    });
                }
            }
            return;
        }

        // --- Pre-collision flight logic ---
        cocktail.velocityY += cocktail.gravity;
        cocktail.x += cocktail.velocityX;
        cocktail.y += cocktail.velocityY;

        // Check for direct obstacle collision
        const obstaclesToCheck = [gameState.currentObstacle, ...gameState.ignitedObstacles].filter(Boolean);
        for (const obstacle of obstaclesToCheck) {
            if (checkMolotovCollision(cocktail, obstacle)) {
                cocktail.hasCollided = true;
                cocktail.isSmashing = true;
                cocktail.animationProgress = 0;
                playAnimationSound('engulfed-crackling');

                setObstacleHit(obstacle); // Mark as hit to prevent player collision
                addIncineratingObstacle({ ...obstacle, animationProgress: 0, startTime: performance.now() });
                if (obstacle === gameState.currentObstacle) {
                    setCurrentObstacle(null);
                }
                if (obstacle.emoji !== EASTER_EGG_EMOJI) {
                    incrementObstaclesIncinerated();
                    incrementTotalInGameIncinerations();
                    incrementConsecutiveIncinerations();
                }
                break; // Stop checking after first collision
            }
        }

        if (cocktail.hasCollided) return;

        // Remove if it falls off the bottom of the screen (failsafe)
        if (cocktail.y > canvas.height + 50) {
            removeMolotovCocktail(i);
        }
    },

    draw: function(cocktail, ctx) {
        if (cocktail.isBursting) {
            for (const p of cocktail.burstParticles) {
                ctx.fillStyle = `rgba(255, ${Math.random() * 150}, 0, ${p.alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (cocktail.isSmashing) {
            // Draw smashing glass particles
            for (let i = 0; i < 10; i++) {
                ctx.fillStyle = `rgba(200, 200, 200, ${1 - cocktail.animationProgress})`;
                ctx.fillRect(
                    cocktail.x + (Math.random() - 0.5) * 20,
                    cocktail.y + (Math.random() - 0.5) * 20,
                    2, 2
                );
            }
        } else { // Still flying
            ctx.fillStyle = 'red'; // Molotov body
            ctx.beginPath();
            ctx.arc(cocktail.x, cocktail.y, 8, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = 'orange'; // Flame
            ctx.beginPath();
            ctx.arc(cocktail.x, cocktail.y - 8, 5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};
