import { canvas, ctx } from '../../dom-elements.js';
import { GROUND_Y, OBSTACLE_EMOJI_Y_OFFSET, FIREBALL_SIZE, STICK_FIGURE_FIXED_X, JUMP_HEIGHT_RATIO, STICK_FIGURE_TOTAL_HEIGHT, COLLISION_DURATION_MS } from '../../constants.js';
import { drawCityscape, drawThemeAnchor } from './environmental-effects.js';
import { drawSlantedGround, drawHurdle, drawObstacle, drawAccelerator, drawProximityEvent, drawIncineration, drawIgnitedObstacle, drawFlipAndCrumble } from './world.js';
import { drawGroundPoundParticles, drawHoudiniParticles, drawMoonwalkParticles, drawHoverParticles, drawScrambleDust, drawDiveParticles, drawSwooshParticles, drawFlipTrail, drawCorkscrewTrail, drawFireTrail, drawShatteredObstacles, createFireExplosion, drawJetstreamParticles, drawAshParticles, drawFireShield, drawShotgunBlast, drawPhoenixSparks, createPhoenixSparks, drawImpactSparks, drawFireWallShatterEffect, createFireWallShatterEffect, drawEchoSlamParticles } from './effects.js';
import { drawEnvironmentalEffects } from './environmental-effects.js';
import { drawStickFigure, drawHourglassCooldown } from './player.js';
import { drawCustomEventStatus, drawMoneyCounter, drawGameCounters, drawEnergyBar, drawDaysCounter, drawTipsOverlay, drawPausedOverlay, drawCashBags, drawDailyChallengeCompletedOverlay, drawBonusHaul, drawCooldownIndicator, drawActiveSkillIndicator, drawCashMultiplierIndicator } from './overlays.js';
import { fireSpinnerSkill } from '../skills/fireSpinner.js';
import { firestormSkill } from '../skills/firestorm.js';
import { fieryGroundPoundSkill } from '../skills/fieryGroundPound.js';
import { fireMageSkill } from '../skills/fireMage.js';
import { mageSpinnerSkill } from '../skills/mageSpinner.js';
import { fireballRollSkill } from '../skills/fireballRoll.js';
import { sixShooterPistolSkill } from '../skills/sixShooterPistol.js';
import { fireAxeSkill } from '../skills/fireAxe.js';
import { tarzanSkill } from '../skills/tarzan.js';
import { reaperDroneSkill } from '../skills/reaperDrone.js';

export function clearCanvas(skyColor) {
    ctx.fillStyle = skyColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function drawBackgroundElements(theme) {
    drawThemeAnchor();
}

export function drawBackground(theme, groundAngleRad) {
    if (theme === 'roadway') {
        drawCityscape();
    }
    drawSlantedGround(groundAngleRad);
}

export function drawParticlesAndEffects(gameState, activeFireballs, ignitedObstacles, vanishingObstacles, flippingObstacles, groundAngleRad, playerY) {
    drawEnvironmentalEffects();
    drawGroundPoundParticles();
    drawHoudiniParticles();
    drawShotgunBlast();
    drawPhoenixSparks();
    drawFireWallShatterEffect();
    drawEchoSlamParticles();

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

function drawActiveSkills(ctx, gameState, currentX, currentY) {
    fireSpinnerSkill.draw(ctx, gameState, currentX, currentY);
    fieryGroundPoundSkill.draw(ctx, gameState, currentX, currentY);
    fireMageSkill.draw(ctx, gameState, currentX, currentY);
    mageSpinnerSkill.draw(ctx, gameState, currentX, currentY);
    fireballRollSkill.draw(ctx, gameState, currentX, currentY);
    fireAxeSkill.draw(ctx, gameState);
    tarzanSkill.draw(ctx, gameState);
    reaperDroneSkill.draw(ctx, gameState);
    firestormSkill.draw(ctx, gameState, currentY);
    sixShooterPistolSkill.draw(ctx, gameState);
}

export function drawGameObjects(gameState, currentSegment, groundAngleRad, playerY) {
    const stickFigureGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(groundAngleRad);

    if (!gameState.isGameOverSequence) {
        if (currentSegment.isMilestone) {
            const hurdleDrawX = canvas.width - 100 - gameState.backgroundOffset;
            const distanceToHurdle = hurdleDrawX - STICK_FIGURE_FIXED_X;
            const animationThreshold = 300;
            const previousState = currentSegment.animationState;
            const isFinalHurdle = gameState.currentSegmentIndex === gameState.raceSegments.length - 1;

            if (distanceToHurdle < animationThreshold && distanceToHurdle > 0) {
                currentSegment.animationState = 'approaching';
                currentSegment.animationProgress = 1 - (distanceToHurdle / animationThreshold);
            } else if (distanceToHurdle <= 0) {
                if (previousState !== 'cleared') {
                    currentSegment.animationProgress = 0;
                    if (isFinalHurdle) {
                        const groundAtHurdleY = GROUND_Y - hurdleDrawX * Math.tan(groundAngleRad);
                        if (gameState.isDailyChallengeActive) {
                            createFireWallShatterEffect(hurdleDrawX, groundAtHurdleY);
                        } else {
                            createPhoenixSparks(hurdleDrawX, groundAtHurdleY - currentSegment.hurdleHeight - 40);
                        }
                    }
                }
                currentSegment.animationState = 'cleared';
                currentSegment.animationProgress = Math.min(1, currentSegment.animationProgress + 0.015);
            } else {
                currentSegment.animationState = 'idle';
                currentSegment.animationProgress = 0;
            }
            drawHurdle(currentSegment, isFinalHurdle);
        } else {
             const isFinalHurdle = gameState.currentSegmentIndex === gameState.raceSegments.length - 1;
             drawHurdle(currentSegment, isFinalHurdle);
        }

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

    if (!gameState.tarzanState.isAttached) {
        if (gameState.jumpState.isJumping) {
            let maxJumpHeightForSegment = gameState.manualJumpOverride.isActive ? gameState.manualJumpHeight : currentSegment.hurdleHeight * JUMP_HEIGHT_RATIO;
            const jumpProgress = gameState.jumpState.progress;
            const jumpOffset = -4 * maxJumpHeightForSegment * (jumpProgress - jumpProgress * jumpProgress);
            currentY += jumpOffset;
        }
        gameState.stickFigureY = currentY; // Update the global state with the new Y position
    }


    // Centralized skill drawing
    drawActiveSkills(ctx, gameState, currentX, currentY);
    drawHourglassCooldown(ctx, gameState); // Draw hourglass cooldown for active skill

    if (!gameState.jumpState.isFireballRolling && !gameState.tarzanState.isAttached) {
        drawStickFigure(currentX, currentY, gameState.jumpState, currentSegment.angleRad);
    }



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
    drawActiveSkillIndicator();
    drawCashBags(); // Draw the animating cash bags
    drawMoneyCounter();
    drawBonusHaul();
    drawGameCounters();
    drawEnergyBar();
    drawCooldownIndicator();
    drawCashMultiplierIndicator(); // Phase 2C: Draw cash multiplier HUD
    if (gameState.daysCounter) drawDaysCounter();
    drawImpactSparks();

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
    drawDailyChallengeCompletedOverlay();
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
