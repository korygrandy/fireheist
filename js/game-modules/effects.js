import state from './state.js';
import {
    ACCELERATOR_DURATION_MS,
    ACCELERATOR_BASE_SPEED_BOOST,
    DECELERATOR_DURATION_MS,
    DECELERATOR_BASE_SPEED_DEBUFF
} from '../constants.js';
import { playChaChing, playDebuffSound } from '../audio.js';

export function applySpeedEffect(type) {
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
