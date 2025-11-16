import { createHoudiniPoof, createFieryHoudiniPoof, createMeteorStrikeEffect, createGroundPoundEffect, createShatterEffect } from './drawing/effects.js';
import { STICK_FIGURE_FIXED_X, GROUND_Y, ENERGY_SETTINGS, FIRE_MAGE_ENERGY_COST, FIRE_MAGE_DURATION_MS, FIRE_MAGE_COOLDOWN_MS, FIREBALL_CAST_ENERGY_COST, FIREBALL_VELOCITY_PX_MS, FIREBALL_SIZE, MAGE_SPINNER_ENERGY_COST, MAGE_SPINNER_DURATION_MS, MAGE_SPINNER_COOLDOWN_MS, MAGE_SPINNER_FIREBALL_INTERVAL_MS, MAGE_SPINNER_FIREBALL_COUNT, STICK_FIGURE_TOTAL_HEIGHT, OBSTACLE_EMOJI_Y_OFFSET, OBSTACLE_HEIGHT, FIERY_HOUDINI_ENERGY_COST, FIERY_HOUDINI_DURATION_MS, FIERY_HOUDINI_COOLDOWN_MS, FIERY_HOUDINI_RANGE, BLINK_STRIKE_DURATION_MS, JETSTREAM_DASH_DURATION_MS, ECHO_SLAM_DURATION_MS, FIREBALL_ROLL_DURATION_MS, OBSTACLE_WIDTH } from '../constants.js';
import { playAnimationSound } from '../audio.js';
import { consumeEnergy, getSkillModifiedValue, initiateJump, addIncineratingObstacle, setCurrentObstacle, incrementObstaclesIncinerated, setScreenFlash } from './state-manager.js';
import { fieryGroundPoundUpgradeEffects, fireSpinnerUpgradeEffects, fieryHoudiniUpgradeEffects, firestormUpgradeEffects } from './skill-upgrades.js';

const JUMP_DURATIONS = {
    hurdle: 500,
    specialMove: 500,
    dive: 500,
    corkscrewSpin: 500,
    scissorKick: 500,
    phaseDash: 600,
    hover: 1000,
    groundPound: 600,
    fieryGroundPound: 600, // Same duration as regular ground pound for now
    fireStomper: 600,
    cartoonScramble: 800,
    moonwalk: 700,
    shockwave: 400,
    firestorm: 10000, // 10 seconds active time
    fireMage: FIRE_MAGE_DURATION_MS, // Duration for Fire Mage mode
    fieryHoudini: FIERY_HOUDINI_DURATION_MS,
    blinkStrike: BLINK_STRIKE_DURATION_MS,
    jetstreamDash: JETSTREAM_DASH_DURATION_MS,
    echoSlam: ECHO_SLAM_DURATION_MS,
    fireballRoll: FIREBALL_ROLL_DURATION_MS
};

// Define upgrade effects for Fire Spinner




export function startFireMage(state) {
    if (!state.gameRunning || state.isPaused || state.isFireMageActive || state.isFireMageOnCooldown) return;

    const now = Date.now();
    if (now - state.fireMageLastActivationTime < FIRE_MAGE_COOLDOWN_MS) {
        console.log("-> startFireMage: Fire Mage is on cooldown.");
        return;
    }

    if (!consumeEnergy(state, 'fireMage', FIRE_MAGE_ENERGY_COST)) return;

    state.isFireMageActive = true;
    state.fireMageEndTime = now + FIRE_MAGE_DURATION_MS;
    state.fireMageLastActivationTime = now; // Start cooldown from now
    state.isFireMageOnCooldown = true; // Cooldown starts immediately

    playAnimationSound('fireball'); // Placeholder sound for activation
    console.log("-> startFireMage: Fire Mage mode initiated.");
}

export function castFireball(state) {
    if (!state.gameRunning || state.isPaused || (!state.isFireMageActive && !state.isMageSpinnerActive)) return;
    if (!consumeEnergy(state, 'fireballCast', FIREBALL_CAST_ENERGY_COST)) return;

    // Correctly calculate player's current Y position based on the ground angle
    const currentSegment = state.raceSegments[Math.min(state.currentSegmentIndex, state.raceSegments.length - 1)];
    const groundAngleRad = currentSegment.angleRad;
    const playerGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(groundAngleRad);
    const playerHeight = STICK_FIGURE_FIXED_X / 2; // Approximate center of the player

    const fireball = {
        x: STICK_FIGURE_FIXED_X + 20, // Start slightly ahead of the player
        y: playerGroundY - playerHeight, // Spawn from the player's vertical center
        size: FIREBALL_SIZE,
        velocity: FIREBALL_VELOCITY_PX_MS,
        spawnTime: Date.now()
    };
    state.activeFireballs.push(fireball);
    playAnimationSound('fireball');
    console.log("-> castFireball: Fireball launched!");
}

