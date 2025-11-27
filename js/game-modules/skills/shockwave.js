import { JUMP_DURATIONS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';

export const shockwaveSkill = {
    config: {
        name: 'shockwave',
        energyCost: 25,
    },
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;
        state.jumpState.isShockwave = true;
        state.jumpState.shockwaveDuration = JUMP_DURATIONS.shockwave;
        initiateJump(state, JUMP_DURATIONS.shockwave);
        playAnimationSound('shockwave');
        console.log("-> startShockwave: Shockwave initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isShockwave) {
            state.jumpState.shockwaveDuration -= deltaTime;
            if (state.jumpState.shockwaveDuration <= 0) {
                state.jumpState.isShockwave = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for shockwave
    }
};
