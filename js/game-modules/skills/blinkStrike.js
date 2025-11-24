import { JUMP_DURATIONS, STICK_FIGURE_FIXED_X, GROUND_Y, STICK_FIGURE_TOTAL_HEIGHT, OBSTACLE_EMOJI_Y_OFFSET, OBSTACLE_HEIGHT } from '../../constants.js';
import { consumeEnergy, initiateJump, setScreenFlash } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';
import { createShatterEffect } from '../drawing/effects.js';

export const blinkStrikeSkill = {
    config: {
        name: 'blinkStrike',
        energyCost: 40,
    },
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;

        state.jumpState.isBlinkStrike = true;
        state.jumpState.blinkStrikeDuration = JUMP_DURATIONS.blinkStrike;
        initiateJump(state, JUMP_DURATIONS.blinkStrike);

        // Make player invisible
        state.playerIsInvisible = true;
        playAnimationSound('houdini'); // Disappearance sound

        // Teleport and shatter obstacle after a very short delay
        setTimeout(() => {
            if (state.currentObstacle) {
                // Calculate obstacle's ground Y to place player correctly
                const currentSegment = state.raceSegments[Math.min(state.currentSegmentIndex, state.raceSegments.length - 1)];
                const obstacleGroundY = GROUND_Y - state.currentObstacle.x * Math.tan(currentSegment.angleRad);
                const playerTeleportY = obstacleGroundY - STICK_FIGURE_TOTAL_HEIGHT;

                // Move player to obstacle's X and calculated Y
                state.stickFigureFixedX = state.currentObstacle.x; // Temporarily move player's X
                state.stickFigureY = playerTeleportY; // Temporarily move player's Y

                createShatterEffect(state.currentObstacle.x, obstacleGroundY + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT, state.currentObstacle.emoji);
                state.incineratingObstacles.push({ ...state.currentObstacle, animationProgress: 0, startTime: performance.now(), animationType: 'shatter' });
                state.currentObstacle = null;
                state.playerStats.obstaclesIncinerated++; // Count as incinerated for now
                playAnimationSound('shatter'); // Shatter sound
            }
            // Make player visible again after the strike
            state.playerIsInvisible = false;
            state.stickFigureFixedX = STICK_FIGURE_FIXED_X; // Reset player X
            state.stickFigureY = undefined; // Reset player Y

            // Add a screen flash for impact
            setScreenFlash(0.7, 200, performance.now());

        }, JUMP_DURATIONS.blinkStrike / 2); // Halfway through the jump duration

        console.log("-> startBlinkStrike: Blink Strike initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isBlinkStrike) {
            state.jumpState.blinkStrikeDuration -= deltaTime;
            if (state.jumpState.blinkStrikeDuration <= 0) {
                state.jumpState.isBlinkStrike = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for blinkStrike
    }
};
