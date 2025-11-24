import { JUMP_DURATIONS, STICK_FIGURE_FIXED_X, GROUND_Y } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';
import { createHoudiniPoof } from '../drawing/effects.js';

export const houdiniSkill = {
    config: {
        name: 'houdini',
        energyCost: 30,
    },
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;
        state.jumpState.isHoudini = true;
        state.jumpState.houdiniDuration = 800;
        state.jumpState.houdiniPhase = 'disappearing';

        // Create the initial poof at the player's location
        const playerY = GROUND_Y - state.jumpState.progress * 200; // Approximate player Y
        createHoudiniPoof(STICK_FIGURE_FIXED_X, playerY - 50);

        initiateJump(state, 800);
        playAnimationSound('houdini');
        console.log("-> startHoudini: Houdini initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isHoudini) {
            const previousPhase = state.jumpState.houdiniPhase;
            state.jumpState.houdiniDuration -= deltaTime;

            if (state.jumpState.houdiniDuration <= 400) {
                state.jumpState.houdiniPhase = 'reappearing';
                if (previousPhase === 'disappearing') {
                    const playerY = GROUND_Y - state.jumpState.progress * 200; 
                    createHoudiniPoof(STICK_FIGURE_FIXED_X, playerY - 50);
                }
            }
            if (state.jumpState.houdiniDuration <= 0) {
                state.jumpState.isHoudini = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for houdini
    }
};
