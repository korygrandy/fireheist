import state from './state.js';

export const GRASS_ANIMATION_INTERVAL_MS = 100;

/**
 * The single source of truth for all state reads.
 * Components should import this to get the current state.
 */
export const gameState = state;

/**
 * =================================================================
 * STATE MUTATION FUNCTIONS
 * =================================================================
 * All functions that change the game state should be centralized here.
 */

/**
 * Sets the game's running status.
 * @param {boolean} isRunning
 */
export function setGameRunning(isRunning) {
    state.gameRunning = isRunning;
}

/**
 * Sets the game's paused status.
 * @param {boolean} isPaused
 */
export function setPaused(isPaused) {
    state.isPaused = isPaused;
}

/**
 * Increments the hits counter.
 */
export function incrementHits() {
    state.hitsCounter++;
}

/**
 * Resets the consecutive ground pound and incineration streaks.
 */
export function resetStreaks() {
    if (state.playerStats.consecutiveGroundPounds > 0) {
        console.log(`[DEBUG] Streak RESET. Was: ${state.playerStats.consecutiveGroundPounds}`);
        state.playerStats.consecutiveGroundPounds = 0;
    }
    if (state.playerStats.consecutiveIncinerations > 0) {
        state.playerStats.consecutiveIncinerations = 0;
    }
}

/**
 * Updates the player's energy, ensuring it stays within bounds.
 * @param {number} newEnergy
 */
export function setPlayerEnergy(newEnergy) {
    state.playerEnergy = Math.max(0, Math.min(state.maxPlayerEnergy, newEnergy));
}

/**
 * Sets the game over sequence status.
 * @param {boolean} isGameOver
 */
export function setGameOverSequence(isGameOver) {
    state.isGameOverSequence = isGameOver;
}

/**
 * Sets the victory status of the game.
 * @param {boolean} isVictory
 */
export function setVictory(isVictory) {
    state.isVictory = isVictory;
}

/**
 * Sets the start time of the game over sequence.
 * @param {number} time
 */
export function setGameOverSequenceStartTime(time) {
    state.gameOverSequenceStartTime = time;
}

/**
 * Sets the last recorded timestamp for the animation frame.
 * @param {number} time
 */
export function setLastTime(time) {
    state.lastTime = time;
}

/**
 * Sets the active status of Firestorm.
 * @param {boolean} isActive
 */
export function setFirestormActive(isActive) {
    state.isFirestormActive = isActive;
}

/**
 * Sets the end time for Firestorm.
 * @param {number} time
 */
export function setFirestormEndTime(time) {
    state.firestormEndTime = time;
}

/**
 * Sets the energy draining status for Firestorm.
 * @param {boolean} isDraining
 */
export function setFirestormDrainingEnergy(isDraining) {
    state.isFirestormDrainingEnergy = isDraining;
}

/**
 * Sets the end time for Firestorm energy drain.
 * @param {number} time
 */
export function setFirestormDrainEndTime(time) {
    state.firestormDrainEndTime = time;
}

/**
 * Sets the energy draining status for Fire Spinner.
 * @param {boolean} isDraining
 */
export function setFireSpinnerDrainingEnergy(isDraining) {
    state.isFireSpinnerDrainingEnergy = isDraining;
}

/**
 * Sets the end time for Fire Spinner energy drain.
 * @param {number} time
 */
export function setFireSpinnerDrainEndTime(time) {
    state.fireSpinnerDrainEndTime = time;
}

/**
 * Sets the active status of Mage Spinner.
 * @param {boolean} isActive
 */
export function setMageSpinnerActive(isActive) {
    state.isMageSpinnerActive = isActive;
}

/**
 * Sets the end time for Mage Spinner.
 * @param {number} time
 */
export function setMageSpinnerEndTime(time) {
    state.mageSpinnerEndTime = time;
}

/**
 * Sets the cooldown status of Fire Mage.
 * @param {boolean} isOnCooldown
 */
