import { STICK_FIGURE_FIXED_X, GROUND_Y, STICK_FIGURE_TOTAL_HEIGHT } from '../../constants.js';
import { setSkillCooldown } from '../state-manager.js';

let droneImage = null; // To hold the loaded SVG image
const FADE_IN_DURATION = 200; // Milliseconds for the drone to fade in

export const reaperDroneSkill = {
    config: {
        name: 'reaperDrone',
        cooldownMs: 4000, // 4 seconds in milliseconds
    },
    activate(state) {
        const now = performance.now();

        // 1. CHECK GLOBAL COOLDOWN
        if (state.skillCooldowns[this.config.name] && now < state.skillCooldowns[this.config.name]) {
            console.log(`Reaper Drone is on cooldown. Remaining: ${Math.max(0, state.skillCooldowns[this.config.name] - now).toFixed(0)}ms`);
            return;
        }

        if (!state.gameRunning || state.isPaused) return;
        
        console.log("Reaper Drone Activated (UI Only)");
        state.reaperDroneState.isActive = true;
        state.reaperDroneState.spawnTime = now; // Record activation time

        // 2. SET GLOBAL COOLDOWN
        setSkillCooldown(this.config.name, now + this.config.cooldownMs);
    },

    update(state, deltaTime) {
        const droneState = state.reaperDroneState;
        const now = performance.now();

        // If the skill is on cooldown (meaning it's active in terms of cooldown logic)
        // but its visual/effect duration has passed, deactivate it.
        if (droneState.isActive && state.skillCooldowns[this.config.name] && now > state.skillCooldowns[this.config.name]) {
            droneState.isActive = false;
            console.log("Reaper Drone Deactivated (Cooldown Expired)");
        }

        if (!droneState.isActive) return;
        // No logic yet
    },

    draw(ctx, state) {
        const droneState = state.reaperDroneState;
        if (!droneState.isActive) return;

        if (!droneImage) {
            droneImage = new Image();
            droneImage.src = 'images/reaper-drone.svg';
            droneImage.onload = () => {
                console.log("Reaper Drone SVG loaded.");
            };
            droneImage.onerror = () => {
                console.error("Failed to load Reaper Drone SVG.");
                droneImage = null; // Reset on error
            };
        }

        if (droneImage && droneImage.complete) {
            const currentSegment = state.raceSegments[state.currentSegmentIndex];
            if (!currentSegment) return; // Prevent error when game is over
            const playerGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(currentSegment.angleRad);
            const playerHeadY = playerGroundY - STICK_FIGURE_TOTAL_HEIGHT;
            
            const droneX = STICK_FIGURE_FIXED_X - 100;
            const droneY = playerHeadY - 120;
            const droneWidth = 50;
            const droneHeight = 50;

            // Calculate fade-in opacity
            const elapsedTime = performance.now() - droneState.spawnTime;
            const opacity = Math.min(1, elapsedTime / FADE_IN_DURATION);
            
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.drawImage(droneImage, droneX, droneY, droneWidth, droneHeight);
            ctx.restore();
        }
    }
};
