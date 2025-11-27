import { JUMP_DURATIONS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';
import { playBackflipSound } from '../../audio.js';

export const backflipSkill = {
    config: {
        name: 'backflip',
        energyCost: 10,
    },
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;
        state.jumpState.isBackflip = true;
        state.jumpState.backflipDuration = 500;
        initiateJump(state, 500);
        playBackflipSound();
        console.log("-> startBackflip: Backflip initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isBackflip) {
            state.jumpState.backflipDuration -= deltaTime;
            if (state.jumpState.backflipDuration <= 0) {
                state.jumpState.isBackflip = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for backflip
    }
};
