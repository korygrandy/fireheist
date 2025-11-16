// js/game-modules/skills/fireballRoll.js
import { JUMP_DURATIONS, STICK_FIGURE_TOTAL_HEIGHT, ENERGY_SETTINGS, FIREBALL_ROLL_DURATION_MS } from '../../constants.js';
import { playAnimationSound } from '../../audio.js';
import { setFireballRolling, setFireballRollDuration, setPlayerEnergy } from '../state-manager.js';

export const fireballRollSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.isPaused || state.isFireballRolling) return;

        // No initial energy cost, but will drain over time
        if (state.playerEnergy <= 0) {
            console.log("-> startFireballRoll: Not enough energy to activate.");
            return;
        }

        setFireballRolling(true);
        setFireballRollDuration(JUMP_DURATIONS.fireballRoll);
        state.isInvincible = true; // Grant invincibility during the roll
        state.invincibilityEndTime = Date.now() + JUMP_DURATIONS.fireballRoll;
        state.fireballRollDrainEndTime = Date.now() + JUMP_DURATIONS.fireballRoll; // Energy drains for the duration

        playAnimationSound('fireballRoll'); // Play sound for Fireball Roll

        console.log("-> startFireballRoll: Fireball Roll initiated.");
    },

    update: function(gameState, deltaTime) {
        if (gameState.jumpState.isFireballRolling) {
            // Create new particles
            const playerX = gameState.stickFigureFixedX;
            const playerY = gameState.stickFigureY - STICK_FIGURE_TOTAL_HEIGHT / 2;
            for (let i = 0; i < 5; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 2 + 1;
                gameState.fireballRollParticles.push({
                    x: playerX,
                    y: playerY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1,
                    size: Math.random() * 2 + 1
                });
            }

            const remainingTime = gameState.fireballRollDrainEndTime - Date.now();
            if (remainingTime <= 0) {
                setPlayerEnergy(0);
            } else {
                const energyToDrain = ENERGY_SETTINGS.ENERGY_COSTS.fireballRoll; // Assuming a per-second drain rate
                const drainRate = energyToDrain / (FIREBALL_ROLL_DURATION_MS / 1000); // Convert to per-ms drain
                setPlayerEnergy(Math.max(0, gameState.playerEnergy - (drainRate * deltaTime)));
            }

            setFireballRollDuration(gameState.jumpState.fireballRollDuration - deltaTime);
            if (gameState.jumpState.fireballRollDuration <= 0) {
                setFireballRolling(false);
                gameState.isInvincible = false; // End invincibility
            }
        }

        // Update existing particles
        for (let i = gameState.fireballRollParticles.length - 1; i >= 0; i--) {
            const p = gameState.fireballRollParticles[i];
            p.vx *= 0.97; // Friction
            p.vy += 0.05; // Gravity
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.04;
            p.size *= 0.96;
            if (p.life <= 0 || p.size < 0.5) {
                gameState.fireballRollParticles.splice(i, 1);
            }
        }
    },

    draw: function(ctx, gameState, playerX, playerY) {
        // Draw particles first, so they appear behind the main fireball
        for (const p of gameState.fireballRollParticles) {
            ctx.save();
            ctx.globalAlpha = p.life;
            const flicker = Math.floor(Math.random() * 100);
            ctx.fillStyle = `rgba(255, ${100 + flicker}, 0, 0.8)`;
            ctx.shadowColor = 'orange';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        if (gameState.jumpState.isFireballRolling) {
            ctx.save();
            // Draw player as a rolling fireball
            ctx.shadowColor = 'orange';
            ctx.shadowBlur = 25;

            ctx.save();
            ctx.translate(playerX, playerY - STICK_FIGURE_TOTAL_HEIGHT / 2); // Center the fireball vertically
            ctx.rotate(gameState.frameCount * 0.02); // Rolling animation (even slower spin)

            ctx.beginPath();
            ctx.arc(0, 0, STICK_FIGURE_TOTAL_HEIGHT / 1.5, 0, Math.PI * 2); // Fiery ball
            ctx.fillStyle = `rgba(255, ${100 + Math.floor(Math.random() * 100)}, 0, 0.9)`;
            ctx.fill();

            ctx.strokeStyle = `rgba(255, ${150 + Math.floor(Math.random() * 100)}, 0, 1)`;
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.restore();

            ctx.restore();
        }
    }
};
