import { canvas, ctx } from '../dom-elements.js';
import { GROUND_Y, STICK_FIGURE_TOTAL_HEIGHT, COLLISION_DURATION_MS, JUMP_HEIGHT_RATIO, STICK_FIGURE_FIXED_X } from '../constants.js';
import { currentTheme } from '../theme.js';
import state from './state.js';
import { raceSegments } from '../ui.js';

import { drawPausedOverlay, drawTipsOverlay, drawVictoryOverlay, drawMoneyCounter, drawGameCounters, drawDaysCounter, drawCustomEventStatus, drawEnergyBar } from './drawing/overlays.js';
import { drawStickFigure } from './drawing/player.js';
import { drawSlantedGround, drawHurdle, drawObstacle, drawAccelerator, drawProximityEvent, drawClouds, drawFireSpinner, drawIncineration, drawIgnitedObstacle, initializeClouds, generateGrassBlades } from './drawing/world.js';
import { drawGroundPoundParticles, drawHoudiniParticles, drawMoonwalkParticles, drawHoverParticles, drawScrambleDust, drawDiveParticles, drawSwooshParticles, drawFlipTrail, drawCorkscrewTrail, drawFireTrail, drawShatteredObstacles, drawFirestormFlashes, drawPlayerEmbers, createFirestormFlashes, createPlayerEmbers, createGroundPoundEffect, createHoudiniPoof, createShatterEffect } from './drawing/effects.js';
import { FIREBALL_SIZE, OBSTACLE_EMOJI_Y_OFFSET } from '../constants.js';

export {
    drawPausedOverlay,
    drawTipsOverlay,
    drawVictoryOverlay,
    drawMoneyCounter,
    drawGameCounters,
    drawDaysCounter,
    drawCustomEventStatus,
    drawEnergyBar,
    drawStickFigure,
    drawSlantedGround,
    drawHurdle,
    drawObstacle,
    drawAccelerator,
    drawProximityEvent,
    drawClouds,
    drawFireSpinner,
    drawIncineration,
    drawIgnitedObstacle,
    initializeClouds,
    generateGrassBlades,
    drawGroundPoundParticles,
    drawHoudiniParticles,
    drawMoonwalkParticles,
    drawHoverParticles,
    drawScrambleDust,
    drawDiveParticles,
    drawSwooshParticles,
    drawFlipTrail,
    drawCorkscrewTrail,
    drawFireTrail,
    drawShatteredObstacles,
    drawFirestormFlashes,
    drawPlayerEmbers,
    createFirestormFlashes,
    createPlayerEmbers,
    createGroundPoundEffect,
    createHoudiniPoof,
    createShatterEffect
};

export let isInitialLoad = true;
export function setInitialLoad(value) {
    isInitialLoad = value;
}

