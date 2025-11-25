// js/game-modules/skills/fireAxe.js

import { consumeEnergy, addIncineratingObstacle, setCurrentObstacle, incrementObstaclesIncinerated, incrementTotalInGameIncinerations, incrementConsecutiveIncinerations, setSkillCooldown } from '../state-manager.js';
import { EASTER_EGG_EMOJI, OBSTACLE_WIDTH, STICK_FIGURE_FIXED_X } from '../../constants.js';
import { playAnimationSound } from '../../audio.js';
import { createShatterEffect } from '../drawing/effects.js';

export const fireAxeSkill = {
    config: {
        name: 'fireAxe',
        energyCost: 30,
        throwDistance: 250,
        cooldownMs: 500, // Matching the implied animation duration for now
    },

    activate: function(state) {
        const now = Date.now();
        // 1. CHECK GLOBAL COOLDOWN
        if (state.skillCooldowns[this.config.name] && now < state.skillCooldowns[this.config.name]) {
            console.log(`Fire Axe is on cooldown. Remaining: ${Math.max(0, state.skillCooldowns[this.config.name] - now).toFixed(0)}ms`);
            return;
        }

        if (!state.gameRunning || state.isPaused) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;

        // 2. SET GLOBAL COOLDOWN
        setSkillCooldown(this.config.name, now + this.config.cooldownMs);

        state.fireAxeState.isActive = true;
        state.fireAxeState.swingProgress = 0;
        state.fireAxeState.hasHit = false; // Reset hit flag for each activation
        
        const skillLevel = state.playerStats.skillLevels.fireAxe || 1;
        if (skillLevel >= 2) {
            state.fireAxeState.isThrown = true;
            state.fireAxeState.x = state.stickFigureFixedX + 20;
            state.fireAxeState.y = state.stickFigureY - 20;
        } else {
            state.fireAxeState.isThrown = false;
        }

        playAnimationSound('swoosh'); // Placeholder sound
    },

    update: function(state, deltaTime) {
        const now = Date.now();

        // If the skill is on cooldown (meaning it's active in terms of cooldown logic)
        // but its visual/effect duration has passed, deactivate it.
        if (state.fireAxeState.isActive && state.skillCooldowns[this.config.name] && now > state.skillCooldowns[this.config.name]) {
            state.fireAxeState.isActive = false;
            state.fireAxeState.isThrown = false; // Also reset thrown state
            console.log("Fire Axe Deactivated (Cooldown Expired)");
        }

        if (!state.fireAxeState.isActive || state.fireAxeState.hasHit) return; // Stop updating if inactive or already hit

        const skillLevel = state.playerStats.skillLevels.fireAxe || 1;
        const currentSegment = state.raceSegments[Math.min(state.currentSegmentIndex, state.raceSegments.length - 1)];
        const groundAngle = currentSegment ? currentSegment.angleRad : 0;

        if (state.fireAxeState.isThrown) {
            // Axe is thrown (Level 2+)
            const speed = 5;
            const velocityX = Math.cos(groundAngle) * speed;
            const velocityY = -Math.sin(groundAngle) * speed; // Invert Y-velocity for canvas coordinates

            state.fireAxeState.x += velocityX;
            state.fireAxeState.y += velocityY;
            
            if (state.fireAxeState.x > STICK_FIGURE_FIXED_X + this.config.throwDistance) {
                state.fireAxeState.isActive = false; // Axe disappears after max distance
                state.fireAxeState.isThrown = false;
            }
        } else {
            // Axe is swung (Level 1)
            state.fireAxeState.swingProgress += deltaTime / 200; // 200ms swing animation
            if (state.fireAxeState.swingProgress >= 1) {
                state.fireAxeState.isActive = false;
            }
        }

        // Collision detection
        if (state.currentObstacle && !state.currentObstacle.hasBeenHit) {
            let axeCollisionX;
            if (state.fireAxeState.isThrown) {
                axeCollisionX = state.fireAxeState.x;
            } else {
                // For swinging axe, estimate collision point during the swing
                axeCollisionX = state.stickFigureFixedX + (40 * Math.sin(state.fireAxeState.swingProgress * Math.PI));
            }
            
            // Simple AABB collision check
            if (axeCollisionX < state.currentObstacle.x + OBSTACLE_WIDTH &&
                axeCollisionX + 20 > state.currentObstacle.x) { // 20 is approx axe head width

                const obstacleToIncinerate = state.currentObstacle;
                addIncineratingObstacle({ ...obstacleToIncinerate, animationProgress: 0, startTime: performance.now(), animationType: 'shatter' });
                setCurrentObstacle(null);
                createShatterEffect(obstacleToIncinerate.x, state.stickFigureY, obstacleToIncinerate.emoji); // Placeholder effect
                playAnimationSound('shatter');

                if (obstacleToIncinerate.emoji !== EASTER_EGG_EMOJI) {
                    incrementObstaclesIncinerated();
                    incrementTotalInGameIncinerations();
                    incrementConsecutiveIncinerations();
                }
                state.fireAxeState.isActive = false; // Axe stops on impact
                state.fireAxeState.hasHit = true; // Mark that it has hit an obstacle
                state.fireAxeState.isThrown = false; // Reset thrown state
            }
        }
    },

    draw: function(ctx, state) {
        if (!state.fireAxeState.isActive) return;

        ctx.save();
        
        if (state.fireAxeState.isThrown) {
            // Draw the thrown axe
            ctx.translate(state.fireAxeState.x, state.fireAxeState.y);
            ctx.rotate((performance.now() / 50) % (Math.PI * 2)); // Spinning animation
        } else {
            // Draw the swinging axe
            const swingArc = Math.sin(state.fireAxeState.swingProgress * Math.PI) * 1.5; // Adjusted for a full swing
            ctx.translate(state.stickFigureFixedX + 10, state.stickFigureY - 20); // Position relative to player
            ctx.rotate(swingArc);
        }

        // Draw the axe shape (fiery colors)
        ctx.fillStyle = 'orangered';
        ctx.shadowColor = 'gold';
        ctx.shadowBlur = 10;
        ctx.fillRect(0, -5, 25, 10); // Axe head (slightly larger)
        ctx.fillStyle = 'saddlebrown';
        ctx.fillRect(-15, 0, 15, 5); // Handle

        ctx.restore();
    }
};
