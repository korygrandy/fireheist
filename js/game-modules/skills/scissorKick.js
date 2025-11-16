import { JUMP_DURATIONS, ENERGY_SETTINGS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';

export const scissorKickSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, 'scissorKick')) return;
        state.jumpState.isScissorKick = true;
        state.jumpState.scissorKickDuration = JUMP_DURATIONS.scissorKick;
        initiateJump(state, JUMP_DURATIONS.scissorKick);
        console.log("-> startScissorKick: Scissor Kick initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isScissorKick) {
            state.jumpState.scissorKickDuration -= deltaTime;
            if (state.jumpState.scissorKickDuration <= 0) {
                state.jumpState.isScissorKick = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for scissorKick
    }
};
