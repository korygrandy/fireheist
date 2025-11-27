import { JUMP_DURATIONS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';
import { playPhaseDashSound } from '../../audio.js';

export const phaseDashSkill = {
    config: {
        name: 'phaseDash',
        energyCost: 25,
    },

    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;

        state.jumpState.isPhaseDash = true;
        state.jumpState.phaseDashDuration = JUMP_DURATIONS.phaseDash;
        initiateJump(state, JUMP_DURATIONS.phaseDash);
        playPhaseDashSound();
        console.log("-> phaseDashSkill: Phase Dash initiated.");
    },

    update: function(state, deltaTime) {
        // No special update logic for phaseDash
    },

    draw: function(ctx, state) {
        // No special drawing for phaseDash
    }
};