import { JUMP_DURATIONS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';

export const frontflipSkill = {
    config: {
        name: 'frontflip',
        energyCost: 10,
    },
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;
        state.jumpState.isFrontflip = true;
        state.jumpState.frontflipDuration = 500;
        initiateJump(state, 500);
        console.log("-> startFrontflip: Frontflip initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isFrontflip) {
            state.jumpState.frontflipDuration -= deltaTime;
            if (state.jumpState.frontflipDuration <= 0) {
                state.jumpState.isFrontflip = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for frontflip
    }
};
