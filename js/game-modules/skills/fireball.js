import { JUMP_DURATIONS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';

export const fireballSkill = {
    config: {
        name: 'fireball',
        energyCost: 10,
    },
    activate: function(state) {
        if (!state.gameRunning || state.isPaused || state.jumpState.isJumping) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;

        state.jumpState.isFireball = true;
        state.jumpState.fireballDuration = JUMP_DURATIONS.fireball;
        initiateJump(state, JUMP_DURATIONS.fireball);
        playAnimationSound('fireball');

        console.log("-> castFireball: Fireball cast.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isFireball) {
            state.jumpState.fireballDuration -= deltaTime;
            if (state.jumpState.fireballDuration <= 0) {
                state.jumpState.isFireball = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for fireball
    }
};
