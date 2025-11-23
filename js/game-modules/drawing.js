import { canvas, ctx } from '../dom-elements.js';
import { GROUND_Y, STICK_FIGURE_TOTAL_HEIGHT, COLLISION_DURATION_MS, JUMP_HEIGHT_RATIO, STICK_FIGURE_FIXED_X } from '../constants.js';
import { currentTheme } from '../theme.js';
import { gameState } from './state-manager.js';

import { drawClouds } from './drawing/world.js';
import { createFireExplosion } from './drawing/effects.js'; // Only keep creation functions here
import { drawParticlesAndEffects, clearCanvas, drawBackground, drawGameObjects, drawUIOverlaysAndEffects, drawBackgroundElements } from './drawing/renderer.js';
import { FIREBALL_SIZE, OBSTACLE_EMOJI_Y_OFFSET } from '../constants.js';
import { molotovSkill } from './skills/molotov.js';
import { shotgunSkill } from './skills/shotgun.js';
import { fireAxeSkill } from './skills/fireAxe.js';
export let isInitialLoad = true;
export function setInitialLoad(value) {
    isInitialLoad = value;
}
export function draw(playerY) {
    // 1. Clear canvas with sky color
    clearCanvas(currentTheme.sky);

    // 2. Draw background elements (sun, etc.)
    drawBackgroundElements(gameState.selectedTheme);

    const currentSegment = gameState.raceSegments[Math.min(gameState.currentSegmentIndex, gameState.raceSegments.length - 1)];
    const groundAngleRad = currentSegment ? currentSegment.angleRad : 0;
    // Draw cityscape and ground
    if (gameState.currentSegmentIndex < gameState.raceSegments.length || gameState.isGameOverSequence) {
        drawBackground(gameState.selectedTheme, groundAngleRad);
    }

    // 3. Draw Environmental & Particle Effects
    drawParticlesAndEffects(
        gameState,
        gameState.activeFireballs,
        gameState.ignitedObstacles,
        gameState.vanishingObstacles,
        gameState.flippingObstacles,
        groundAngleRad,
        playerY
    );

    // 4. Draw Clouds on top of the shimmered background
    drawClouds();

    // 6. Draw Game Objects (Player, Obstacles, etc.)
    if (gameState.currentSegmentIndex < gameState.raceSegments.length || gameState.isGameOverSequence) {
        drawGameObjects(gameState, currentSegment, groundAngleRad, playerY);
    }

    // 7. Draw UI Overlays
    drawUIOverlaysAndEffects(gameState, isInitialLoad, COLLISION_DURATION_MS);

    // Draw skill effects
    for (const cocktail of gameState.molotovCocktails) {
        molotovSkill.draw(cocktail, ctx);
    }
}