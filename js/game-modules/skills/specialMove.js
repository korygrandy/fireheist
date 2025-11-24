import { JUMP_DURATIONS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';

export const specialMoveSkill = {
    config: {
        name: 'specialMove',
        energyCost: 20,
    },
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;
        state.jumpState.isSpecialMove = true;
        state.jumpState.specialMoveDuration = JUMP_DURATIONS.specialMove;
        initiateJump(state, JUMP_DURATIONS.specialMove);
        console.log("-> startSpecialMove: Special Move initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isSpecialMove) {
            state.jumpState.specialMoveDuration -= deltaTime;
            if (state.jumpState.specialMoveDuration <= 0) {
                state.jumpState.isSpecialMove = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for specialMove
    }
};
