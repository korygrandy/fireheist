import { JUMP_DURATIONS, ENERGY_SETTINGS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';

export const groundPoundSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, 'groundPound')) return;
        state.jumpState.isGroundPound = true;
        state.jumpState.groundPoundDuration = JUMP_DURATIONS.groundPound;
        state.jumpState.groundPoundEffectTriggered = false; // Reset the trigger flag
        initiateJump(state, JUMP_DURATIONS.groundPound);
        playAnimationSound('groundPound');
        console.log("-> startGroundPound: Ground Pound initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isGroundPound) {
            state.jumpState.groundPoundDuration -= deltaTime;
            if (state.jumpState.groundPoundDuration <= 0) {
                state.jumpState.isGroundPound = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for groundPound
    }
};