export function startFireSpinner(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused || state.isFireSpinnerOnCooldown) return;
    if (state.playerEnergy <= state.maxPlayerEnergy * 0.5) {
        console.log("-> startFireSpinner: Not enough energy to activate. Requires > 50%.");
        return;
    }

    const now = Date.now();
    if (now - state.fireSpinnerLastActivationTime < state.fireSpinnerCooldown) {
        console.log("-> startFireSpinner: Fire Spinner is on cooldown.");
        return;
    }

    state.jumpState.isFireSpinner = true;
    state.jumpState.fireSpinnerDuration = JUMP_DURATIONS.firestorm;
    state.fireSpinnerLastActivationTime = now;
    state.isFireSpinnerOnCooldown = true; // Cooldown starts immediately
    state.isFireSpinnerDrainingEnergy = true;

    // Calculate modified drain duration based on skill level
    const baseDrainDuration = JUMP_DURATIONS.firestorm; // Base duration is 10 seconds
    state.fireSpinnerDrainEndTime = now + getSkillModifiedValue(baseDrainDuration, 'fireSpinner', fireSpinnerUpgradeEffects, state);

    initiateJump(state, JUMP_DURATIONS.firestorm);
    playAnimationSound('fireball'); // Placeholder sound
    console.log("-> startFireSpinner: Fire Spinner initiated.");
}

export function startMageSpinner(state) {
    if (!state.gameRunning || state.isPaused || state.isMageSpinnerActive || state.isMageSpinnerOnCooldown) return;

    const now = Date.now();
    if (now - state.mageSpinnerLastActivationTime < MAGE_SPINNER_COOLDOWN_MS) {
        console.log("-> startMageSpinner: Mage Spinner is on cooldown.");
        return;
    }

    if (!consumeEnergy(state, 'mageSpinner', MAGE_SPINNER_ENERGY_COST)) return;

    state.isMageSpinnerActive = true;
    state.mageSpinnerEndTime = now + MAGE_SPINNER_DURATION_MS;
    state.mageSpinnerLastActivationTime = now; // Start cooldown from now
    state.isMageSpinnerOnCooldown = true; // Cooldown starts immediately
    state.mageSpinnerFireballTimer = MAGE_SPINNER_FIREBALL_INTERVAL_MS; // Initialize timer for first fireball
    state.mageSpinnerFireballsSpawned = 0; // Reset fireball counter

    playAnimationSound('firestorm'); // Placeholder sound for activation
    console.log("-> startMageSpinner: Mage Spinner initiated.");
}

export function castMageSpinnerFireball(state, targetObstacle) {
    if (!state.gameRunning || state.isPaused || !targetObstacle) return;

    // Calculate player's current Y position (approximate center)
    const currentSegment = state.raceSegments[Math.min(state.currentSegmentIndex, state.raceSegments.length - 1)];
    const groundAngleRad = currentSegment.angleRad;
    const playerGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(groundAngleRad);
    const playerCenterY = playerGroundY - (STICK_FIGURE_TOTAL_HEIGHT / 2);

    // Fireball starts from player's X, slightly above player's center
    const startX = STICK_FIGURE_FIXED_X + 10;
    const startY = playerCenterY - 10; // Slightly above player center

    // Calculate target Y for the fireball (top of the obstacle)
    const obstacleTopY = GROUND_Y - targetObstacle.x * Math.tan(groundAngleRad) + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    // Calculate velocity components to hit the obstacle
    const distanceX = targetObstacle.x - startX;
    const distanceY = obstacleTopY - startY;

    // Using a fixed horizontal velocity, calculate vertical velocity
    const velocityX = FIREBALL_VELOCITY_PX_MS * 1.5; // Slightly faster than regular fireballs
    const duration = distanceX / velocityX; // Time to reach obstacle horizontally
    const velocityY = distanceY / duration; // Required vertical velocity

    const fireball = {
        x: startX,
        y: startY,
        size: FIREBALL_SIZE,
        velocityX: velocityX,
        velocityY: velocityY,
        spawnTime: Date.now(),
        isMageSpinnerFireball: true // Mark this fireball as from Mage Spinner
    };
    state.activeFireballs.push(fireball);
    playAnimationSound('fireball');
    console.log("-> castMageSpinnerFireball: Fireball launched at obstacle!");
}

