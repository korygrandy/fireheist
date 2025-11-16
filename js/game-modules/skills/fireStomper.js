import { JUMP_DURATIONS, ENERGY_SETTINGS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';
import { createFireStomperEffect } from '../drawing/effects.js';

export const fireStomperSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.isPaused || state.jumpState.isJumping) return;
        if (!consumeEnergy(state, 'fireStomper')) return;

        state.jumpState.isFireStomper = true;
        state.jumpState.fireStomperDuration = JUMP_DURATIONS.fireStomper;
        initiateJump(state, JUMP_DURATIONS.fireStomper);
        playAnimationSound('fireStomper');

        // Create the visual effect
        createFireStomperEffect();

        // Destroy all obstacles on screen
        const allObstacles = [state.currentObstacle, ...state.ignitedObstacles, ...state.vanishingObstacles].filter(Boolean);
        allObstacles.forEach(ob => {
            state.incineratingObstacles.push({ ...ob, animationProgress: 0, startTime: performance.now(), animationType: 'shatter' });
            state.playerStats.obstaclesIncinerated++;
        });
        state.currentObstacle = null;
        state.ignitedObstacles = [];
        state.vanishingObstacles = [];

        console.log("-> startFireStomper: Fire Stomper initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isFireStomper) {
            state.jumpState.fireStomperDuration -= deltaTime;
            if (state.jumpState.fireStomperDuration <= 0) {
                state.jumpState.isFireStomper = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for fireStomper
    }
};