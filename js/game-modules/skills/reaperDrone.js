import { STICK_FIGURE_FIXED_X, GROUND_Y, STICK_FIGURE_TOTAL_HEIGHT } from '../../constants.js';

let droneImage = null; // To hold the loaded SVG image

export const reaperDroneSkill = {
    activate(state) {
        const droneState = state.reaperDroneState;
        if (droneState.isActive) return;
        
        console.log("Reaper Drone Activated (UI Only)");
        droneState.isActive = true;
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
            
            const droneX = STICK_FIGURE_FIXED_X - 50;
            const droneY = playerHeadY - 120; // Position 50 pixels higher
            const droneWidth = 50; // Half size
            const droneHeight = 50; // Half size

            ctx.drawImage(droneImage, droneX, droneY, droneWidth, droneHeight);
        }
    }
};
