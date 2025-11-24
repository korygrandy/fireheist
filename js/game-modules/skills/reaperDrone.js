import { STICK_FIGURE_FIXED_X, GROUND_Y, STICK_FIGURE_TOTAL_HEIGHT } from '../../constants.js';

let droneImage = null; // To hold the loaded SVG image
const FADE_IN_DURATION = 200; // Milliseconds for the drone to fade in
const COOLDOWN = 4000; // 4 seconds in milliseconds

export const reaperDroneSkill = {
    activate(state) {
        const droneState = state.reaperDroneState;
        const now = performance.now();

        if (droneState.isActive || now < droneState.cooldownEndTime) {
            console.log(`Reaper Drone activation failed. Active: ${droneState.isActive}, Cooldown remaining: ${Math.max(0, droneState.cooldownEndTime - now).toFixed(0)}ms`);
            return;
        }
        
        console.log("Reaper Drone Activated (UI Only)");
        droneState.isActive = true;
        droneState.spawnTime = now; // Record activation time
        droneState.cooldownEndTime = now + COOLDOWN;
    },

    update(state, deltaTime) {
        const droneState = state.reaperDroneState;
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
