import { canvas, ctx, header, controlPanel, mainElement } from '../dom-elements.js';
import {
    VICTORY_DISPLAY_TIME,
    HURDLE_FIXED_START_DISTANCE,
    AUTO_JUMP_START_PROGRESS,
    AUTO_JUMP_DURATION,
    OBSTACLE_SPAWN_X,
    OBSTACLE_WIDTH,
    OBSTACLE_BASE_VELOCITY_PX_MS,
    EVENT_PROXIMITY_VISUAL_STEPS,
    MIN_VISUAL_DURATION_MS,
    MAX_VISUAL_DURATION_MS,
    CASH_BAG_ANIMATION_DURATION,
    COUNTER_TARGET_X,
    COUNTER_TARGET_Y,
    ACCELERATOR_DURATION_MS,
    ACCELERATOR_BASE_SPEED_BOOST,
    DECELERATOR_DURATION_MS,
    DECELERATOR_BASE_SPEED_DEBUFF,
    COLLISION_DURATION_MS,
    GROUND_Y,
    STICK_FIGURE_TOTAL_HEIGHT,
    OBSTACLE_EMOJI_Y_OFFSET,
    OBSTACLE_HEIGHT,
    JUMP_HEIGHT_RATIO,
    STICK_FIGURE_FIXED_X,
    ACCELERATOR_EMOJI,
    EMOJI_MUSIC_MAP,
    DEFAULT_MUSIC_URL
} from '../constants.js';
import { isMuted, backgroundMusic, chaChingSynth, collisionSynth, debuffSynth, initializeMusicPlayer, playChaChing, playCollisionSound, playDebuffSound, playQuackSound, playPowerUpSound, playWinnerSound, playLoserSound, preloadEndgameSounds } from '../audio.js';
import { financialMilestones, raceSegments, customEvents, stickFigureEmoji, obstacleEmoji, obstacleFrequencyPercent, currentSkillLevel, intendedSpeedMultiplier, applySkillLevelSettings, showResultsScreen, hideResultsScreen, updateControlPanelState, displayHighScores, enableRandomPowerUps, isAutoHurdleDisabled, selectedPersona, exitFullScreenIfActive } from '../ui.js';
import { currentTheme } from '../theme.js';
import { personas } from '../personas.js';
import state, { HIGH_SCORE_KEY } from './state.js';
import * as drawing from './drawing.js';

function updateHighScore() {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORE_KEY)) || {};
    const currentScore = {
        days: Math.round(state.daysElapsedTotal),
        hits: state.hitsCounter,
        emoji: stickFigureEmoji,
        speed: intendedSpeedMultiplier
    };

    const existingScore = highScores[currentSkillLevel];

    if (!existingScore || currentScore.hits < existingScore.hits || (currentScore.hits === existingScore.hits && currentScore.days < existingScore.days)) {
        highScores[currentSkillLevel] = currentScore;
        localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(highScores));
        console.log(`-> updateHighScore: New high score for ${currentSkillLevel} saved!`);
        displayHighScores(); // Update the UI immediately
    }
}

function spawnObstacle() {
    state.currentObstacle = {
        x: OBSTACLE_SPAWN_X,
        emoji: obstacleEmoji,
        spawnTime: Date.now(),
        hasBeenHit: false
    };
    console.log(`-> spawnObstacle: New obstacle spawned.`);
}

function spawnAccelerator() {
    state.currentAccelerator = {
        x: OBSTACLE_SPAWN_X,
        emoji: ACCELERATOR_EMOJI,
        spawnTime: Date.now(),
        hasBeenCollected: false
    };
    console.log(`-> spawnAccelerator: New accelerator spawned.`);
}

function spawnProximityEvent(eventData) {
    state.onScreenCustomEvent = {
        ...eventData,
        x: OBSTACLE_SPAWN_X,
        spawnTime: Date.now(),
        hasBeenCollected: false
    };
    const originalEvent = state.activeCustomEvents.find(e => e.daysSinceStart === eventData.daysSinceStart);
    if (originalEvent) {
        originalEvent.wasSpawned = true;
    }
    console.log(`-> spawnProximityEvent: New ${eventData.type} event spawned by proximity.`);
}

