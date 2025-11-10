import { canvas, header, controlPanel, mainElement } from '../dom-elements.js';
import {
    VICTORY_DISPLAY_TIME,
    HURDLE_FIXED_START_DISTANCE,
    AUTO_JUMP_START_PROGRESS,
    AUTO_JUMP_DURATION,
    OBSTACLE_WIDTH,
    OBSTACLE_BASE_VELOCITY_PX_MS,
    EVENT_PROXIMITY_VISUAL_STEPS,
    MIN_VISUAL_DURATION_MS,
    MAX_VISUAL_DURATION_MS,
    CASH_BAG_ANIMATION_DURATION,
    COUNTER_TARGET_X,
    COUNTER_TARGET_Y,
    DECELERATOR_BASE_SPEED_DEBUFF,
    COLLISION_DURATION_MS,
    GROUND_Y,
    STICK_FIGURE_TOTAL_HEIGHT,
    OBSTACLE_EMOJI_Y_OFFSET,
    OBSTACLE_HEIGHT,
    JUMP_HEIGHT_RATIO,
    STICK_FIGURE_FIXED_X,
    DEFAULT_MUSIC_URL,
    EMOJI_MUSIC_MAP,
    ENERGY_SETTINGS,
    ENERGY_GAIN_ACCELERATOR,
    FIRE_MAGE_COOLDOWN_MS,
    MAGE_SPINNER_COOLDOWN_MS,
    MAGE_SPINNER_DURATION_MS,
    MAGE_SPINNER_FIREBALL_INTERVAL_MS,
    MAGE_SPINNER_FIREBALL_COUNT,
    MAGE_SPINNER_ENERGY_COST,
    FIERY_HOUDINI_COOLDOWN_MS,
    FIERY_HOUDINI_DURATION_MS,
    ACCELERATOR_BASE_SPEED_BOOST,
    ACCELERATOR_DURATION_MS,
    DECELERATOR_DURATION_MS,
    THEME_MUSIC_MAP
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
    playQuackSound,
    playPowerUpSound,
    playWinnerSound,
    playLoserSound,
    preloadEndgameSounds,
    playAnimationSound
} from '../audio.js';
import { applySkillLevelSettings } from '../ui-modules/input-handlers.js';
import { showResultsScreen, hideResultsScreen } from '../ui-modules/results.js';
import { updateControlPanelState, exitFullScreenIfActive, showSandboxControls } from '../ui-modules/ui-helpers.js';
import { savePlayerStats } from '../ui-modules/settings.js';
import { checkForNewUnlocks } from '../ui-modules/unlocks.js';
import { personas } from '../personas.js';
import { setPaused, gameState, setGameOverSequence, setVictory, setGameOverSequenceStartTime, setLastTime, setFirestormActive, setFirestormEndTime, setFirestormDrainingEnergy, setFirestormDrainEndTime, setFireSpinnerDrainingEnergy, setFireSpinnerDrainEndTime, setMageSpinnerActive, setMageSpinnerEndTime, setFireMageOnCooldown, setFireMageActive, setFireMageEndTime, setMageSpinnerFireballTimer, incrementMageSpinnerFireballsSpawned, setMageSpinnerOnCooldown, setFieryHoudiniOnCooldown, setManualJumpOverrideActive, setJumpProgress, setJumping, setSegmentProgress, setBackgroundOffset, setDaysElapsedTotal, setOnScreenCustomEvent, setCurrentObstacle, addIgnitedObstacle, removeIgnitedObstacle, addVanishingObstacle, removeVanishingObstacle, addFireball, removeFireball, incrementObstaclesIncinerated, incrementConsecutiveIncinerations, incrementConsecutiveGroundPounds, incrementTotalGroundPoundCollisions, setColliding, setCollisionDuration, setCurrentAccelerator, setAccelerating, setAccelerationDuration, setDecelerating, setDecelerationDuration, setGameSpeedMultiplier, setScreenFlash, setStickFigureBurst, setTurboBoostFrame, setTurboBoostLastFrameTime, addCashBag, removeCashBag, setDaysCounter, setAccumulatedCash, setHurdle, setHurdleDuration, setSpecialMove, setSpecialMoveDuration, setPowerStomp, setPowerStompDuration, setDive, setDiveDuration, setCorkscrewSpin, setCorkscrewSpinDuration, setScissorKick, setScissorKickDuration, setPhaseDash, setPhaseDashDuration, setHover, setHoverDuration, setGroundPound, setGroundPoundDuration, setGroundPoundEffectTriggered, setCartoonScramble, setCartoonScrambleDuration, setMoonwalking, setMoonwalkDuration, setShockwave, setShockwaveDuration, setBackflip, setBackflipDuration, setFrontflip, setFrontflipDuration, setHoudini, setHoudiniDuration, setHoudiniPhase, setFieryHoudini, setFieryHoudiniDuration, setFieryHoudiniPhase, setFireSpinner, setFireSpinnerDuration, setFireSpinnerOnCooldown, incrementFrameCount, setPlayerEnergy, setGameRunning, removeIncineratingObstacle, addIncineratingObstacle, incrementHits, resetStreaks } from './state-manager.js';
import state from './state.js';
import * as drawing from './drawing.js';
import { displayDailyChallenge, displayDailyChallengeCompletedScreen } from '../ui-modules/daily-challenge-ui.js';
import { markDailyChallengeAsPlayed, updateDailyChallengeWinStreak } from '../daily-challenge.js';
import { castMageSpinnerFireball } from './actions.js';
import { updateEnvironmentalEffects } from './drawing/environmental-effects.js';
import { checkCollision, checkAcceleratorCollision, checkProximityEventCollection } from './collision.js';
import { spawnObstacle, spawnAccelerator, spawnProximityEvent } from './spawning.js';
import { applySpeedEffect } from './effects.js';
import { updateHighScore } from './score.js';

