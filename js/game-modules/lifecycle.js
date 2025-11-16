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
    ENERGY_SETTINGS,
    ENERGY_GAIN_ACCELERATOR,
    FIRE_MAGE_COOLDOWN_MS,
    MAGE_SPINNER_COOLDOWN_MS,
    MAGE_SPINNER_DURATION_MS,
    MAGE_SPINNER_FIREBALL_INTERVAL_MS,
    MAGE_SPINNER_FIREBALL_COUNT,
    MAGE_SPINNER_ENERGY_COST,
    ACCELERATOR_BASE_SPEED_BOOST,
    JETSTREAM_DASH_DURATION_MS,
    FIREBALL_ROLL_DURATION_MS,
} from '../constants.js';
import {
    playWinnerSound,
    playLoserSound,
    playAnimationSound,
    playCollisionSound,
    playQuackSound,
    playPowerUpSound,
    playChaChing
} from '../audio.js';
import { savePlayerStats } from '../ui-modules/settings.js';
import { checkForNewUnlocks } from '../ui-modules/unlocks.js';
import {
    setPaused,
    gameState,
    setGameOverSequence,
    setVictory,
    setGameOverSequenceStartTime,
    setLastTime,
    setFireMageOnCooldown,
    setFireMageActive,
    setFireMageEndTime,
    setMageSpinnerFireballTimer,
    incrementMageSpinnerFireballsSpawned,
    setMageSpinnerOnCooldown,
    setMageSpinnerActive,
    setManualJumpOverrideActive,
    setJumpProgress,
    setJumping,
    setSegmentProgress,
    setBackgroundOffset,
    setDaysElapsedTotal,
    setOnScreenCustomEvent,
    setCurrentObstacle,
    addIgnitedObstacle,
    removeIgnitedObstacle,
    addVanishingObstacle,
    removeVanishingObstacle,
    addFireball,
    removeFireball,
    incrementObstaclesIncinerated,
    incrementConsecutiveIncinerations,
    setColliding,
    setCollisionDuration,
    setCurrentAccelerator,
    setAccelerating,
    setAccelerationDuration,
    setDecelerating,
    setDecelerationDuration,
    setGameSpeedMultiplier,
    setScreenFlash,
    setStickFigureBurst,
    setTurboBoostFrame,
    setTurboBoostLastFrameTime,
    addCashBag,
    removeCashBag,
    setDaysCounter,
    setAccumulatedCash,
    setHurdle,
    setHurdleDuration,
    setSpecialMove,
    setSpecialMoveDuration,
    setPowerStomp,
    setPowerStompDuration,
    setDive,
    setDiveDuration,
    setCorkscrewSpin,
    setCorkscrewSpinDuration,
    setScissorKick,
    setScissorKickDuration,
    setPhaseDash,
    setPhaseDashDuration,
    setHover,
    setHoverDuration,
    setGroundPound,
    setGroundPoundDuration,
    setFieryGroundPound,
    setFieryGroundPoundDuration,
    setGroundPoundEffectTriggered,
    setCartoonScramble,
    setCartoonScrambleDuration,
    setMoonwalking,
    setMoonwalkDuration,
    setShockwave,
    setShockwaveDuration,
    setBackflip,
    setBackflipDuration,
    setFrontflip,
    setFrontflipDuration,
    setHoudini,
    setHoudiniDuration,
    setHoudiniPhase,
    setBlinkStrike,
    setBlinkStrikeDuration,
    setPlayerIsInvisible,
    setStickFigureFixedX,
    setStickFigureY,
    setJetstreamDashing,
    setJetstreamDashDuration,
    setEchoSlam,
    setEchoSlamDuration,
    setEchoSlamSecondaryTriggered,
    setFireballRolling,
    setFireballRollDuration,
    incrementFrameCount,
    setPlayerEnergy,
    setGameRunning,
    incrementHits,
    addIncineratingObstacle,
    removeIncineratingObstacle,
    resetStreaks,
    deactivateAllEvents,
    activateCustomEvent,
    addMolotovCocktail,
    removeMolotovCocktail,
    clearMolotovCocktails,
    setObstacleHit,
} from './state-manager.js';
import { updateClouds } from './drawing/world.js';
import * as drawing from './drawing.js';
import { castMageSpinnerFireball } from './actions.js';
import { updateEnvironmentalEffects } from './drawing/environmental-effects.js';
import { createShatterEffect, createHoudiniPoof, createGroundPoundEffect, createFireTrail, createJetstreamParticle } from './drawing/effects.js';
import { checkCollision, checkAcceleratorCollision, checkProximityEventCollection } from './collision.js';
import { spawnObstacle, spawnAccelerator, spawnProximityEvent } from './spawning.js';
import { applySpeedEffect } from './effects.js';
import { updateHighScore } from './score.js';
import { animateValue } from './animations.js';
import { drawVictoryOverlay } from './drawing/overlays.js';
import { stopGame } from './game-controller.js';
import { checkShotgunCollision, checkMolotovCollision } from './collision.js';
import { molotovSkill } from './skills/molotov.js';
import { shotgunSkill } from './skills/shotgun.js';
import { fieryHoudiniSkill } from './skills/fieryHoudini.js';
import { fireSpinnerSkill } from './skills/fireSpinner.js';
import { firestormSkill } from './skills/firestorm.js';
import { fieryGroundPoundSkill } from './skills/fieryGroundPound.js';
import { fireMageSkill } from './skills/fireMage.js';
import { mageSpinnerSkill } from './skills/mageSpinner.js';