function checkCollision(runnerY, angleRad) {
    if (!state.currentObstacle || state.currentObstacle.hasBeenHit || state.isColliding) return false;

    const obstacleX = state.currentObstacle.x;
    const runnerX = STICK_FIGURE_FIXED_X;

    const groundAtObstacleY = GROUND_Y - obstacleX * Math.tan(angleRad);
    const runnerBottomY = runnerY + STICK_FIGURE_TOTAL_HEIGHT;
    const obstacleTopY = groundAtObstacleY + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    const horizontalDistance = Math.abs(obstacleX - runnerX);
    if (horizontalDistance > state.COLLISION_RANGE_X) return false;

    const minClearanceY = obstacleTopY - STICK_FIGURE_TOTAL_HEIGHT + 5;

    const runnerIsJumpingClear = state.jumpState.isJumping && (runnerY < minClearanceY);

    if (horizontalDistance < state.COLLISION_RANGE_X) {
        const collisionTolerance = 5;
        if (!runnerIsJumpingClear && (runnerBottomY >= obstacleTopY - collisionTolerance)) {
            return true;
        }
    }
    return false;
}

function checkAcceleratorCollision(runnerY, angleRad) {
    if (!state.currentAccelerator || state.currentAccelerator.hasBeenCollected || state.isAccelerating) return false;

    const accelX = state.currentAccelerator.x;
    const runnerX = STICK_FIGURE_FIXED_X;

    const COLLECTION_RANGE_X = state.COLLISION_RANGE_X + 10;
    const horizontalDistance = Math.abs(accelX - runnerX);
    if (horizontalDistance > COLLECTION_RANGE_X) return false;

    const groundAtAccelY = GROUND_Y - accelX * Math.tan(angleRad);
    const runnerBottomY = runnerY + STICK_FIGURE_TOTAL_HEIGHT;
    const accelTopY = groundAtAccelY + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    if (horizontalDistance < COLLECTION_RANGE_X) {
        if (runnerBottomY >= accelTopY) {
            state.currentAccelerator.hasBeenCollected = true;
            return true;
        }
    }
    return false;
}

function checkProximityEventCollection(runnerY, angleRad) {
    if (!state.onScreenCustomEvent || state.onScreenCustomEvent.hasBeenCollected) return false;

    const eventX = state.onScreenCustomEvent.x;
    const runnerX = STICK_FIGURE_FIXED_X;

    const COLLECTION_RANGE_X = state.COLLISION_RANGE_X + 10;
    const horizontalDistance = Math.abs(eventX - runnerX);
    if (horizontalDistance > COLLECTION_RANGE_X) return false;

    const groundAtEventY = GROUND_Y - eventX * Math.tan(angleRad);
    const runnerBottomY = runnerY + STICK_FIGURE_TOTAL_HEIGHT;
    const eventTopY = groundAtEventY + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    if (horizontalDistance < COLLECTION_RANGE_X) {
        if (runnerBottomY >= eventTopY) {
            state.onScreenCustomEvent.hasBeenCollected = true;
            return true;
        }
    }
    return false;
}

function applySpeedEffect(type) {
    if (state.isColliding) {
        console.log(`-> SPEED EFFECT BLOCKED: ${type} blocked by active collision.`);
        return;
    }

    if (state.isAccelerating) {
        state.isAccelerating = false;
        state.accelerationDuration = 0;
        state.activeCustomEvents.forEach(e => { if (e.type === 'ACCELERATOR') e.isActive = false; });
    }
    if (state.isDecelerating) {
        state.isDecelerating = false;
        state.decelerationDuration = 0;
        state.activeCustomEvents.forEach(e => { if (e.type === 'DECELERATOR') e.isActive = false; });
    }

    if (type === 'ACCELERATOR') {
        state.isAccelerating = true;
        state.accelerationDuration = ACCELERATOR_DURATION_MS;
        state.gameSpeedMultiplier = intendedSpeedMultiplier * ACCELERATOR_BASE_SPEED_BOOST;
        playChaChing();
        state.screenFlash = { opacity: 0.7, duration: 200, startTime: performance.now() };
        console.info("-> APPLY SPEED: Accelerator (2x) applied!");
    } else if (type === 'DECELERATOR') {
        state.isDecelerating = true;
        state.decelerationDuration = DECELERATOR_DURATION_MS;
        state.gameSpeedMultiplier = intendedSpeedMultiplier * DECELERATOR_BASE_SPEED_DEBUFF;
        playDebuffSound();
        console.warn("-> APPLY SPEED: Decelerator (0.5x) applied!");
    }
}

export function togglePauseGame() {
    if (!state.gameRunning) return;
    state.isPaused = !state.isPaused;
    const startButton = document.getElementById('startButton');
    if (state.isPaused) {
        Tone.Transport.pause();
        startButton.textContent = "Unpause";
        console.log("-> GAME PAUSED");
    } else {
        Tone.Transport.start();
        startButton.textContent = "Pause";
        console.log("-> GAME RESUMED");
        state.lastTime = performance.now();
    }
    updateControlPanelState(state.gameRunning, state.isPaused);
    drawing.draw();
}