function drawFireballs() {
    state.activeFireballs.forEach(fireball => {
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

export function draw() {
    ctx.fillStyle = currentTheme.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGroundPoundParticles();
    drawHoudiniParticles();
    drawMoonwalkParticles();
    drawHoverParticles();
    drawScrambleDust();
    drawDiveParticles();
    drawSwooshParticles();
    drawFlipTrail();
    drawCorkscrewTrail();
    drawFireTrail();
    drawShatteredObstacles();
    drawClouds();
    drawFirestormFlashes();
    drawPlayerEmbers();
    drawFireballs(); // Draw fireballs

    let groundAngleRad = 0;
    let stickFigureGroundY = GROUND_Y;

    if (state.currentSegmentIndex < raceSegments.length || state.isGameOverSequence) {
        const currentSegment = raceSegments[Math.min(state.currentSegmentIndex, raceSegments.length - 1)];

        groundAngleRad = currentSegment.angleRad;
        drawSlantedGround(groundAngleRad);

        stickFigureGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(groundAngleRad);

        if (!state.isGameOverSequence) {
            if (currentSegment.isMilestone) {
                const hurdleDrawX = canvas.width - 100 - state.backgroundOffset;
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

            if (state.currentObstacle) {
                drawObstacle(state.currentObstacle, groundAngleRad);
            }
            if (state.currentAccelerator) {
                drawAccelerator(state.currentAccelerator, groundAngleRad);
            }

            if (state.onScreenCustomEvent) {
                drawProximityEvent(state.onScreenCustomEvent, groundAngleRad);
            }

            if (state.isAccelerating && !state.currentAccelerator) {
                const activeEvent = state.activeCustomEvents.find(e => e.type === 'ACCELERATOR' && e.isActive);
                if (activeEvent) { drawCustomEventStatus(activeEvent, groundAngleRad); }
            } else if (state.isDecelerating) {
                const activeEvent = state.activeCustomEvents.find(e => e.type === 'DECELERATOR' && e.isActive);
                if (activeEvent) { drawCustomEventStatus(activeEvent, groundAngleRad); }
            }
        }

        let stickFigureOffsetX = 0;
        let stickFigureOffsetY = 0;
        if (state.stickFigureBurst.active) {
            const p = state.stickFigureBurst.progress;
            let burstDistance = 0;

            if (p < 0.3) {
                const phaseProgress = p / 0.3;
                burstDistance = state.stickFigureBurst.maxOffset * 0.4 * Math.sin(phaseProgress * Math.PI);
            } else if (p < 0.6) {
                const phaseProgress = (p - 0.3) / 0.3;
                burstDistance = state.stickFigureBurst.maxOffset * 0.7 * Math.sin(phaseProgress * Math.PI);
            } else {
                const phaseProgress = (p - 0.6) / 0.4;
                burstDistance = state.stickFigureBurst.maxOffset * 1.0 * Math.sin(phaseProgress * Math.PI);
            }

            const burstAngleRad = 15 * (Math.PI / 180);
            stickFigureOffsetX = burstDistance * Math.cos(burstAngleRad);
            stickFigureOffsetY = -burstDistance * Math.sin(burstAngleRad);
        }
        const currentX = STICK_FIGURE_FIXED_X + stickFigureOffsetX;
        let currentY = stickFigureGroundY + stickFigureOffsetY;

        if (state.jumpState.isJumping) {
            let maxJumpHeight = 0;
            let jumpProgress = state.jumpState.progress;

            if (state.manualJumpOverride.isActive) {
                maxJumpHeight = state.manualJumpHeight;
            } else {
                maxJumpHeight = currentSegment.hurdleHeight * JUMP_HEIGHT_RATIO;
            }

            const jumpOffset = -4 * maxJumpHeight * (jumpProgress - jumpProgress * jumpProgress);
            currentY += jumpOffset;
        }

        drawStickFigure(currentX, currentY, state.jumpState, groundAngleRad);
        drawFireSpinner(currentX, currentY);

        // Visual indicator for Fire Mage mode
        if (state.isFireMageActive) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(currentX, currentY - STICK_FIGURE_TOTAL_HEIGHT / 2, STICK_FIGURE_TOTAL_HEIGHT * 0.8, 0, Math.PI * 2, false);
            ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
            ctx.shadowColor = 'orange';
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.restore();
        }

        state.incineratingObstacles.forEach(obstacle => {
            drawIncineration(obstacle, groundAngleRad);
        });

        state.ignitedObstacles.forEach(obstacle => {
            drawIgnitedObstacle(obstacle, groundAngleRad);
        });

        state.vanishingObstacles.forEach(obstacle => {
            drawVanishingObstacle(obstacle, groundAngleRad);
        });

        for (let i = state.activeCashBags.length - 1; i >= 0; i--) {
            const bag = state.activeCashBags[i];
            if (bag.isDone) {
                state.activeCashBags.splice(i, 1);
            } else {
                // drawCashBagEmoji(bag.currentX, bag.currentY, bag.opacity);
            }
        }

        drawMoneyCounter();
        drawGameCounters();
        drawEnergyBar();

        if (state.daysCounter) { drawDaysCounter(); }

        if (state.isColliding && state.collisionDuration > 0) {
            const fadeProgress = state.collisionDuration / COLLISION_DURATION_MS;
            ctx.save();
            ctx.fillStyle = `rgba(255, 0, 0, ${fadeProgress * 0.4})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }

        if (state.screenFlash.opacity > 0) {
            ctx.save();
            ctx.fillStyle = `rgba(255, 165, 0, ${state.screenFlash.opacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    }

    if (!state.gameRunning && isInitialLoad) {
        drawTipsOverlay();
    }

    if (state.isPaused) {
        drawPausedOverlay();
    }

    if (state.currentSegmentIndex >= raceSegments.length && !state.isGameOverSequence) {
        return;
    }
}