export function animate(timestamp) {
    if (!gameState.gameRunning && !gameState.isGameOverSequence) return;

    if (gameState.isPaused) {
        requestAnimationFrame(animate);
        return;
    }

    if (gameState.isInvincible && timestamp > gameState.invincibilityEndTime) {
        gameState.isInvincible = false;
    }

    if (gameState.currentSegmentIndex >= gameState.raceSegments.length) {
        if (!gameState.isGameOverSequence) {
            setVictory(gameState.hitsCounter === 0);
            if (gameState.isVictory) {
                playWinnerSound();
                if (gameState.selectedPersona !== 'custom') {
                    if (!gameState.playerStats.flawlessRuns) {
                        gameState.playerStats.flawlessRuns = {};
                    }
                    gameState.playerStats.flawlessRuns[gameState.currentSkillLevel] = true;
                    savePlayerStats(); 
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
            savePlayerStats(); 
            checkForNewUnlocks(gameState.playerStats); 

            // Disable the start button and re-enable it after 3 seconds
            const startButton = document.getElementById('startButton');
            if (startButton) {
                startButton.disabled = true;
                setTimeout(() => {
                    startButton.disabled = false;
                }, 3000);
            }
        }

        drawing.draw();
        drawVictoryOverlay(timestamp - gameState.gameOverSequenceStartTime);

        if (timestamp - gameState.gameOverSequenceStartTime >= VICTORY_DISPLAY_TIME) {
            if (gameState.isDailyChallengeActive) {
                // For daily challenges, activate the initials UI instead of stopping the game
                if (!gameState.leaderboardInitials.isActive) {
                    gameState.leaderboardInitials.isActive = true;
                }
            } else {
                // For sandbox mode, stop the game as before
                stopGame(false);
                setGameOverSequence(false);
                return;
            }
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
        if (event && !event.wasTriggered && daysCheck >= event.daysSinceStart) {
            if (!gameState.onScreenCustomEvent || gameState.onScreenCustomEvent.daysSinceStart !== event.daysSinceStart) {
                console.info(`-> CUSTOM EVENT AUTO-TRIGGERED: Date: ${event.date}. Object missed or spawned late. Applying effect directly.`);
                activateCustomEvent(event);
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
    setStickFigureY(runnerY); // Update the global state with the new Y position

    const objectMovementDelta = deltaTime * OBSTACLE_BASE_VELOCITY_PX_MS * gameState.gameSpeedMultiplier;
    if (gameState.currentObstacle) setCurrentObstacle({ ...gameState.currentObstacle, x: gameState.currentObstacle.x - objectMovementDelta });
    if (gameState.currentAccelerator) setCurrentAccelerator({ ...gameState.currentAccelerator, x: gameState.currentAccelerator.x - objectMovementDelta });
    if (gameState.onScreenCustomEvent) setOnScreenCustomEvent({ ...gameState.onScreenCustomEvent, x: gameState.onScreenCustomEvent.x - objectMovementDelta });
    gameState.ignitedObstacles.forEach(ob => {
        ob.x -= objectMovementDelta * (ob.speedMultiplier || 1);
    });

    for (let i = gameState.activeFireballs.length - 1; i >= 0; i--) {
        const fireball = gameState.activeFireballs[i];
        if (fireball.isMageSpinnerFireball) {
            fireball.x += fireball.velocityX * deltaTime;
            fireball.y += fireball.velocityY * deltaTime;
        } else {
            fireball.x += fireball.velocity * deltaTime; 
        }

        if (gameState.currentObstacle && !gameState.currentObstacle.hasBeenHit) {
            const obstacleX = gameState.currentObstacle.x;
            const obstacleY = GROUND_Y - obstacleX * Math.tan(angleRad) + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

            if (fireball.x + fireball.size > obstacleX &&
                fireball.x < obstacleX + OBSTACLE_WIDTH &&
                fireball.y + fireball.size > obstacleY &&
                fireball.y < obstacleY + OBSTACLE_HEIGHT) {

                const destructionType = Math.floor(Math.random() * 3);
                switch (destructionType) {
                    case 0: 
                        addIncineratingObstacle({
                            ...gameState.currentObstacle,
                            animationProgress: 0,
                            startTime: performance.now()
                        });
                        playAnimationSound('fireball');
                        break;
                    case 1: 
                        createShatterEffect(gameState.currentObstacle.x, obstacleY, gameState.currentObstacle.emoji);
                        playAnimationSound('shatter');
                        break;
                    case 2: 
                        addVanishingObstacle({
                            ...gameState.currentObstacle,
                            animationProgress: 0,
                            startTime: performance.now()
                        });
                        createHoudiniPoof(gameState.currentObstacle.x, obstacleY);
                        playAnimationSound('houdini');
                        break;
                }

                setCurrentObstacle(null); 
                incrementObstaclesIncinerated(); 
                incrementConsecutiveIncinerations();
                resetStreaks(); 
                console.log(`-> FIRE MAGE: Obstacle destroyed with type ${destructionType}!`);
                removeFireball(i); 
                continue; 
            }
        }

        if (fireball.x > canvas.width + fireball.size || fireball.y > canvas.height + fireball.size) {
            removeFireball(i);
        }
    }

    for (let i = gameState.ignitedObstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.ignitedObstacles[i];
        if (Date.now() > obstacle.burnoutTime) {
            addIncineratingObstacle({
                ...obstacle,
                animationProgress: 0,
                startTime: performance.now()
            });
            playAnimationSound('incinerate');
            incrementObstaclesIncinerated(); 
            incrementConsecutiveIncinerations();
            removeIgnitedObstacle(i);
        } else if (obstacle.x < -OBSTACLE_WIDTH) {
            removeIgnitedObstacle(i);
        }
    }

    if (gameState.frameCount % 60 === 0) { 
        if (!gameState.currentObstacle && Math.random() * 100 < gameState.obstacleFrequencyPercent) {
            spawnObstacle();
        }

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
                setPlayerEnergy(gameState.playerEnergy * 0.5); 
                console.warn(`-> COLLISION: Hit obstacle! Total hits: ${gameState.hitsCounter}. Speed penalty applied.`);
            }
            setCurrentObstacle({ ...gameState.currentObstacle, hasBeenHit: true });
            setAccelerating(false);
            setAccelerationDuration(0);
            setDecelerating(false);
            setDecelerationDuration(0);
            deactivateAllEvents();
        }
        if (gameState.currentObstacle && gameState.currentObstacle.x < -OBSTACLE_WIDTH) {
            resetStreaks(); 
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

    if (gameState.screenFlash.opacity > 0) {
        const elapsed = timestamp - gameState.screenFlash.startTime;
        if (elapsed > gameState.screenFlash.duration) {
            setScreenFlash(0, gameState.screenFlash.duration, gameState.screenFlash.startTime);
        } else {
            setScreenFlash((1 - elapsed / gameState.screenFlash.duration) * 0.7, gameState.screenFlash.duration, gameState.screenFlash.startTime);
        }
    }

    if (gameState.stickFigureBurst.active) {
        const elapsed = timestamp - gameState.stickFigureBurst.startTime;
        if (elapsed >= gameState.stickFigureBurst.duration) {
            setStickFigureBurst(false, gameState.stickFigureBurst.startTime, 0);
        } else {
            setStickFigureBurst(true, gameState.stickFigureBurst.startTime, elapsed / gameState.stickFigureBurst.duration);
        }
    }

    const turboBoostEl = document.getElementById('turbo-boost-animation');
    if (gameState.isAccelerating) {
        const frames = ['> ', '>>', ' >', '  '];
        const frameDuration = 100; 
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
        if (!gameState.stickFigureBurst.active) {
            if (gameState.isDecelerating) {
                setDecelerationDuration(gameState.decelerationDuration - deltaTime);
                setGameSpeedMultiplier(gameState.intendedSpeedMultiplier * DECELERATOR_BASE_SPEED_DEBUFF);
                if (gameState.decelerationDuration <= 0) {
                    setDecelerating(false);
                    setDecelerationDuration(0);
                    deactivateAllEvents();
                    setGameSpeedMultiplier(gameState.intendedSpeedMultiplier);
                    console.info("-> DECELERATOR: Debuff ended. Speed restored.");
                }
            } else if (gameState.isAccelerating) {
                setAccelerationDuration(gameState.accelerationDuration - deltaTime);
                setGameSpeedMultiplier(gameState.intendedSpeedMultiplier * ACCELERATOR_BASE_SPEED_BOOST);
                if (gameState.accelerationDuration <= 0) {
                    setAccelerating(false);
                    setAccelerationDuration(0);
                    deactivateAllEvents();
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
            setTimeout(() => {
                const startValue = gameState.displayCash;
                const endValue = completedSegment.milestoneValue;
                animateValue(startValue, endValue, 500, (currentValue) => {
                    gameState.displayCash = currentValue;
                });
                setAccumulatedCash(completedSegment.milestoneValue);
            }, CASH_BAG_ANIMATION_DURATION);
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
        deactivateAllEvents();
        setGameSpeedMultiplier(gameState.intendedSpeedMultiplier);

        setCurrentObstacle(null);
        setCurrentAccelerator(null);
        setOnScreenCustomEvent(null);

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
        if (gameState.jumpState.groundPoundDuration < 100 && !gameState.jumpState.groundPoundEffectTriggered) {
            const groundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(gameState.raceSegments[gameState.currentSegmentIndex].angleRad);
            createGroundPoundEffect(STICK_FIGURE_FIXED_X, groundY);
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
                const playerY = GROUND_Y - gameState.jumpState.progress * 200; 
                createHoudiniPoof(STICK_FIGURE_FIXED_X, playerY - 50);
            }
        }
        if (gameState.jumpState.houdiniDuration <= 0) {
            setHoudini(false);
        }
    }

    if (gameState.jumpState.isFieryHoudini) {
        fieryHoudiniSkill.update(gameState, deltaTime);
    }

    fireSpinnerSkill.update(gameState, deltaTime);
    firestormSkill.update(gameState, deltaTime);
    fieryGroundPoundSkill.update(gameState, deltaTime);
    fireMageSkill.update(gameState, deltaTime);
    mageSpinnerSkill.update(gameState, deltaTime);

    if (gameState.jumpState.isBlinkStrike) {
        setBlinkStrikeDuration(gameState.jumpState.blinkStrikeDuration - deltaTime);
        if (gameState.jumpState.blinkStrikeDuration <= 0) {
            setBlinkStrike(false);
            setPlayerIsInvisible(false); // Ensure player is visible after Blink Strike
            setStickFigureFixedX(STICK_FIGURE_FIXED_X); // Reset player X position
            setStickFigureY(undefined); // Reset player Y position
        }
    }

    if (gameState.jumpState.isJetstreamDashing) {
        setJetstreamDashDuration(gameState.jumpState.jetstreamDashDuration - deltaTime);
        if (gameState.jumpState.jetstreamDashDuration <= 0) {
            setJetstreamDashing(false);
            gameState.isInvincible = false; // End invincibility
        } else {
            // Emit jetstream particles
            createJetstreamParticle(gameState.stickFigureFixedX - 20, runnerY + STICK_FIGURE_TOTAL_HEIGHT / 2);
        }
    }

    if (gameState.jumpState.isEchoSlam) {
        setEchoSlamDuration(gameState.jumpState.echoSlamDuration - deltaTime);
        if (gameState.jumpState.echoSlamDuration <= 0) {
            setEchoSlam(false);
            setEchoSlamSecondaryTriggered(false); // Reset secondary trigger
        }
    }

    if (gameState.jumpState.isFireballRolling) {
        setFireballRollDuration(gameState.jumpState.fireballRollDuration - deltaTime);
        if (gameState.jumpState.fireballRollDuration <= 0) {
            setFireballRolling(false);
            gameState.isInvincible = false; // End invincibility
        } else {
            // Emit fire particles (re-using fire trail particles for now)
            createFireTrail(gameState.stickFigureFixedX, runnerY + STICK_FIGURE_TOTAL_HEIGHT / 2);
        }
    }



    for (let i = gameState.incineratingObstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.incineratingObstacles[i];
        const elapsed = performance.now() - obstacle.startTime;
        obstacle.animationProgress = Math.min(1, elapsed / 1000); 

        if (obstacle.animationProgress >= 1) {
            removeIncineratingObstacle(i);
        }
    }

    for (let i = gameState.vanishingObstacles.length - 1; i >= 0; i--) {
        const obstacle = gameState.vanishingObstacles[i];
        const elapsed = performance.now() - obstacle.startTime;
        if (elapsed > 300) { 
            removeVanishingObstacle(i);
        }
    }

// Update Molotov Cocktails
for (let i = gameState.molotovCocktails.length - 1; i >= 0; i--) {
    const cocktail = gameState.molotovCocktails[i];
    molotovSkill.update(cocktail, i, gameState, deltaTime);
}

    incrementFrameCount();

    setLastTime(timestamp);
    updateClouds(); 
    drawing.draw(runnerY);
    requestAnimationFrame(animate);
}
