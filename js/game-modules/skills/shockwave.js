import { JUMP_DURATIONS, ENERGY_SETTINGS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';

export const shockwaveSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, 'shockwave')) return;
        state.jumpState.isShockwave = true;
        state.jumpState.shockwaveDuration = JUMP_DURATIONS.shockwave;
        initiateJump(state, JUMP_DURATIONS.shockwave);
        console.log("-> startShockwave: Shockwave initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isShockwave) {
            state.jumpState.shockwaveDuration -= deltaTime;
            if (state.jumpState.shockwaveDuration <= 0) {
                state.jumpState.isShockwave = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for shockwave
    }
};
