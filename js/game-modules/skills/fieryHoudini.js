import { STICK_FIGURE_FIXED_X, GROUND_Y, FIERY_HOUDINI_ENERGY_COST, FIERY_HOUDINI_DURATION_MS, FIERY_HOUDINI_RANGE, EASTER_EGG_EMOJI } from '../../constants.js';
import { playAnimationSound } from '../../audio.js';
import { createFieryHoudiniPoof } from '../drawing/effects.js';
import { consumeEnergy, getSkillModifiedValue, initiateJump, addIncineratingObstacle, setCurrentObstacle, incrementObstaclesIncinerated, incrementTotalInGameIncinerations, incrementConsecutiveIncinerations, setFieryHoudini, setFieryHoudiniDuration, setFieryHoudiniPhase, setFieryHoudiniOnCooldown, setPlayerIsInvisible, setInvincible, setInvincibilityEndTime } from '../state-manager.js';
import { fieryHoudiniUpgradeEffects } from '../skill-upgrades.js';

const COOLDOWN = 12000; // 12 seconds cooldown

// Fiery Houdini Skill Module
export const fieryHoudiniSkill = {
    config: {
        name: 'fieryHoudini',
        energyCost: 60,
        durationMs: 800,
        cooldownMs: COOLDOWN,
        range: 300,
    },

    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused || state.isFieryHoudiniOnCooldown) return;

        const now = Date.now();
        if (now - state.fieryHoudiniLastActivationTime < COOLDOWN) {
            console.log("-> fieryHoudiniSkill.activate: Fiery Houdini is on cooldown.");
            return;
        }

        const skillLevel = state.playerStats.skillLevels.fieryHoudini || 1;
        const energyCost = getSkillModifiedValue(FIERY_HOUDINI_ENERGY_COST, 'fieryHoudini', fieryHoudiniUpgradeEffects, state);

        if (!consumeEnergy(state, 'fieryHoudini', energyCost)) return;

        const range = getSkillModifiedValue(FIERY_HOUDINI_RANGE, 'fieryHoudini', fieryHoudiniUpgradeEffects, state);

        setFieryHoudini(true);
        setFieryHoudiniDuration(FIERY_HOUDINI_DURATION_MS);
        setFieryHoudiniPhase('disappearing');
        state.fieryHoudiniEndTime = now + FIERY_HOUDINI_DURATION_MS;
        state.fieryHoudiniLastActivationTime = now;
        setFieryHoudiniOnCooldown(true);

        if (skillLevel >= 4) {
            setInvincible(true);
            setInvincibilityEndTime(now + FIERY_HOUDINI_DURATION_MS + 300); // Invincible during and 300ms after
        }

        const playerY = GROUND_Y - state.jumpState.progress * 200; // Approximate player Y
        createFieryHoudiniPoof(STICK_FIGURE_FIXED_X + range / 2, playerY - 50);

        // Find and incinerate the current obstacle if it's in range
        if (state.currentObstacle && state.currentObstacle.x < STICK_FIGURE_FIXED_X + range) {
            const obstacleToIncinerate = state.currentObstacle;
            addIncineratingObstacle({ ...obstacleToIncinerate, animationProgress: 0, startTime: performance.now() });
            setCurrentObstacle(null);
            if (obstacleToIncinerate.emoji !== EASTER_EGG_EMOJI) {
                incrementObstaclesIncinerated();
                incrementTotalInGameIncinerations();
                incrementConsecutiveIncinerations();
            }
        }

        initiateJump(state, FIERY_HOUDINI_DURATION_MS);
        playAnimationSound('fieryHoudini');
        console.log("-> fieryHoudiniSkill.activate: Fiery Houdini initiated.");
    },

    update: function(gameState, deltaTime) {
        if (gameState.isFieryHoudiniOnCooldown) {
            const now = Date.now();
            if (now - gameState.fieryHoudiniLastActivationTime > COOLDOWN) {
                setFieryHoudiniOnCooldown(false);
                console.log("-> Fiery Houdini: Cooldown finished. Ready.");
            }
        }

        if (!gameState.jumpState.isFieryHoudini) return;

        const previousPhase = gameState.jumpState.fieryHoudiniPhase;
        setFieryHoudiniDuration(gameState.jumpState.fieryHoudiniDuration - deltaTime);

        if (gameState.jumpState.fieryHoudiniDuration <= FIERY_HOUDINI_DURATION_MS / 2) {
            setFieryHoudiniPhase('reappearing');
            if (previousPhase === 'disappearing') {
                const playerY = GROUND_Y - gameState.jumpState.progress * 200; 
                createFieryHoudiniPoof(STICK_FIGURE_FIXED_X, playerY - 50);
            }
        }
        if (gameState.jumpState.fieryHoudiniDuration <= 0) {
            setFieryHoudini(false);
        }
    },

    draw: function(ctx, gameState) {
        // Drawing logic will be moved here
    },

    reset: function(state) {
        state.fieryHoudiniLastActivationTime = 0;
        setFieryHoudiniOnCooldown(false);
        setFieryHoudini(false);
    }
};