export function startManualJump(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    initiateJump(state, state.manualJumpDurationMs);
    playAnimationSound('manualJump'); // Play sound for manual jump
    console.log("-> startManualJump: Manual jump initiated.");
}

export function startHurdle(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isHurdle = true;
    state.jumpState.hurdleDuration = JUMP_DURATIONS.hurdle;
    initiateJump(state, JUMP_DURATIONS.hurdle);
    playAnimationSound('hurdle'); // Play sound for hurdle
    console.log("-> startHurdle: Hurdle initiated.");
}

export function startSpecialMove(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'specialMove')) return;
    state.jumpState.isSpecialMove = true;
    state.jumpState.specialMoveDuration = JUMP_DURATIONS.specialMove;
    initiateJump(state, JUMP_DURATIONS.specialMove);
    console.log("-> startSpecialMove: Special Move initiated.");
}

export function startDive(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'dive')) return;
    state.jumpState.isDive = true;
    state.jumpState.diveDuration = JUMP_DURATIONS.dive;
    initiateJump(state, JUMP_DURATIONS.dive);
    console.log("-> startDive: Dive initiated.");
}

export function startCorkscrewSpin(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'corkscrewSpin')) return;
    state.jumpState.isCorkscrewSpin = true;
    state.jumpState.corkscrewSpinDuration = JUMP_DURATIONS.corkscrewSpin;
    initiateJump(state, JUMP_DURATIONS.corkscrewSpin);
    console.log("-> startCorkscrewSpin: Corkscrew Spin initiated.");
}

export function startScissorKick(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'scissorKick')) return;
    state.jumpState.isScissorKick = true;
    state.jumpState.scissorKickDuration = JUMP_DURATIONS.scissorKick;
    initiateJump(state, JUMP_DURATIONS.scissorKick);
    console.log("-> startScissorKick: Scissor Kick initiated.");
}

export function startPhaseDash(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'phaseDash')) return;
    state.jumpState.isPhaseDash = true;
    state.jumpState.phaseDashDuration = JUMP_DURATIONS.phaseDash;
    initiateJump(state, JUMP_DURATIONS.phaseDash);
    console.log("-> startPhaseDash: Phase Dash initiated.");
}

export function startHover(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'hover')) return;
    state.jumpState.isHover = true;
    state.jumpState.hoverDuration = JUMP_DURATIONS.hover;
    initiateJump(state, JUMP_DURATIONS.hover);
    console.log("-> startHover: Hover initiated.");
}

export function startGroundPound(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'groundPound')) return;
    state.jumpState.isGroundPound = true;
    state.jumpState.groundPoundDuration = JUMP_DURATIONS.groundPound;
    state.jumpState.groundPoundEffectTriggered = false; // Reset the trigger flag
    initiateJump(state, JUMP_DURATIONS.groundPound);
    playAnimationSound('groundPound');
    console.log("-> startGroundPound: Ground Pound initiated.");
}

export function startFieryGroundPound(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'fieryGroundPound')) return; // Use a new energy cost type

    state.jumpState.isFieryGroundPound = true;
    state.jumpState.fieryGroundPoundDuration = JUMP_DURATIONS.fieryGroundPound;
    state.jumpState.groundPoundEffectTriggered = false; // Reset the trigger flag
    initiateJump(state, JUMP_DURATIONS.fieryGroundPound);
    playAnimationSound('firestorm'); // Use firestorm sound for fiery effect

    // Incinerate all active obstacles
    let now = performance.now();
    const timeIncrement = 0.0001; // A tiny increment to ensure unique start times

    if (state.currentObstacle) {
        state.incineratingObstacles.push({ ...state.currentObstacle, animationProgress: 0, startTime: now });
        now += timeIncrement;
        state.currentObstacle = null;
        state.playerStats.obstaclesIncinerated++;
    }
    state.ignitedObstacles.forEach(ob => {
        state.incineratingObstacles.push({ ...ob, animationProgress: 0, startTime: now });
        now += timeIncrement;
    });
    state.ignitedObstacles.length = 0; // Clear ignited obstacles

    state.vanishingObstacles.forEach(ob => {
        state.incineratingObstacles.push({ ...ob, animationProgress: 0, startTime: now });
        now += timeIncrement;
    });
    state.vanishingObstacles.length = 0; // Clear vanishing obstacles

    console.log("-> startFieryGroundPound: Fiery Ground Pound initiated. All obstacles incinerated!");
}

