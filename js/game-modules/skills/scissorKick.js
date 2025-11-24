import { JUMP_DURATIONS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';

export const scissorKickSkill = {
    config: {
        name: 'scissorKick',
        energyCost: 15,
    },

    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;

        state.jumpState.isScissorKick = true;
        state.jumpState.scissorKickDuration = JUMP_DURATIONS.scissorKick;
        initiateJump(state, JUMP_DURATIONS.scissorKick);
        console.log("-> scissorKickSkill: Scissor Kick initiated.");
    },

    update: function(state, deltaTime) {
        // No special update logic for scissorKick, it's primarily a jump animation
    },

    draw: function(ctx, state) {
        // No special drawing for scissorKick, it uses the base stick figure drawing
    }
};