import { JUMP_DURATIONS, ENERGY_SETTINGS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';

export const diveSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, 'dive')) return;
        state.jumpState.isDive = true;
        state.jumpState.diveDuration = JUMP_DURATIONS.dive;
        initiateJump(state, JUMP_DURATIONS.dive);
        console.log("-> startDive: Dive initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isDive) {
            state.jumpState.diveDuration -= deltaTime;
            if (state.jumpState.diveDuration <= 0) {
                state.jumpState.isDive = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for dive
    }
};
