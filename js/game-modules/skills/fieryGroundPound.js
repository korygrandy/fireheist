// js/game-modules/skills/fieryGroundPound.js
import { JUMP_DURATIONS, GROUND_Y, STICK_FIGURE_FIXED_X, STICK_FIGURE_TOTAL_HEIGHT } from '../../constants.js';
import { playAnimationSound } from '../../audio.js';
import { consumeEnergy, initiateJump, setFieryGroundPound, setFieryGroundPoundDuration, setGroundPoundEffectTriggered } from '../state-manager.js';
import { createGroundPoundEffect, createFireTrail, createHurdleJumpSpikes } from '../drawing/effects.js';

export const fieryGroundPoundSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, 'fieryGroundPound')) return;

        // Trigger the large spike explosion at the start of the move
        const groundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(state.raceSegments[state.currentSegmentIndex].angleRad);
        createHurdleJumpSpikes(STICK_FIGURE_FIXED_X, groundY, 2); // sizeMultiplier = 2

        state.jumpState.isFieryGroundPound = true;
        state.jumpState.fieryGroundPoundDuration = JUMP_DURATIONS.fieryGroundPound;
        state.jumpState.groundPoundEffectTriggered = false; // Reset the trigger flag
        initiateJump(state, JUMP_DURATIONS.fieryGroundPound);
        playAnimationSound('firestorm'); // Use firestorm sound for fiery effect

        // Incinerate all active obstacles
        let now = performance.now();
        const timeIncrement = 0.0001; // A tiny increment to ensure unique start times

        if (state.currentObstacle) {
            state.incineratingObstacles.push({ ...state.currentObstacle, animationProgress: 0, startTime: now });
            now += timeIncrement;
            state.currentObstacle = null;
            state.playerStats.obstaclesIncinerated++;
        }
        state.ignitedObstacles.forEach(ob => {
            state.incineratingObstacles.push({ ...ob, animationProgress: 0, startTime: now });
            now += timeIncrement;
        });
        state.ignitedObstacles.length = 0; // Clear ignited obstacles

        state.vanishingObstacles.forEach(ob => {
            state.incineratingObstacles.push({ ...ob, animationProgress: 0, startTime: now });
            now += timeIncrement;
        });
        state.vanishingObstacles.length = 0; // Clear vanishing obstacles

        console.log("-> startFieryGroundPound: Fiery Ground Pound initiated. All obstacles incinerated!");
    },

    update: function(gameState, deltaTime) {
        if (gameState.jumpState.isFieryGroundPound) {
            setFieryGroundPoundDuration(gameState.jumpState.fieryGroundPoundDuration - deltaTime);
            if (gameState.jumpState.fieryGroundPoundDuration <= 0) {
                setFieryGroundPound(false);
            }
        }
    },

    draw: function(ctx, gameState, playerX, playerY) {
        if (gameState.jumpState.isFieryGroundPound && gameState.jumpState.fieryGroundPoundDuration < 100 && !gameState.jumpState.groundPoundEffectTriggered) {
            const groundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(gameState.raceSegments[gameState.currentSegmentIndex].angleRad);
            const skillLevel = gameState.playerStats.skillLevels.fieryGroundPound || 1;
            
            // Define a fiery color palette for the jagged explosion
            const fireColors = [
                'rgba(255, 80, 0, 0.8)',   // Bright Orange
                'rgba(255, 165, 0, 0.9)', // Orange
                'rgba(255, 100, 0, 0.8)',  // Deeper Orange
                'rgba(255, 215, 0, 0.7)'   // Golden Yellow
            ];

            // Create a single, fiery, jagged explosion
            createGroundPoundEffect(STICK_FIGURE_FIXED_X, groundY, skillLevel, fireColors);

            if (skillLevel === 5) {
                createFireTrail(STICK_FIGURE_FIXED_X, groundY);
            }
            setGroundPoundEffectTriggered(true);
        }
    }
};
