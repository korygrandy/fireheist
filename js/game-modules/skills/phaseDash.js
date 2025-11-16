import { JUMP_DURATIONS, ENERGY_SETTINGS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';

export const phaseDashSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, 'phaseDash')) return;
        state.jumpState.isPhaseDash = true;
        state.jumpState.phaseDashDuration = JUMP_DURATIONS.phaseDash;
        initiateJump(state, JUMP_DURATIONS.phaseDash);
        console.log("-> startPhaseDash: Phase Dash initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isPhaseDash) {
            state.jumpState.phaseDashDuration -= deltaTime;
            if (state.jumpState.phaseDashDuration <= 0) {
                state.jumpState.isPhaseDash = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for phaseDash
    }
};
