import { JUMP_DURATIONS, ENERGY_SETTINGS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';
import { createMeteorStrikeEffect } from '../drawing/effects.js';

export const meteorStrikeSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, 'meteorStrike')) return;

        const skillLevel = state.playerStats.skillLevels.meteorStrike || 1;

        if (skillLevel === 1) {
            if (state.currentObstacle) {
                createMeteorStrikeEffect(state.currentObstacle, skillLevel);
                state.incineratingObstacles.push({ ...state.currentObstacle, animationProgress: 0, startTime: performance.now() });
                state.currentObstacle = null;
                state.playerStats.obstaclesIncinerated++;
            }
        } else if (skillLevel === 2) {
            const obstaclesToIncinerate = [state.currentObstacle, ...state.ignitedObstacles, ...state.vanishingObstacles].filter(Boolean).slice(0, 2);
            obstaclesToIncinerate.forEach(ob => {
                createMeteorStrikeEffect(ob, skillLevel);
                state.incineratingObstacles.push({ ...ob, animationProgress: 0, startTime: performance.now() });
                state.playerStats.obstaclesIncinerated++;
            });
            if (obstaclesToIncinerate.includes(state.currentObstacle)) state.currentObstacle = null;
            state.ignitedObstacles = state.ignitedObstacles.filter(ob => !obstaclesToIncinerate.includes(ob));
            state.vanishingObstacles = state.vanishingObstacles.filter(ob => !obstaclesToIncinerate.includes(ob));
        } else if (skillLevel >= 3) {
            const allObstacles = [state.currentObstacle, ...state.ignitedObstacles, ...state.vanishingObstacles].filter(Boolean);
            allObstacles.forEach(ob => {
                createMeteorStrikeEffect(ob, skillLevel);
                state.incineratingObstacles.push({ ...ob, animationProgress: 0, startTime: performance.now() });
                state.playerStats.obstaclesIncinerated++;
            });
            state.currentObstacle = null;
            state.ignitedObstacles = [];
            state.vanishingObstacles = [];
        }

        state.jumpState.isMeteorStrike = true;
        state.jumpState.meteorStrikeDuration = 800; // A longer duration for a dramatic effect
        initiateJump(state, 800);
        playAnimationSound('meteorStrike'); // Play sound for Meteor Strike
        console.log("-> startMeteorStrike: Meteor Strike initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isMeteorStrike) {
            state.jumpState.meteorStrikeDuration -= deltaTime;
            if (state.jumpState.meteorStrikeDuration <= 0) {
                state.jumpState.isMeteorStrike = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for meteorStrike
    }
};