export function setFireMageOnCooldown(isOnCooldown) {
    state.isFireMageOnCooldown = isOnCooldown;
}

/**
 * Sets the active status of Fire Mage.
 * @param {boolean} isActive
 */
export function setFireMageActive(isActive) {
    state.isFireMageActive = isActive;
}

/**
 * Sets the end time for Fire Mage.
 * @param {number} time
 */
export function setFireMageEndTime(time) {
    state.fireMageEndTime = time;
}

/**
 * Sets the Mage Spinner fireball timer.
 * @param {number} time
 */
export function setMageSpinnerFireballTimer(time) {
    state.mageSpinnerFireballTimer = time;
}

/**
 * Increments the count of fireballs spawned by Mage Spinner.
 */
export function incrementMageSpinnerFireballsSpawned() {
    state.mageSpinnerFireballsSpawned++;
}

/**
 * Sets the cooldown status of Mage Spinner.
 * @param {boolean} isOnCooldown
 */
export function setMageSpinnerOnCooldown(isOnCooldown) {
    state.isMageSpinnerOnCooldown = isOnCooldown;
}

/**
 * Sets the cooldown status of Fiery Houdini.
 * @param {boolean} isOnCooldown
 */
export function setFieryHoudiniOnCooldown(isOnCooldown) {
    state.isFieryHoudiniOnCooldown = isOnCooldown;
}

/**
 * Sets the active status of manual jump override.
 * @param {boolean} isActive
 */
export function setManualJumpOverrideActive(isActive) {
    state.manualJumpOverride.isActive = isActive;
}

/**
 * Sets the progress of the current jump.
 * @param {number} progress
 */
export function setJumpProgress(progress) {
    state.jumpState.progress = progress;
}

/**
 * Sets the jumping status of the stick figure.
 * @param {boolean} isJumping
 */
export function setJumping(isJumping) {
    state.jumpState.isJumping = isJumping;
}

/**
 * Sets the segment progress.
 * @param {number} progress
 */
export function setSegmentProgress(progress) {
    state.segmentProgress = progress;
}

/**
 * Sets the background offset.
 * @param {number} offset
 */
export function setBackgroundOffset(offset) {
    state.backgroundOffset = offset;
}

/**
 * Sets the total days elapsed.
 * @param {number} days
 */
export function setDaysElapsedTotal(days) {
    state.daysElapsedTotal = days;
}

/**
 * Sets the on-screen custom event.
 * @param {object|null} event
 */
export function setOnScreenCustomEvent(event) {
    state.onScreenCustomEvent = event;
}

/**
 * Sets the current obstacle.
 * @param {object|null} obstacle
 */
export function setCurrentObstacle(obstacle) {
    state.currentObstacle = obstacle;
}

/**
 * Adds an ignited obstacle.
 * @param {object} obstacle
 */
export function addIgnitedObstacle(obstacle) {
    state.ignitedObstacles.push(obstacle);
}

/**
 * Removes an ignited obstacle by index.
 * @param {number} index
 */
export function removeIgnitedObstacle(index) {
    state.ignitedObstacles.splice(index, 1);
}

/**
 * Adds a vanishing obstacle.
 * @param {object} obstacle
 */
export function addVanishingObstacle(obstacle) {
    state.vanishingObstacles.push(obstacle);
}

/**
 * Removes a vanishing obstacle by index.
 * @param {number} index
 */
export function removeVanishingObstacle(index) {
    state.vanishingObstacles.splice(index, 1);
}

/**
 * Adds an active fireball.
 * @param {object} fireball
 */
export function addFireball(fireball) {
    state.activeFireballs.push(fireball);
}

/**
 * Removes an active fireball by index.
 * @param {number} index
 */
export function removeFireball(index) {
    state.activeFireballs.splice(index, 1);
}

/**
 * Increments the obstacles incinerated count.
 */
export function incrementObstaclesIncinerated() {
    state.playerStats.obstaclesIncinerated++;
}

/**
 * Sets the obstacles incinerated count.
 * @param {number} count
 */
