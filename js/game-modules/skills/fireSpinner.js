import { playAnimationSound } from '../../audio.js';
import { getSkillModifiedValue, initiateJump, setFireSpinner, setFireSpinnerDuration, setFireSpinnerOnCooldown, setFireSpinnerDrainingEnergy, setPlayerEnergy } from '../state-manager.js';
import { fireSpinnerUpgradeEffects } from '../skill-upgrades.js';
import { JUMP_DURATIONS, STICK_FIGURE_TOTAL_HEIGHT } from '../../constants.js';

const COOLDOWN = 30000; // 30 seconds cooldown

// Fire Spinner Skill Module
export const fireSpinnerSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused || state.isFireSpinnerOnCooldown) return;
        if (state.playerEnergy <= state.maxPlayerEnergy * 0.5) {
            console.log("-> fireSpinnerSkill.activate: Not enough energy to activate. Requires > 50%.");
            return;
        }

        const now = Date.now();
        if (now - state.fireSpinnerLastActivationTime < COOLDOWN) {
            console.log("-> fireSpinnerSkill.activate: Fire Spinner is on cooldown.");
            return;
        }

        setFireSpinner(true);
        setFireSpinnerDuration(JUMP_DURATIONS.firestorm);
        state.fireSpinnerLastActivationTime = now;
        setFireSpinnerOnCooldown(true);
        setFireSpinnerDrainingEnergy(true);

        // Calculate modified drain duration based on skill level
        const baseDrainDuration = JUMP_DURATIONS.firestorm; // Base duration is 10 seconds
        state.fireSpinnerDrainEndTime = now + getSkillModifiedValue(baseDrainDuration, 'fireSpinner', fireSpinnerUpgradeEffects, state);

        initiateJump(state, JUMP_DURATIONS.firestorm);
        playAnimationSound('fireball'); // Placeholder sound
        console.log("-> fireSpinnerSkill.activate: Fire Spinner initiated.");
    },

    update: function(gameState, deltaTime) {
        if (gameState.isFireSpinnerDrainingEnergy) {
            const remainingTime = gameState.fireSpinnerDrainEndTime - Date.now();
            if (remainingTime <= 0) {
                setPlayerEnergy(0);
                setFireSpinnerDrainingEnergy(false);
            } else {
                const energyToDrain = gameState.playerEnergy;
                const drainRate = energyToDrain / remainingTime;
                setPlayerEnergy(Math.max(0, gameState.playerEnergy - (drainRate * deltaTime)));
            }
        }

        if (gameState.jumpState.isFireSpinner) {
            setFireSpinnerDuration(gameState.jumpState.fireSpinnerDuration - deltaTime);
            if (gameState.jumpState.fireSpinnerDuration <= 0) {
                setFireSpinner(false);
            }
        }

        if (gameState.isFireSpinnerOnCooldown) {
            const now = Date.now();
            if (now - gameState.fireSpinnerLastActivationTime > COOLDOWN) {
                setFireSpinnerOnCooldown(false);
                console.log("-> FIRE SPINNER: Cooldown finished. Ready.");
            }
        }
    },

    draw: function(ctx, gameState, playerX, playerY) {
        if (!gameState.jumpState.isFireSpinner && !gameState.isMageSpinnerActive) return;

        const numFireballs = 12;
        const orbitRadius = 50;
        const rotationSpeed = 0.1;
        const angle = gameState.frameCount * rotationSpeed;

        for (let i = 0; i < numFireballs; i++) {
            const fireballAngle = angle + (i * (Math.PI * 2 / numFireballs));
            const x = playerX + orbitRadius * Math.cos(fireballAngle);
            const y = playerY - STICK_FIGURE_TOTAL_HEIGHT / 2 + orbitRadius * Math.sin(fireballAngle);

            ctx.save();
            ctx.globalAlpha = 0.8 + 0.2 * Math.sin(gameState.frameCount * 0.2 + i);
            ctx.font = '24px Arial';
            ctx.fillText('🔥', x, y);
            ctx.restore();
        }
    },

    reset: function(state) {
        state.fireSpinnerLastActivationTime = 0;
        setFireSpinnerOnCooldown(false);
        setFireSpinner(false);
        setFireSpinnerDrainingEnergy(false);
    }
};
