import { createHoudiniPoof } from './drawing/effects.js';
import { STICK_FIGURE_FIXED_X, GROUND_Y, ENERGY_SETTINGS, FIRE_MAGE_ENERGY_COST, FIRE_MAGE_DURATION_MS, FIRE_MAGE_COOLDOWN_MS, FIREBALL_CAST_ENERGY_COST, FIREBALL_VELOCITY_PX_MS, FIREBALL_SIZE } from '../constants.js';
import { playAnimationSound } from '../audio.js';

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
    fireMage: FIRE_MAGE_DURATION_MS // Duration for Fire Mage mode
};

function consumeEnergy(state, actionName, costOverride = null) {
    const cost = costOverride !== null ? costOverride : (ENERGY_SETTINGS.ENERGY_COSTS[actionName] || ENERGY_SETTINGS.ENERGY_COSTS.default);
    if (state.playerEnergy >= cost) {
        state.playerEnergy -= cost;
        return true;
    }
    console.log(`-> ${actionName}: Not enough energy. Have: ${state.playerEnergy}, Need: ${cost}`);
    return false;
}

function initiateJump(state, duration) {
    state.manualJumpOverride.duration = duration;
    state.jumpState.isJumping = true;
    state.jumpState.progress = 0;
    state.manualJumpOverride.isActive = true;
    state.manualJumpOverride.startTime = Date.now();
}

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
    if (!state.gameRunning || state.isPaused || !state.isFireMageActive) return;
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
    state.fireSpinnerDrainEndTime = now + JUMP_DURATIONS.firestorm;

    initiateJump(state, JUMP_DURATIONS.firestorm);
    playAnimationSound('fireball'); // Placeholder sound
    console.log("-> startFireSpinner: Fire Spinner initiated.");
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
    state.jumpState.isMeteorStrike = true;
    state.jumpState.meteorStrikeDuration = 800; // A longer duration for a dramatic effect
    initiateJump(state, 800);
    playAnimationSound('meteorStrike'); // Play sound for Meteor Strike
    console.log("-> startMeteorStrike: Meteor Strike initiated.");
}

export function startFirestorm(state) {
    if (!state.gameRunning || state.isFirestormActive) return;
    if (state.playerEnergy <= state.maxPlayerEnergy * 0.5) {
        console.log("-> startFirestorm: Not enough energy to activate. Requires > 50%.");
        return;
    }
    state.isFirestormActive = true;
    state.firestormEndTime = Date.now() + 10000; // 10 seconds from now
    state.isFirestormDrainingEnergy = true;
    state.firestormDrainEndTime = state.firestormEndTime;
    playAnimationSound('firestorm');
    console.log("-> startFirestorm: Firestorm V2 initiated.");
}