export function setObstaclesIncinerated(count) {
    state.playerStats.obstaclesIncinerated = count;
}

/**
 * Increments the consecutive incinerations count.
 */
export function incrementConsecutiveIncinerations() {
    state.playerStats.consecutiveIncinerations++;
}

/**
 * Increments the consecutive ground pounds count.
 */
export function incrementConsecutiveGroundPounds() {
    state.playerStats.consecutiveGroundPounds++;
}

/**
 * Increments the total ground pound collisions count.
 */
export function incrementTotalGroundPoundCollisions() {
    state.playerStats.totalGroundPoundCollisions++;
}

/**
 * Sets the colliding status.
 * @param {boolean} isColliding
 */
export function setColliding(isColliding) {
    state.isColliding = isColliding;
}

/**
 * Sets the collision duration.
 * @param {number} duration
 */
export function setCollisionDuration(duration) {
    state.collisionDuration = duration;
}

/**
 * Sets the current accelerator.
 * @param {object|null} accelerator
 */
export function setCurrentAccelerator(accelerator) {
    state.currentAccelerator = accelerator;
}

/**
 * Sets the accelerating status.
 * @param {boolean} isAccelerating
 */
export function setAccelerating(isAccelerating) {
    state.isAccelerating = isAccelerating;
}

/**
 * Sets the acceleration duration.
 * @param {number} duration
 */
export function setAccelerationDuration(duration) {
    state.accelerationDuration = duration;
}

/**
 * Sets the decelerating status.
 * @param {boolean} isDecelerating
 */
export function setDecelerating(isDecelerating) {
    state.isDecelerating = isDecelerating;
}

/**
 * Sets the deceleration duration.
 * @param {number} duration
 */
export function setDecelerationDuration(duration) {
    state.decelerationDuration = duration;
}

/**
 * Sets the game speed multiplier.
 * @param {number} multiplier
 */
export function setGameSpeedMultiplier(multiplier) {
    state.gameSpeedMultiplier = multiplier;
}

/**
 * Sets the screen flash properties.
 * @param {number} opacity
 * @param {number} duration
 * @param {number} startTime
 */
export function setScreenFlash(opacity, duration, startTime) {
    state.screenFlash = { opacity, duration, startTime };
}

/**
 * Sets the stick figure burst properties.
 * @param {boolean} active
 * @param {number} startTime
 * @param {number} progress
 */
export function setStickFigureBurst(active, startTime, progress) {
    state.stickFigureBurst = { ...state.stickFigureBurst, active, startTime, progress };
}

/**
 * Sets the turbo boost frame.
 * @param {number} frame
 */
export function setTurboBoostFrame(frame) {
    state.turboBoost.frame = frame;
}

/**
 * Sets the turbo boost last frame time.
 * @param {number} time
 */
export function setTurboBoostLastFrameTime(time) {
    state.turboBoost.lastFrameTime = time;
}

/**
 * Adds a cash bag.
 * @param {object} bag
 */
export function addCashBag(bag) {
    state.activeCashBags.push(bag);
}

/**
 * Removes a cash bag by index.
 * @param {number} index
 */
export function removeCashBag(index) {
    state.activeCashBags.splice(index, 1);
}

/**
 * Sets the days counter.
 * @param {number} days
 * @param {number} delta
 * @param {number} frame
 */
export function setDaysCounter(days, delta, frame) {
    state.daysCounter = { days, delta, frame };
}

export function setAccumulatedCash(value) {
    state.accumulatedCash = value;
}

export function setTotalAccumulatedCash(value) {
    state.playerStats.totalAccumulatedCash = value;
}

export function setPlayerSkillLevel(skillKey, level) {
    if (!gameState.playerStats.skillLevels) {
        gameState.playerStats.skillLevels = {};
    }
    gameState.playerStats.skillLevels[skillKey] = level;
}

export function setHurdle(value) {
    gameState.jumpState.isHurdle = value;
}

/**
 * Sets the hurdle duration.
 * @param {number} duration
 */
