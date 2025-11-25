// js/game-modules/skills/mageSpinner.js
import { MAGE_SPINNER_DURATION_MS, MAGE_SPINNER_FIREBALL_INTERVAL_MS, MAGE_SPINNER_FIREBALL_COUNT, STICK_FIGURE_TOTAL_HEIGHT } from '../../constants.js';
import { playAnimationSound } from '../../audio.js';
import { consumeEnergy, setMageSpinnerActive, setMageSpinnerEndTime, setMageSpinnerFireballTimer, incrementMageSpinnerFireballsSpawned, setPlayerEnergy, setSkillCooldown } from '../state-manager.js';
import { castMageSpinnerFireball } from '../actions.js';

export const mageSpinnerSkill = {
    config: {
        name: 'mageSpinner',
        energyCost: 80,
        cooldownMs: 15000, // 15 seconds cooldown
    },
    activate: function(state) {
        const now = Date.now();
        // 1. CHECK COOLDOWN
        if (state.skillCooldowns[this.config.name] && now < state.skillCooldowns[this.config.name]) {
            console.log("-> mageSpinnerSkill.activate: Mage Spinner is on cooldown.");
            return;
        }

        if (!state.gameRunning || state.isPaused || state.isMageSpinnerActive) return;

        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;

        // 2. SET COOLDOWN
        setSkillCooldown(this.config.name, now + this.config.cooldownMs);

        state.isMageSpinnerActive = true;
        state.mageSpinnerEndTime = now + MAGE_SPINNER_DURATION_MS;
        state.mageSpinnerFireballTimer = MAGE_SPINNER_FIREBALL_INTERVAL_MS; // Initialize timer for first fireball
        incrementMageSpinnerFireballsSpawned(0); // Reset fireball counter

        playAnimationSound('firestorm'); // Placeholder sound for activation
        console.log("-> startMageSpinner: Mage Spinner initiated.");
    },

    update: function(gameState, deltaTime) {
        if (gameState.isMageSpinnerActive) {
            const remainingTime = gameState.mageSpinnerEndTime - Date.now();
            if (remainingTime <= 0) {
                setPlayerEnergy(0); 
            } else {
                const energyToDrain = this.config.energyCost; 
                const drainRate = energyToDrain / MAGE_SPINNER_DURATION_MS; 
                setPlayerEnergy(Math.max(0, gameState.playerEnergy - (drainRate * deltaTime)));
            }
        }

        if (gameState.isMageSpinnerActive) {
            const now = Date.now();
            if (now > gameState.mageSpinnerEndTime) {
                setMageSpinnerActive(false);
                console.log("-> Mage Spinner mode ended.");
            } else {
                setMageSpinnerFireballTimer(gameState.mageSpinnerFireballTimer - deltaTime);
                if (gameState.mageSpinnerFireballTimer <= 0 && gameState.mageSpinnerFireballsSpawned < MAGE_SPINNER_FIREBALL_COUNT) {
                    const targetObstacle = gameState.currentObstacle || gameState.ignitedObstacles[0] || gameState.vanishingObstacles[0];
                    if (targetObstacle) {
                        castMageSpinnerFireball(gameState, targetObstacle); 
                        incrementMageSpinnerFireballsSpawned();
                        setMageSpinnerFireballTimer(MAGE_SPINNER_FIREBALL_INTERVAL_MS); 
                    }
                }
            }
        }
    },
    draw: function(ctx, gameState, playerX, playerY) {
        if (gameState.isMageSpinnerActive) {
            ctx.save();
            ctx.shadowColor = 'orange';
            ctx.shadowBlur = 20;
            ctx.restore();
        }
    },

    reset: function(state) {
        setMageSpinnerActive(false);
        setMageSpinnerFireballTimer(0);
        incrementMageSpinnerFireballsSpawned(0);
    }
};
