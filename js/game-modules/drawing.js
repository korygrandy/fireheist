import { canvas, ctx } from '../dom-elements.js';
import { GROUND_Y, STICK_FIGURE_TOTAL_HEIGHT, COLLISION_DURATION_MS, JUMP_HEIGHT_RATIO, STICK_FIGURE_FIXED_X } from '../constants.js';
import { currentTheme } from '../theme.js';
import { gameState } from './state-manager.js';

import { drawClouds } from './drawing/world.js';
import { createFireExplosion } from './drawing/effects.js'; // Only keep creation functions here
import { drawParticlesAndEffects, clearCanvas, drawBackground, drawGameObjects, drawUIOverlaysAndEffects } from './drawing/renderer.js';
import { FIREBALL_SIZE, OBSTACLE_EMOJI_Y_OFFSET } from '../constants.js';

export let isInitialLoad = true;
export function setInitialLoad(value) {
    isInitialLoad = value;
}





export function draw() {
    // 1. Clear canvas with sky color
    clearCanvas(currentTheme.sky);

    const currentSegment = gameState.raceSegments[Math.min(gameState.currentSegmentIndex, gameState.raceSegments.length - 1)];
    const groundAngleRad = currentSegment ? currentSegment.angleRad : 0;

    // Draw cityscape and ground
    if (gameState.currentSegmentIndex < gameState.raceSegments.length || gameState.isGameOverSequence) {
        drawBackground(gameState.selectedTheme, groundAngleRad);
    }

    // 3. Draw Clouds
    drawClouds();

    // 5. Draw Environmental & Particle Effects on top of the ground
    drawParticlesAndEffects(
        gameState.activeFireballs,
        gameState.ignitedObstacles,
        gameState.vanishingObstacles,
        gameState.flippingObstacles,
        groundAngleRad
    );

    // 6. Draw Game Objects (Player, Obstacles, etc.)
    if (gameState.currentSegmentIndex < gameState.raceSegments.length || gameState.isGameOverSequence) {
        drawGameObjects(gameState, currentSegment, groundAngleRad);
    }

    // 7. Draw UI Overlays
    drawUIOverlaysAndEffects(gameState, isInitialLoad, COLLISION_DURATION_MS);

    // Draw shotgun particles
    ctx.fillStyle = 'orange'; // Default color
    for (const particle of gameState.shotgunParticles) {
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 5, 5);
    }

    // Draw Molotov Cocktails
    for (const cocktail of gameState.molotovCocktails) {
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
}