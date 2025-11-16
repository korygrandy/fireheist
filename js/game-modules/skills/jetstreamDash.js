import { JUMP_DURATIONS, STICK_FIGURE_FIXED_X, STICK_FIGURE_TOTAL_HEIGHT } from '../../constants.js';
import { initiateJump } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';
import { createJetstreamParticle } from '../drawing/effects.js';

export const jetstreamDashSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.isPaused || state.jumpState.isJumping || state.isJetstreamDashing) return;

        // No initial energy cost, but will drain over time
        if (state.playerEnergy <= 0) {
            console.log("-> startJetstreamDash: Not enough energy to activate.");
            return;
        }

        state.jumpState.isJetstreamDashing = true;
        state.jumpState.jetstreamDashDuration = JUMP_DURATIONS.jetstreamDash;
        state.isInvincible = true; // Grant invincibility during the dash
        state.invincibilityEndTime = Date.now() + JUMP_DURATIONS.jetstreamDash;
        state.jetstreamDashDrainEndTime = Date.now() + JUMP_DURATIONS.jetstreamDash; // Energy drains for the duration

        initiateJump(state, JUMP_DURATIONS.jetstreamDash);
        playAnimationSound('jetstreamDash'); // Play sound for Jetstream Dash
        console.log("-> startJetstreamDash: Jetstream Dash initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isJetstreamDashing) {
            state.jumpState.jetstreamDashDuration -= deltaTime;
            if (state.jumpState.jetstreamDashDuration <= 0) {
                state.jumpState.isJetstreamDashing = false;
                state.isInvincible = false; // End invincibility
            } else {
                // Emit jetstream particles
                createJetstreamParticle(state.stickFigureFixedX - 20, state.stickFigureY + STICK_FIGURE_TOTAL_HEIGHT / 2);
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for jetstreamDash
    }
};
