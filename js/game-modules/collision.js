import state from './state.js';
import {
    GROUND_Y,
    STICK_FIGURE_TOTAL_HEIGHT,
    OBSTACLE_EMOJI_Y_OFFSET,
    OBSTACLE_HEIGHT,
    STICK_FIGURE_FIXED_X,
    OBSTACLE_WIDTH
} from '../constants.js';
import * as drawing from './drawing.js';
import { playAnimationSound } from '../audio.js';
import { savePlayerStats } from '../ui-modules/settings.js';
import { checkForNewUnlocks } from '../ui-modules/unlocks.js';

export function checkCollision(runnerY, angleRad) {
    if (!state.currentObstacle || state.currentObstacle.hasBeenHit || state.isColliding) return false;

    const obstacleX = state.currentObstacle.x;
    const runnerX = STICK_FIGURE_FIXED_X;

    const groundAtObstacleY = GROUND_Y - obstacleX * Math.tan(angleRad);
    const runnerBottomY = runnerY + STICK_FIGURE_TOTAL_HEIGHT;
    const obstacleTopY = groundAtObstacleY + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    const horizontalDistance = Math.abs(obstacleX - runnerX);
    if (horizontalDistance > state.COLLISION_RANGE_X) return false;

    const minClearanceY = obstacleTopY - STICK_FIGURE_TOTAL_HEIGHT + 5;

    const runnerIsJumpingClear = state.jumpState.isJumping && (runnerY < minClearanceY);

    if (horizontalDistance < state.COLLISION_RANGE_X) {
        // Priority 1: Check for active Firestorm first, as it overrides all other collision types.
        if (state.isFirestormActive) {
            state.incineratingObstacles.push({
                ...state.currentObstacle,
                animationProgress: 0,
                startTime: performance.now()
            });
            state.currentObstacle = null;
            playAnimationSound('incinerate');
            state.playerStats.obstaclesIncinerated++;
            state.playerStats.consecutiveIncinerations++;
            state.playerStats.consecutiveGroundPounds = 0; // Reset streak
            console.log("-> FIRESTORM V2: Obstacle incinerated by collision!");
            return false; // No penalty
        }

        // Priority 2: Check for destructive jump moves.
        if (state.jumpState.isFireSpinner) {
            state.incineratingObstacles.push({
                ...state.currentObstacle,
                animationProgress: 0,
                startTime: performance.now()
            });
            state.currentObstacle = null;
            playAnimationSound('fireball');
            state.playerStats.obstaclesIncinerated++;
            state.playerStats.consecutiveIncinerations++;
            if (state.playerStats.consecutiveGroundPounds > 0) {
                console.log(`[DEBUG] Streak RESET by Fire Spinner. Was: ${state.playerStats.consecutiveGroundPounds}`);
                state.playerStats.consecutiveGroundPounds = 0; // Reset streak
            }
            console.log("-> FIRE SPINNER: Obstacle incinerated!");
            return false; // No penalty
        }
        if (state.jumpState.isGroundPound && state.jumpState.progress > 0.5) { // Shatter on the way down
            drawing.createShatterEffect(state.currentObstacle.x, obstacleTopY, state.currentObstacle.emoji);
            state.currentObstacle = null;
            playAnimationSound('shatter');
            state.playerStats.obstaclesIncinerated++;
            state.playerStats.consecutiveIncinerations++;
            
            // Check for unlocks BEFORE incrementing, so we unlock based on the NEXT count
            checkForNewUnlocks(state.playerStats); 
            
            state.playerStats.consecutiveGroundPounds++; // Increment consecutive Ground Pounds
            state.playerStats.totalGroundPoundCollisions++;
            console.log(`[DEBUG] Streak INCREMENTED to: ${state.playerStats.consecutiveGroundPounds}`);
            savePlayerStats(); // Save stats immediately to persist the streak
            return false; // No penalty
        }

        // Priority 3: If no destructive moves are active, check for a standard collision.
        const collisionTolerance = 5;
        if (!runnerIsJumpingClear && (runnerBottomY >= obstacleTopY - collisionTolerance)) {
            if (state.playerStats.consecutiveGroundPounds > 0) {
                console.log(`[DEBUG] Streak RESET by standard collision. Was: ${state.playerStats.consecutiveGroundPounds}`);
                state.playerStats.consecutiveGroundPounds = 0; // Reset on standard collision
            }
            state.playerStats.consecutiveIncinerations = 0; // Reset incineration streak
            return true; // This is a standard, damaging hit.
        }
    }
    return false;
}

export function checkAcceleratorCollision(runnerY, angleRad) {
    if (!state.currentAccelerator || state.currentAccelerator.hasBeenCollected || state.isAccelerating) return false;

    const accelX = state.currentAccelerator.x;
    const runnerX = STICK_FIGURE_FIXED_X;

    const COLLECTION_RANGE_X = state.COLLISION_RANGE_X + 10;
    const horizontalDistance = Math.abs(accelX - runnerX);
    if (horizontalDistance > COLLECTION_RANGE_X) return false;

    const groundAtAccelY = GROUND_Y - accelX * Math.tan(angleRad);
    const runnerBottomY = runnerY + STICK_FIGURE_TOTAL_HEIGHT;
    const accelTopY = groundAtAccelY + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    if (horizontalDistance < COLLECTION_RANGE_X) {
        if (runnerBottomY >= accelTopY) {
            state.currentAccelerator.hasBeenCollected = true;
            return true;
        }
    }
    return false;
}

export function checkProximityEventCollection(runnerY, angleRad) {
    if (!state.onScreenCustomEvent || state.onScreenCustomEvent.hasBeenCollected) return false;

    const eventX = state.onScreenCustomEvent.x;
    const runnerX = STICK_FIGURE_FIXED_X;

    const COLLECTION_RANGE_X = state.COLLISION_RANGE_X + 10;
    const horizontalDistance = Math.abs(eventX - runnerX);
    if (horizontalDistance > COLLECTION_RANGE_X) return false;

    const groundAtEventY = GROUND_Y - eventX * Math.tan(angleRad);
    const runnerBottomY = runnerY + STICK_FIGURE_TOTAL_HEIGHT;
    const eventTopY = groundAtEventY + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    if (horizontalDistance < COLLECTION_RANGE_X) {
        if (runnerBottomY >= eventTopY) {
            state.onScreenCustomEvent.hasBeenCollected = true;
            return true;
        }
    }
    return false;
}