export function animate(timestamp) {
    if (!state.gameRunning && !state.isGameOverSequence) return;

    if (state.isPaused) {
        requestAnimationFrame(animate);
        return;
    }

    if (!state.lastTime) {
        state.lastTime = timestamp;
        console.log(`-- ANIME START -- Segment ${state.currentSegmentIndex} initialized.`);
        requestAnimationFrame(animate);
        return;
    }

    let deltaTime = timestamp - state.lastTime;

    if (state.currentSegmentIndex >= raceSegments.length) {
        if (!state.isGameOverSequence) {
            state.isVictory = (state.hitsCounter === 0);
            if (state.isVictory) {
                playWinnerSound();
            } else {
                playLoserSound();
            }
            state.isGameOverSequence = true;
            state.gameOverSequenceStartTime = timestamp;
            console.log(`-> GAME OVER: Starting sequence. Victory: ${state.isVictory}`);
            state.gameRunning = false;
            updateHighScore();
        }

        drawing.draw();
        drawing.drawVictoryOverlay(timestamp - state.gameOverSequenceStartTime);

        if (timestamp - state.gameOverSequenceStartTime >= VICTORY_DISPLAY_TIME) {
            stopGame(false);
            state.isGameOverSequence = false;
            return;
        }

        state.lastTime = timestamp;
        requestAnimationFrame(animate);
        return;
    }

    const currentHurdle = raceSegments[state.currentSegmentIndex];
    const targetSegmentDuration = currentHurdle.visualDurationMs / intendedSpeedMultiplier;

    if (state.manualJumpOverride.isActive) {
        const elapsed = Date.now() - state.manualJumpOverride.startTime;
        state.jumpState.progress = elapsed / state.manualJumpOverride.duration;

        if (state.jumpState.progress >= 1) {
            state.jumpState.isJumping = false;
            state.manualJumpOverride.isActive = false;
            state.jumpState.progress = 0;
        }
    } else {
        if (!isAutoHurdleDisabled && state.segmentProgress >= AUTO_JUMP_START_PROGRESS && state.segmentProgress <= AUTO_JUMP_START_PROGRESS + AUTO_JUMP_DURATION) {
            state.jumpState.isJumping = true;
            state.jumpState.progress = (state.segmentProgress - AUTO_JUMP_START_PROGRESS) / AUTO_JUMP_DURATION;
        } else {
            state.jumpState.isJumping = false;
            state.jumpState.progress = 0;
        }
    }

    state.segmentProgress += deltaTime / targetSegmentDuration;
    state.backgroundOffset = (HURDLE_FIXED_START_DISTANCE) * state.segmentProgress;

    const totalDaysForCurrentSegment = currentHurdle.durationDays;
    const progressInDays = totalDaysForCurrentSegment * Math.min(1, state.segmentProgress);
    state.daysElapsedTotal = state.daysAccumulatedAtSegmentStart + progressInDays;

    const daysCheck = state.daysElapsedTotal;

    if (!state.onScreenCustomEvent) {
        const nextEventToTrigger = state.activeCustomEvents.find(event => !event.wasTriggered && !event.wasSpawned);
        if (nextEventToTrigger) {
            const daysPerCanvas = totalDaysForCurrentSegment;
            const proximityDays = daysPerCanvas * (EVENT_PROXIMITY_VISUAL_STEPS * (MIN_VISUAL_DURATION_MS/MAX_VISUAL_DURATION_MS));

            if (nextEventToTrigger.daysSinceStart <= daysCheck + proximityDays) {
                spawnProximityEvent(nextEventToTrigger);
            }
        }
    }

    state.activeCustomEvents.forEach(event => {
        if (!event.wasTriggered && daysCheck >= event.daysSinceStart) {
            if (!state.onScreenCustomEvent || state.onScreenCustomEvent.daysSinceStart !== event.daysSinceStart) {
                console.info(`-> CUSTOM EVENT AUTO-TRIGGERED: Date: ${event.date}. Object missed or spawned late. Applying effect directly.`);
                event.wasTriggered = true;
                event.isActive = true;
                applySpeedEffect(event.type);
            }
        }
    });

    const stickFigureGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(currentHurdle.angleRad);
    let runnerY = stickFigureGroundY - STICK_FIGURE_TOTAL_HEIGHT;

    if (state.jumpState.isJumping) {
        let maxJumpHeightForSegment = state.manualJumpOverride.isActive ? state.manualJumpHeight : currentHurdle.hurdleHeight * JUMP_HEIGHT_RATIO;
        const jumpProgress = state.jumpState.progress;
        const jumpOffset = -4 * maxJumpHeightForSegment * (jumpProgress - jumpProgress * jumpProgress);
        runnerY += jumpOffset;
    }

    if (state.frameCount % 60 === 0) {
        if (!state.currentObstacle && !state.currentAccelerator && !state.onScreenCustomEvent) {
            const randomRoll = Math.random() * 100;
            let effectiveAcceleratorFrequency = enableRandomPowerUps ? state.acceleratorFrequencyPercent : 0;

            if (randomRoll < obstacleFrequencyPercent) {
                spawnObstacle();
            } else if (randomRoll < obstacleFrequencyPercent + effectiveAcceleratorFrequency) {
                spawnAccelerator();
            }
        }
    }

    const angleRad = currentHurdle.angleRad;
    const objectMovementDelta = deltaTime * OBSTACLE_BASE_VELOCITY_PX_MS * state.gameSpeedMultiplier;

    if (state.currentObstacle) {
        state.currentObstacle.x -= objectMovementDelta;
        if (checkCollision(runnerY, angleRad)) {
            if (!state.isColliding) {
                state.hitsCounter++;
                state.isColliding = true;
                state.collisionDuration = COLLISION_DURATION_MS;
                playCollisionSound();
                playQuackSound();
                console.warn(`-> COLLISION: Hit obstacle! Total hits: ${state.hitsCounter}. Speed penalty applied.`);
            }
            state.currentObstacle.hasBeenHit = true;
            state.isAccelerating = false;
            state.accelerationDuration = 0;
            state.isDecelerating = false;
            state.decelerationDuration = 0;
            state.activeCustomEvents.forEach(e => e.isActive = false);
        }
        if (state.currentObstacle.x < -OBSTACLE_WIDTH) {
            state.currentObstacle = null;
        }
    }

    if (state.currentAccelerator) {
        state.currentAccelerator.x -= objectMovementDelta;

        if (checkAcceleratorCollision(runnerY, angleRad)) {
            if (!state.isAccelerating && !state.isDecelerating) {
                state.stickFigureBurst = { ...state.stickFigureBurst, active: true, startTime: timestamp, progress: 0 };
                applySpeedEffect('ACCELERATOR');
                playPowerUpSound();
            }
        }
        if (state.currentAccelerator.x < -OBSTACLE_WIDTH) {
            state.currentAccelerator = null;
        }
    }

    if (state.onScreenCustomEvent) {
        state.onScreenCustomEvent.x -= objectMovementDelta;

        if (checkProximityEventCollection(runnerY, angleRad)) {
            if (!state.isAccelerating && !state.isDecelerating) {
                if (state.onScreenCustomEvent.type === 'ACCELERATOR') {
                    state.stickFigureBurst = { ...state.stickFigureBurst, active: true, startTime: timestamp, progress: 0 };
                }
                applySpeedEffect(state.onScreenCustomEvent.type);
            }
            const originalEvent = state.activeCustomEvents.find(e => e.daysSinceStart === state.onScreenCustomEvent.daysSinceStart);
            if (originalEvent) {
                originalEvent.wasTriggered = true;
                originalEvent.isActive = true;
            }
        }
        if (state.onScreenCustomEvent.x < -OBSTACLE_WIDTH) {
            state.onScreenCustomEvent = null;
        }
    }

    // Update screen flash
    if (state.screenFlash.opacity > 0) {
        const elapsed = timestamp - state.screenFlash.startTime;
        if (elapsed > state.screenFlash.duration) {
            state.screenFlash.opacity = 0;
        } else {
            state.screenFlash.opacity = (1 - elapsed / state.screenFlash.duration) * 0.7;
        }
    }

    // Update stick figure burst animation
    if (state.stickFigureBurst.active) {
        const elapsed = timestamp - state.stickFigureBurst.startTime;
        if (elapsed >= state.stickFigureBurst.duration) {
            state.stickFigureBurst.active = false;
            state.stickFigureBurst.progress = 0;
        } else {
            state.stickFigureBurst.progress = elapsed / state.stickFigureBurst.duration;
        }
    }

    // Update turbo boost animation
    const turboBoostEl = document.getElementById('turbo-boost-animation');
    if (state.isAccelerating) {
        const frames = ['> ', '>>', ' >', '  '];
        const frameDuration = 100; // ms per frame
        if (timestamp - state.turboBoost.lastFrameTime > frameDuration) {
            state.turboBoost.frame = (state.turboBoost.frame + 1) % frames.length;
            state.turboBoost.lastFrameTime = timestamp;
        }
        turboBoostEl.textContent = frames[state.turboBoost.frame];
        turboBoostEl.style.opacity = '1';
    } else {
        turboBoostEl.style.opacity = '0';
    }

    if (state.isColliding) {
        state.collisionDuration -= deltaTime;
        if (state.collisionDuration <= 0) {
            state.isColliding = false;
            state.collisionDuration = 0;
            state.gameSpeedMultiplier = intendedSpeedMultiplier;
            console.info("-> COLLISION: Penalty ended. Speed restored.");
        } else {
            state.gameSpeedMultiplier = intendedSpeedMultiplier * 0.1;
        }
    } else {
        // If not in a burst (or burst just ended), check for regular acceleration/deceleration
        if (!state.stickFigureBurst.active) {
            if (state.isDecelerating) {
                state.decelerationDuration -= deltaTime;
                state.gameSpeedMultiplier = intendedSpeedMultiplier * DECELERATOR_BASE_SPEED_DEBUFF;
                if (state.decelerationDuration <= 0) {
                    state.isDecelerating = false;
                    state.decelerationDuration = 0;
                    state.activeCustomEvents.forEach(e => { if (e.type === 'DECELERATOR') e.isActive = false; });
                    state.gameSpeedMultiplier = intendedSpeedMultiplier;
                    console.info("-> DECELERATOR: Debuff ended. Speed restored.");
                }
            } else if (state.isAccelerating) {
                state.accelerationDuration -= deltaTime;
                state.gameSpeedMultiplier = intendedSpeedMultiplier * ACCELERATOR_BASE_SPEED_BOOST;
                if (state.accelerationDuration <= 0) {
                    state.isAccelerating = false;
                    state.accelerationDuration = 0;
                    state.activeCustomEvents.forEach(e => { if (e.type === 'ACCELERATOR') e.isActive = false; });
                    state.gameSpeedMultiplier = intendedSpeedMultiplier;
                    console.info("-> ACCELERATOR: Boost ended. Speed restored.");
                }
            } else {
                state.gameSpeedMultiplier = intendedSpeedMultiplier;
            }
        }
    }

    const stickFigureGroundYForBags = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(currentHurdle.angleRad);
    const collectionY = stickFigureGroundYForBags;

    for (let i = state.activeCashBags.length - 1; i >= 0; i--) {
        const bag = state.activeCashBags[i];
        if (bag.isDone) {
            state.activeCashBags.splice(i, 1);
            continue;
        }
        bag.progress += deltaTime / CASH_BAG_ANIMATION_DURATION;
        const t = bag.progress;

        if (t < 1) {
            if (t < 0.5) {
                const hopProgress = t * 2;
                const hopHeight = 80;
                const yOffset = -4 * hopHeight * (hopProgress - hopProgress * hopProgress);
                bag.currentY = bag.y + yOffset;
                bag.currentX = bag.x;
                bag.opacity = 1.0;
            } else {
                const moveProgress = (t - 0.5) * 2;
                bag.currentX = bag.x + (COUNTER_TARGET_X - bag.x) * moveProgress;
                bag.currentY = bag.currentY + (COUNTER_TARGET_Y - bag.currentY) * moveProgress * 0.5;
                bag.opacity = 1 - Math.max(0, (t - 0.8) / 0.2);
            }
        } else {
            bag.isDone = true;
        }
    }

    if (state.segmentProgress >= 1) {
        const completedSegment = raceSegments[state.currentSegmentIndex];
        console.log(`-> SEGMENT COMPLETE: Reached Milestone ${state.currentSegmentIndex}. Value: $${completedSegment.milestoneValue.toLocaleString()}`);

        state.daysCounter = {
            days: completedSegment.durationDays,
            delta: completedSegment.durationDelta,
            frame: 0
        };

        if (state.currentSegmentIndex > 0) {
            state.accumulatedCash = completedSegment.milestoneValue;
            state.activeCashBags.push({ x: STICK_FIGURE_FIXED_X, y: collectionY, currentX: STICK_FIGURE_FIXED_X, currentY: collectionY, opacity: 1.0, progress: 0, isDone: false });
            playChaChing();
        }

        state.daysAccumulatedAtSegmentStart += completedSegment.durationDays;

        state.currentSegmentIndex++;
        state.segmentProgress = 0;
        state.backgroundOffset = 0;

        state.isAccelerating = false;
        state.accelerationDuration = 0;
        state.isColliding = false;
        state.collisionDuration = 0;
        state.isDecelerating = false;
        state.decelerationDuration = 0;
        state.activeCustomEvents.forEach(e => e.isActive = false);
        state.gameSpeedMultiplier = intendedSpeedMultiplier;

        state.currentObstacle = null;
        state.currentAccelerator = null;
        state.onScreenCustomEvent = null;

        if (state.currentSegmentIndex === raceSegments.length - 1) {
            preloadEndgameSounds();
        }

        if (state.currentSegmentIndex < raceSegments.length) {
            console.log(`-> NEW SEGMENT START: Index ${state.currentSegmentIndex}. Visual Duration: ${raceSegments[state.currentSegmentIndex].visualDurationMs.toFixed(0)}ms`);
        }
    }

    if (state.jumpState.isHurdle) {
        state.jumpState.hurdleDuration -= deltaTime;
        if (state.jumpState.hurdleDuration <= 0) {
            state.jumpState.isHurdle = false;
        }
    }

    if (state.jumpState.isSpecialMove) {
        state.jumpState.specialMoveDuration -= deltaTime;
        if (state.jumpState.specialMoveDuration <= 0) {
            state.jumpState.isSpecialMove = false;
        }
    }
    if (state.jumpState.isPowerStomp) {
        state.jumpState.powerStompDuration -= deltaTime;
        if (state.jumpState.powerStompDuration <= 0) {
            state.jumpState.isPowerStomp = false;
        }
    }
    if (state.jumpState.isDive) {
        state.jumpState.diveDuration -= deltaTime;
        if (state.jumpState.diveDuration <= 0) {
            state.jumpState.isDive = false;
        }
    }
    if (state.jumpState.isCorkscrewSpin) {
        state.jumpState.corkscrewSpinDuration -= deltaTime;
        if (state.jumpState.corkscrewSpinDuration <= 0) {
            state.jumpState.isCorkscrewSpin = false;
        }
    }
    if (state.jumpState.isScissorKick) {
        state.jumpState.scissorKickDuration -= deltaTime;
        if (state.jumpState.scissorKickDuration <= 0) {
            state.jumpState.isScissorKick = false;
        }
    }
    if (state.jumpState.isPhaseDash) {
        state.jumpState.phaseDashDuration -= deltaTime;
        if (state.jumpState.phaseDashDuration <= 0) {
            state.jumpState.isPhaseDash = false;
        }
    }
    if (state.jumpState.isHover) {
        state.jumpState.hoverDuration -= deltaTime;
        if (state.jumpState.hoverDuration <= 0) {
            state.jumpState.isHover = false;
        }
    }
    if (state.jumpState.isGroundPound) {
        state.jumpState.groundPoundDuration -= deltaTime;
        // Check if the pound is about to hit the ground and the effect hasn't been triggered yet
        if (state.jumpState.groundPoundDuration < 100 && !state.jumpState.groundPoundEffectTriggered) {
            const groundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(raceSegments[state.currentSegmentIndex].angleRad);
            drawing.createGroundPoundEffect(STICK_FIGURE_FIXED_X, groundY);
            state.jumpState.groundPoundEffectTriggered = true;
        }
        if (state.jumpState.groundPoundDuration <= 0) {
            state.jumpState.isGroundPound = false;
        }
    }
    if (state.jumpState.isCartoonScramble) {
        state.jumpState.cartoonScrambleDuration -= deltaTime;
        if (state.jumpState.cartoonScrambleDuration <= 0) {
            state.jumpState.isCartoonScramble = false;
        }
    }
    if (state.jumpState.isMoonwalking) {
        state.jumpState.moonwalkDuration -= deltaTime;
        if (state.jumpState.moonwalkDuration <= 0) {
            state.jumpState.isMoonwalking = false;
        }
    }
    if (state.jumpState.isShockwave) {
        state.jumpState.shockwaveDuration -= deltaTime;
        if (state.jumpState.shockwaveDuration <= 0) {
            state.jumpState.isShockwave = false;
        }
    }
    if (state.jumpState.isBackflip) {
        state.jumpState.backflipDuration -= deltaTime;
        if (state.jumpState.backflipDuration <= 0) {
            state.jumpState.isBackflip = false;
        }
    }
    if (state.jumpState.isFrontflip) {
        state.jumpState.frontflipDuration -= deltaTime;
        if (state.jumpState.frontflipDuration <= 0) {
            state.jumpState.isFrontflip = false;
        }
    }
    if (state.jumpState.isHoudini) {
        const previousPhase = state.jumpState.houdiniPhase;
        state.jumpState.houdiniDuration -= deltaTime;

        if (state.jumpState.houdiniDuration <= 400) {
            state.jumpState.houdiniPhase = 'reappearing';
            if (previousPhase === 'disappearing') {
                // Trigger the reappearing poof once
                const playerY = GROUND_Y - state.jumpState.progress * 200; // Approximate player Y
                drawing.createHoudiniPoof(STICK_FIGURE_FIXED_X, playerY - 50);
            }
        }
        if (state.jumpState.houdiniDuration <= 0) {
            state.jumpState.isHoudini = false;
        }
    }

    state.frameCount++;

    state.lastTime = timestamp;
    drawing.draw();
    requestAnimationFrame(animate);
}

