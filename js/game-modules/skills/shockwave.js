import { JUMP_DURATIONS, GROUND_Y, STICK_FIGURE_FIXED_X, STICK_FIGURE_TOTAL_HEIGHT } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';
import { createShockwaveRing } from '../drawing/effects.js';

export const shockwaveSkill = {
    config: {
        name: 'shockwave',
        energyCost: 25,
        pushbackDistance: 200, // How far obstacles get pushed back (in pixels)
    },
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;
        state.jumpState.isShockwave = true;
        state.jumpState.shockwaveDuration = JUMP_DURATIONS.shockwave;
        state.jumpState.shockwaveEffectTriggered = false; // Reset effect trigger flag
        initiateJump(state, JUMP_DURATIONS.shockwave);
        playAnimationSound('shockwave');
        console.log("-> startShockwave: Shockwave initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isShockwave) {
            state.jumpState.shockwaveDuration -= deltaTime;
            
            // Trigger shockwave effect on landing (progress > 0.5 = descending)
            if (!state.jumpState.shockwaveEffectTriggered && state.jumpState.progress > 0.5) {
                this.triggerShockwaveEffect(state);
                state.jumpState.shockwaveEffectTriggered = true;
            }
            
            if (state.jumpState.shockwaveDuration <= 0) {
                state.jumpState.isShockwave = false;
                state.jumpState.shockwaveEffectTriggered = false;
            }
        }
    },

    triggerShockwaveEffect: function(state) {
        // Calculate player position for the shockwave origin
        const playerX = STICK_FIGURE_FIXED_X;
        const playerY = GROUND_Y - STICK_FIGURE_TOTAL_HEIGHT;
        
        // Create visual shockwave ring effect at player feet
        createShockwaveRing(playerX, GROUND_Y - 5);
        
        // Push back any obstacles that are ahead of the player
        if (state.currentObstacle && !state.currentObstacle.hasBeenHit) {
            const distance = state.currentObstacle.x - playerX;
            // Only push if obstacle is ahead and within shockwave range
            if (distance > 0 && distance < 400) {
                state.currentObstacle.x += this.config.pushbackDistance;
                console.log(`-> SHOCKWAVE: Pushed obstacle back by ${this.config.pushbackDistance}px`);
            }
        }
        
        // Also push back ignited obstacles if any
        if (state.ignitedObstacles) {
            state.ignitedObstacles.forEach(obstacle => {
                const distance = obstacle.x - playerX;
                if (distance > 0 && distance < 400) {
                    obstacle.x += this.config.pushbackDistance;
                }
            });
        }
    },

    draw: function(ctx, state) {
        // Shockwave rings are drawn via the effects system
    }
};
