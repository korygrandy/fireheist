import {canvas, ctx, header, controlPanel, mainElement} from '../dom-elements.js';
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
    DEFAULT_MUSIC_URL,
    ENERGY_SETTINGS,
    ENERGY_GAIN_ACCELERATOR,
    FIRE_MAGE_COOLDOWN_MS,
    FIREBALL_SIZE,
    MAGE_SPINNER_COOLDOWN_MS,
    MAGE_SPINNER_DURATION_MS,
    MAGE_SPINNER_FIREBALL_INTERVAL_MS,
    MAGE_SPINNER_FIREBALL_COUNT,
    MAGE_SPINNER_ENERGY_COST,
    FIERY_HOUDINI_COOLDOWN_MS,
    FIERY_HOUDINI_DURATION_MS
} from '../constants.js';
import {
    isMuted,
    backgroundMusic,
    chaChingSynth,
    collisionSynth,
    debuffSynth,
    initializeMusicPlayer,
    playChaChing,
    playCollisionSound,
    playDebuffSound,
    playQuackSound,
    playPowerUpSound,
    playWinnerSound,
    playLoserSound,
    preloadEndgameSounds,
    playAnimationSound
} from '../audio.js';
import {applySkillLevelSettings} from '../ui-modules/input-handlers.js';
import {showResultsScreen, hideResultsScreen} from '../ui-modules/results.js';
import {updateControlPanelState} from '../ui-modules/ui-helpers.js';
import {displayHighScores} from '../ui-modules/high-scores.js';
import {exitFullScreenIfActive} from '../ui-modules/ui-helpers.js';
import {savePlayerStats} from '../ui-modules/settings.js';
import {checkForNewUnlocks} from '../ui-modules/unlocks.js';
import {currentTheme} from '../theme.js';
import {personas} from '../personas.js';
import state, {HIGH_SCORE_KEY} from './state.js';
import * as drawing from './drawing.js';
import {initializeUIData} from '../ui-modules/data.js';
import {displayDailyChallenge, displayDailyChallengeCompletedScreen} from '../ui-modules/daily-challenge-ui.js';
import {showSandboxControls} from '../ui-modules/ui-helpers.js';
import {markDailyChallengeAsPlayed, updateDailyChallengeWinStreak} from '../daily-challenge.js';
import {castMageSpinnerFireball} from './actions.js';
import { updateEnvironmentalEffects } from './drawing/environmental-effects.js';

function updateHighScore() {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORE_KEY)) || {};
    const currentScore = {
        days: Math.round(state.daysElapsedTotal),
        hits: state.hitsCounter,
        emoji: state.stickFigureEmoji,
        speed: state.intendedSpeedMultiplier
    };

    const existingScore = highScores[state.currentSkillLevel];

    if (!existingScore || currentScore.hits < existingScore.hits || (currentScore.hits === existingScore.hits && currentScore.days < existingScore.days)) {
        highScores[state.currentSkillLevel] = currentScore;
        localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(highScores));
        console.log(`-> updateHighScore: New high score for ${state.currentSkillLevel} saved!`);
        displayHighScores(); // Update the UI immediately
    }
}

