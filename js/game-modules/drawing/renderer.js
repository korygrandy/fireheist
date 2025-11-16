import { canvas, ctx } from '../../dom-elements.js';
import { GROUND_Y, OBSTACLE_EMOJI_Y_OFFSET, FIREBALL_SIZE, STICK_FIGURE_FIXED_X, JUMP_HEIGHT_RATIO, STICK_FIGURE_TOTAL_HEIGHT, COLLISION_DURATION_MS } from '../../constants.js';
import { drawCityscape } from './environmental-effects.js';
import { drawSlantedGround, drawHurdle, drawObstacle, drawAccelerator, drawProximityEvent, drawIncineration, drawIgnitedObstacle, drawFlipAndCrumble } from './world.js';
import { drawGroundPoundParticles, drawHoudiniParticles, drawMoonwalkParticles, drawHoverParticles, drawScrambleDust, drawDiveParticles, drawSwooshParticles, drawFlipTrail, drawCorkscrewTrail, drawFireTrail, drawShatteredObstacles, createFireExplosion, drawJetstreamParticles, drawAshParticles } from './effects.js';
import { drawEnvironmentalEffects } from './environmental-effects.js';
import { drawStickFigure, drawFireShield } from './player.js';
import { drawCustomEventStatus, drawMoneyCounter, drawGameCounters, drawEnergyBar, drawDaysCounter, drawTipsOverlay, drawPausedOverlay, drawCashBags } from './overlays.js';
import { fireSpinnerSkill } from '../skills/fireSpinner.js';
import { firestormSkill } from '../skills/firestorm.js';
import { fieryGroundPoundSkill } from '../skills/fieryGroundPound.js';
import { fireMageSkill } from '../skills/fireMage.js';
import { mageSpinnerSkill } from '../skills/mageSpinner.js';

