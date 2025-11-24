import { JUMP_DURATIONS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';

export const hoverSkill = {
    config: {
        name: 'hover',
        energyCost: 5,
    },

    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;

        state.jumpState.isHover = true;
        state.jumpState.hoverDuration = JUMP_DURATIONS.hover;
        initiateJump(state, JUMP_DURATIONS.hover);
        console.log("-> hoverSkill: Hover initiated.");
    },

    update: function(state, deltaTime) {
        // No special update logic for hover
    },

    draw: function(ctx, state) {
        // No special drawing for hover
    }
};