function spawnObstacle() {
    const newObstacle = {
        x: OBSTACLE_SPAWN_X,
        emoji: state.obstacleEmoji,
        spawnTime: Date.now(),
        hasBeenHit: false
    };

    if (state.isFirestormActive) {
        const burnoutDuration = 500 + Math.random() * 1000; // Quicker burnout: 0.5 to 1.5 seconds
        newObstacle.burnoutTime = Date.now() + burnoutDuration;
        newObstacle.speedMultiplier = 1.2; // 20% faster
        state.ignitedObstacles.push(newObstacle);
        console.log("-> spawnObstacle: New obstacle spawned directly into Firestorm.");
    } else {
        state.currentObstacle = newObstacle;
        console.log(`-> spawnObstacle: New obstacle spawned.`);
    }
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
        // Priority 1: Check for active Firestorm first, as it overrides all other collision types.
        if (state.isFirestormActive) {
            state.incineratingObstacles.push({
                ...state.currentObstacle,
                animationProgress: 0,
                startTime: performance.now()
            });
            state.currentObstacle = null;
            playAnimationSound('incinerate');
            state.playerStats.obstaclesIncinerated++;
            state.playerStats.consecutiveIncinerations++;
            state.playerStats.consecutiveGroundPounds = 0; // Reset streak
            console.log("-> FIRESTORM V2: Obstacle incinerated by collision!");
            return false; // No penalty
        }

        // Priority 2: Check for destructive jump moves.
        if (state.jumpState.isFireSpinner) {
            state.incineratingObstacles.push({
                ...state.currentObstacle,
                animationProgress: 0,
                startTime: performance.now()
            });
            state.currentObstacle = null;
            playAnimationSound('fireball');
            state.playerStats.obstaclesIncinerated++;
            state.playerStats.consecutiveIncinerations++;
            if (state.playerStats.consecutiveGroundPounds > 0) {
                console.log(`[DEBUG] Streak RESET by Fire Spinner. Was: ${state.playerStats.consecutiveGroundPounds}`);
                state.playerStats.consecutiveGroundPounds = 0; // Reset streak
            }
            console.log("-> FIRE SPINNER: Obstacle incinerated!");
            return false; // No penalty
        }
        if (state.jumpState.isGroundPound && state.jumpState.progress > 0.5) { // Shatter on the way down
            drawing.createShatterEffect(state.currentObstacle.x, obstacleTopY, state.currentObstacle.emoji);
            state.currentObstacle = null;
            playAnimationSound('shatter');
            state.playerStats.obstaclesIncinerated++;
            state.playerStats.consecutiveIncinerations++;
            state.playerStats.consecutiveGroundPounds++; // Increment consecutive Ground Pounds
            state.playerStats.totalGroundPoundCollisions++;
            console.log(`[DEBUG] Streak INCREMENTED to: ${state.playerStats.consecutiveGroundPounds}`);
            checkForNewUnlocks(state.playerStats); // Check for unlocks immediately
            return false; // No penalty
        }

        // Priority 3: If no destructive moves are active, check for a standard collision.
        const collisionTolerance = 5;
        if (!runnerIsJumpingClear && (runnerBottomY >= obstacleTopY - collisionTolerance)) {
            if (state.playerStats.consecutiveGroundPounds > 0) {
                console.log(`[DEBUG] Streak RESET by standard collision. Was: ${state.playerStats.consecutiveGroundPounds}`);
                state.playerStats.consecutiveGroundPounds = 0; // Reset on standard collision
            }
            state.playerStats.consecutiveIncinerations = 0; // Reset incineration streak
            return true; // This is a standard, damaging hit.
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
        state.activeCustomEvents.forEach(e => {
            if (e.type === 'ACCELERATOR') e.isActive = false;
        });
    }
    if (state.isDecelerating) {
        state.isDecelerating = false;
        state.decelerationDuration = 0;
        state.activeCustomEvents.forEach(e => {
            if (e.type === 'DECELERATOR') e.isActive = false;
        });
    }

    if (type === 'ACCELERATOR') {
        state.isAccelerating = true;
        state.accelerationDuration = ACCELERATOR_DURATION_MS;
        state.gameSpeedMultiplier = state.intendedSpeedMultiplier * ACCELERATOR_BASE_SPEED_BOOST;
        playChaChing();
        state.screenFlash = {opacity: 0.7, duration: 200, startTime: performance.now()};
        console.info("-> APPLY SPEED: Accelerator (2x) applied!");
    } else if (type === 'DECELERATOR') {
        state.isDecelerating = true;
        state.decelerationDuration = DECELERATOR_DURATION_MS;
        state.gameSpeedMultiplier = state.intendedSpeedMultiplier * DECELERATOR_BASE_SPEED_DEBUFF;
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

    if (state.currentSegmentIndex >= state.raceSegments.length) {
        if (!state.isGameOverSequence) {
            state.isVictory = (state.hitsCounter === 0);
            if (state.isVictory) {
                playWinnerSound();
                // Track flawless run only if not using custom persona
                if (state.selectedPersona !== 'custom') {
                    if (!state.playerStats.flawlessRuns) {
                        state.playerStats.flawlessRuns = {};
                    }
                    state.playerStats.flawlessRuns[state.currentSkillLevel] = true;
                    savePlayerStats(); // Save stats on flawless victory
                } else {
                    console.log("-> GAME OVER: Flawless run not recorded for Custom Persona.");
                }
            } else {
                playLoserSound();
            }
            state.isGameOverSequence = true;
            state.gameOverSequenceStartTime = timestamp;
            console.log(`-> GAME OVER: Starting sequence. Victory: ${state.isVictory}`);
            state.gameRunning = false;
            updateHighScore();
            savePlayerStats(); // Also save stats on a regular loss
            checkForNewUnlocks(state.playerStats); // Check for new unlocks
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

    const currentHurdle = state.raceSegments[state.currentSegmentIndex];
    const angleRad = currentHurdle.angleRad;

    if (!state.lastTime) {
        state.lastTime = timestamp;
        console.log(`-- ANIME START -- Segment ${state.currentSegmentIndex} initialized.`);
        requestAnimationFrame(animate);
        return;
    }

    let deltaTime = timestamp - state.lastTime;
    if (deltaTime > 100) {
        deltaTime = 100;
    }

    updateEnvironmentalEffects(deltaTime);

    // Handle continuous energy drain for Firestorm and Fire Spinner
    if (state.isFirestormDrainingEnergy) {
        const remainingTime = state.firestormDrainEndTime - Date.now();
        if (remainingTime <= 0) {
            state.playerEnergy = 0;
            state.isFirestormDrainingEnergy = false;
        } else {
            const energyToDrain = state.playerEnergy;
            const drainRate = energyToDrain / remainingTime;
            state.playerEnergy = Math.max(0, state.playerEnergy - (drainRate * deltaTime));
        }
    } else if (state.isFireSpinnerDrainingEnergy) {
        const remainingTime = state.fireSpinnerDrainEndTime - Date.now();
        if (remainingTime <= 0) {
            state.playerEnergy = 0;
            state.isFireSpinnerDrainingEnergy = false;
        } else {
            const energyToDrain = state.playerEnergy;
            const drainRate = energyToDrain / remainingTime;
            state.playerEnergy = Math.max(0, state.playerEnergy - (drainRate * deltaTime));
        }
    } else if (state.isMageSpinnerActive) { // Mage Spinner drains energy over its duration
        const remainingTime = state.mageSpinnerEndTime - Date.now();
        if (remainingTime <= 0) {
            state.playerEnergy = 0; // Ensure energy is fully drained if skill ends
        } else {
            // Calculate drain rate to deplete energy over the skill's duration
            const energyToDrain = MAGE_SPINNER_ENERGY_COST; // Total cost of the skill
            const drainRate = energyToDrain / MAGE_SPINNER_DURATION_MS; // Energy per millisecond
            state.playerEnergy = Math.max(0, state.playerEnergy - (drainRate * deltaTime));
        }
    } else if (state.jumpState.isHover) { // Hover drains energy continuously
        const energyDrain = (ENERGY_SETTINGS.HOVER_DRAIN_RATE * deltaTime) / 1000;
        state.playerEnergy = Math.max(0, state.playerEnergy - energyDrain);
    } else {
        // Passive energy drain based on skill level
        const energyDrain = (state.passiveDrainRate * deltaTime) / 1000;
        state.playerEnergy = Math.max(0, state.playerEnergy - energyDrain);
    }

    // Check and update Fire Mage mode duration
    if (state.isFireMageActive && Date.now() > state.fireMageEndTime) {
        state.isFireMageActive = false;
        console.log("-> Fire Mage mode ended.");
    }

    // Check and update Fire Mage cooldown
    if (state.isFireMageOnCooldown) {
        const now = Date.now();
        if (now - state.fireMageLastActivationTime > FIRE_MAGE_COOLDOWN_MS) {
            state.isFireMageOnCooldown = false;
            console.log("-> Fire Mage: Cooldown finished. Ready.");
        }
    }

    // Check and update Mage Spinner mode duration
    if (state.isMageSpinnerActive) {
        const now = Date.now();
        if (now > state.mageSpinnerEndTime) {
            state.isMageSpinnerActive = false;
            console.log("-> Mage Spinner mode ended.");
        } else {
            // Handle fireball spawning during Mage Spinner active time
            state.mageSpinnerFireballTimer -= deltaTime;
            if (state.mageSpinnerFireballTimer <= 0 && state.mageSpinnerFireballsSpawned < MAGE_SPINNER_FIREBALL_COUNT) {
                // Find the closest obstacle to target
                const targetObstacle = state.currentObstacle || state.ignitedObstacles[0] || state.vanishingObstacles[0];
                if (targetObstacle) {
                    castMageSpinnerFireball(state, targetObstacle); // Pass the target obstacle
                    state.mageSpinnerFireballsSpawned++;
                    state.mageSpinnerFireballTimer = MAGE_SPINNER_FIREBALL_INTERVAL_MS; // Reset timer
                }
            }
        }
    }

    // Check and update Mage Spinner cooldown
    if (state.isMageSpinnerOnCooldown) {
        const now = Date.now();
        if (now - state.mageSpinnerLastActivationTime > MAGE_SPINNER_COOLDOWN_MS) {
            state.isMageSpinnerOnCooldown = false;
            console.log("-> Mage Spinner: Cooldown finished. Ready.");
        }
    }

    // Check and update Fiery Houdini cooldown
    if (state.isFieryHoudiniOnCooldown) {
        const now = Date.now();
        if (now - state.fieryHoudiniLastActivationTime > FIERY_HOUDINI_COOLDOWN_MS) {
            state.isFieryHoudiniOnCooldown = false;
            console.log("-> Fiery Houdini: Cooldown finished. Ready.");
        }
    }

    const targetSegmentDuration = currentHurdle.visualDurationMs / state.intendedSpeedMultiplier;

    if (state.manualJumpOverride.isActive) {
        const elapsed = Date.now() - state.manualJumpOverride.startTime;
        state.jumpState.progress = elapsed / state.manualJumpOverride.duration;

        if (state.jumpState.progress >= 1) {
            state.jumpState.isJumping = false;
            state.manualJumpOverride.isActive = false;
            state.jumpState.progress = 0;
        }
    } else {
        if (state.isAutoHurdleEnabled && state.segmentProgress >= AUTO_JUMP_START_PROGRESS && state.segmentProgress <= AUTO_JUMP_START_PROGRESS + AUTO_JUMP_DURATION) {
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
            const proximityDays = daysPerCanvas * (EVENT_PROXIMITY_VISUAL_STEPS * (MIN_VISUAL_DURATION_MS / MAX_VISUAL_DURATION_MS));

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

    // Update positions of all moving objects first
    const objectMovementDelta = deltaTime * OBSTACLE_BASE_VELOCITY_PX_MS * state.gameSpeedMultiplier;
    if (state.currentObstacle) state.currentObstacle.x -= objectMovementDelta;
    if (state.currentAccelerator) state.currentAccelerator.x -= objectMovementDelta;
    if (state.onScreenCustomEvent) state.onScreenCustomEvent.x -= objectMovementDelta;
    state.ignitedObstacles.forEach(ob => {
        ob.x -= objectMovementDelta * (ob.speedMultiplier || 1);
    });

    // Update and check active fireballs
    for (let i = state.activeFireballs.length - 1; i >= 0; i--) {
        const fireball = state.activeFireballs[i];
        if (fireball.isMageSpinnerFireball) {
            fireball.x += fireball.velocityX * deltaTime;
            fireball.y += fireball.velocityY * deltaTime;
        } else {
            fireball.x += fireball.velocity * deltaTime; // Regular fireballs move forward
        }

        // Check for collision with current obstacle
        if (state.currentObstacle && !state.currentObstacle.hasBeenHit) {
            const obstacleX = state.currentObstacle.x;
            const obstacleY = GROUND_Y - obstacleX * Math.tan(angleRad) + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

            // Simple AABB collision detection
            if (fireball.x + fireball.size > obstacleX &&
                fireball.x < obstacleX + OBSTACLE_WIDTH &&
                fireball.y + fireball.size > obstacleY &&
                fireball.y < obstacleY + OBSTACLE_HEIGHT) {

                // Randomly choose a destruction type
                const destructionType = Math.floor(Math.random() * 3);
                switch (destructionType) {
                    case 0: // Incinerate
                        state.incineratingObstacles.push({
                            ...state.currentObstacle,
                            animationProgress: 0,
                            startTime: performance.now()
                        });
                        playAnimationSound('fireball');
                        break;
                    case 1: // Shatter
                        drawing.createShatterEffect(state.currentObstacle.x, obstacleY, state.currentObstacle.emoji);
                        playAnimationSound('shatter');
                        break;
                    case 2: // Vanish (Poof)
                        state.vanishingObstacles.push({
                            ...state.currentObstacle,
                            animationProgress: 0,
                            startTime: performance.now()
                        });
                        drawing.createHoudiniPoof(state.currentObstacle.x, obstacleY);
                        playAnimationSound('houdini');
                        break;
                }

                state.currentObstacle = null; // Remove the obstacle from the main track
                state.playerStats.obstaclesIncinerated++; // Increment stat
                state.playerStats.consecutiveIncinerations++;
                state.playerStats.consecutiveGroundPounds = 0; // Reset streak
                console.log(`-> FIRE MAGE: Obstacle destroyed with type ${destructionType}!`);
                state.activeFireballs.splice(i, 1); // Remove the fireball
                continue; // Move to the next fireball
            }
        }

        // Remove fireball if it goes off-screen
        if (fireball.x > canvas.width + fireball.size || fireball.y > canvas.height + fireball.size) {
            state.activeFireballs.splice(i, 1);
        }
    }

    // Handle new Firestorm V2
    if (state.isFirestormActive) {
        if (Date.now() > state.firestormEndTime) {
            state.isFirestormActive = false;
        } else {
            // Robust catch-all: If there's a current obstacle and it's not already ignited, ignite it.
            if (state.currentObstacle && !state.ignitedObstacles.some(o => o.x === state.currentObstacle.x)) {
                const burnoutDuration = 500 + Math.random() * 1000; // Quicker burnout: 0.5 to 1.5 seconds
                state.ignitedObstacles.push({
                    ...state.currentObstacle,
                    burnoutTime: Date.now() + burnoutDuration,
                    speedMultiplier: 1.2 // 20% faster
                });
                state.currentObstacle = null; // Remove from main track
                console.log("-> Firestorm: Robust catch-all ignited a stray obstacle.");
            }

            if (state.frameCount % 8 === 0) { // Reduced particle density for performance
                drawing.createFirestormFlashes(angleRad);
                drawing.createPlayerEmbers(runnerY);
            }
        }
    }

    // Update and check ignited obstacles
    for (let i = state.ignitedObstacles.length - 1; i >= 0; i--) {
        const obstacle = state.ignitedObstacles[i];
        // Phase 2: Incinerate when burnout time is reached
        if (Date.now() > obstacle.burnoutTime) {
            state.incineratingObstacles.push({
                ...obstacle,
                animationProgress: 0,
                startTime: performance.now()
            });
            playAnimationSound('incinerate');
            state.playerStats.obstaclesIncinerated++; // Increment stat here
            state.playerStats.consecutiveIncinerations++;
            state.ignitedObstacles.splice(i, 1);
        } else if (obstacle.x < -OBSTACLE_WIDTH) {
            state.ignitedObstacles.splice(i, 1);
        }
    }

    if (state.frameCount % 60 === 0) { // Check every 60 frames
        // Independent check for obstacle spawn
        if (!state.currentObstacle && Math.random() * 100 < state.obstacleFrequencyPercent) {
            spawnObstacle();
        }

        // Independent check for accelerator spawn
        if (state.enableRandomPowerUps && !state.currentAccelerator && Math.random() * 100 < state.acceleratorFrequencyPercent) {
            spawnAccelerator();
        }
    }

    if (state.currentObstacle) {
        if (checkCollision(runnerY, angleRad)) {
            if (!state.isColliding) {
                state.hitsCounter++;
                state.isColliding = true;
                state.collisionDuration = COLLISION_DURATION_MS;
                playCollisionSound();
                playQuackSound();
                state.playerEnergy *= 0.5; // Deplete energy by 50% of current level
                console.warn(`-> COLLISION: Hit obstacle! Total hits: ${state.hitsCounter}. Speed penalty applied.`);
            }
            state.currentObstacle.hasBeenHit = true;
            state.isAccelerating = false;
            state.accelerationDuration = 0;
            state.isDecelerating = false;
            state.decelerationDuration = 0;
            state.activeCustomEvents.forEach(e => e.isActive = false);
        }
        if (state.currentObstacle && state.currentObstacle.x < -OBSTACLE_WIDTH) {
            state.playerStats.consecutiveGroundPounds = 0; // Reset if obstacle is missed
            state.playerStats.consecutiveIncinerations = 0;
            console.log("-> STREAK RESET: Obstacle missed.");
            state.currentObstacle = null;
        }
    }

    if (state.currentAccelerator) {
        if (checkAcceleratorCollision(runnerY, angleRad)) {
            if (!state.isAccelerating && !state.isDecelerating) {
                state.stickFigureBurst = {...state.stickFigureBurst, active: true, startTime: timestamp, progress: 0};
                applySpeedEffect('ACCELERATOR');
                playPowerUpSound();
                if (!state.isFirestormActive && !state.jumpState.isFireSpinner) {
                    state.playerEnergy = Math.min(state.maxPlayerEnergy, state.playerEnergy + (ENERGY_GAIN_ACCELERATOR * 0.5 * state.energyRegenMultiplier));
                }
            }
        }
        if (state.currentAccelerator.x < -OBSTACLE_WIDTH) {
            state.currentAccelerator = null;
        }
    }

    if (state.onScreenCustomEvent) {
        if (checkProximityEventCollection(runnerY, angleRad)) {
            if (!state.isAccelerating && !state.isDecelerating) {
                if (state.onScreenCustomEvent.type === 'ACCELERATOR') {
                    state.stickFigureBurst = {
                        ...state.stickFigureBurst,
                        active: true,
                        startTime: timestamp,
                        progress: 0
                    };
                    state.playerEnergy = Math.min(state.maxPlayerEnergy, state.playerEnergy + (state.maxPlayerEnergy * 0.10));
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
            state.gameSpeedMultiplier = state.intendedSpeedMultiplier;
            console.info("-> COLLISION: Penalty ended. Speed restored.");
        } else {
            state.gameSpeedMultiplier = state.intendedSpeedMultiplier * 0.1;
        }
    } else {
        // If not in a burst (or burst just ended), check for regular acceleration/deceleration
        if (!state.stickFigureBurst.active) {
            if (state.isDecelerating) {
                state.decelerationDuration -= deltaTime;
                state.gameSpeedMultiplier = state.intendedSpeedMultiplier * DECELERATOR_BASE_SPEED_DEBUFF;
                if (state.decelerationDuration <= 0) {
                    state.isDecelerating = false;
                    state.decelerationDuration = 0;
                    state.activeCustomEvents.forEach(e => {
                        if (e.type === 'DECELERATOR') e.isActive = false;
                    });
                    state.gameSpeedMultiplier = state.intendedSpeedMultiplier;
                    console.info("-> DECELERATOR: Debuff ended. Speed restored.");
                }
            } else if (state.isAccelerating) {
                state.accelerationDuration -= deltaTime;
                state.gameSpeedMultiplier = state.intendedSpeedMultiplier * ACCELERATOR_BASE_SPEED_BOOST;
                if (state.accelerationDuration <= 0) {
                    state.isAccelerating = false;
                    state.accelerationDuration = 0;
                    state.activeCustomEvents.forEach(e => {
                        if (e.type === 'ACCELERATOR') e.isActive = false;
                    });
                    state.gameSpeedMultiplier = state.intendedSpeedMultiplier;
                    console.info("-> ACCELERATOR: Boost ended. Speed restored.");
                }
            } else {
                state.gameSpeedMultiplier = state.intendedSpeedMultiplier;
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
        const completedSegment = state.raceSegments[state.currentSegmentIndex];
        console.log(`-> SEGMENT COMPLETE: Reached Milestone ${state.currentSegmentIndex}. Value: $${completedSegment.milestoneValue.toLocaleString()}`);

        state.daysCounter = {
            days: completedSegment.durationDays,
            delta: completedSegment.durationDelta,
            frame: 0
        };

        if (state.currentSegmentIndex > 0) {
            state.accumulatedCash = completedSegment.milestoneValue;
            state.activeCashBags.push({
                x: STICK_FIGURE_FIXED_X,
                y: collectionY,
                currentX: STICK_FIGURE_FIXED_X,
                currentY: collectionY,
                opacity: 1.0,
                progress: 0,
                isDone: false
            });
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
        state.gameSpeedMultiplier = state.intendedSpeedMultiplier;

        state.currentObstacle = null;
        state.currentAccelerator = null;
        state.onScreenCustomEvent = null;

        if (state.currentSegmentIndex === state.raceSegments.length - 1) {
            preloadEndgameSounds();
        }

        if (state.currentSegmentIndex < state.raceSegments.length) {
            console.log(`-> NEW SEGMENT START: Index ${state.currentSegmentIndex}. Visual Duration: ${state.raceSegments[state.currentSegmentIndex].visualDurationMs.toFixed(0)}ms`);
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
            const groundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(state.raceSegments[state.currentSegmentIndex].angleRad);
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

    if (state.jumpState.isFieryHoudini) {
        const previousPhase = state.jumpState.fieryHoudiniPhase;
        state.jumpState.fieryHoudiniDuration -= deltaTime;

        if (state.jumpState.fieryHoudiniDuration <= FIERY_HOUDINI_DURATION_MS / 2) {
            state.jumpState.fieryHoudiniPhase = 'reappearing';
            if (previousPhase === 'disappearing') {
                const playerY = GROUND_Y - state.jumpState.progress * 200; // Approximate player Y
                drawing.createFieryHoudiniPoof(STICK_FIGURE_FIXED_X, playerY - 50);
            }
        }
        if (state.jumpState.fieryHoudiniDuration <= 0) {
            state.jumpState.isFieryHoudini = false;
        }
    }

    if (state.jumpState.isFireSpinner) {
        state.jumpState.fireSpinnerDuration -= deltaTime;
        if (state.jumpState.fireSpinnerDuration <= 0) {
            state.jumpState.isFireSpinner = false;
        }
    }

    // Check and update Fire Spinner cooldown
    if (state.isFireSpinnerOnCooldown) {
        const now = Date.now();
        if (now - state.fireSpinnerLastActivationTime > state.fireSpinnerCooldown) {
            state.isFireSpinnerOnCooldown = false;
            console.log("-> FIRE SPINNER: Cooldown finished. Ready.");
        }
    }

    // Update incinerating obstacles
    for (let i = state.incineratingObstacles.length - 1; i >= 0; i--) {
        const obstacle = state.incineratingObstacles[i];
        const elapsed = performance.now() - obstacle.startTime;
        obstacle.animationProgress = Math.min(1, elapsed / 1000); // 1-second animation

        if (obstacle.animationProgress >= 1) {
            state.incineratingObstacles.splice(i, 1); // Remove after animation
        }
    }

    // Update vanishing obstacles
    for (let i = state.vanishingObstacles.length - 1; i >= 0; i--) {
        const obstacle = state.vanishingObstacles[i];
        const elapsed = performance.now() - obstacle.startTime;
        if (elapsed > 300) { // Corresponds to VANISH_DURATION in drawing.js
            state.vanishingObstacles.splice(i, 1);
        }
    }

    state.frameCount++;

    state.lastTime = timestamp;
    drawing.updateClouds(); // Update clouds before drawing
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
    state.accumulatedCash = state.raceSegments.length > 0 ? state.raceSegments[0].milestoneValue : 0;
    state.activeCashBags.length = 0;
    state.fireTrail = [];
    state.incineratingObstacles = [];
    state.vanishingObstacles = [];
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
    state.shatteredObstacles.length = 0;
    state.ignitedObstacles = [];

    // Reset environmental effects
    state.environmentalEffects.raindrops = [];
    state.environmentalEffects.rocks = [];
    state.environmentalEffects.headlights = [];
    state.environmentalEffects.fogPatches = [];
    state.environmentalEffects.snowflakes = [];
    state.environmentalEffects.windGusts = [];
    state.environmentalEffects.kickedUpSnow = [];
    state.environmentalEffects.heatHaze = [];
    state.environmentalEffects.tumbleweeds = [];
    state.environmentalEffects.sandGrains = [];
    state.environmentalEffects.tornadoes = [];
    state.environmentalEffects.asteroids = [];
    state.environmentalEffects.shootingStars = [];
    state.environmentalEffects.nebulaClouds = [];
    state.environmentalEffects.shootingStarBursts = [];
    state.environmentalEffects.shootingStarTrails = [];
    state.environmentalEffects.nebulaCloudState = { active: false, startTime: 0, opacity: 0 };
    state.environmentalEffects.fireflies = [];
    state.environmentalEffects.moonGlow = { active: false, opacity: 0, rays: [] };

    state.isFirestormActive = false;
    state.firestormEndTime = 0;
    state.firestormParticles = [];
    state.playerEmberParticles = [];
    state.ignitedObstacles = [];
    state.isFirestormDrainingEnergy = false;
    state.firestormDrainEndTime = 0;
    state.isFireSpinnerDrainingEnergy = false;
    state.fireSpinnerDrainEndTime = 0;
    state.isMageSpinnerActive = false;
    state.mageSpinnerEndTime = 0;
    state.isMageSpinnerOnCooldown = false;
    state.mageSpinnerLastActivationTime = 0;
    state.mageSpinnerFireballTimer = 0;
    state.mageSpinnerFireballsSpawned = 0;
    state.playerEnergy = state.maxPlayerEnergy; // Initialize to max energy

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
        isHoudini: false, houdiniDuration: 0, houdiniPhase: 'disappearing',
        isFieryHoudini: false, fieryHoudiniDuration: 0
    };
    state.currentObstacle = null;
    state.isColliding = false;
    state.collisionDuration = 0;
    state.currentAccelerator = null;
    state.isAccelerating = false;
    state.accelerationDuration = 0;
    state.isDecelerating = false;
    state.decelerationDuration = 0;
    state.gameSpeedMultiplier = state.intendedSpeedMultiplier;

    state.isFireSpinnerOnCooldown = false;
    state.fireSpinnerLastActivationTime = 0;
    state.isFireMageActive = false;
    state.fireMageEndTime = 0;
    state.isFireMageOnCooldown = false;
    state.fireMageLastActivationTime = 0;
    state.activeFireballs = [];
    state.playerStats.consecutiveGroundPounds = 0; // Reset consecutive Ground Pounds
    state.playerStats.totalGroundPoundCollisions = 0;
    state.playerStats.consecutiveIncinerations = 0;

    state.activeCustomEvents = Object.values(state.customEvents).flat().map(event => ({
        ...event,
        wasTriggered: false,
        isActive: false,
        wasSpawned: false
    })).sort((a, b) => a.daysSinceStart - b.daysSinceStart);
    console.log(`-> RESET GAME: Prepared ${state.activeCustomEvents.length} custom events.`);
    state.onScreenCustomEvent = null;

    // Reset hurdle animation states
    state.raceSegments.forEach(segment => {
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
    if (state.raceSegments.length < 2) {
        // dataMessage.textContent = "Error: Cannot start. Load valid data with at least two milestones."; // Handled in UI
        // dataMessage.style.color = 'red';
        console.error("-> START GAME FAILED: Insufficient milestones.");
        return;
    }
    if (state.gameRunning) return;

    state.raceSegments = state.raceSegments; // Initialize raceSegments in the state

    console.log("-> START GAME: Initiating game start sequence.");

    // Reset all game state variables to their defaults
    state.currentSegmentIndex = 0;
    state.segmentProgress = 0;
    state.lastTime = 0;
    state.backgroundOffset = 0;
    state.frameCount = 0;
    state.accumulatedCash = state.raceSegments[0].milestoneValue;
    state.activeCashBags.length = 0;
    state.fireTrail = [];
    state.incineratingObstacles = [];
    state.vanishingObstacles = [];
    state.houdiniParticles = [];
    state.groundPoundParticles = [];
    state.moonwalkParticles = [];
    state.hoverParticles = [];
    state.scrambleParticles = [];
    state.diveParticles = [];
    state.swooshParticles = [];
    state.flipTrail = [];
    state.corkscrewTrail = [];
    state.shatteredObstacles.length = 0;
    state.ignitedObstacles = [];
    state.isFirestormActive = false;
    state.firestormEndTime = 0;
    state.firestormParticles = [];
    state.playerEmberParticles = [];
    state.ignitedObstacles = [];
    state.isFirestormDrainingEnergy = false;
    state.firestormDrainEndTime = 0;
    state.isFireSpinnerDrainingEnergy = false;
    state.fireSpinnerDrainEndTime = 0;
    state.isMageSpinnerActive = false;
    state.mageSpinnerEndTime = 0;
    state.isMageSpinnerOnCooldown = false;
    state.mageSpinnerLastActivationTime = 0;
    state.mageSpinnerFireballTimer = 0;
    state.mageSpinnerFireballsSpawned = 0;
    state.playerEnergy = state.maxPlayerEnergy; // Start energy at max
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
        isHoudini: false, houdiniDuration: 0, houdiniPhase: 'disappearing',
        isFieryHoudini: false, fieryHoudiniDuration: 0
    };
    state.manualJumpOverride = {isActive: false, startTime: 0, duration: state.manualJumpDurationMs};
    state.isColliding = false;
    state.collisionDuration = 0;
    state.currentObstacle = null;
    state.currentAccelerator = null;
    state.isAccelerating = false;
    state.accelerationDuration = 0;
    state.isDecelerating = false;
    state.decelerationDuration = 0;
    state.onScreenCustomEvent = null;
    state.isFireSpinnerOnCooldown = false;
    state.fireSpinnerLastActivationTime = 0;
    state.isFireMageActive = false;
    state.fireMageEndTime = 0;
    state.isFireMageOnCooldown = false;
    state.fireMageLastActivationTime = 0;
    state.activeFireballs = [];
    state.hitsCounter = 0;
    state.daysElapsedTotal = 0;
    state.daysAccumulatedAtSegmentStart = 0;
    state.isVictory = false;
    state.isGameOverSequence = false;
    state.gameOverSequenceStartTime = 0;
    state.isPaused = false;

    drawing.setInitialLoad(false);

    applySkillLevelSettings(state.currentSkillLevel);

    state.gameSpeedMultiplier = state.intendedSpeedMultiplier;

    let musicUrl = DEFAULT_MUSIC_URL;
    if (state.selectedPersona && state.selectedPersona !== 'custom' && personas[state.selectedPersona]) {
        musicUrl = personas[state.selectedPersona].music;
    } else {
        const cleanEmoji = state.stickFigureEmoji.replace(/\uFE0F/g, '');
        musicUrl = EMOJI_MUSIC_MAP[cleanEmoji] || DEFAULT_MUSIC_URL;
    }
    initializeMusicPlayer(musicUrl);

    hideResultsScreen();

    if (Tone.context.state !== 'running') {
        Tone.start();
    }
    if (!isMuted) {
        chaChingSynth.mute = false;
        collisionSynth.mute = false;
        debuffSynth.mute = false;
        Tone.loaded().then(() => {
            backgroundMusic.sync().start(0);
            Tone.Transport.start();
        });
    }

    state.activeCustomEvents = Object.values(state.customEvents).flat().map(event => ({
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
        document.getElementById('gameCanvas').scrollIntoView({behavior: 'smooth', block: 'start'});
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

    if (state.isDailyChallengeActive) {
        if (shouldReset) {
            console.log("-> STOP GAME: Resetting Daily Challenge.");
            resetGameState();
            displayDailyChallenge(); // Re-display the start button
            showSandboxControls(); // Ensure controls are visible
            state.isDailyChallengeActive = false; // Reset the flag
        } else {
            console.log("-> STOP GAME: Daily Challenge ended, displaying results.");
            const newWinStreak = updateDailyChallengeWinStreak(state.isVictory);
            const stats = {
                days: Math.round(state.daysElapsedTotal),
                hits: state.hitsCounter
            };
            const results = {...stats, winStreak: newWinStreak};

            markDailyChallengeAsPlayed(stats, newWinStreak);
            displayDailyChallengeCompletedScreen(results);

            showSandboxControls();
            state.isDailyChallengeActive = false; // Reset the flag
            document.getElementById('startButton').textContent = "Start the Heist!";
            const stopButton = document.getElementById('stopButton');
            if (stopButton) {
                stopButton.disabled = false;
            }
        }
    } else if (shouldReset) {
        drawing.setInitialLoad(true);
        resetGameState();
        drawing.draw();
    } else {
        showResultsScreen(state.financialMilestones, state.raceSegments);
        updateControlPanelState(false, false);
        document.getElementById('startButton').textContent = "Restart Heist!";
        console.log("-> STOP GAME: Game ended, displaying results.");
    }
}
