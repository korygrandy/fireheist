import { gameState, addIncineratingObstacle, setCurrentObstacle, incrementObstaclesIncinerated, incrementConsecutiveIncinerations, resetStreaks, incrementConsecutiveGroundPounds, incrementTotalGroundPoundCollisions, setCurrentAccelerator, setOnScreenCustomEvent } from './state-manager.js';
import {
    GROUND_Y,
    STICK_FIGURE_TOTAL_HEIGHT,
    OBSTACLE_EMOJI_Y_OFFSET,
    OBSTACLE_HEIGHT,
    STICK_FIGURE_FIXED_X,
    OBSTACLE_WIDTH
} from '../constants.js';
import { playAnimationSound } from '../audio.js';
import { savePlayerStats } from '../ui-modules/settings.js';
import { checkForNewUnlocks } from '../ui-modules/unlocks.js';
import { createShatterEffect } from './drawing/effects.js';

export function checkCollision(runnerY, angleRad) {
    if (!gameState.currentObstacle || gameState.currentObstacle.hasBeenHit || gameState.isColliding) return false;

    const obstacleX = gameState.currentObstacle.x;
    const runnerX = STICK_FIGURE_FIXED_X;

    // Special collision logic for Fireball Roll (must run BEFORE invincibility check)
    if (gameState.jumpState.isFireballRolling) {
        const obstacleCenterX = obstacleX + OBSTACLE_WIDTH / 2;
        const collisionWindow = 25; // Increased window for more reliable collision

        // Check if the center of the fireball is within the collision window of the obstacle's center
        if (Math.abs(runnerX - obstacleCenterX) < collisionWindow) {
            addIncineratingObstacle({
                ...gameState.currentObstacle,
                animationProgress: 0,
                startTime: performance.now(),
                animationType: 'incinerate-ash-blow'
            });
            setCurrentObstacle(null);
            playAnimationSound('incinerate');
            incrementObstaclesIncinerated();
            incrementConsecutiveIncinerations();
            resetStreaks();
            console.log("-> FIREBALL ROLL: Obstacle incinerated by centered collision!");
            return false; // No penalty
        }
        return false; // No collision
    }

    if (gameState.isInvincible) return false;

    const groundAtObstacleY = GROUND_Y - obstacleX * Math.tan(angleRad);
    const runnerBottomY = runnerY + STICK_FIGURE_TOTAL_HEIGHT;
    const obstacleTopY = groundAtObstacleY + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    const horizontalDistance = Math.abs(obstacleX - runnerX);
    if (horizontalDistance > gameState.COLLISION_RANGE_X) return false;

    const minClearanceY = obstacleTopY - STICK_FIGURE_TOTAL_HEIGHT + 5;

    const runnerIsJumpingClear = gameState.jumpState.isJumping && (runnerY < minClearanceY);

    if (horizontalDistance < gameState.COLLISION_RANGE_X) {
        // Priority 1: Check for active Firestorm first, as it overrides all other collision types.
        if (gameState.isFirestormActive) {
            addIncineratingObstacle({
                ...gameState.currentObstacle,
                animationProgress: 0,
                startTime: performance.now()
            });
            setCurrentObstacle(null);
            playAnimationSound('incinerate');
            incrementObstaclesIncinerated();
            incrementConsecutiveIncinerations();
            resetStreaks(); // Reset streak
            console.log("-> FIRESTORM V2: Obstacle incinerated by collision!");
            return false; // No penalty
        }

        // Priority 1.5: Check for active Fire Shield.
        if (gameState.isFireShieldActive) {
            addIncineratingObstacle({
                ...gameState.currentObstacle,
                animationProgress: 0,
                startTime: performance.now()
            });
            setCurrentObstacle(null);
            playAnimationSound('incinerate');
            gameState.isFireShieldActive = false; // Shield is consumed on impact
            console.log("-> FIRE SHIELD: Obstacle incinerated!");
            return false; // No penalty
        }

        // Priority 2: Check for destructive jump moves.
        if (gameState.jumpState.isFireSpinner) {
            addIncineratingObstacle({
                ...gameState.currentObstacle,
                animationProgress: 0,
                startTime: performance.now()
            });
            setCurrentObstacle(null);
            playAnimationSound('fireball');
            incrementObstaclesIncinerated();
            incrementConsecutiveIncinerations();
            if (gameState.playerStats.consecutiveGroundPounds > 0) {
                console.log(`[DEBUG] Streak RESET by Fire Spinner. Was: ${gameState.playerStats.consecutiveGroundPounds}`);
                resetStreaks(); // Reset streak
            }
            console.log("-> FIRE SPINNER: Obstacle incinerated!");
            return false; // No penalty
        }
        if (gameState.jumpState.isGroundPound && gameState.jumpState.progress > 0.5) { // Shatter on the way down
            createShatterEffect(gameState.currentObstacle.x, obstacleTopY, gameState.currentObstacle.emoji);
            setCurrentObstacle(null);
            playAnimationSound('shatter');
            incrementObstaclesIncinerated();
            incrementConsecutiveIncinerations();
            
            // Check for unlocks BEFORE incrementing, so we unlock based on the NEXT count
            checkForNewUnlocks(gameState.playerStats); 
            
            incrementConsecutiveGroundPounds(); // Increment consecutive Ground Pounds
            incrementTotalGroundPoundCollisions();
            console.log(`[DEBUG] Streak INCREMENTED to: ${gameState.playerStats.consecutiveGroundPounds}`);
            savePlayerStats(); // Save stats immediately to persist the streak
            return false; // No penalty
        }

        // Priority 3: If no destructive moves are active, check for a standard collision.
        const collisionTolerance = 5;
        if (!runnerIsJumpingClear && (runnerBottomY >= obstacleTopY - collisionTolerance)) {
            if (gameState.playerStats.consecutiveGroundPounds > 0) {
                console.log(`[DEBUG] Streak RESET by standard collision. Was: ${gameState.playerStats.consecutiveGroundPounds}`);
                resetStreaks(); // Reset on standard collision
            }
            resetStreaks(); // Reset incineration streak
            return true; // This is a standard, damaging hit.
        }
    }
    return false;
}

