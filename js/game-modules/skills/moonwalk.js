import { JUMP_DURATIONS } from '../../constants.js';
import { consumeEnergy, initiateJump } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';

export const moonwalkSkill = {
    config: {
        name: 'moonwalk',
        energyCost: 10,
    },
    activate: function(state) {
        if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
        if (!consumeEnergy(state, this.config.name, this.config.energyCost)) return;

        const skillLevel = state.playerStats.skillLevels.moonwalk || 1;

        if (skillLevel >= 2) {
            state.playerEnergy = Math.min(state.maxPlayerEnergy, state.playerEnergy + 10);
        }
        if (skillLevel >= 3) {
            state.isInvincible = true;
            state.invincibilityEndTime = Date.now() + 200; // 200ms of invincibility
        }

        state.jumpState.isMoonwalking = true;
        state.jumpState.moonwalkDuration = JUMP_DURATIONS.moonwalk;
        initiateJump(state, JUMP_DURATIONS.moonwalk);
        playAnimationSound('moonwalk'); // Play sound for Moonwalk
        console.log("-> startMoonwalk: Moonwalk initiated.");
    },

    update: function(state, deltaTime) {
        if (state.jumpState.isMoonwalking) {
            state.jumpState.moonwalkDuration -= deltaTime;
            if (state.jumpState.moonwalkDuration <= 0) {
                state.jumpState.isMoonwalking = false;
            }
        }
    },

    draw: function(ctx, state) {
        // No special drawing for moonwalk
    }
};
