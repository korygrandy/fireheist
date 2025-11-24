import { JUMP_DURATIONS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';

export const cartoonScrambleSkill = {
    config: {
        name: 'cartoonScramble',
        energyCost: 30,
    },
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;
        state.jumpState.isCartoonScramble = true;
        state.jumpState.cartoonScrambleDuration = JUMP_DURATIONS.cartoonScramble;
        initiateJump(state, JUMP_DURATIONS.cartoonScramble);
        playAnimationSound('cartoon-running');
        console.log("-> startCartoonScramble: Cartoon Scramble initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isCartoonScramble) {
            state.jumpState.cartoonScrambleDuration -= deltaTime;
            if (state.jumpState.cartoonScrambleDuration <= 0) {
                state.jumpState.isCartoonScramble = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for cartoonScramble
    }
};