export function resetGameState() {
    console.log("-> RESET GAME: Initiated.");
    state.gameRunning = false;
    state.isPaused = false;
    state.currentSegmentIndex = 0;
    state.segmentProgress = 0;
    state.lastTime = 0;
    state.backgroundOffset = 0;
    state.frameCount = 0;
    state.accumulatedCash = raceSegments.length > 0 ? raceSegments[0].milestoneValue : 0;
    state.activeCashBags.length = 0;
    state.fireTrail = [];
    state.houdiniParticles = [];
    state.groundPoundParticles = [];
    state.flipTrail = [];
    state.moonwalkParticles = [];
    state.hoverParticles = [];
    state.scrambleParticles = [];
    state.diveParticles = [];
    state.swooshParticles = [];
    state.flipTrail = [];
    state.corkscrewTrail = [];
    state.manualJumpOverride = { isActive: false, startTime: 0, duration: state.manualJumpDurationMs };
    state.jumpState = {
        isJumping: false, progress: 0,
        isHurdle: false, hurdleDuration: 0,
        isSpecialMove: false, specialMoveDuration: 0,
        isPowerStomp: false, powerStompDuration: 0,
        isDive: false, diveDuration: 0,
        isCorkscrewSpin: false, corkscrewSpinDuration: 0,
        isScissorKick: false, scissorKickDuration: 0,
        isPhaseDash: false, phaseDashDuration: 0,
        isHover: false, hoverDuration: 0,
        isGroundPound: false, groundPoundDuration: 0, groundPoundEffectTriggered: false,
        isCartoonScramble: false, cartoonScrambleDuration: 0,
        isMoonwalking: false, moonwalkDuration: 0,
        isShockwave: false, shockwaveDuration: 0,
        isBackflip: false, backflipDuration: 0,
        isFrontflip: false, frontflipDuration: 0,
        isHoudini: false, houdiniDuration: 0, houdiniPhase: 'disappearing'
    };
    state.currentObstacle = null;
    state.isColliding = false;
    state.collisionDuration = 0;
    state.currentAccelerator = null;
    state.isAccelerating = false;
    state.accelerationDuration = 0;
    state.isDecelerating = false;
    state.decelerationDuration = 0;
    state.gameSpeedMultiplier = intendedSpeedMultiplier;

    state.activeCustomEvents = Object.values(customEvents).flat().map(event => ({
        ...event,
        wasTriggered: false,
        isActive: false,
        wasSpawned: false
    })).sort((a, b) => a.daysSinceStart - b.daysSinceStart);
    console.log(`-> RESET GAME: Prepared ${state.activeCustomEvents.length} custom events.`);
    state.onScreenCustomEvent = null;

    // Reset hurdle animation states
    raceSegments.forEach(segment => {
        if (segment.isMilestone) {
            segment.animationState = 'idle';
            segment.animationProgress = 0;
        }
    });

    state.hitsCounter = 0;
    state.daysElapsedTotal = 0;
    state.daysAccumulatedAtSegmentStart = 0;

    state.isVictory = false;
    state.isGameOverSequence = false;
    state.gameOverSequenceStartTime = 0;

    Tone.Transport.stop();
    Tone.Transport.cancel();

    drawing.initializeClouds();
    drawing.generateGrassBlades(0); // Initialize grass blades on reset

    hideResultsScreen();
    updateControlPanelState(false, false);

    console.log("-> RESET GAME: Complete.");
}