export function setHurdleDuration(duration) {
    state.jumpState.hurdleDuration = duration;
}

/**
 * Sets the special move status.
 * @param {boolean} isSpecialMove
 */
export function setSpecialMove(isSpecialMove) {
    state.jumpState.isSpecialMove = isSpecialMove;
}

/**
 * Sets the special move duration.
 * @param {number} duration
 */
export function setSpecialMoveDuration(duration) {
    state.jumpState.specialMoveDuration = duration;
}

/**
 * Sets the power stomp status.
 * @param {boolean} isPowerStomp
 */
export function setPowerStomp(isPowerStomp) {
    state.jumpState.isPowerStomp = isPowerStomp;
}

/**
 * Sets the power stomp duration.
 * @param {number} duration
 */
export function setPowerStompDuration(duration) {
    state.jumpState.powerStompDuration = duration;
}

/**
 * Sets the dive status.
 * @param {boolean} isDive
 */
export function setDive(isDive) {
    state.jumpState.isDive = isDive;
}

/**
 * Sets the dive duration.
 * @param {number} duration
 */
export function setDiveDuration(duration) {
    state.jumpState.diveDuration = duration;
}

/**
 * Sets the corkscrew spin status.
 * @param {boolean} isCorkscrewSpin
 */
export function setCorkscrewSpin(isCorkscrewSpin) {
    state.jumpState.isCorkscrewSpin = isCorkscrewSpin;
}

/**
 * Sets the corkscrew spin duration.
 * @param {number} duration
 */
export function setCorkscrewSpinDuration(duration) {
    state.jumpState.corkscrewSpinDuration = duration;
}

/**
 * Sets the scissor kick status.
 * @param {boolean} isScissorKick
 */
export function setScissorKick(isScissorKick) {
    state.jumpState.isScissorKick = isScissorKick;
}

/**
 * Sets the scissor kick duration.
 * @param {number} duration
 */
export function setScissorKickDuration(duration) {
    state.jumpState.scissorKickDuration = duration;
}

/**
 * Sets the phase dash status.
 * @param {boolean} isPhaseDash
 */
export function setPhaseDash(isPhaseDash) {
    state.jumpState.isPhaseDash = isPhaseDash;
}

/**
 * Sets the phase dash duration.
 * @param {number} duration
 */
export function setPhaseDashDuration(duration) {
    state.jumpState.phaseDashDuration = duration;
}

/**
 * Sets the hover status.
 * @param {boolean} isHover
 */
export function setHover(isHover) {
    state.jumpState.isHover = isHover;
}

/**
 * Sets the hover duration.
 * @param {number} duration
 */
export function setHoverDuration(duration) {
    state.jumpState.hoverDuration = duration;
}

/**
 * Sets the ground pound status.
 * @param {boolean} isGroundPound
 */
export function setGroundPound(isGroundPound) {
    state.jumpState.isGroundPound = isGroundPound;
}

/**
 * Sets the ground pound duration.
 * @param {number} duration
 */
export function setGroundPoundDuration(duration) {
    state.jumpState.groundPoundDuration = duration;
}

/**
 * Sets the ground pound effect triggered status.
 * @param {boolean} isTriggered
 */
export function setGroundPoundEffectTriggered(isTriggered) {
    state.jumpState.groundPoundEffectTriggered = isTriggered;
}

export function setFieryGroundPound(isFieryGroundPound) {
    state.jumpState.isFieryGroundPound = isFieryGroundPound;
}

export function setFieryGroundPoundDuration(duration) {
    state.jumpState.fieryGroundPoundDuration = duration;
}

/**
 * Sets the cartoon scramble status.
 * @param {boolean} isCartoonScramble
 */
export function setCartoonScramble(isCartoonScramble) {
    state.jumpState.isCartoonScramble = isCartoonScramble;
}

/**
 * Sets the cartoon scramble duration.
 * @param {number} duration
 */
export function setCartoonScrambleDuration(duration) {
    state.jumpState.cartoonScrambleDuration = duration;
}

