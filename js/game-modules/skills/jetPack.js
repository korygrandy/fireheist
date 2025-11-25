import { consumeEnergy, initiateJump, setSkillCooldown, setJumping } from '../state-manager.js';
import { JUMP_DURATIONS } from '../../constants.js';
import { playAnimationSound } from '../../audio.js';
import { createJetPackEffect } from '../drawing/effects.js';

export const jetPackSkill = {
    config: {
        name: 'jetPack',
        energyCost: 40,
        cooldownMs: 5000, // 5 seconds cooldown
    },
    activate(state) {
        const now = Date.now();
        if (state.skillCooldowns[this.config.name] && now < state.skillCooldowns[this.config.name]) {
            console.log(`[DEBUG] Jet Pack blocked: On cooldown. Remaining: ${Math.max(0, state.skillCooldowns[this.config.name] - now).toFixed(0)}ms`);
            return;
        }

        if (!state.gameRunning || state.isPaused) {
            console.log(`[DEBUG] Jet Pack blocked: Game not running or paused. Game Running: ${state.gameRunning}, Paused: ${state.isPaused}`);
            return;
        }

        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) {
            console.log(`[DEBUG] Jet Pack blocked: Not enough energy. Required: ${this.config.energyCost}, Available: ${state.playerEnergy}`);
            playAnimationSound('quack');
            return;
        }

        setSkillCooldown(this.config.name, now + this.config.cooldownMs);

        const skillLevel = state.playerStats.skillLevels.jetPack || 1;

        if (skillLevel === 1) {
            if (state.currentObstacle) {
                createJetPackEffect(state.currentObstacle, skillLevel);
                state.incineratingObstacles.push({ ...state.currentObstacle, animationProgress: 0, startTime: performance.now() });
                state.currentObstacle = null;
                state.playerStats.obstaclesIncinerated++;
            }
        } else if (skillLevel === 2) {
            const obstaclesToIncinerate = [state.currentObstacle, ...state.ignitedObstacles, ...state.vanishingObstacles].filter(Boolean).slice(0, 2);
            obstaclesToIncinerate.forEach(ob => {
                createJetPackEffect(ob, skillLevel);
                state.incineratingObstacles.push({ ...ob, animationProgress: 0, startTime: performance.now() });
                state.playerStats.obstaclesIncinerated++;
            });
            if (obstaclesToIncinerate.includes(state.currentObstacle)) state.currentObstacle = null;
            state.ignitedObstacles = state.ignitedObstacles.filter(ob => !obstaclesToIncinerate.includes(ob));
            state.vanishingObstacles = state.vanishingObstacles.filter(ob => !obstaclesToIncinerate.includes(ob));
        } else if (skillLevel >= 3) {
            const allObstacles = [state.currentObstacle, ...state.ignitedObstacles, ...state.vanishingObstacles].filter(Boolean);
            allObstacles.forEach(ob => {
                createJetPackEffect(ob, skillLevel);
                state.incineratingObstacles.push({ ...ob, animationProgress: 0, startTime: performance.now() });
                state.playerStats.obstaclesIncinerated++;
            });
            state.currentObstacle = null;
            state.ignitedObstacles = [];
            state.vanishingObstacles = [];
        }

        state.jumpState.isJetPack = true;
        state.jumpState.jetPackDuration = 800; // A longer duration for a dramatic effect
        initiateJump(state, 800);
        playAnimationSound('jetPack'); // Play sound for Jet Pack
        console.log("-> startJetPack: Jet Pack initiated.");
    },

    update(state, deltaTime) {
        if (state.jumpState.isJetPack) {
            state.jumpState.jetPackDuration -= deltaTime;
            if (state.jumpState.jetPackDuration <= 0) {
                console.log("[DEBUG] Deactivating Jet Pack.");
                state.jumpState.isJetPack = false;
                resetJumpState();
            }
        }
    },

    draw(ctx, state) {
        // No special drawing for jetPack
    }
};
