``// js/game-modules/skills/hoverPack.js

import {
    initiateJump,
    setPlayerEnergy,
    setJumping
} from '../state-manager.js';
import {
    ENERGY_SETTINGS,
    HOVER_PACK_INITIAL_BOOST_DURATION,
    JETPACK_HOVER_HEIGHT,
    MIN_ENERGY_FOR_JETPACK_SUSTAIN,
    GROUND_Y,
    STICK_FIGURE_TOTAL_HEIGHT
} from '../../constants.js';
import { playAnimationSound } from '../../audio.js';

class HoverPackSkill {
    constructor() {
        this.isActive = false;
        this.drainRate = 0;
    }

    activate(state) {
        if (state.jumpState.isJumping || this.isActive) {
            console.log("[DEBUG] Hover Pack blocked: Already jumping or active.");
            return;
        }

        if (state.playerEnergy < ENERGY_SETTINGS.ENERGY_COSTS.hoverPack) {
            playAnimationSound('quack');
            console.log("[DEBUG] Hover Pack failed: Not enough energy.");
            return;
        }

        setPlayerEnergy(state.playerEnergy - ENERGY_SETTINGS.ENERGY_COSTS.hoverPack);
        initiateJump(state, HOVER_PACK_INITIAL_BOOST_DURATION);
        
        this.isActive = true;
        this.drainRate = ENERGY_SETTINGS.HOVER_PACK_DRAIN_RATES[state.currentSkillLevel] || 0.2;
        
        state.jumpState.isHoverPackActive = true;
        state.jumpState.hoverAltitude = null; // Reset altitude capture
        state.isInvincible = true; // Player is invincible while hovering

        playAnimationSound('jetPack'); // Re-use sound for now
    }

    update(state) {
        if (!this.isActive) return;

        const isInputHeld = state.keysPressed['KeyK'] || state.keysPressed['KeyY'] || (state.gamepad?.buttons[1]?.pressed || false);
        const hasEnoughEnergy = state.playerEnergy > MIN_ENERGY_FOR_JETPACK_SUSTAIN;

        // Termination condition
        if (!isInputHeld || !hasEnoughEnergy) {
            this.deactivate(state);
            return;
        }

        // Sustain logic
        setPlayerEnergy(state.playerEnergy - this.drainRate);
    }

    deactivate(state) {
        if (!this.isActive) return;
        
        this.isActive = false;
        state.jumpState.isHoverPackActive = false;
        state.isInvincible = false;
        setJumping(false); // Allow the player to fall
    }

    spawnParticles(x, y, state) {
        const particleCount = 3; // Spawn 3 embers per frame
        for (let i = 0; i < particleCount; i++) {
            const side = (Math.random() < 0.5 ? -1 : 1);
            state.hoverPackParticles.push({
                x: x + (side * (Math.random() * 5 + 2)), // Eject from left/right of pack
                y: y - 15, // Eject from base of torso
                vx: (Math.random() - 0.5) * 1, // Slight horizontal spread
                vy: Math.random() * 2 + 2,   // Downward velocity
                size: Math.random() * 3 + 2,
                life: Math.random() * 20 + 20, // Lifespan in frames
                color: Math.random() < 0.7 ? 'orange' : 'yellow'
            });
        }
    }
}

export const hoverPackSkill = new HoverPackSkill();
