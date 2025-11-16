// js/game-modules/skills/mageSpinner.js
import { MAGE_SPINNER_ENERGY_COST, MAGE_SPINNER_DURATION_MS, MAGE_SPINNER_COOLDOWN_MS, MAGE_SPINNER_FIREBALL_INTERVAL_MS, MAGE_SPINNER_FIREBALL_COUNT, STICK_FIGURE_TOTAL_HEIGHT } from '../../constants.js';
import { playAnimationSound } from '../../audio.js';
import { consumeEnergy, setMageSpinnerActive, setMageSpinnerEndTime, setMageSpinnerOnCooldown, setMageSpinnerFireballTimer, incrementMageSpinnerFireballsSpawned, setPlayerEnergy } from '../state-manager.js';
import { castMageSpinnerFireball } from '../actions.js';

export const mageSpinnerSkill = {
    activate: function(state) {
        if (!state.gameRunning || state.isPaused || state.isMageSpinnerActive || state.isMageSpinnerOnCooldown) return;

        const now = Date.now();
        if (now - state.mageSpinnerLastActivationTime < MAGE_SPINNER_COOLDOWN_MS) {
            console.log("-> startMageSpinner: Mage Spinner is on cooldown.");
            return;
        }

        if (!consumeEnergy(state, 'mageSpinner', MAGE_SPINNER_ENERGY_COST)) return;

        state.isMageSpinnerActive = true;
        state.mageSpinnerEndTime = now + MAGE_SPINNER_DURATION_MS;
        state.mageSpinnerLastActivationTime = now; // Start cooldown from now
        setMageSpinnerOnCooldown(true); // Cooldown starts immediately
        setMageSpinnerFireballTimer(MAGE_SPINNER_FIREBALL_INTERVAL_MS); // Initialize timer for first fireball
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
                const energyToDrain = MAGE_SPINNER_ENERGY_COST; 
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

        if (gameState.isMageSpinnerOnCooldown) {
            const now = Date.now();
            if (now - gameState.mageSpinnerLastActivationTime > MAGE_SPINNER_COOLDOWN_MS) {
                setMageSpinnerOnCooldown(false);
                console.log("-> Mage Spinner: Cooldown finished. Ready.");
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
    }
};