export function startFireStomper(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'fireStomper')) return;

    state.jumpState.isFireStomper = true;
    state.jumpState.fireStomperDuration = JUMP_DURATIONS.fireStomper;
    state.jumpState.groundPoundEffectTriggered = false; // Reset the trigger flag
    initiateJump(state, JUMP_DURATIONS.fireStomper);
    playAnimationSound('groundPound'); // Use regular ground pound sound for now

    // Mark all active obstacles for the new flip-and-crumble animation
    let now = performance.now();
    const timeIncrement = 0.0001;

    const allObstacles = [
        ...(state.currentObstacle ? [state.currentObstacle] : []),
        ...state.ignitedObstacles,
        ...state.vanishingObstacles
    ];

    allObstacles.forEach(ob => {
        state.flippingObstacles.push({
            ...ob,
            animationProgress: 0,
            startTime: now,
            animationType: 'flip-and-crumble'
        });
        now += timeIncrement;
    });

    if (state.currentObstacle) {
        state.playerStats.obstaclesDestroyed++; // Or a more specific counter
        state.currentObstacle = null;
    }
    state.ignitedObstacles.length = 0;
    state.vanishingObstacles.length = 0;

    console.log("-> startFireStomper: Fire Stomper initiated. All obstacles marked for destruction!");
}

export function startCartoonScramble(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'cartoonScramble')) return;
    state.jumpState.isCartoonScramble = true;
    state.jumpState.cartoonScrambleDuration = JUMP_DURATIONS.cartoonScramble;
    initiateJump(state, JUMP_DURATIONS.cartoonScramble);
    playAnimationSound('cartoon-running');
    console.log("-> startCartoonScramble: Cartoon Scramble initiated.");
}

export function startMoonwalk(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'moonwalk')) return;

    const skillLevel = state.playerStats.skillLevels.moonwalk || 1;

    if (skillLevel >= 2) {
        state.playerEnergy = Math.min(state.maxPlayerEnergy, state.playerEnergy + 10);
    }
    if (skillLevel >= 3) {
        state.isInvincible = true;
        state.invincibilityEndTime = Date.now() + 200; // 200ms of invincibility
    }

    state.jumpState.isMoonwalking = true;
    state.jumpState.moonwalkDuration = JUMP_DURATIONS.moonwalk;
    initiateJump(state, JUMP_DURATIONS.moonwalk);
    playAnimationSound('moonwalk'); // Play sound for Moonwalk
    console.log("-> startMoonwalk: Moonwalk initiated.");
}

export function startShockwave(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'shockwave')) return;
    state.jumpState.isShockwave = true;
    state.jumpState.shockwaveDuration = JUMP_DURATIONS.shockwave;
    initiateJump(state, JUMP_DURATIONS.shockwave);
    console.log("-> startShockwave: Shockwave initiated.");
}

export function startBackflip(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'backflip')) return;
    state.jumpState.isBackflip = true;
    state.jumpState.backflipDuration = 500;
    initiateJump(state, 500);
    console.log("-> startBackflip: Backflip initiated.");
}

export function startFrontflip(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'frontflip')) return;
    state.jumpState.isFrontflip = true;
    state.jumpState.frontflipDuration = 500;
    initiateJump(state, 500);
    console.log("-> startFrontflip: Frontflip initiated.");
}

export function startHoudini(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'houdini')) return;
    state.jumpState.isHoudini = true;
    state.jumpState.houdiniDuration = 800;
    state.jumpState.houdiniPhase = 'disappearing';

    // Create the initial poof at the player's location
    const playerY = GROUND_Y - state.jumpState.progress * 200; // Approximate player Y
    createHoudiniPoof(STICK_FIGURE_FIXED_X, playerY - 50);

    initiateJump(state, 800);
    playAnimationSound('houdini');
    console.log("-> startHoudini: Houdini initiated.");
}



