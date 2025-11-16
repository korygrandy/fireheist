import { JUMP_DURATIONS, ENERGY_SETTINGS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';

export const backflipSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, 'backflip')) return;
        state.jumpState.isBackflip = true;
        state.jumpState.backflipDuration = 500;
        initiateJump(state, 500);
        console.log("-> startBackflip: Backflip initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isBackflip) {
            state.jumpState.backflipDuration -= deltaTime;
            if (state.jumpState.backflipDuration <= 0) {
                state.jumpState.isBackflip = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for backflip
    }
};
