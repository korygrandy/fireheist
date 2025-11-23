// js/game-modules/skills/tarzan.js

import { consumeEnergy, initiateJump } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';
import { canvas } from '../../dom-elements.js';
import { drawStickFigure } from '../drawing/player.js';
import { JUMP_DURATIONS } from '../../constants.js';

export const tarzanSkill = {
    config: {
        name: 'tarzanSwing',
        energyCost: 50,
    },

    activate: function(state) {
        const now = performance.now();
        if (now < state.tarzanState.cooldownEndTime) {
            console.log("-> Tarzan Skill: On cooldown.");
            return;
        }

        if (!state.gameRunning || state.isPaused || state.tarzanState.isActive) return;
        if (!consumeEnergy(state, this.config.name)) return;

        console.log("-> Tarzan Skill: Activated!");
        const tarzanState = state.tarzanState;
        tarzanState.isActive = true;
        tarzanState.isSwinging = false;
        tarzanState.isAttached = false;
        tarzanState.ropeLength = 216; // Increased by 20%
        tarzanState.angle = -Math.PI / 3; // Even wider initial arc (60 degrees)
        tarzanState.angularVelocity = 0; // Start with no velocity
        tarzanState.anchorX = canvas.width / 2; // Centered
        tarzanState.anchorY = 0;
        tarzanState.hasAutoJumped = false;
        tarzanState.hasSwungForward = false;

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

            // Release condition: after swinging forward and then back
            if (tarzanState.hasSwungForward && tarzanState.angularVelocity > -0.001 && tarzanState.angle < 0) {
                tarzanState.isActive = false;
                tarzanState.isAttached = false;
                tarzanState.isSwinging = false;
                state.jumpState.isJumping = false; // Land the player
                tarzanState.cooldownEndTime = performance.now() + 3000; // Reduced cooldown to 3 seconds

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
