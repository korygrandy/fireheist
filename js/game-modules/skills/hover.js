import { JUMP_DURATIONS, ENERGY_SETTINGS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';

export const hoverSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, 'hover')) return;
        state.jumpState.isHover = true;
        state.jumpState.hoverDuration = JUMP_DURATIONS.hover;
        initiateJump(state, JUMP_DURATIONS.hover);
        console.log("-> startHover: Hover initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isHover) {
            state.jumpState.hoverDuration -= deltaTime;
            if (state.jumpState.hoverDuration <= 0) {
                state.jumpState.isHover = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for hover
    }
};