/**
 * Sets the moonwalking status.
 * @param {boolean} isMoonwalking
 */
export function setMoonwalking(isMoonwalking) {
    state.jumpState.isMoonwalking = isMoonwalking;
}

/**
 * Sets the moonwalk duration.
 * @param {number} duration
 */
export function setMoonwalkDuration(duration) {
    state.jumpState.moonwalkDuration = duration;
}

/**
 * Sets the shockwave status.
 * @param {boolean} isShockwave
 */
export function setShockwave(isShockwave) {
    state.jumpState.isShockwave = isShockwave;
}

/**
 * Sets the shockwave duration.
 * @param {number} duration
 */
export function setShockwaveDuration(duration) {
    state.jumpState.shockwaveDuration = duration;
}

/**
 * Sets the backflip status.
 * @param {boolean} isBackflip
 */
export function setBackflip(isBackflip) {
    state.jumpState.isBackflip = isBackflip;
}

/**
 * Sets the backflip duration.
 * @param {number} duration
 */
export function setBackflipDuration(duration) {
    state.jumpState.backflipDuration = duration;
}

/**
 * Sets the frontflip status.
 * @param {boolean} isFrontflip
 */
export function setFrontflip(isFrontflip) {
    state.jumpState.isFrontflip = isFrontflip;
}

/**
 * Sets the frontflip duration.
 * @param {number} duration
 */
export function setFrontflipDuration(duration) {
    state.jumpState.frontflipDuration = duration;
}

/**
 * Sets the houdini status.
 * @param {boolean} isHoudini
 */
export function setHoudini(isHoudini) {
    state.jumpState.isHoudini = isHoudini;
}

/**
 * Sets the houdini duration.
 * @param {number} duration
 */
export function setHoudiniDuration(duration) {
    state.jumpState.houdiniDuration = duration;
}

/**
 * Sets the houdini phase.
 * @param {string} phase
 */
export function setHoudiniPhase(phase) {
    state.jumpState.houdiniPhase = phase;
}

/**
 * Sets the fiery houdini status.
 * @param {boolean} isFieryHoudini
 */
export function setFieryHoudini(isFieryHoudini) {
    state.jumpState.isFieryHoudini = isFieryHoudini;
}

/**
 * Sets the fiery houdini duration.
 * @param {number} duration
 */
export function setFieryHoudiniDuration(duration) {
    state.jumpState.fieryHoudiniDuration = duration;
}

/**
 * Sets the fiery houdini phase.
 * @param {string} phase
 */
export function setFieryHoudiniPhase(phase) {
    state.jumpState.fieryHoudiniPhase = phase;
}

/**
 * Sets the blink strike status.
 * @param {boolean} isBlinkStrike
 */
export function setBlinkStrike(isBlinkStrike) {
    state.jumpState.isBlinkStrike = isBlinkStrike;
}

/**
 * Sets the blink strike duration.
 * @param {number} duration
 */
export function setBlinkStrikeDuration(duration) {
    state.jumpState.blinkStrikeDuration = duration;
}

/**
 * Sets the jetstream dashing status.
 * @param {boolean} isJetstreamDashing
 */
export function setJetstreamDashing(isJetstreamDashing) {
    state.jumpState.isJetstreamDashing = isJetstreamDashing;
}

/**
 * Sets the jetstream dash duration.
 * @param {number} duration
 */
export function setJetstreamDashDuration(duration) {
    state.jumpState.jetstreamDashDuration = duration;
}

/**
 * Sets the jetstream dash drain end time.
 * @param {number} time
 */
export function setJetstreamDashDrainEndTime(time) {
    state.jetstreamDashDrainEndTime = time;
}

/**
 * Sets the echo slam status.
 * @param {boolean} isEchoSlam
 */
export function setEchoSlam(isEchoSlam) {
    state.jumpState.isEchoSlam = isEchoSlam;
}

/**
 * Sets the echo slam duration.
 * @param {number} duration
 */
