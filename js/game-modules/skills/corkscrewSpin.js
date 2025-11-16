import { JUMP_DURATIONS, ENERGY_SETTINGS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';

export const corkscrewSpinSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, 'corkscrewSpin')) return;
        state.jumpState.isCorkscrewSpin = true;
        state.jumpState.corkscrewSpinDuration = JUMP_DURATIONS.corkscrewSpin;
        initiateJump(state, JUMP_DURATIONS.corkscrewSpin);
        console.log("-> startCorkscrewSpin: Corkscrew Spin initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isCorkscrewSpin) {
            state.jumpState.corkscrewSpinDuration -= deltaTime;
            if (state.jumpState.corkscrewSpinDuration <= 0) {
                state.jumpState.isCorkscrewSpin = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for corkscrewSpin
    }
};
