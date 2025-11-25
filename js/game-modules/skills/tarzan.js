// js/game-modules/skills/tarzan.js

import { consumeEnergy, initiateJump, setInvincible, setInvincibilityEndTime, setSkillCooldown } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';
import { canvas } from '../../dom-elements.js';
import { drawStickFigure } from '../drawing/player.js';
import { JUMP_DURATIONS } from '../../constants.js';

export const tarzanSkill = {
    config: {
        name: 'tarzanSwing',
        energyCost: 50,
        cooldownMs: 3000,
    },

    activate: function(state) {
        const now = performance.now();
        // 1. CHECK COOLDOWN
        if (state.skillCooldowns[this.config.name] && now < state.skillCooldowns[this.config.name]) {
            console.log("-> Tarzan Skill: On cooldown.");
            return;
        }

        if (!state.gameRunning || state.isPaused || state.tarzanState.isActive) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;

        // 2. SET COOLDOWN
        setSkillCooldown(this.config.name, now + this.config.cooldownMs);

        console.log("-> Tarzan Skill: Activated!");
        const tarzanState = state.tarzanState;
        tarzanState.isActive = true;
        tarzanState.isSwinging = false;
        tarzanState.isAttached = false;
        tarzanState.ropeLength = 216; 
        tarzanState.angle = -Math.PI / 2.75; // Even wider initial arc (approx 65 degrees)
        tarzanState.angularVelocity = 0;
        tarzanState.anchorX = canvas.width / 2; // Centered
        tarzanState.anchorY = 0;
        tarzanState.hasAutoJumped = false;
        tarzanState.hasSwungForward = false;
        tarzanState.swingStartTime = 0; // Reset swing start time

        playAnimationSound('swoosh');
    },

    update: function(state, deltaTime) {
        if (!state.tarzanState.isActive) return;

        const tarzanState = state.tarzanState;

        if (!tarzanState.isAttached) {
            if (!tarzanState.hasAutoJumped) {
                initiateJump(state, JUMP_DURATIONS.hurdle);
                tarzanState.hasAutoJumped = true;

                setTimeout(() => {
                    if (!tarzanState.isActive) return;
                    tarzanState.isAttached = true;
                    tarzanState.isSwinging = true;
                    tarzanState.swingStartTime = performance.now(); // Record swing start time
                    setInvincible(true); // Become invincible
                    playAnimationSound('tarzanSwing');
                }, 150);
            }
        } else if (tarzanState.isSwinging) {
            const gravity = 0.0042; // Reduced by 30% for slower swing
            const angularAcceleration = -gravity * Math.sin(tarzanState.angle);
            tarzanState.angularVelocity += angularAcceleration;
            tarzanState.angle += tarzanState.angularVelocity;
            tarzanState.angularVelocity *= 0.995;

            // Check for the apex of the forward swing
            if (!tarzanState.hasSwungForward && tarzanState.angularVelocity < 0.001 && tarzanState.angle > 0) {
                tarzanState.hasSwungForward = true;
            }

            // Release condition: after swinging forward and then back, AND after minimum duration
            const minSwingDurationMet = (performance.now() - tarzanState.swingStartTime) > 1500; // 1.5 seconds minimum
            if (tarzanState.hasSwungForward && tarzanState.angularVelocity > -0.001 && tarzanState.angle < 0 && minSwingDurationMet) {
                tarzanState.isActive = false;
                tarzanState.isAttached = false;
                tarzanState.isSwinging = false;
                state.jumpState.isJumping = false; // Land the player
                setInvincible(false); // End invincibility

                state.gameSpeedMultiplier *= 1.5;
                setTimeout(() => {
                    state.gameSpeedMultiplier /= 1.5;
                }, 1200);
            }
        }
    },

    draw: function(ctx, state) {
        if (!state.tarzanState.isActive) return;

        const tarzanState = state.tarzanState;
        const ropeEndX = tarzanState.anchorX + Math.sin(tarzanState.angle) * tarzanState.ropeLength;
        const ropeEndY = tarzanState.anchorY + Math.cos(tarzanState.angle) * tarzanState.ropeLength;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(tarzanState.anchorX, tarzanState.anchorY);
        ctx.lineTo(ropeEndX, ropeEndY);
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        if (tarzanState.isAttached) {
            const currentSegment = state.raceSegments[Math.min(state.currentSegmentIndex, state.raceSegments.length - 1)];
            const groundAngle = currentSegment ? currentSegment.angleRad : 0;
            drawStickFigure(ropeEndX, ropeEndY, state.jumpState, groundAngle);
        }
    }
};