export function startGame() {
    if (raceSegments.length < 2) {
        // dataMessage.textContent = "Error: Cannot start. Load valid data with at least two milestones."; // Handled in UI
        // dataMessage.style.color = 'red';
        console.error("-> START GAME FAILED: Insufficient milestones.");
        return;
    }
    if (state.gameRunning) return;

    console.log("-> START GAME: Initiating game start sequence.");

    drawing.setInitialLoad(false);

    applySkillLevelSettings(currentSkillLevel);

    state.gameSpeedMultiplier = intendedSpeedMultiplier;

    let musicUrl = DEFAULT_MUSIC_URL;
    if (selectedPersona && selectedPersona !== 'custom' && personas[selectedPersona]) {
        musicUrl = personas[selectedPersona].music;
    } else {
        const cleanEmoji = stickFigureEmoji.replace(/\uFE0F/g, '');
        musicUrl = EMOJI_MUSIC_MAP[cleanEmoji] || DEFAULT_MUSIC_URL;
    }
    initializeMusicPlayer(musicUrl);

    hideResultsScreen();

    if (Tone.context.state !== 'running') { Tone.start(); }
    if (!isMuted) {
        chaChingSynth.mute = false;
        collisionSynth.mute = false;
        debuffSynth.mute = false;
        Tone.loaded().then(() => {
            backgroundMusic.sync().start(0);
            Tone.Transport.start();
        });
    }

    state.currentSegmentIndex = 0;
    state.segmentProgress = 0;
    state.lastTime = 0;
    state.backgroundOffset = 0;
    state.frameCount = 0;
    state.accumulatedCash = raceSegments[0].milestoneValue;
    state.activeCashBags.length = 0;
    state.fireTrail = [];
    state.houdiniParticles = [];
    state.groundPoundParticles = [];
    state.moonwalkParticles = [];
    state.hoverParticles = [];
    state.scrambleParticles = [];
    state.diveParticles = [];
    state.swooshParticles = [];
    state.flipTrail = [];
    state.corkscrewTrail = [];
    state.jumpState = {
        isJumping: false, progress: 0,
        isHurdle: false, hurdleDuration: 0,
        isSpecialMove: false, specialMoveDuration: 0,
        isPowerStomp: false, powerStompDuration: 0,
        isDive: false, diveDuration: 0,
        isCorkscrewSpin: false, corkscrewSpinDuration: 0,
        isScissorKick: false, scissorKickDuration: 0,
        isPhaseDash: false, phaseDashDuration: 0,
        isHover: false, hoverDuration: 0,
        isGroundPound: false, groundPoundDuration: 0, groundPoundEffectTriggered: false,
        isCartoonScramble: false, cartoonScrambleDuration: 0,
        isMoonwalking: false, moonwalkDuration: 0,
        isShockwave: false, shockwaveDuration: 0,
        isBackflip: false, backflipDuration: 0,
        isFrontflip: false, frontflipDuration: 0,
        isHoudini: false, houdiniDuration: 0, houdiniPhase: 'disappearing'
    };
    state.manualJumpOverride = { isActive: false, startTime: 0, duration: state.manualJumpDurationMs };
    state.isColliding = false;
    state.collisionDuration = 0;
    state.currentObstacle = null;
    state.currentAccelerator = null;
    state.isAccelerating = false;
    state.accelerationDuration = 0;
    state.isDecelerating = false;
    state.decelerationDuration = 0;
    state.onScreenCustomEvent = null;

    state.hitsCounter = 0;
    state.daysElapsedTotal = 0;
    state.daysAccumulatedAtSegmentStart = 0;
    state.isVictory = false;
    state.isGameOverSequence = false;
    state.gameOverSequenceStartTime = 0;
    state.isPaused = false;

    state.activeCustomEvents = Object.values(customEvents).flat().map(event => ({
        ...event,
        wasTriggered: false,
        isActive: false,
        wasSpawned: false
    })).sort((a, b) => a.daysSinceStart - b.daysSinceStart);
    console.log(`-> START GAME: ${state.activeCustomEvents.length} custom events enabled.`);

    drawing.initializeClouds();
    drawing.generateGrassBlades(0); // Initialize grass blades on game start

    state.gameRunning = true;

    updateControlPanelState(true, false);

    const mobileBreakpoint = 768;
    if (window.innerWidth < mobileBreakpoint) {
        document.getElementById('gameCanvas').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // If starting in fullscreen, apply the immersive class and hide controls
    if (document.fullscreenElement) {
        document.body.classList.add('game-active-fullscreen');
        header.classList.add('hidden');
        controlPanel.classList.add('hidden');
        document.getElementById('actionButtons').classList.add('hidden');
        mainElement.classList.remove('grid', 'lg:grid-cols-3', 'gap-8');
        document.body.style.backgroundColor = '#000'; // Force black background
    }

    requestAnimationFrame(animate);
    console.log("-> START GAME: Animation loop started.");
}

export function stopGame(shouldReset = true) {
    if (!state.gameRunning && !shouldReset && !state.isGameOverSequence) return;

    console.log("-> STOP GAME: Game execution halted.");
    state.gameRunning = false;
    state.isPaused = false;

    // Always restore UI visibility on game stop
    header.classList.remove('hidden');
    controlPanel.classList.remove('hidden');
    document.getElementById('actionButtons').classList.remove('hidden');
    mainElement.classList.add('grid', 'lg:grid-cols-3', 'gap-8');
    document.body.style.backgroundColor = ''; // Reset background color
    document.body.classList.remove('game-active-fullscreen'); // Always remove immersive class on stop
    exitFullScreenIfActive(); // Exit fullscreen when the game stops

    Tone.Transport.stop();

    if (shouldReset) {
        drawing.setInitialLoad(true);
        resetGameState();
        drawing.draw();
    } else {
        showResultsScreen(financialMilestones, raceSegments);
        updateControlPanelState(false, false);
        document.getElementById('startButton').textContent = "Restart Heist!";
        console.log("-> STOP GAME: Game ended, displaying results.");
    }
}
