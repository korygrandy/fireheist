import state from './state.js';
import { JUMP_DURATIONS } from '../constants.js';

function initiateJump(duration) {
    state.manualJumpOverride.duration = duration;
    state.jumpState.isJumping = true;
    state.jumpState.progress = 0;
    state.manualJumpOverride.isActive = true;
    state.manualJumpOverride.startTime = Date.now();
}

export function startManualJump() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    initiateJump(state.manualJumpDurationMs);
}

export function startHurdle() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isHurdle = true;
    state.jumpState.hurdleDuration = JUMP_DURATIONS.hurdle;
    initiateJump(JUMP_DURATIONS.hurdle);
}

export function startSpecialMove() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isSpecialMove = true;
    state.jumpState.isSlowMotion = true;
    state.jumpState.specialMoveDuration = 1500; // Extended duration for slow-mo
    initiateJump(1500);
}

export function startPowerStomp() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isPowerStomp = true;
    state.jumpState.powerStompDuration = JUMP_DURATIONS.powerStomp;
    initiateJump(JUMP_DURATIONS.powerStomp);
}

export function startDive() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isDive = true;
    state.jumpState.diveDuration = JUMP_DURATIONS.dive;
    initiateJump(JUMP_DURATIONS.dive);
}

export function startCorkscrewSpin() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isCorkscrewSpin = true;
    state.jumpState.corkscrewSpinDuration = JUMP_DURATIONS.corkscrewSpin;
    initiateJump(JUMP_DURATIONS.corkscrewSpin);
}

export function startSpinningTop() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isSpinningTop = true;
    state.jumpState.spinningTopDuration = JUMP_DURATIONS.spinningTop;
    initiateJump(JUMP_DURATIONS.spinningTop);
}

export function startScissorKick() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isScissorKick = true;
    state.jumpState.scissorKickDuration = JUMP_DURATIONS.scissorKick;
    initiateJump(JUMP_DURATIONS.scissorKick);
}

export function startPhaseDash() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isPhaseDash = true;
    state.jumpState.phaseDashDuration = JUMP_DURATIONS.phaseDash;
    initiateJump(JUMP_DURATIONS.phaseDash);
}

export function startHover() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isHover = true;
    state.jumpState.hoverDuration = JUMP_DURATIONS.hover;
    initiateJump(JUMP_DURATIONS.hover);
}

export function startGroundPound() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isGroundPound = true;
    state.jumpState.groundPoundDuration = JUMP_DURATIONS.groundPound;
    initiateJump(JUMP_DURATIONS.groundPound);
}

export function startCartoonScramble() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isCartoonScramble = true;
    state.jumpState.cartoonScrambleDuration = JUMP_DURATIONS.cartoonScramble;
    initiateJump(JUMP_DURATIONS.cartoonScramble);
}

export function startMoonwalk() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isMoonwalking = true;
    state.jumpState.moonwalkDuration = JUMP_DURATIONS.moonwalk;
    initiateJump(JUMP_DURATIONS.moonwalk);
}

export function startShockwave() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isShockwave = true;
    state.jumpState.shockwaveDuration = JUMP_DURATIONS.shockwave;
    initiateJump(JUMP_DURATIONS.shockwave);
}

export function startBackflip() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isBackflip = true;
    state.jumpState.backflipDuration = JUMP_DURATIONS.backflip;
    initiateJump(JUMP_DURATIONS.backflip);
}

export function startFrontflip() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isFrontflip = true;
    state.jumpState.frontflipDuration = JUMP_DURATIONS.frontflip;
    initiateJump(JUMP_DURATIONS.frontflip);
}

export function startHoudini() {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isHoudini = true;
    state.jumpState.houdiniDuration = JUMP_DURATIONS.houdini;
    state.jumpState.houdiniPhase = 'disappearing';
    initiateJump(JUMP_DURATIONS.houdini);
}
