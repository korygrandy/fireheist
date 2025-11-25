// js/game-modules/skills/fireMage.js
import { FIRE_MAGE_DURATION_MS, STICK_FIGURE_TOTAL_HEIGHT } from '../../constants.js';
import { playAnimationSound } from '../../audio.js';
import { consumeEnergy, setFireMageActive, setFireMageEndTime, setSkillCooldown } from '../state-manager.js';

export const fireMageSkill = {
    config: {
        name: 'fireMage',
        energyCost: 40,
        cooldownMs: 10000, // Cooldown of 10 seconds
    },
    activate: function(state) {
        const now = Date.now();
        // 1. CHECK COOLDOWN
        if (state.skillCooldowns[this.config.name] && now < state.skillCooldowns[this.config.name]) {
            console.log("-> fireMageSkill.activate: Fire Mage is on cooldown.");
            return;
        }

        if (!state.gameRunning || state.isPaused || state.isFireMageActive) return;

        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) {
            console.log(`[DEBUG] Fire Mage blocked: Not enough energy. Required: ${this.config.energyCost}, Available: ${state.playerEnergy}`);
            playAnimationSound('quack');
            return;
        }

        // 2. SET COOLDOWN
        setSkillCooldown(this.config.name, now + this.config.cooldownMs);

        setFireMageActive(true);
        setFireMageEndTime(now + FIRE_MAGE_DURATION_MS);

        playAnimationSound('fireball'); // Placeholder sound for activation
        console.log("-> startFireMage: Fire Mage mode initiated.");
    },

    update: function(gameState, deltaTime) {
        if (gameState.isFireMageActive && Date.now() > gameState.fireMageEndTime) {
            setFireMageActive(false);
            console.log("-> Fire Mage mode ended.");
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
        setFireMageActive(false);
    }
};
