import { JUMP_DURATIONS } from '../../constants.js';
import { playAnimationSound } from '../../audio.js';
import { initiateJump } from '../state-manager.js';

export const hurdleSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        state.jumpState.isHurdle = true;
        state.jumpState.hurdleDuration = JUMP_DURATIONS.hurdle;
        initiateJump(state, JUMP_DURATIONS.hurdle);
        playAnimationSound('hurdle');
        console.log("-> startHurdle: Hurdle initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isHurdle) {
            state.jumpState.hurdleDuration -= deltaTime;
            if (state.jumpState.hurdleDuration <= 0) {
                state.jumpState.isHurdle = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for hurdle
    }
};