export function setEchoSlamDuration(duration) {
    state.jumpState.echoSlamDuration = duration;
}

/**
 * Sets the echo slam secondary triggered status.
 * @param {boolean} isTriggered
 */
export function setEchoSlamSecondaryTriggered(isTriggered) {
    state.jumpState.echoSlamSecondaryTriggered = isTriggered;
}

/**
 * Sets the fireball rolling status.
 * @param {boolean} isFireballRolling
 */
export function setFireballRolling(isFireballRolling) {
    state.jumpState.isFireballRolling = isFireballRolling;
}

/**
 * Sets the fireball roll duration.
 * @param {number} duration
 */
export function setFireballRollDuration(duration) {
    state.jumpState.fireballRollDuration = duration;
}

/**
 * Sets the fireball roll drain end time.
 * @param {number} time
 */
export function setFireballRollDrainEndTime(time) {
    state.fireballRollDrainEndTime = time;
}

/**
 * Sets the player's invisibility status.
 * @param {boolean} isInvisible
 */
export function setPlayerIsInvisible(isInvisible) {
    state.playerIsInvisible = isInvisible;
}

/**
 * Sets the stick figure's fixed X position.
 * @param {number} x
 */
export function setStickFigureFixedX(x) {
    state.stickFigureFixedX = x;
}

/**
 * Sets the stick figure's Y position.
 * @param {number} y
 */
export function setStickFigureY(y) {
    state.stickFigureY = y;
}

/**
 * Sets the fire spinner status.
 * @param {boolean} isFireSpinner
 */
export function setFireSpinner(isFireSpinner) {
    state.jumpState.isFireSpinner = isFireSpinner;
}

/**
 * Sets the fire spinner duration.
 * @param {number} duration
 */
export function setFireSpinnerDuration(duration) {
    state.jumpState.fireSpinnerDuration = duration;
}

/**
 * Sets the fire spinner cooldown status.
 * @param {boolean} isOnCooldown
 */
export function setFireSpinnerOnCooldown(isOnCooldown) {
    state.isFireSpinnerOnCooldown = isOnCooldown;
}

/**
 * Increments the frame count.
 */
export function incrementFrameCount() {
    state.frameCount++;
}

/**
 * Adds an obstacle to the incinerating list.
 * @param {object} obstacle
 */
export function addIncineratingObstacle(obstacle) {
    state.incineratingObstacles.push(obstacle);
}

/**
 * Removes an incinerating obstacle by index.
 * @param {number} index
 */
export function removeIncineratingObstacle(index) {
    state.incineratingObstacles.splice(index, 1);
}

export function clearActiveCashBags() { state.activeCashBags = []; }
export function clearFireTrail() { state.fireTrail = []; }
export function clearIncineratingObstacles() { state.incineratingObstacles = []; }
export function clearVanishingObstacles() { state.vanishingObstacles = []; }
export function clearHoudiniParticles() { state.houdiniParticles = []; }
export function clearGroundPoundParticles() { state.groundPoundParticles = []; }
export function clearFlipTrail() { state.flipTrail = []; }
export function clearMoonwalkParticles() { state.moonwalkParticles = []; }
export function clearHoverParticles() { state.hoverParticles = []; }
export function clearScrambleParticles() { state.scrambleParticles = []; }
export function clearDiveParticles() { state.diveParticles = []; }
export function clearSwooshParticles() { state.swooshParticles = []; }
export function clearCorkscrewTrail() { state.corkscrewTrail = []; }
export function clearShatteredObstacles() { state.shatteredObstacles = []; }
export function clearIgnitedObstacles() { state.ignitedObstacles = []; }
export function clearActiveFireballs() { state.activeFireballs = []; }
export function clearShotgunParticles() { state.shotgunParticles = []; }
export function addMolotovCocktail(cocktail) { state.molotovCocktails.push(cocktail); }
export function removeMolotovCocktail(index) { state.molotovCocktails.splice(index, 1); }
export function clearMolotovCocktails() { state.molotovCocktails = []; }

