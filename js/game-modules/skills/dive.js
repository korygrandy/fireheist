import { JUMP_DURATIONS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';
import { createDiveParticle } from '../drawing/effects.js';

export const diveSkill = {
    config: {
        name: 'dive',
        energyCost: 15,
    },

    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;

        state.jumpState.isDive = true;
        state.jumpState.diveDuration = JUMP_DURATIONS.dive;
        initiateJump(state, JUMP_DURATIONS.dive);
        console.log("-> diveSkill: Dive initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isDive) {
            // Emit particles during the dive
            createDiveParticle(state.stickFigureFixedX, state.stickFigureY - STICK_FIGURE_TOTAL_HEIGHT / 2);
        }
    },

    draw: function(ctx, state) {
        // The visual effect is handled by the particle system in update()
    }
};