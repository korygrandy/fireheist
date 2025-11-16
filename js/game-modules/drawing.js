import { canvas, ctx } from '../dom-elements.js';
import { GROUND_Y, STICK_FIGURE_TOTAL_HEIGHT, COLLISION_DURATION_MS, JUMP_HEIGHT_RATIO, STICK_FIGURE_FIXED_X } from '../constants.js';
import { currentTheme } from '../theme.js';
import { gameState } from './state-manager.js';

import { drawClouds } from './drawing/world.js';
import { createFireExplosion } from './drawing/effects.js'; // Only keep creation functions here
import { drawParticlesAndEffects, clearCanvas, drawBackground, drawGameObjects, drawUIOverlaysAndEffects } from './drawing/renderer.js';
import { FIREBALL_SIZE, OBSTACLE_EMOJI_Y_OFFSET } from '../constants.js';
import { molotovSkill } from './skills/molotov.js';

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
    molotovSkill.draw(cocktail, ctx);
}
}