export function setObstacleHit(obstacle) {
    if (state.currentObstacle && state.currentObstacle.spawnTime === obstacle.spawnTime) {
        state.currentObstacle.hasBeenHit = true;
    }
    const ignited = state.ignitedObstacles.find(o => o.spawnTime === obstacle.spawnTime);
    if (ignited) {
        ignited.hasBeenHit = true;
    }
}

export function setShotgunBlastActive(isActive) {
    state.isShotgunBlastActive = isActive;
}

export function addShotgunParticle(particle) {
    state.shotgunParticles.push(particle);
}

export function resetJumpState() {
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
        isHoudini: false, houdiniDuration: 0, houdiniPhase: 'disappearing',
        isFieryHoudini: false, fieryHoudiniDuration: 0,
        isBlinkStrike: false, blinkStrikeDuration: 0,
        isJetstreamDashing: false, jetstreamDashDuration: 0,
        isEchoSlam: false, echoSlamDuration: 0, echoSlamSecondaryTriggered: false,
        isFireballRolling: false, fireballRollDuration: 0
    };
}

export function deactivateAllEvents() {
    state.activeCustomEvents.forEach(event => {
        if (event) {
            event.isActive = false;
        }
    });
}

export function resetManualJumpOverride() {
    state.manualJumpOverride = { isActive: false, startTime: 0, duration: state.manualJumpDurationMs };
}

export function activateCustomEvent(eventToActivate) {
    const event = state.activeCustomEvents.find(e => e && e.daysSinceStart === eventToActivate.daysSinceStart);
    if (event) {
        event.isActive = true;
        event.wasTriggered = true;
    }
}

// More state management functions will be added here as we refactor.

export function setDailyChallengeActive(isActive) {
    state.isDailyChallengeActive = isActive;
}

export function setSelectedTheme(theme) {
    state.selectedTheme = theme;
}

export function setStickFigureEmoji(emoji) {
    state.stickFigureEmoji = emoji;
}

export function setObstacleEmoji(emoji) {
    state.obstacleEmoji = emoji;
}

export function setActiveArmorySkill(skillKey) {
    state.playerStats.activeArmorySkill = skillKey;
}

export function setHasSeenNewArmoryIndicator(hasSeen) {
    state.playerStats.hasSeenNewArmoryIndicator = hasSeen;
}

export function setFinancialMilestones(milestones) {
    state.financialMilestones = milestones;
}

export function setRaceSegments(segments) {
    state.raceSegments = segments;
}

export function setCustomEvents(events) {
    state.customEvents = events;
}

export function setPlayerStats(stats) {
    state.playerStats = stats;
}

export function setHitsCounter(count) {
    state.hitsCounter = count;
}

export function setObstacleFrequencyPercent(percent) {
    state.obstacleFrequencyPercent = percent;
}

export function setUserObstacleFrequencyPercent(percent) {
    state.userObstacleFrequencyPercent = percent;
}

export function setEnableRandomPowerUps(enabled) {
    state.enableRandomPowerUps = enabled;
}

export function setAutoHurdleEnabled(enabled) {
    state.isAutoHurdleEnabled = enabled;
}

export function setCurrentSkillLevel(level) {
    state.currentSkillLevel = level;
}

export function setMaxPlayerEnergy(energy) {
    state.maxPlayerEnergy = energy;
}

export function setPassiveDrainRate(rate) {
    state.passiveDrainRate = rate;
}

export function setAcceleratorFrequencyPercent(percent) {
    state.acceleratorFrequencyPercent = percent;
}

export function setIntendedSpeedMultiplier(multiplier) {
    state.intendedSpeedMultiplier = multiplier;
}

export function setSelectedPersona(personaKey) {
    state.selectedPersona = personaKey;
}

export function setObstacleFrequency(frequency) {
    state.obstacleFrequencyPercent = frequency;
}

export function setSkillLevel(level) {
    state.currentSkillLevel = level;
}