export function clearCanvas(skyColor) {
    ctx.fillStyle = skyColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function drawBackground(theme, groundAngleRad) {
    if (theme === 'roadway') {
        drawCityscape();
    }
    drawSlantedGround(groundAngleRad);
}

export function drawParticlesAndEffects(activeFireballs, ignitedObstacles, vanishingObstacles, flippingObstacles, groundAngleRad, playerY) {
    drawEnvironmentalEffects();
    drawGroundPoundParticles();
    drawHoudiniParticles();

    drawMoonwalkParticles();
    drawHoverParticles();
    drawScrambleDust();
    drawDiveParticles();
    drawSwooshParticles();
    drawJetstreamParticles();
    drawFlipTrail();
    drawCorkscrewTrail();
    drawFireTrail();
    drawShatteredObstacles();
    drawAshParticles();
    firestormSkill.draw(ctx, gameState, playerY);
    drawFireballs(activeFireballs);

    ignitedObstacles.forEach(obstacle => drawIgnitedObstacle(obstacle, groundAngleRad));
    vanishingObstacles.forEach(obstacle => drawVanishingObstacle(obstacle, groundAngleRad));

    for (let i = flippingObstacles.length - 1; i >= 0; i--) {
        const obstacle = flippingObstacles[i];
        const elapsed = performance.now() - obstacle.startTime;
        obstacle.animationProgress = Math.min(1, elapsed / 1000);
        if (obstacle.animationProgress >= 1) flippingObstacles.splice(i, 1);
        else drawFlipAndCrumble(obstacle, groundAngleRad);
    }
}

export function drawGameObjects(gameState, currentSegment, groundAngleRad, playerY) {
    const stickFigureGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(groundAngleRad);

    if (!gameState.isGameOverSequence) {
        if (currentSegment.isMilestone) {
            const hurdleDrawX = canvas.width - 100 - gameState.backgroundOffset;
            const distanceToHurdle = hurdleDrawX - STICK_FIGURE_FIXED_X;
            const animationThreshold = 300;
            const previousState = currentSegment.animationState;

            if (distanceToHurdle < animationThreshold && distanceToHurdle > 0) {
                currentSegment.animationState = 'approaching';
                currentSegment.animationProgress = 1 - (distanceToHurdle / animationThreshold);
            } else if (distanceToHurdle <= 0) {
                if (previousState !== 'cleared') {
                    currentSegment.animationProgress = 0;
                }
                currentSegment.animationState = 'cleared';
                currentSegment.animationProgress = Math.min(1, currentSegment.animationProgress + 0.015);
            } else {
                currentSegment.animationState = 'idle';
                currentSegment.animationProgress = 0;
            }
        }
        drawHurdle(currentSegment);

        if (gameState.currentObstacle) drawObstacle(gameState.currentObstacle, groundAngleRad);
        if (gameState.currentAccelerator) drawAccelerator(gameState.currentAccelerator, groundAngleRad);
        if (gameState.onScreenCustomEvent) drawProximityEvent(gameState.onScreenCustomEvent, groundAngleRad);

        if (gameState.isAccelerating && !gameState.currentAccelerator) {
            const activeEvent = gameState.activeCustomEvents.find(e => e.type === 'ACCELERATOR' && e.isActive);
            if (activeEvent) { drawCustomEventStatus(activeEvent, groundAngleRad); }
        } else if (gameState.isDecelerating) {
            const activeEvent = gameState.activeCustomEvents.find(e => e.type === 'DECELERATOR' && e.isActive);
            if (activeEvent) { drawCustomEventStatus(activeEvent, groundAngleRad); }
        }
    }

    let stickFigureOffsetX = 0;
    let stickFigureOffsetY = 0;
    if (gameState.stickFigureBurst.active) {
        const p = gameState.stickFigureBurst.progress;
        let burstDistance = 0;

        if (p < 0.3) burstDistance = gameState.stickFigureBurst.maxOffset * 0.4 * Math.sin((p / 0.3) * Math.PI);
        else if (p < 0.6) burstDistance = gameState.stickFigureBurst.maxOffset * 0.7 * Math.sin(((p - 0.3) / 0.3) * Math.PI);
        else burstDistance = gameState.stickFigureBurst.maxOffset * 1.0 * Math.sin(((p - 0.6) / 0.4) * Math.PI);

        const burstAngleRad = 15 * (Math.PI / 180);
        stickFigureOffsetX = burstDistance * Math.cos(burstAngleRad);
        stickFigureOffsetY = -burstDistance * Math.sin(burstAngleRad);
    }
    const currentX = STICK_FIGURE_FIXED_X + stickFigureOffsetX;
    let currentY = stickFigureGroundY + stickFigureOffsetY;

    if (gameState.jumpState.isJumping) {
        const jumpProgress = gameState.jumpState.progress;
        const maxJumpHeight = gameState.manualJumpOverride.isActive ? gameState.manualJumpHeight : currentSegment.hurdleHeight * JUMP_HEIGHT_RATIO;
        const jumpOffset = -4 * maxJumpHeight * (jumpProgress - jumpProgress * jumpProgress);
        currentY += jumpOffset;
    }

    drawStickFigure(currentX, currentY, gameState.jumpState, groundAngleRad);
    if (gameState.isFireShieldActive) {
        drawFireShield(currentX, currentY);
    }
    fireSpinnerSkill.draw(ctx, gameState, currentX, currentY);
    fieryGroundPoundSkill.draw(ctx, gameState, currentX, currentY);
    fireMageSkill.draw(ctx, gameState, currentX, currentY);
    mageSpinnerSkill.draw(ctx, gameState, currentX, currentY);



    gameState.incineratingObstacles.forEach(obstacle => drawIncineration(obstacle, groundAngleRad));

    for (let i = gameState.flippingObstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.flippingObstacles[i];
        const elapsed = performance.now() - obstacle.startTime;
        obstacle.animationProgress = Math.min(1, elapsed / 1000);
        if (obstacle.animationProgress >= 1) gameState.flippingObstacles.splice(i, 1);
        else drawFlipAndCrumble(obstacle, groundAngleRad);
    }
}

export function drawUIOverlaysAndEffects(gameState, isInitialLoad, collisionDurationMs) {
    drawCashBags(); // Draw the animating cash bags
    drawMoneyCounter();
    drawGameCounters();
    drawEnergyBar();
    if (gameState.daysCounter) drawDaysCounter();

    if (gameState.isColliding && gameState.collisionDuration > 0) {
        const fadeProgress = gameState.collisionDuration / collisionDurationMs;
        ctx.save();
        ctx.fillStyle = `rgba(255, 0, 0, ${fadeProgress * 0.4})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    if (gameState.screenFlash.opacity > 0) {
        ctx.save();
        ctx.fillStyle = `rgba(255, 165, 0, ${gameState.screenFlash.opacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    if (!gameState.gameRunning && isInitialLoad) drawTipsOverlay();
    if (gameState.isPaused) drawPausedOverlay();
    if (gameState.currentSegmentIndex >= gameState.raceSegments.length && !gameState.isGameOverSequence) return;
}

export function drawFireballs(activeFireballs) {
    activeFireballs.forEach(fireball => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(fireball.x, fireball.y, fireball.size / 2, 0, Math.PI * 2, false);
        ctx.fillStyle = 'orange';
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.restore();
    });
}

export function drawVanishingObstacle(obstacle, angleRad) {
    const VANISH_DURATION = 300; // Vanish animation lasts 300ms
    const elapsed = performance.now() - obstacle.startTime;
    const progress = Math.min(1, elapsed / VANISH_DURATION);

    if (progress >= 1) return; // Animation finished

    const scale = 1 - progress;
    const opacity = 1 - progress;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(obstacle.x, GROUND_Y - obstacle.x * Math.tan(angleRad) + OBSTACLE_EMOJI_Y_OFFSET);
    ctx.scale(scale, scale);
    ctx.fillText(obstacle.emoji, 0, 0);
    ctx.restore();
}