export function startMeteorStrike(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'meteorStrike')) return;

    const skillLevel = state.playerStats.skillLevels.meteorStrike || 1;

    if (skillLevel === 1) {
        if (state.currentObstacle) {
            createMeteorStrikeEffect(state.currentObstacle, skillLevel);
            state.incineratingObstacles.push({ ...state.currentObstacle, animationProgress: 0, startTime: performance.now() });
            state.currentObstacle = null;
            state.playerStats.obstaclesIncinerated++;
        }
    } else if (skillLevel === 2) {
        const obstaclesToIncinerate = [state.currentObstacle, ...state.ignitedObstacles, ...state.vanishingObstacles].filter(Boolean).slice(0, 2);
        obstaclesToIncinerate.forEach(ob => {
            createMeteorStrikeEffect(ob, skillLevel);
            state.incineratingObstacles.push({ ...ob, animationProgress: 0, startTime: performance.now() });
            state.playerStats.obstaclesIncinerated++;
        });
        if (obstaclesToIncinerate.includes(state.currentObstacle)) state.currentObstacle = null;
        state.ignitedObstacles = state.ignitedObstacles.filter(ob => !obstaclesToIncinerate.includes(ob));
        state.vanishingObstacles = state.vanishingObstacles.filter(ob => !obstaclesToIncinerate.includes(ob));
    } else if (skillLevel >= 3) {
        const allObstacles = [state.currentObstacle, ...state.ignitedObstacles, ...state.vanishingObstacles].filter(Boolean);
        allObstacles.forEach(ob => {
            createMeteorStrikeEffect(ob, skillLevel);
            state.incineratingObstacles.push({ ...ob, animationProgress: 0, startTime: performance.now() });
            state.playerStats.obstaclesIncinerated++;
        });
        state.currentObstacle = null;
        state.ignitedObstacles = [];
        state.vanishingObstacles = [];
    }

    state.jumpState.isMeteorStrike = true;
    state.jumpState.meteorStrikeDuration = 800; // A longer duration for a dramatic effect
    initiateJump(state, 800);
    playAnimationSound('meteorStrike'); // Play sound for Meteor Strike
    console.log("-> startMeteorStrike: Meteor Strike initiated.");
}

export function startBlinkStrike(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'blinkStrike')) return;

    state.jumpState.isBlinkStrike = true;
    state.jumpState.blinkStrikeDuration = JUMP_DURATIONS.blinkStrike;
    initiateJump(state, JUMP_DURATIONS.blinkStrike);

    // Make player invisible
    state.playerIsInvisible = true;
    playAnimationSound('houdini'); // Disappearance sound

    // Teleport and shatter obstacle after a very short delay
    setTimeout(() => {
        if (state.currentObstacle) {
            // Calculate obstacle's ground Y to place player correctly
            const currentSegment = state.raceSegments[Math.min(state.currentSegmentIndex, state.raceSegments.length - 1)];
            const obstacleGroundY = GROUND_Y - state.currentObstacle.x * Math.tan(currentSegment.angleRad);
            const playerTeleportY = obstacleGroundY - STICK_FIGURE_TOTAL_HEIGHT;

            // Move player to obstacle's X and calculated Y
            state.stickFigureFixedX = state.currentObstacle.x; // Temporarily move player's X
            state.stickFigureY = playerTeleportY; // Temporarily move player's Y

            createShatterEffect(state.currentObstacle.x, obstacleGroundY + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT, state.currentObstacle.emoji);
            state.incineratingObstacles.push({ ...state.currentObstacle, animationProgress: 0, startTime: performance.now(), animationType: 'shatter' });
            state.currentObstacle = null;
            state.playerStats.obstaclesIncinerated++; // Count as incinerated for now
            playAnimationSound('shatter'); // Shatter sound
        }
        // Make player visible again after the strike
        state.playerIsInvisible = false;
        state.stickFigureFixedX = STICK_FIGURE_FIXED_X; // Reset player X
        state.stickFigureY = undefined; // Reset player Y

        // Add a screen flash for impact
        setScreenFlash(0.7, 200, performance.now());

    }, JUMP_DURATIONS.blinkStrike / 2); // Halfway through the jump duration

    console.log("-> startBlinkStrike: Blink Strike initiated.");
}



