import { gameState, addIncineratingObstacle, setCurrentObstacle, incrementObstaclesIncinerated, incrementConsecutiveIncinerations, incrementTotalInGameIncinerations, resetStreaks, resetGroundPoundStreak, incrementConsecutiveGroundPounds, incrementTotalGroundPoundCollisions, setCurrentAccelerator, setOnScreenCustomEvent } from './state-manager.js';
import {
    GROUND_Y,
    STICK_FIGURE_TOTAL_HEIGHT,
    OBSTACLE_EMOJI_Y_OFFSET,
    OBSTACLE_HEIGHT,
    STICK_FIGURE_FIXED_X,
    OBSTACLE_WIDTH,
    EASTER_EGG_EMOJI
} from '../constants.js';
import { playAnimationSound } from '../audio.js';
import { savePlayerStats } from '../ui-modules/settings.js';
import { checkForNewUnlocks } from '../ui-modules/unlocks.js';
import { createShatterEffect, createChristmasCollisionBurst } from './drawing/effects.js';
import { currentTheme } from '../theme.js';
import { init as initMiniGame } from './mini-games/blowThatDough.js';
import { init as initPredictionAddiction } from './mini-games/predictionAddiction.js';

export function checkCollision(runnerY, angleRad) {
    if (gameState.tarzanState.isAttached) return false; // Player is immune while swinging
    if (!gameState.currentObstacle || gameState.currentObstacle.hasBeenHit || gameState.isColliding) return false;

    const obstacleX = gameState.currentObstacle.x;
    const runnerX = STICK_FIGURE_FIXED_X;

    // Special collision logic for Fireball Roll (must run BEFORE invincibility check)
    if (gameState.jumpState.isFireballRolling) {
        const obstacleCenterX = obstacleX + OBSTACLE_WIDTH / 2;
        const collisionWindow = 25; // Increased window for more reliable collision

        // Check if the center of the fireball is within the collision window of the obstacle's center
        if (Math.abs(runnerX - obstacleCenterX) < collisionWindow) {
            const obstacleToIncinerate = gameState.currentObstacle;
            addIncineratingObstacle({
                ...obstacleToIncinerate,
                animationProgress: 0,
                startTime: performance.now(),
                animationType: 'incinerate-ash-blow'
            });
            setCurrentObstacle(null);
            playAnimationSound('incinerate');
            if (obstacleToIncinerate.emoji !== EASTER_EGG_EMOJI) {
                incrementObstaclesIncinerated();
                incrementTotalInGameIncinerations();
                incrementConsecutiveIncinerations();
            }
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

    // Check for Easter Egg collision first, as it has unique activation requirements
    if (gameState.currentObstacle.isEasterEgg) {
        const collisionTolerance = 5;
        // Check for physical collision with the easter egg
        if (!runnerIsJumpingClear && (runnerBottomY >= obstacleTopY - collisionTolerance)) {
            if (gameState.jumpState.isGroundPound) {
                // Successful activation with Ground Pound
                setCurrentObstacle(null); // Remove the egg
                const miniGameTypes = ['blowThatDough', 'predictionAddiction'];
                const selectedMiniGameType = miniGameTypes[Math.floor(Math.random() * miniGameTypes.length)];
                gameState.miniGameType = selectedMiniGameType; // Set the type in global state

                if (selectedMiniGameType === 'blowThatDough') {
                    initMiniGame();
                } else if (selectedMiniGameType === 'predictionAddiction') {
                    initPredictionAddiction();
                }
                return false; // Mini-game activated, no further collision processing
            } else {
                // Easter egg hit, but not with a Ground Pound, so pass through
                return false;
            }
        } else {
            // No physical collision with easter egg, so pass through
            return false;
        }
    }

    // If we reach here, it's not an easter egg, or it's an easter egg that was passed through.
    // Now proceed with standard collision checks for regular obstacles.

    if (horizontalDistance < gameState.COLLISION_RANGE_X) {
        // Priority 1: Check for active Firestorm first, as it overrides all other collision types.
        if (gameState.isFirestormActive) {
            const obstacleToIncinerate = gameState.currentObstacle;
            addIncineratingObstacle({
                ...obstacleToIncinerate,
                animationProgress: 0,
                startTime: performance.now()
            });
            setCurrentObstacle(null);
            playAnimationSound('incinerate');
            if (obstacleToIncinerate.emoji !== EASTER_EGG_EMOJI) {
                incrementObstaclesIncinerated();
                incrementTotalInGameIncinerations();
                incrementConsecutiveIncinerations();
            }
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
            const obstacleToIncinerate = gameState.currentObstacle;
            addIncineratingObstacle({
                ...obstacleToIncinerate,
                animationProgress: 0,
                startTime: performance.now()
            });
            setCurrentObstacle(null);
            playAnimationSound('fireball');
            if (obstacleToIncinerate.emoji !== EASTER_EGG_EMOJI) {
                incrementObstaclesIncinerated();
                incrementTotalInGameIncinerations();
                incrementConsecutiveIncinerations();
            }
            if (gameState.playerStats.consecutiveGroundPounds > 0) {
                console.log(`[DEBUG] Streak RESET by Fire Spinner. Was: ${gameState.playerStats.consecutiveGroundPounds}`);
                resetGroundPoundStreak(); // Reset streak
            }
            console.log("-> FIRE SPINNER: Obstacle incinerated!");
            return false; // No penalty
        }
        if (gameState.jumpState.isGroundPound && gameState.jumpState.progress > 0.5) { // Shatter on the way down
            const obstacleToIncinerate = gameState.currentObstacle;
            createShatterEffect(obstacleToIncinerate.x, obstacleTopY, obstacleToIncinerate.emoji);
            setCurrentObstacle(null);
            playAnimationSound('shatter');
            if (obstacleToIncinerate.emoji !== EASTER_EGG_EMOJI) {
                incrementObstaclesIncinerated();
                incrementTotalInGameIncinerations();
                incrementConsecutiveIncinerations();
            }
            
            // Check for unlocks BEFORE incrementing, so we unlock based on the NEXT count
            checkForNewUnlocks(gameState.playerStats); 
            
            incrementConsecutiveGroundPounds(); // Increment consecutive Ground Pounds
            incrementTotalGroundPoundCollisions();
            console.log(`[DEBUG] Streak INCREMENTED to: ${gameState.playerStats.consecutiveGroundPounds}`);
            savePlayerStats(); // Save stats immediately to persist the streak
            return false; // No penalty
        }

        // Shockwave: Shatter obstacle on impact (similar to Ground Pound but doesn't count toward GP streak)
        if (gameState.jumpState.isShockwave && gameState.jumpState.progress > 0.5) {
            const obstacleToShatter = gameState.currentObstacle;
            createShatterEffect(obstacleToShatter.x, obstacleTopY, obstacleToShatter.emoji);
            setCurrentObstacle(null);
            playAnimationSound('shatter');
            if (obstacleToShatter.emoji !== EASTER_EGG_EMOJI) {
                incrementObstaclesIncinerated();
                incrementTotalInGameIncinerations();
                incrementConsecutiveIncinerations();
            }
            // Note: Shockwave does NOT increment Ground Pound streak - it's a separate skill
            // The pushback effect is handled in shockwave.js update() function
            console.log("-> SHOCKWAVE: Obstacle shattered!");
            return false; // No penalty
        }

        // Priority 3: If no destructive moves are active, check for a standard collision.
        const collisionTolerance = 5;
        if (!runnerIsJumpingClear && (runnerBottomY >= obstacleTopY - collisionTolerance)) {
            if (gameState.playerStats.consecutiveGroundPounds > 0) {
                console.log(`[DEBUG] Streak RESET by standard collision. Was: ${gameState.playerStats.consecutiveGroundPounds}`);
                resetGroundPoundStreak(); // Reset on standard collision
            }
            resetStreaks(); // Reset incineration streak
            
            // Create theme-specific collision effects
            if (gameState.selectedTheme === 'christmas') {
                createChristmasCollisionBurst(gameState.currentObstacle.x, obstacleTopY);
            }
            
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

    const particleSize = 5; // Assuming particle size is 5x5 for collision
    const obstacleX = obstacle.x;
    const groundAngle = gameState.raceSegments[gameState.currentSegmentIndex].angleRad;
    const obstacleY = GROUND_Y - obstacleX * Math.tan(groundAngle) + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    // Use a standard AABB collision check without the flawed Y-adjustment.
    // The particle's coordinates are already in the correct frame of reference.
    const collision = particle.x < obstacleX + OBSTACLE_WIDTH &&
           particle.x + particleSize > obstacleX &&
           particle.y < obstacleY + OBSTACLE_HEIGHT &&
           particle.y + particleSize > obstacleY;

    return collision;
}

export function checkMolotovCollision(cocktail, obstacle) {
    if (!obstacle || obstacle.hasBeenHit) return false;

    const cocktailSize = 8; // Radius of the cocktail
    const obstacleX = obstacle.x;
    const obstacleY = GROUND_Y - obstacleX * Math.tan(gameState.raceSegments[gameState.currentSegmentIndex].angleRad) + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    // Simple AABB collision detection
    return cocktail.x < obstacleX + OBSTACLE_WIDTH &&
           cocktail.x + cocktailSize > obstacleX &&
           cocktail.y < obstacleY + OBSTACLE_HEIGHT &&
           cocktail.y + cocktailSize > obstacleY;
}

export function checkSixShooterBulletCollision(bullet, obstacle) {
    if (!obstacle || obstacle.hasBeenHit) return false;

    const bulletWidth = bullet.width;
    const bulletHeight = bullet.height;
    const obstacleX = obstacle.x;
    const groundAngle = gameState.raceSegments[gameState.currentSegmentIndex].angleRad;
    const obstacleY = GROUND_Y - obstacleX * Math.tan(groundAngle) + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    // Simple AABB collision detection
    const collision = bullet.x < obstacleX + OBSTACLE_WIDTH &&
           bullet.x + bulletWidth > obstacleX &&
           bullet.y < obstacleY + OBSTACLE_HEIGHT &&
           bullet.y + bulletHeight > obstacleY;

    return collision;
}

export function checkGiftBombCollision(bomb, obstacle) {
    if (!obstacle || obstacle.hasBeenHit) return false;

    const bombSize = 16;
    const obstacleX = obstacle.x;
    const groundAngle = gameState.raceSegments[gameState.currentSegmentIndex].angleRad;
    const obstacleY = GROUND_Y - obstacleX * Math.tan(groundAngle) + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    // AABB collision detection between gift bomb and obstacle
    const collision = bomb.x - bombSize / 2 < obstacleX + OBSTACLE_WIDTH &&
           bomb.x + bombSize / 2 > obstacleX &&
           bomb.y - bombSize / 2 < obstacleY + OBSTACLE_HEIGHT &&
           bomb.y + bombSize / 2 > obstacleY;

    return collision;
}
