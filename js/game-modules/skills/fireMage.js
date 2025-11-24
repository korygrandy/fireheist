// js/game-modules/skills/fireMage.js
import { FIRE_MAGE_ENERGY_COST, FIRE_MAGE_DURATION_MS, STICK_FIGURE_TOTAL_HEIGHT } from '../../constants.js';
import { playAnimationSound } from '../../audio.js';
import { consumeEnergy, setFireMageActive, setFireMageEndTime, setFireMageOnCooldown } from '../state-manager.js';

const COOLDOWN = 10000; // Cooldown of 10 seconds

export const fireMageSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.isPaused || state.isFireMageActive || state.isFireMageOnCooldown) return;

        const now = Date.now();
        if (now - state.fireMageLastActivationTime < COOLDOWN) {
            console.log("-> startFireMage: Fire Mage is on cooldown.");
            return;
        }

        if (!consumeEnergy(state, 'fireMage', FIRE_MAGE_ENERGY_COST)) return;

        setFireMageActive(true);
        setFireMageEndTime(now + FIRE_MAGE_DURATION_MS);
        state.fireMageLastActivationTime = now; // Start cooldown from now
        setFireMageOnCooldown(true); // Cooldown starts immediately

        playAnimationSound('fireball'); // Placeholder sound for activation
        console.log("-> startFireMage: Fire Mage mode initiated.");
    },

    update: function(gameState, deltaTime) {
        if (gameState.isFireMageActive && Date.now() > gameState.fireMageEndTime) {
            setFireMageActive(false);
            console.log("-> Fire Mage mode ended.");
        }

        if (gameState.isFireMageOnCooldown) {
            const now = Date.now();
            if (now - gameState.fireMageLastActivationTime > COOLDOWN) {
                setFireMageOnCooldown(false);
                console.log("-> Fire Mage: Cooldown finished. Ready.");
            }
        }
    },

    draw: function(ctx, gameState, playerX, playerY) {
        if (gameState.isFireMageActive) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(playerX, playerY - STICK_FIGURE_TOTAL_HEIGHT / 2, STICK_FIGURE_TOTAL_HEIGHT * 0.8, 0, Math.PI * 2, false);
            ctx.fillStyle = 'rgba(255, 100, 0, 0.3)';
            ctx.shadowColor = 'orange';
            ctx.shadowBlur = 20;
            ctx.fill();
            ctx.restore();
        }
    },

    reset: function(state) {
        state.fireMageLastActivationTime = 0;
        setFireMageOnCooldown(false);
        setFireMageActive(false);
    }
};