export function togglePauseGame() {
    if (!gameState.gameRunning) return;
    setPaused(!gameState.isPaused);
    const startButton = document.getElementById('startButton');
    if (gameState.isPaused) {
        Tone.Transport.pause();
        startButton.textContent = "Unpause";
        console.log("-> GAME PAUSED");
    } else {
        Tone.Transport.start();
        startButton.textContent = "Pause";
        console.log("-> GAME RESUMED");
        gameState.lastTime = performance.now();
    }
    updateControlPanelState(gameState.gameRunning, gameState.isPaused);
    drawing.draw();
}

export function animate(timestamp) {
    if (!gameState.gameRunning && !gameState.isGameOverSequence) return;

    if (gameState.isPaused) {
        requestAnimationFrame(animate);
        return;
    }

    if (gameState.currentSegmentIndex >= gameState.raceSegments.length) {
        if (!gameState.isGameOverSequence) {
            setVictory(gameState.hitsCounter === 0);
            if (gameState.isVictory) {
                playWinnerSound();
                // Track flawless run only if not using custom persona
                if (gameState.selectedPersona !== 'custom') {
                    if (!gameState.playerStats.flawlessRuns) {
                        gameState.playerStats.flawlessRuns = {};
                    }
                    gameState.playerStats.flawlessRuns[gameState.currentSkillLevel] = true;
                    savePlayerStats(); // Save stats on flawless victory
                } else {
                    console.log("-> GAME OVER: Flawless run not recorded for Custom Persona.");
                }
            } else {
                playLoserSound();
            }
            setGameOverSequence(true);
            setGameOverSequenceStartTime(timestamp);
            console.log(`-> GAME OVER: Starting sequence. Victory: ${gameState.isVictory}`);
            setGameRunning(false);
            updateHighScore();
            savePlayerStats(); // Also save stats on a regular loss
            checkForNewUnlocks(gameState.playerStats); // Check for new unlocks
        }

        drawing.draw();
        drawing.drawVictoryOverlay(timestamp - gameState.gameOverSequenceStartTime);

        if (timestamp - gameState.gameOverSequenceStartTime >= VICTORY_DISPLAY_TIME) {
            stopGame(false);
            setGameOverSequence(false);
            return;
        }

        setLastTime(timestamp);
        requestAnimationFrame(animate);
        return;
    }

    const currentHurdle = gameState.raceSegments[gameState.currentSegmentIndex];
    const angleRad = currentHurdle.angleRad;

    if (!gameState.lastTime) {
        setLastTime(timestamp);
        console.log(`-- ANIME START -- Segment ${gameState.currentSegmentIndex} initialized.`);
        requestAnimationFrame(animate);
        return;
    }

    let deltaTime = timestamp - gameState.lastTime;
    if (deltaTime > 100) {
        deltaTime = 100;
    }

    updateEnvironmentalEffects(deltaTime);

    // Handle continuous energy drain for Firestorm and Fire Spinner
    if (gameState.isFirestormDrainingEnergy) {
        const remainingTime = gameState.firestormDrainEndTime - Date.now();
        if (remainingTime <= 0) {
            setPlayerEnergy(0);
            setFirestormDrainingEnergy(false);
        } else {
            const energyToDrain = gameState.playerEnergy;
            const drainRate = energyToDrain / remainingTime;
            setPlayerEnergy(Math.max(0, gameState.playerEnergy - (drainRate * deltaTime)));
        }
    } else if (gameState.isFireSpinnerDrainingEnergy) {
        const remainingTime = gameState.fireSpinnerDrainEndTime - Date.now();
        if (remainingTime <= 0) {
            setPlayerEnergy(0);
            setFireSpinnerDrainingEnergy(false);
        } else {
            const energyToDrain = gameState.playerEnergy;
            const drainRate = energyToDrain / remainingTime;
            setPlayerEnergy(Math.max(0, gameState.playerEnergy - (drainRate * deltaTime)));
        }
    } else if (gameState.isMageSpinnerActive) { // Mage Spinner drains energy over its duration
        const remainingTime = gameState.mageSpinnerEndTime - Date.now();
        if (remainingTime <= 0) {
            setPlayerEnergy(0); // Ensure energy is fully drained if skill ends
        } else {
            // Calculate drain rate to deplete energy over the skill's duration
            const energyToDrain = MAGE_SPINNER_ENERGY_COST; // Total cost of the skill
            const drainRate = energyToDrain / MAGE_SPINNER_DURATION_MS; // Energy per millisecond
            setPlayerEnergy(Math.max(0, gameState.playerEnergy - (drainRate * deltaTime)));
        }
    } else if (gameState.jumpState.isHover) { // Hover drains energy continuously
        const energyDrain = (ENERGY_SETTINGS.HOVER_DRAIN_RATE * deltaTime) / 1000;
        setPlayerEnergy(Math.max(0, gameState.playerEnergy - energyDrain));
    } else {
        // Passive energy drain based on skill level
        const energyDrain = (gameState.passiveDrainRate * deltaTime) / 1000;
        setPlayerEnergy(Math.max(0, gameState.playerEnergy - energyDrain));
    }

    // Check and update Fire Mage mode duration
    if (gameState.isFireMageActive && Date.now() > gameState.fireMageEndTime) {
        setFireMageActive(false);
        console.log("-> Fire Mage mode ended.");
    }

    // Check and update Fire Mage cooldown
    if (gameState.isFireMageOnCooldown) {
        const now = Date.now();
        if (now - gameState.fireMageLastActivationTime > FIRE_MAGE_COOLDOWN_MS) {
            setFireMageOnCooldown(false);
            console.log("-> Fire Mage: Cooldown finished. Ready.");
        }
    }

    // Check and update Mage Spinner mode duration
    if (gameState.isMageSpinnerActive) {
        const now = Date.now();
        if (now > gameState.mageSpinnerEndTime) {
            setMageSpinnerActive(false);
            console.log("-> Mage Spinner mode ended.");
        } else {
            // Handle fireball spawning during Mage Spinner active time
            setMageSpinnerFireballTimer(gameState.mageSpinnerFireballTimer - deltaTime);
            if (gameState.mageSpinnerFireballTimer <= 0 && gameState.mageSpinnerFireballsSpawned < MAGE_SPINNER_FIREBALL_COUNT) {
                // Find the closest obstacle to target
                const targetObstacle = gameState.currentObstacle || gameState.ignitedObstacles[0] || gameState.vanishingObstacles[0];
                if (targetObstacle) {
                    castMageSpinnerFireball(gameState, targetObstacle); // Pass the target obstacle
                    incrementMageSpinnerFireballsSpawned();
                    setMageSpinnerFireballTimer(MAGE_SPINNER_FIREBALL_INTERVAL_MS); // Reset timer
                }
            }
        }
    }

    // Check and update Mage Spinner cooldown
    if (gameState.isMageSpinnerOnCooldown) {
        const now = Date.now();
        if (now - gameState.mageSpinnerLastActivationTime > MAGE_SPINNER_COOLDOWN_MS) {
            setMageSpinnerOnCooldown(false);
            console.log("-> Mage Spinner: Cooldown finished. Ready.");
        }
    }

    // Check and update Fiery Houdini cooldown
    if (gameState.isFieryHoudiniOnCooldown) {
        const now = Date.now();
        if (now - gameState.fieryHoudiniLastActivationTime > FIERY_HOUDINI_COOLDOWN_MS) {
            setFieryHoudiniOnCooldown(false);
            console.log("-> Fiery Houdini: Cooldown finished. Ready.");
        }
    }

    const targetSegmentDuration = currentHurdle.visualDurationMs / gameState.intendedSpeedMultiplier;

    if (gameState.manualJumpOverride.isActive) {
        const elapsed = Date.now() - gameState.manualJumpOverride.startTime;
        setJumpProgress(elapsed / gameState.manualJumpOverride.duration);

        if (gameState.jumpState.progress >= 1) {
            setJumping(false);
            setManualJumpOverrideActive(false);
            setJumpProgress(0);
        }
    } else {
        if (gameState.isAutoHurdleEnabled && gameState.segmentProgress >= AUTO_JUMP_START_PROGRESS && gameState.segmentProgress <= AUTO_JUMP_START_PROGRESS + AUTO_JUMP_DURATION) {
            setJumping(true);
            setJumpProgress((gameState.segmentProgress - AUTO_JUMP_START_PROGRESS) / AUTO_JUMP_DURATION);
        } else {
            setJumping(false);
            setJumpProgress(0);
        }
    }

    setSegmentProgress(gameState.segmentProgress + (deltaTime / targetSegmentDuration));
    setBackgroundOffset((HURDLE_FIXED_START_DISTANCE) * gameState.segmentProgress);

    const totalDaysForCurrentSegment = currentHurdle.durationDays;
    const progressInDays = totalDaysForCurrentSegment * Math.min(1, gameState.segmentProgress);
    setDaysElapsedTotal(gameState.daysAccumulatedAtSegmentStart + progressInDays);

    const daysCheck = gameState.daysElapsedTotal;

    if (!gameState.onScreenCustomEvent) {
        const nextEventToTrigger = gameState.activeCustomEvents.find(event => !event.wasTriggered && !event.wasSpawned);
        if (nextEventToTrigger) {
            const daysPerCanvas = totalDaysForCurrentSegment;
            const proximityDays = daysPerCanvas * (EVENT_PROXIMITY_VISUAL_STEPS * (MIN_VISUAL_DURATION_MS / MAX_VISUAL_DURATION_MS));

            if (nextEventToTrigger.daysSinceStart <= daysCheck + proximityDays) {
                spawnProximityEvent(nextEventToTrigger);
            }
        }
    }

    gameState.activeCustomEvents.forEach(event => {
        if (!event.wasTriggered && daysCheck >= event.daysSinceStart) {
            if (!gameState.onScreenCustomEvent || gameState.onScreenCustomEvent.daysSinceStart !== event.daysSinceStart) {
                console.info(`-> CUSTOM EVENT AUTO-TRIGGERED: Date: ${event.date}. Object missed or spawned late. Applying effect directly.`);
                event.wasTriggered = true;
                event.isActive = true;
                applySpeedEffect(event.type);
            }
        }
    });

    const stickFigureGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(currentHurdle.angleRad);
    let runnerY = stickFigureGroundY - STICK_FIGURE_TOTAL_HEIGHT;

    if (gameState.jumpState.isJumping) {
        let maxJumpHeightForSegment = gameState.manualJumpOverride.isActive ? gameState.manualJumpHeight : currentHurdle.hurdleHeight * JUMP_HEIGHT_RATIO;
        const jumpProgress = gameState.jumpState.progress;
        const jumpOffset = -4 * maxJumpHeightForSegment * (jumpProgress - jumpProgress * jumpProgress);
        runnerY += jumpOffset;
    }

    // Update positions of all moving objects first
    const objectMovementDelta = deltaTime * OBSTACLE_BASE_VELOCITY_PX_MS * gameState.gameSpeedMultiplier;
    if (gameState.currentObstacle) setCurrentObstacle({ ...gameState.currentObstacle, x: gameState.currentObstacle.x - objectMovementDelta });
    if (gameState.currentAccelerator) setCurrentAccelerator({ ...gameState.currentAccelerator, x: gameState.currentAccelerator.x - objectMovementDelta });
    if (gameState.onScreenCustomEvent) setOnScreenCustomEvent({ ...gameState.onScreenCustomEvent, x: gameState.onScreenCustomEvent.x - objectMovementDelta });
    gameState.ignitedObstacles.forEach(ob => {
        ob.x -= objectMovementDelta * (ob.speedMultiplier || 1);
    });

    // Update and check active fireballs
    for (let i = gameState.activeFireballs.length - 1; i >= 0; i--) {
        const fireball = gameState.activeFireballs[i];
        if (fireball.isMageSpinnerFireball) {
            fireball.x += fireball.velocityX * deltaTime;
            fireball.y += fireball.velocityY * deltaTime;
        } else {
            fireball.x += fireball.velocity * deltaTime; // Regular fireballs move forward
        }

        // Check for collision with current obstacle
        if (gameState.currentObstacle && !gameState.currentObstacle.hasBeenHit) {
            const obstacleX = gameState.currentObstacle.x;
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
                        addIncineratingObstacle({
                            ...gameState.currentObstacle,
                            animationProgress: 0,
                            startTime: performance.now()
                        });
                        playAnimationSound('fireball');
                        break;
                    case 1: // Shatter
                        drawing.createShatterEffect(gameState.currentObstacle.x, obstacleY, gameState.currentObstacle.emoji);
                        playAnimationSound('shatter');
                        break;
                    case 2: // Vanish (Poof)
                        addVanishingObstacle({
                            ...gameState.currentObstacle,
                            animationProgress: 0,
                            startTime: performance.now()
                        });
                        drawing.createHoudiniPoof(gameState.currentObstacle.x, obstacleY);
                        playAnimationSound('houdini');
                        break;
                }

                setCurrentObstacle(null); // Remove the obstacle from the main track
                incrementObstaclesIncinerated(); // Increment stat
                incrementConsecutiveIncinerations();
                resetStreaks(); // Reset streak
                console.log(`-> FIRE MAGE: Obstacle destroyed with type ${destructionType}!`);
                removeFireball(i); // Remove the fireball
                continue; // Move to the next fireball
            }
        }

        // Remove fireball if it goes off-screen
        if (fireball.x > canvas.width + fireball.size || fireball.y > canvas.height + fireball.size) {
            removeFireball(i);
        }
    }

    // Handle new Firestorm V2
    if (gameState.isFirestormActive) {
        if (Date.now() > gameState.firestormEndTime) {
            setFirestormActive(false);
        } else {
            // Robust catch-all: If there's a current obstacle and it's not already ignited, ignite it.
            if (gameState.currentObstacle && !gameState.ignitedObstacles.some(o => o.x === gameState.currentObstacle.x)) {
                const burnoutDuration = 500 + Math.random() * 1000; // Quicker burnout: 0.5 to 1.5 seconds
                addIgnitedObstacle({
                    ...gameState.currentObstacle,
                    burnoutTime: Date.now() + burnoutDuration,
                    speedMultiplier: 1.2 // 20% faster
                });
                setCurrentObstacle(null); // Remove from main track
                console.log("-> Firestorm: Robust catch-all ignited a stray obstacle.");
            }

            if (gameState.frameCount % 8 === 0) { // Reduced particle density for performance
                drawing.createFirestormFlashes(angleRad);
                drawing.createPlayerEmbers(runnerY);
            }
        }
    }

    // Update and check ignited obstacles
    for (let i = gameState.ignitedObstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.ignitedObstacles[i];
        // Phase 2: Incinerate when burnout time is reached
        if (Date.now() > obstacle.burnoutTime) {
            addIncineratingObstacle({
                ...obstacle,
                animationProgress: 0,
                startTime: performance.now()
            });
            playAnimationSound('incinerate');
            incrementObstaclesIncinerated(); // Increment stat here
            incrementConsecutiveIncinerations();
            removeIgnitedObstacle(i);
        } else if (obstacle.x < -OBSTACLE_WIDTH) {
            removeIgnitedObstacle(i);
        }
    }

    if (gameState.frameCount % 60 === 0) { // Check every 60 frames
        // Independent check for obstacle spawn
        if (!gameState.currentObstacle && Math.random() * 100 < gameState.obstacleFrequencyPercent) {
            spawnObstacle();
        }

        // Independent check for accelerator spawn
        if (gameState.enableRandomPowerUps && !gameState.currentAccelerator && Math.random() * 100 < gameState.acceleratorFrequencyPercent) {
            spawnAccelerator();
        }
    }

    if (gameState.currentObstacle) {
        if (checkCollision(runnerY, angleRad)) {
            if (!gameState.isColliding) {
                incrementHits();
                setColliding(true);
                setCollisionDuration(COLLISION_DURATION_MS);
                playCollisionSound();
                playQuackSound();
                setPlayerEnergy(gameState.playerEnergy * 0.5); // Deplete energy by 50% of current level
                console.warn(`-> COLLISION: Hit obstacle! Total hits: ${gameState.hitsCounter}. Speed penalty applied.`);
            }
            setCurrentObstacle({ ...gameState.currentObstacle, hasBeenHit: true });
            setAccelerating(false);
            setAccelerationDuration(0);
            setDecelerating(false);
            setDecelerationDuration(0);
            gameState.activeCustomEvents.forEach(e => e.isActive = false);
        }
        if (gameState.currentObstacle && gameState.currentObstacle.x < -OBSTACLE_WIDTH) {
            resetStreaks(); // Reset if obstacle is missed
            console.log("-> STREAK RESET: Obstacle missed.");
            setCurrentObstacle(null);
        }
    }

    if (gameState.currentAccelerator) {
        if (checkAcceleratorCollision(runnerY, angleRad)) {
            if (!gameState.isAccelerating && !gameState.isDecelerating) {
                setStickFigureBurst(true, timestamp, 0);
                applySpeedEffect('ACCELERATOR');
                playPowerUpSound();
                if (!gameState.isFirestormActive && !gameState.jumpState.isFireSpinner) {
                    setPlayerEnergy(Math.min(gameState.maxPlayerEnergy, gameState.playerEnergy + (ENERGY_GAIN_ACCELERATOR * 0.5 * gameState.energyRegenMultiplier)));
                }
            }
        }
        if (gameState.currentAccelerator.x < -OBSTACLE_WIDTH) {
            setCurrentAccelerator(null);
        }
    }

    if (gameState.onScreenCustomEvent) {
        if (checkProximityEventCollection(runnerY, angleRad)) {
            if (!gameState.isAccelerating && !gameState.isDecelerating) {
                if (gameState.onScreenCustomEvent.type === 'ACCELERATOR') {
                    setStickFigureBurst(true, timestamp, 0);
                    setPlayerEnergy(Math.min(gameState.maxPlayerEnergy, gameState.playerEnergy + (gameState.maxPlayerEnergy * 0.10)));
                }
                applySpeedEffect(gameState.onScreenCustomEvent.type);
            }
            const originalEvent = gameState.activeCustomEvents.find(e => e.daysSinceStart === gameState.onScreenCustomEvent.daysSinceStart);
            if (originalEvent) {
                originalEvent.wasTriggered = true;
                originalEvent.isActive = true;
            }
        }
        if (gameState.onScreenCustomEvent.x < -OBSTACLE_WIDTH) {
            setOnScreenCustomEvent(null);
        }
    }

    // Update screen flash
    if (gameState.screenFlash.opacity > 0) {
        const elapsed = timestamp - gameState.screenFlash.startTime;
        if (elapsed > gameState.screenFlash.duration) {
            setScreenFlash(0, gameState.screenFlash.duration, gameState.screenFlash.startTime);
        } else {
            setScreenFlash((1 - elapsed / gameState.screenFlash.duration) * 0.7, gameState.screenFlash.duration, gameState.screenFlash.startTime);
        }
    }

    // Update stick figure burst animation
    if (gameState.stickFigureBurst.active) {
        const elapsed = timestamp - gameState.stickFigureBurst.startTime;
        if (elapsed >= gameState.stickFigureBurst.duration) {
            setStickFigureBurst(false, gameState.stickFigureBurst.startTime, 0);
        } else {
            setStickFigureBurst(true, gameState.stickFigureBurst.startTime, elapsed / gameState.stickFigureBurst.duration);
        }
    }

    // Update turbo boost animation
    const turboBoostEl = document.getElementById('turbo-boost-animation');
    if (gameState.isAccelerating) {
        const frames = ['> ', '>>', ' >', '  '];
        const frameDuration = 100; // ms per frame
        if (timestamp - gameState.turboBoost.lastFrameTime > frameDuration) {
            setTurboBoostFrame((gameState.turboBoost.frame + 1) % frames.length);
            setTurboBoostLastFrameTime(timestamp);
        }
        turboBoostEl.textContent = frames[gameState.turboBoost.frame];
        turboBoostEl.style.opacity = '1';
    } else {
        turboBoostEl.style.opacity = '0';
    }

    if (gameState.isColliding) {
        setCollisionDuration(gameState.collisionDuration - deltaTime);
        if (gameState.collisionDuration <= 0) {
            setColliding(false);
            setCollisionDuration(0);
            setGameSpeedMultiplier(gameState.intendedSpeedMultiplier);
            console.info("-> COLLISION: Penalty ended. Speed restored.");
        } else {
            setGameSpeedMultiplier(gameState.intendedSpeedMultiplier * 0.1);
        }
    } else {
        // If not in a burst (or burst just ended), check for regular acceleration/deceleration
        if (!gameState.stickFigureBurst.active) {
            if (gameState.isDecelerating) {
                setDecelerationDuration(gameState.decelerationDuration - deltaTime);
                setGameSpeedMultiplier(gameState.intendedSpeedMultiplier * DECELERATOR_BASE_SPEED_DEBUFF);
                if (gameState.decelerationDuration <= 0) {
                    setDecelerating(false);
                    setDecelerationDuration(0);
                    gameState.activeCustomEvents.forEach(e => {
                        if (e.type === 'DECELERATOR') e.isActive = false;
                    });
                    setGameSpeedMultiplier(gameState.intendedSpeedMultiplier);
                    console.info("-> DECELERATOR: Debuff ended. Speed restored.");
                }
            } else if (gameState.isAccelerating) {
                setAccelerationDuration(gameState.accelerationDuration - deltaTime);
                setGameSpeedMultiplier(gameState.intendedSpeedMultiplier * ACCELERATOR_BASE_SPEED_BOOST);
                if (gameState.accelerationDuration <= 0) {
                    setAccelerating(false);
                    setAccelerationDuration(0);
                    gameState.activeCustomEvents.forEach(e => {
                        if (e.type === 'ACCELERATOR') e.isActive = false;
                    });
                    setGameSpeedMultiplier(gameState.intendedSpeedMultiplier);
                    console.info("-> ACCELERATOR: Boost ended. Speed restored.");
                }
            } else {
                setGameSpeedMultiplier(gameState.intendedSpeedMultiplier);
            }
        }
    }

    const stickFigureGroundYForBags = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(currentHurdle.angleRad);
    const collectionY = stickFigureGroundYForBags;

    for (let i = gameState.activeCashBags.length - 1; i >= 0; i--) {
        const bag = gameState.activeCashBags[i];
        if (bag.isDone) {
            removeCashBag(i);
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

    if (gameState.segmentProgress >= 1) {
        const completedSegment = gameState.raceSegments[gameState.currentSegmentIndex];
        console.log(`-> SEGMENT COMPLETE: Reached Milestone ${gameState.currentSegmentIndex}. Value: $${completedSegment.milestoneValue.toLocaleString()}`);

        setDaysCounter(completedSegment.durationDays, completedSegment.durationDelta, 0);

        if (gameState.currentSegmentIndex > 0) {
            setAccumulatedCash(completedSegment.milestoneValue);
            addCashBag({
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

        gameState.daysAccumulatedAtSegmentStart += completedSegment.durationDays;

        gameState.currentSegmentIndex++;
        setSegmentProgress(0);
        setBackgroundOffset(0);

        setAccelerating(false);
        setAccelerationDuration(0);
        setColliding(false);
        setCollisionDuration(0);
        setDecelerating(false);
        setDecelerationDuration(0);
        gameState.activeCustomEvents.forEach(e => e.isActive = false);
        setGameSpeedMultiplier(gameState.intendedSpeedMultiplier);

        setCurrentObstacle(null);
        setCurrentAccelerator(null);
        setOnScreenCustomEvent(null);

        if (gameState.currentSegmentIndex === gameState.raceSegments.length - 1) {
            preloadEndgameSounds();
        }

        if (gameState.currentSegmentIndex < gameState.raceSegments.length) {
            console.log(`-> NEW SEGMENT START: Index ${gameState.currentSegmentIndex}. Visual Duration: ${gameState.raceSegments[gameState.currentSegmentIndex].visualDurationMs.toFixed(0)}ms`);
        }
    }

    if (gameState.jumpState.isHurdle) {
        setHurdleDuration(gameState.jumpState.hurdleDuration - deltaTime);
        if (gameState.jumpState.hurdleDuration <= 0) {
            setHurdle(false);
        }
    }

    if (gameState.jumpState.isSpecialMove) {
        setSpecialMoveDuration(gameState.jumpState.specialMoveDuration - deltaTime);
        if (gameState.jumpState.specialMoveDuration <= 0) {
            setSpecialMove(false);
        }
    }
    if (gameState.jumpState.isPowerStomp) {
        setPowerStompDuration(gameState.jumpState.powerStompDuration - deltaTime);
        if (gameState.jumpState.powerStompDuration <= 0) {
            setPowerStomp(false);
        }
    }
    if (gameState.jumpState.isDive) {
        setDiveDuration(gameState.jumpState.diveDuration - deltaTime);
        if (gameState.jumpState.diveDuration <= 0) {
            setDive(false);
        }
    }
    if (gameState.jumpState.isCorkscrewSpin) {
        setCorkscrewSpinDuration(gameState.jumpState.corkscrewSpinDuration - deltaTime);
        if (gameState.jumpState.corkscrewSpinDuration <= 0) {
            setCorkscrewSpin(false);
        }
    }
    if (gameState.jumpState.isScissorKick) {
        setScissorKickDuration(gameState.jumpState.scissorKickDuration - deltaTime);
        if (gameState.jumpState.scissorKickDuration <= 0) {
            setScissorKick(false);
        }
    }
    if (gameState.jumpState.isPhaseDash) {
        setPhaseDashDuration(gameState.jumpState.phaseDashDuration - deltaTime);
        if (gameState.jumpState.phaseDashDuration <= 0) {
            setPhaseDash(false);
        }
    }
    if (gameState.jumpState.isHover) {
        setHoverDuration(gameState.jumpState.hoverDuration - deltaTime);
        if (gameState.jumpState.hoverDuration <= 0) {
            setHover(false);
        }
    }
    if (gameState.jumpState.isGroundPound) {
        setGroundPoundDuration(gameState.jumpState.groundPoundDuration - deltaTime);
        // Check if the pound is about to hit the ground and the effect hasn't been triggered yet
        if (gameState.jumpState.groundPoundDuration < 100 && !gameState.jumpState.groundPoundEffectTriggered) {
            const groundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(gameState.raceSegments[gameState.currentSegmentIndex].angleRad);
            drawing.createGroundPoundEffect(STICK_FIGURE_FIXED_X, groundY);
            setGroundPoundEffectTriggered(true);
        }
        if (gameState.jumpState.groundPoundDuration <= 0) {
            setGroundPound(false);
        }
    }
    if (gameState.jumpState.isCartoonScramble) {
        setCartoonScrambleDuration(gameState.jumpState.cartoonScrambleDuration - deltaTime);
        if (gameState.jumpState.cartoonScrambleDuration <= 0) {
            setCartoonScramble(false);
        }
    }
    if (gameState.jumpState.isMoonwalking) {
        setMoonwalkDuration(gameState.jumpState.moonwalkDuration - deltaTime);
        if (gameState.jumpState.moonwalkDuration <= 0) {
            setMoonwalking(false);
        }
    }
    if (gameState.jumpState.isShockwave) {
        setShockwaveDuration(gameState.jumpState.shockwaveDuration - deltaTime);
        if (gameState.jumpState.shockwaveDuration <= 0) {
            setShockwave(false);
        }
    }
    if (gameState.jumpState.isBackflip) {
        setBackflipDuration(gameState.jumpState.backflipDuration - deltaTime);
        if (gameState.jumpState.backflipDuration <= 0) {
            setBackflip(false);
        }
    }
    if (gameState.jumpState.isFrontflip) {
        setFrontflipDuration(gameState.jumpState.frontflipDuration - deltaTime);
        if (gameState.jumpState.frontflipDuration <= 0) {
            setFrontflip(false);
        }
    }
    if (gameState.jumpState.isHoudini) {
        const previousPhase = gameState.jumpState.houdiniPhase;
        setHoudiniDuration(gameState.jumpState.houdiniDuration - deltaTime);

        if (gameState.jumpState.houdiniDuration <= 400) {
            setHoudiniPhase('reappearing');
            if (previousPhase === 'disappearing') {
                // Trigger the reappearing poof once
                const playerY = GROUND_Y - gameState.jumpState.progress * 200; // Approximate player Y
                drawing.createHoudiniPoof(STICK_FIGURE_FIXED_X, playerY - 50);
            }
        }
        if (gameState.jumpState.houdiniDuration <= 0) {
            setHoudini(false);
        }
    }

    if (gameState.jumpState.isFieryHoudini) {
        const previousPhase = gameState.jumpState.fieryHoudiniPhase;
        setFieryHoudiniDuration(gameState.jumpState.fieryHoudiniDuration - deltaTime);

        if (gameState.jumpState.fieryHoudiniDuration <= FIERY_HOUDINI_DURATION_MS / 2) {
            setFieryHoudiniPhase('reappearing');
            if (previousPhase === 'disappearing') {
                const playerY = GROUND_Y - gameState.jumpState.progress * 200; // Approximate player Y
                drawing.createFieryHoudiniPoof(STICK_FIGURE_FIXED_X, playerY - 50);
            }
        }
        if (gameState.jumpState.fieryHoudiniDuration <= 0) {
            setFieryHoudini(false);
        }
    }

    if (gameState.jumpState.isFireSpinner) {
        setFireSpinnerDuration(gameState.jumpState.fireSpinnerDuration - deltaTime);
        if (gameState.jumpState.fireSpinnerDuration <= 0) {
            setFireSpinner(false);
        }
    }

    // Check and update Fire Spinner cooldown
    if (gameState.isFireSpinnerOnCooldown) {
        const now = Date.now();
        if (now - gameState.fireSpinnerLastActivationTime > gameState.fireSpinnerCooldown) {
            setFireSpinnerOnCooldown(false);
            console.log("-> FIRE SPINNER: Cooldown finished. Ready.");
        }
    }

    // Update incinerating obstacles
    for (let i = gameState.incineratingObstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.incineratingObstacles[i];
        const elapsed = performance.now() - obstacle.startTime;
        obstacle.animationProgress = Math.min(1, elapsed / 1000); // 1-second animation

        if (obstacle.animationProgress >= 1) {
            removeIncineratingObstacle(i);
        }
    }

    // Update vanishing obstacles
    for (let i = gameState.vanishingObstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.vanishingObstacles[i];
        const elapsed = performance.now() - obstacle.startTime;
        if (elapsed > 300) { // Corresponds to VANISH_DURATION in drawing.js
            removeVanishingObstacle(i);
        }
    }

    incrementFrameCount();

    setLastTime(timestamp);
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
    state.environmentalEffects.volcanoSmoke = [];
    state.environmentalEffects.embers = [];
    state.environmentalEffects.ash = [];
    state.environmentalEffects.steamVents = [];
    state.environmentalEffects.heatShimmer = { active: false, waveY: 0 };
    state.environmentalEffects.cityscape = { buildings: [] };

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
    if (gameState.raceSegments.length < 2) {
        // dataMessage.textContent = "Error: Cannot start. Load valid data with at least two milestones."; // Handled in UI
        // dataMessage.style.color = 'red';
        console.error("-> START GAME FAILED: Insufficient milestones.");
        return;
    }
    if (gameState.gameRunning) return;

    gameState.raceSegments = gameState.raceSegments; // Initialize raceSegments in the state

    console.log("-> START GAME: Initiating game start sequence.");

    // Reset all game state variables to their defaults
    gameState.currentSegmentIndex = 0;
    gameState.segmentProgress = 0;
    gameState.lastTime = 0;
    gameState.backgroundOffset = 0;
    gameState.frameCount = 0;
    gameState.accumulatedCash = gameState.raceSegments[0].milestoneValue;
    gameState.activeCashBags.length = 0;
    gameState.fireTrail = [];
    gameState.incineratingObstacles = [];
    gameState.vanishingObstacles = [];
    gameState.houdiniParticles = [];
    gameState.groundPoundParticles = [];
    gameState.moonwalkParticles = [];
    gameState.hoverParticles = [];
    gameState.scrambleParticles = [];
    gameState.diveParticles = [];
    gameState.swooshParticles = [];
    gameState.flipTrail = [];
    gameState.corkscrewTrail = [];
    gameState.shatteredObstacles.length = 0;
    gameState.ignitedObstacles = [];
    gameState.isFirestormActive = false;
    gameState.firestormEndTime = 0;
    gameState.firestormParticles = [];
    gameState.playerEmberParticles = [];
    gameState.ignitedObstacles = [];
    gameState.isFirestormDrainingEnergy = false;
    gameState.firestormDrainEndTime = 0;
    gameState.isFireSpinnerDrainingEnergy = false;
    gameState.fireSpinnerDrainEndTime = 0;
    gameState.isMageSpinnerActive = false;
    gameState.mageSpinnerEndTime = 0;
    gameState.isMageSpinnerOnCooldown = false;
    gameState.mageSpinnerLastActivationTime = 0;
    gameState.mageSpinnerFireballTimer = 0;
    gameState.mageSpinnerFireballsSpawned = 0;
    gameState.playerEnergy = gameState.maxPlayerEnergy; // Start energy at max
    gameState.jumpState = {
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
    gameState.manualJumpOverride = {isActive: false, startTime: 0, duration: gameState.manualJumpDurationMs};
    gameState.isColliding = false;
    gameState.collisionDuration = 0;
    gameState.currentObstacle = null;
    gameState.currentAccelerator = null;
    gameState.isAccelerating = false;
    gameState.accelerationDuration = 0;
    gameState.isDecelerating = false;
    gameState.decelerationDuration = 0;
    gameState.onScreenCustomEvent = null;
    gameState.isFireSpinnerOnCooldown = false;
    gameState.fireSpinnerLastActivationTime = 0;
    gameState.isFireMageActive = false;
    gameState.fireMageEndTime = 0;
    gameState.isFireMageOnCooldown = false;
    gameState.fireMageLastActivationTime = 0;
    gameState.activeFireballs = [];
    gameState.hitsCounter = 0;
    gameState.daysElapsedTotal = 0;
    gameState.daysAccumulatedAtSegmentStart = 0;
    gameState.isVictory = false;
    gameState.isGameOverSequence = false;
    gameState.gameOverSequenceStartTime = 0;
    gameState.isPaused = false;

    drawing.setInitialLoad(false);

    applySkillLevelSettings(gameState.currentSkillLevel);

    gameState.gameSpeedMultiplier = gameState.intendedSpeedMultiplier;

    let musicUrl = DEFAULT_MUSIC_URL;
    if (gameState.selectedPersona && gameState.selectedPersona !== 'custom' && personas[gameState.selectedPersona]) {
        musicUrl = personas[gameState.selectedPersona].music;
    } else if (gameState.currentTheme && THEME_MUSIC_MAP[gameState.currentTheme]) {
        musicUrl = THEME_MUSIC_MAP[gameState.currentTheme];
    } else {
        const cleanEmoji = gameState.stickFigureEmoji.replace(/\uFE0F/g, '');
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

    gameState.activeCustomEvents = Object.values(gameState.customEvents).flat().map(event => ({
        ...event,
        wasTriggered: false,
        isActive: false,
        wasSpawned: false
    })).sort((a, b) => a.daysSinceStart - b.daysSinceStart);
    console.log(`-> START GAME: ${gameState.activeCustomEvents.length} custom events enabled.`);

    drawing.initializeClouds();
    drawing.generateGrassBlades(0); // Initialize grass blades on game start

    gameState.gameRunning = true;

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