export function startFirestorm(state) {
    if (!state.gameRunning || state.isFirestormActive) return;
    if (state.playerEnergy <= state.maxPlayerEnergy * 0.5) {
        console.log("-> startFirestorm: Not enough energy to activate. Requires > 50%.");
        return;
    }

    const skillLevel = state.playerStats.skillLevels.firestorm || 1;
    const baseDuration = 10000; // 10 seconds
    const modifiedDuration = getSkillModifiedValue(baseDuration, 'firestorm', firestormUpgradeEffects, state);

    state.isFirestormActive = true;
    state.firestormEndTime = Date.now() + modifiedDuration;
    state.isFirestormDrainingEnergy = true;
    state.firestormDrainEndTime = state.firestormEndTime;
    playAnimationSound('firestorm');
    console.log("-> startFirestorm: Firestorm V2 initiated.");
}

export function startJetstreamDash(state) {
    if (!state.gameRunning || state.isPaused || state.jumpState.isJumping || state.isJetstreamDashing) return;

    // No initial energy cost, but will drain over time
    if (state.playerEnergy <= 0) {
        console.log("-> startJetstreamDash: Not enough energy to activate.");
        return;
    }

    state.jumpState.isJetstreamDashing = true;
    state.jumpState.jetstreamDashDuration = JUMP_DURATIONS.jetstreamDash;
    state.isInvincible = true; // Grant invincibility during the dash
    state.invincibilityEndTime = Date.now() + JUMP_DURATIONS.jetstreamDash;
    state.jetstreamDashDrainEndTime = Date.now() + JUMP_DURATIONS.jetstreamDash; // Energy drains for the duration

    initiateJump(state, JUMP_DURATIONS.jetstreamDash);
    playAnimationSound('jetstreamDash'); // Play sound for Jetstream Dash
    console.log("-> startJetstreamDash: Jetstream Dash initiated.");
}

export function startEchoSlam(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy(state, 'echoSlam')) return;

    state.jumpState.isEchoSlam = true;
    state.jumpState.echoSlamDuration = JUMP_DURATIONS.echoSlam;
    state.jumpState.groundPoundEffectTriggered = false; // Reset for primary effect
    state.jumpState.echoSlamSecondaryTriggered = false; // Reset for secondary effect

    initiateJump(state, JUMP_DURATIONS.echoSlam);
    playAnimationSound('groundPound'); // Primary ground pound sound

    // Trigger secondary shockwave after a delay
    setTimeout(() => {
        if (state.gameRunning && !state.isPaused) {
            const currentSegment = state.raceSegments[Math.min(state.currentSegmentIndex, state.raceSegments.length - 1)];
            const groundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(currentSegment.angleRad);
            const echoX = STICK_FIGURE_FIXED_X + 150; // Position of the echo slam

            // Create a secondary, smaller ground pound effect
            createGroundPoundEffect(echoX, groundY, 0.5); // Smaller effect, slightly ahead
            playAnimationSound('shockwave'); // Secondary shockwave sound
            state.jumpState.echoSlamSecondaryTriggered = true;

            // Check for obstacle collision with the echo
            if (state.currentObstacle && Math.abs(state.currentObstacle.x - echoX) < 50) {
                state.incineratingObstacles.push({ ...state.currentObstacle, animationProgress: 0, startTime: performance.now(), animationType: 'shatter' });
                state.currentObstacle = null;
                state.playerStats.obstaclesIncinerated++;
                playAnimationSound('shatter');
            }
        }
    }, JUMP_DURATIONS.echoSlam / 2); // Halfway through the primary effect

    console.log("-> startEchoSlam: Echo Slam initiated.");
}

export function startFireballRoll(state) {
    if (!state.gameRunning || state.isPaused || state.isFireballRolling) return;

    // No initial energy cost, but will drain over time
    if (state.playerEnergy <= 0) {
        console.log("-> startFireballRoll: Not enough energy to activate.");
        return;
    }

    state.jumpState.isFireballRolling = true;
    state.jumpState.fireballRollDuration = JUMP_DURATIONS.fireballRoll;
    state.isInvincible = true; // Grant invincibility during the roll
    state.invincibilityEndTime = Date.now() + JUMP_DURATIONS.fireballRoll;
    state.fireballRollDrainEndTime = Date.now() + JUMP_DURATIONS.fireballRoll; // Energy drains for the duration

        playAnimationSound('fireballRoll'); // Play sound for Fireball Roll

        console.log("-> startFireballRoll: Fireball Roll initiated.");

    }

    

    

    

    

    

        

    

    

    

        

    