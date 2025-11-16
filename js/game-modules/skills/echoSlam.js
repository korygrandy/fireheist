import { JUMP_DURATIONS, ENERGY_SETTINGS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';
import { createEchoSlamEffect } from '../drawing/effects.js';

export const echoSlamSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.isPaused || state.jumpState.isJumping) return;
        if (!consumeEnergy(state, 'echoSlam')) return;

        state.jumpState.isEchoSlam = true;
        state.jumpState.echoSlamDuration = JUMP_DURATIONS.echoSlam;
        initiateJump(state, JUMP_DURATIONS.echoSlam);
        playAnimationSound('echoSlam');

        // Create the visual effect
        createEchoSlamEffect();

        // Destroy all obstacles on screen
        const allObstacles = [state.currentObstacle, ...state.ignitedObstacles, ...state.vanishingObstacles].filter(Boolean);
        allObstacles.forEach(ob => {
            state.incineratingObstacles.push({ ...ob, animationProgress: 0, startTime: performance.now(), animationType: 'shatter' });
            state.playerStats.obstaclesIncinerated++;
        });
        state.currentObstacle = null;
        state.ignitedObstacles = [];
        state.vanishingObstacles = [];

        console.log("-> startEchoSlam: Echo Slam initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isEchoSlam) {
            state.jumpState.echoSlamDuration -= deltaTime;
            if (state.jumpState.echoSlamDuration <= 0) {
                state.jumpState.isEchoSlam = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for echoSlam
    }
};