export function checkAcceleratorCollision(runnerY, angleRad) {
    if (!gameState.currentAccelerator || gameState.currentAccelerator.hasBeenCollected || gameState.isAccelerating) return false;

    const accelX = gameState.currentAccelerator.x;
    const runnerX = STICK_FIGURE_FIXED_X;

    const COLLECTION_RANGE_X = gameState.COLLISION_RANGE_X + 10;
    const horizontalDistance = Math.abs(accelX - runnerX);
    if (horizontalDistance > COLLECTION_RANGE_X) return false;

    const groundAtAccelY = GROUND_Y - accelX * Math.tan(angleRad);
    const runnerBottomY = runnerY + STICK_FIGURE_TOTAL_HEIGHT;
    const accelTopY = groundAtAccelY + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    if (horizontalDistance < COLLECTION_RANGE_X) {
        if (runnerBottomY >= accelTopY) {
            setCurrentAccelerator({ ...gameState.currentAccelerator, hasBeenCollected: true });
            return true;
        }
    }
    return false;
}

export function checkProximityEventCollection(runnerY, angleRad) {
    if (!gameState.onScreenCustomEvent || gameState.onScreenCustomEvent.hasBeenCollected) return false;

    const eventX = gameState.onScreenCustomEvent.x;
    const runnerX = STICK_FIGURE_FIXED_X;

    const COLLECTION_RANGE_X = gameState.COLLISION_RANGE_X + 10;
    const horizontalDistance = Math.abs(eventX - runnerX);
    if (horizontalDistance > COLLECTION_RANGE_X) return false;

    const groundAtEventY = GROUND_Y - eventX * Math.tan(angleRad);
    const runnerBottomY = runnerY + STICK_FIGURE_TOTAL_HEIGHT;
    const eventTopY = groundAtEventY + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    if (horizontalDistance < COLLECTION_RANGE_X) {
        if (runnerBottomY >= eventTopY) {
            setOnScreenCustomEvent({ ...gameState.onScreenCustomEvent, hasBeenCollected: true });
            return true;
        }
    }
    return false;
}

export function checkShotgunCollision(particle, obstacle) {
    if (!obstacle || obstacle.hasBeenHit) return false;

    const particleSize = 5; // Assuming particle size is 5x5
    const obstacleX = obstacle.x;
    const obstacleY = GROUND_Y - obstacleX * Math.tan(gameState.raceSegments[gameState.currentSegmentIndex].angleRad) + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    // Simple AABB collision detection
    return particle.x < obstacleX + OBSTACLE_WIDTH &&
           particle.x + particleSize > obstacleX &&
           particle.y < obstacleY + OBSTACLE_HEIGHT &&
           particle.y + particleSize > obstacleY;
}

