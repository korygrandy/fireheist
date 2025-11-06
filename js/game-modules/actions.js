import state from './state.js';
import { createHoudiniPoof } from './drawing/effects.js';
import { STICK_FIGURE_FIXED_X, GROUND_Y, ENERGY_SETTINGS } from '../constants.js';
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
    cartoonScramble: 800,
    moonwalk: 700,
    shockwave: 400,
    firestorm: 10000 // 10 seconds active time
};

function consumeEnergy(actionName) {
    const cost = ENERGY_SETTINGS.ENERGY_COSTS[actionName] || ENERGY_SETTINGS.ENERGY_COSTS.default;
    if (state.playerEnergy >= cost) {
        state.playerEnergy -= cost;
        return true;
    }
    console.log(`-> ${actionName}: Not enough energy. Have: ${state.playerEnergy}, Need: ${cost}`);
    return false;
}

function initiateJump(duration) {
    state.manualJumpOverride.duration = duration;
    state.jumpState.isJumping = true;
    state.jumpState.progress = 0;
    state.manualJumpOverride.isActive = true;
    state.manualJumpOverride.startTime = Date.now();
}

export function startFireSpinner() {
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

    initiateJump(JUMP_DURATIONS.firestorm);
    playAnimationSound('fireball'); // Placeholder sound
    console.log("-> startFireSpinner: Fire Spinner initiated.");
}

export function startManualJump() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    initiateJump(state.manualJumpDurationMs);
    playAnimationSound('manualJump'); // Play sound for manual jump
    console.log("-> startManualJump: Manual jump initiated.");
}

export function startHurdle() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isHurdle = true;
    state.jumpState.hurdleDuration = JUMP_DURATIONS.hurdle;
    initiateJump(JUMP_DURATIONS.hurdle);
    playAnimationSound('hurdle'); // Play sound for hurdle
    console.log("-> startHurdle: Hurdle initiated.");
}

export function startSpecialMove() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy('specialMove')) return;
    state.jumpState.isSpecialMove = true;
    state.jumpState.specialMoveDuration = JUMP_DURATIONS.specialMove;
    initiateJump(JUMP_DURATIONS.specialMove);
    console.log("-> startSpecialMove: Special Move initiated.");
}

export function startDive() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy('dive')) return;
    state.jumpState.isDive = true;
    state.jumpState.diveDuration = JUMP_DURATIONS.dive;
    initiateJump(JUMP_DURATIONS.dive);
    console.log("-> startDive: Dive initiated.");
}

export function startCorkscrewSpin() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy('corkscrewSpin')) return;
    state.jumpState.isCorkscrewSpin = true;
    state.jumpState.corkscrewSpinDuration = JUMP_DURATIONS.corkscrewSpin;
    initiateJump(JUMP_DURATIONS.corkscrewSpin);
    console.log("-> startCorkscrewSpin: Corkscrew Spin initiated.");
}

export function startScissorKick() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy('scissorKick')) return;
    state.jumpState.isScissorKick = true;
    state.jumpState.scissorKickDuration = JUMP_DURATIONS.scissorKick;
    initiateJump(JUMP_DURATIONS.scissorKick);
    console.log("-> startScissorKick: Scissor Kick initiated.");
}

export function startPhaseDash() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy('phaseDash')) return;
    state.jumpState.isPhaseDash = true;
    state.jumpState.phaseDashDuration = JUMP_DURATIONS.phaseDash;
    initiateJump(JUMP_DURATIONS.phaseDash);
    console.log("-> startPhaseDash: Phase Dash initiated.");
}

export function startHover() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy('hover')) return;
    state.jumpState.isHover = true;
    state.jumpState.hoverDuration = JUMP_DURATIONS.hover;
    initiateJump(JUMP_DURATIONS.hover);
    console.log("-> startHover: Hover initiated.");
}

export function startGroundPound() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy('groundPound')) return;
    state.jumpState.isGroundPound = true;
    state.jumpState.groundPoundDuration = JUMP_DURATIONS.groundPound;
    state.jumpState.groundPoundEffectTriggered = false; // Reset the trigger flag
    initiateJump(JUMP_DURATIONS.groundPound);
    playAnimationSound('groundPound');
    console.log("-> startGroundPound: Ground Pound initiated.");
}

export function startCartoonScramble() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy('cartoonScramble')) return;
    state.jumpState.isCartoonScramble = true;
    state.jumpState.cartoonScrambleDuration = JUMP_DURATIONS.cartoonScramble;
    initiateJump(JUMP_DURATIONS.cartoonScramble);
    playAnimationSound('cartoon-running');
    console.log("-> startCartoonScramble: Cartoon Scramble initiated.");
}

export function startMoonwalk() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy('moonwalk')) return;
    state.jumpState.isMoonwalking = true;
    state.jumpState.moonwalkDuration = JUMP_DURATIONS.moonwalk;
    initiateJump(JUMP_DURATIONS.moonwalk);
    playAnimationSound('moonwalk'); // Play sound for Moonwalk
    console.log("-> startMoonwalk: Moonwalk initiated.");
}

export function startShockwave() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy('shockwave')) return;
    state.jumpState.isShockwave = true;
    state.jumpState.shockwaveDuration = JUMP_DURATIONS.shockwave;
    initiateJump(JUMP_DURATIONS.shockwave);
    console.log("-> startShockwave: Shockwave initiated.");
}

export function startBackflip() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy('backflip')) return;
    state.jumpState.isBackflip = true;
    state.jumpState.backflipDuration = 500;
    initiateJump(500);
    console.log("-> startBackflip: Backflip initiated.");
}

export function startFrontflip() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy('frontflip')) return;
    state.jumpState.isFrontflip = true;
    state.jumpState.frontflipDuration = 500;
    initiateJump(500);
    console.log("-> startFrontflip: Frontflip initiated.");
}

export function startHoudini() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy('houdini')) return;
    state.jumpState.isHoudini = true;
    state.jumpState.houdiniDuration = 800;
    state.jumpState.houdiniPhase = 'disappearing';

    // Create the initial poof at the player's location
    const playerY = GROUND_Y - state.jumpState.progress * 200; // Approximate player Y
    createHoudiniPoof(STICK_FIGURE_FIXED_X, playerY - 50);

    initiateJump(800);
    playAnimationSound('houdini');
    console.log("-> startHoudini: Houdini initiated.");
}

export function startMeteorStrike() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    if (!consumeEnergy('meteorStrike')) return;
    state.jumpState.isMeteorStrike = true;
    state.jumpState.meteorStrikeDuration = 800; // A longer duration for a dramatic effect
    initiateJump(800);
    playAnimationSound('meteorStrike'); // Play sound for Meteor Strike
    console.log("-> startMeteorStrike: Meteor Strike initiated.");
}

export function startFirestorm() {
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