import { JUMP_DURATIONS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';
import { createCorkscrewParticle } from '../drawing/effects.js';

export const corkscrewSpinSkill = {
    config: {
        name: 'corkscrewSpin',
        energyCost: 15,
    },

    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;

        state.jumpState.isCorkscrewSpin = true;
        state.jumpState.corkscrewSpinDuration = JUMP_DURATIONS.corkscrewSpin;
        initiateJump(state, JUMP_DURATIONS.corkscrewSpin);
        console.log("-> corkscrewSpinSkill: Corkscrew Spin initiated.");
    },

    update: function(state, deltaTime) {
        // The visual effect is handled by the jump animation in the drawing module
    },

    draw: function(ctx, state) {
        // The visual effect is handled by the jump animation in the drawing module
    }
};