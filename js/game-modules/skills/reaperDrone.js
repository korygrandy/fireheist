import {
    STICK_FIGURE_FIXED_X,
    GROUND_Y,
    STICK_FIGURE_TOTAL_HEIGHT,
    OBSTACLE_EMOJI_Y_OFFSET,
    OBSTACLE_HEIGHT,
    OBSTACLE_WIDTH,
    EASTER_EGG_EMOJI,
    REAPER_DRONE_COOLDOWN_MS,
    REAPER_DRONE_FADE_IN_DURATION_MS,
    REAPER_DRONE_FIRE_DELAY_MS,
    REAPER_DRONE_MISSILE_DURATION_MS,
    REAPER_DRONE_FADE_OUT_DURATION_MS,
    REAPER_DRONE_TARGET_SEARCH_TIMEOUT_MS,
    REAPER_DRONE_MISSILE_RADIUS,
    REAPER_DRONE_SCANNING_PULSE_SPEED
} from '../../constants.js';
import {
    setSkillCooldown,
    addIncineratingObstacle,
    setCurrentObstacle,
    incrementObstaclesIncinerated,
    incrementTotalInGameIncinerations,
    incrementConsecutiveIncinerations
} from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';

let droneImage = null;

/**
 * Find a valid target obstacle for the missile
 * Rules:
 * 1. currentObstacle must exist
 * 2. Must not be an Easter egg
 * 3. Must not already be hit
 */
function findValidTarget(state) {
    // Rule 1: currentObstacle must exist
    if (!state.currentObstacle) {
        return { isValid: false, reason: 'NO_OBSTACLE' };
    }

    // Rule 2: Must not be an Easter egg
    if (state.currentObstacle.isEasterEgg) {
        return { isValid: false, reason: 'EASTER_EGG_ONLY' };
    }

    // Rule 3: Must not already be hit
    if (state.currentObstacle.hasBeenHit) {
        return { isValid: false, reason: 'OBSTACLE_ALREADY_HIT' };
    }

    // ✅ All checks passed
    return { isValid: true, reason: null };
}

/**
 * Fire the missile at the target obstacle
 */
function fireMissile(state, now) {
    const targetObstacle = state.currentObstacle;

    // Calculate missile start position (drone location)
    const currentSegment = state.raceSegments[state.currentSegmentIndex];
    if (!currentSegment) return;

    const playerGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(currentSegment.angleRad);
    const playerHeadY = playerGroundY - STICK_FIGURE_TOTAL_HEIGHT;

    const droneX = STICK_FIGURE_FIXED_X - 100;
    const droneY = playerHeadY - 120;

    // Calculate target position (obstacle center)
    const groundAtObstacleY = GROUND_Y - targetObstacle.x * Math.tan(currentSegment.angleRad);
    const obstacleY = groundAtObstacleY + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT / 2;

    // PREDICT obstacle position at impact
    // Obstacle moves left by OBSTACLE_BASE_VELOCITY_PX_MS * gameSpeedMultiplier per frame
    // We need to calculate where it will be after REAPER_DRONE_MISSILE_DURATION_MS
    const obstacleVelocityPerMs = (0.2 * state.gameSpeedMultiplier); // OBSTACLE_BASE_VELOCITY_PX_MS * gameSpeedMultiplier
    const predictedObstacleX = targetObstacle.x - (obstacleVelocityPerMs * REAPER_DRONE_MISSILE_DURATION_MS);

    // Initialize missile state
    const missileState = state.reaperDroneState.missileState;
    missileState.isActive = true;
    missileState.x = droneX;
    missileState.y = droneY;
    missileState.startX = droneX;
    missileState.startY = droneY;
    missileState.targetObstacleX = predictedObstacleX;  // Use predicted position
    missileState.targetObstacleY = obstacleY;
    missileState.progress = 0;
    missileState.startTime = now;
    missileState.duration = REAPER_DRONE_MISSILE_DURATION_MS;  // SET DURATION!
    missileState.trailParticles = [];

    console.log(`-> Reaper Drone: Firing missile at predicted obstacle x=${predictedObstacleX.toFixed(0)}`);
}

/**
 * Update missile position and check for collision
 */
function updateMissile(state, deltaTime, now) {
    const missileState = state.reaperDroneState.missileState;
    const elapsedMs = now - missileState.startTime;
    const progress = Math.min(1, elapsedMs / missileState.duration);

    // 1. LERP MISSILE POSITION
    missileState.x = lerp(missileState.startX, missileState.targetObstacleX, progress);
    missileState.y = lerp(missileState.startY, missileState.targetObstacleY, progress);

    // 2. ADD TRAIL PARTICLES
    if (Math.random() < 0.3) {
        missileState.trailParticles.push({
            x: missileState.x,
            y: missileState.y,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 30,
            maxLife: 30
        });
    }

    // 3. CHECK COLLISION WITH CURRENT OBSTACLE
    // Use both progress-based and distance-based collision checks for reliability
    if (progress >= 0.8 || hasReachedTarget(missileState, state)) {
        const targetObstacle = state.currentObstacle;

        if (targetObstacle && !targetObstacle.isEasterEgg && !targetObstacle.hasBeenHit) {
            // Incinerate the obstacle
            addIncineratingObstacle({
                ...targetObstacle,
                animationProgress: 0,
                startTime: now,
                animationType: 'incinerate-ash-blow'
            });

            setCurrentObstacle(null);
            playAnimationSound('reaper-drone-collision');

            // Update stats
            if (targetObstacle.emoji !== EASTER_EGG_EMOJI) {
                incrementObstaclesIncinerated();
                incrementTotalInGameIncinerations();
                incrementConsecutiveIncinerations();
            }

            console.log('-> Reaper Drone: Missile hit! Obstacle incinerated!');
        }

        // Deactivate missile
        missileState.isActive = false;
        missileState.trailParticles = [];
    }

    // 4. UPDATE TRAIL PARTICLES
    for (let i = missileState.trailParticles.length - 1; i >= 0; i--) {
        const particle = missileState.trailParticles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;

        if (particle.life <= 0) {
            missileState.trailParticles.splice(i, 1);
        }
    }
}

/**
 * Check if missile has reached target (distance check against current obstacle)
 */
function hasReachedTarget(missileState, state) {
    const targetObstacle = state.currentObstacle;
    if (!targetObstacle) return true; // No obstacle to hit

    // Calculate distance from missile to current obstacle position
    const dx = missileState.x - targetObstacle.x;
    const dy = missileState.y - (GROUND_Y - targetObstacle.x * Math.tan(state.raceSegments[state.currentSegmentIndex].angleRad) + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < 40; // Increased collision radius for better hit detection
}

/**
 * Linear interpolation helper
 */
function lerp(start, end, t) {
    return start + (end - start) * t;
}

export const reaperDroneSkill = {
    config: {
        name: 'reaperDrone',
        cooldownMs: REAPER_DRONE_COOLDOWN_MS
    },

    activate(state) {
        const now = performance.now();

        // CHECK COOLDOWN
        if (state.skillCooldowns[this.config.name] && now < state.skillCooldowns[this.config.name]) {
            console.log(`Reaper Drone is on cooldown. Remaining: ${Math.max(0, state.skillCooldowns[this.config.name] - now).toFixed(0)}ms`);
            return;
        }

        if (!state.gameRunning || state.isPaused) return;

        console.log('Reaper Drone Activated');
        state.reaperDroneState.isActive = true;
        state.reaperDroneState.spawnTime = now;
        state.reaperDroneState.targetSearchStartTime = now;
        state.reaperDroneState.hasFired = false;
        state.reaperDroneState.hasAttemptedFire = false;
        state.reaperDroneState.fadingOut = false;
        state.reaperDroneState.droneOpacity = 1.0;
        state.reaperDroneState.failureReason = null;

        state.reaperDroneState.missileState.isActive = false;
        state.reaperDroneState.missileState.trailParticles = [];

        playAnimationSound('reaperDrone');
        setSkillCooldown(this.config.name, now + this.config.cooldownMs);
    },

    update(state, deltaTime) {
        const droneState = state.reaperDroneState;
        const now = performance.now();

        if (!droneState.isActive) return;

        // ===== PHASE 1: TARGET SEARCH (0-500ms) =====
        if (!droneState.hasFired && !droneState.hasAttemptedFire) {
            const timeSinceActivation = now - droneState.spawnTime;
            const timeSinceSearchStart = now - droneState.targetSearchStartTime;

            // Check for valid target at FIRE_DELAY_MS and every frame after
            const shouldCheckForTarget = timeSinceActivation >= REAPER_DRONE_FIRE_DELAY_MS;

            if (shouldCheckForTarget) {
                const targetResult = findValidTarget(state);

                if (targetResult.isValid) {
                    // ✅ Valid target found → Fire immediately
                    fireMissile(state, now);
                    droneState.hasFired = true;
                    droneState.hasAttemptedFire = true;
                    console.log('-> Reaper Drone: Valid target found. Firing missile.');
                } else if (timeSinceSearchStart >= droneState.targetSearchTimeoutMs) {
                    // ❌ Timeout reached → Graceful failure
                    droneState.hasFired = true;
                    droneState.hasAttemptedFire = true;
                    droneState.failureReason = targetResult.reason;
                    console.log(`-> Reaper Drone: Search timeout. Reason: ${targetResult.reason}`);

                    // Start fading drone (no missile)
                    droneState.fadingOut = true;
                    droneState.missileState.fadeStartTime = now;
                }
                // else: Still within timeout window and no target yet → keep waiting
            }
        }

        // ===== PHASE 2: MISSILE FLIGHT (if fired) =====
        if (droneState.missileState.isActive) {
            updateMissile(state, deltaTime, now);
        }

        // ===== PHASE 3: FADE OUT =====
        if (droneState.missileState.isActive && !droneState.fadingOut) {
            droneState.fadingOut = true;
            droneState.missileState.fadeStartTime = now;
        }

        if (droneState.fadingOut) {
            const fadeDuration = REAPER_DRONE_FADE_OUT_DURATION_MS;
            const fadeElapsed = now - droneState.missileState.fadeStartTime;
            const fadeProgress = Math.min(1, fadeElapsed / fadeDuration);

            droneState.droneOpacity = Math.max(0, 1.0 - fadeProgress);

            if (fadeProgress >= 1.0) {
                droneState.isActive = false;
                droneState.fadingOut = false;
            }
        }

        // ===== PHASE 4: COOLDOWN CLEANUP =====
        if (droneState.isActive && state.skillCooldowns[this.config.name] && now > state.skillCooldowns[this.config.name]) {
            droneState.isActive = false;
        }
    },

    draw(ctx, state) {
        const droneState = state.reaperDroneState;

        if (!droneState.isActive || droneState.droneOpacity <= 0) {
            return;
        }

        if (!droneImage) {
            droneImage = new Image();
            droneImage.src = 'images/reaper-drone.svg';
            droneImage.onload = () => {
                console.log('Reaper Drone SVG loaded.');
            };
            droneImage.onerror = () => {
                console.error('Failed to load Reaper Drone SVG.');
                droneImage = null;
            };
        }

        if (droneImage && droneImage.complete) {
            const currentSegment = state.raceSegments[state.currentSegmentIndex];
            if (!currentSegment) return;

            const playerGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(currentSegment.angleRad);
            const playerHeadY = playerGroundY - STICK_FIGURE_TOTAL_HEIGHT;

            const droneX = STICK_FIGURE_FIXED_X - 100;
            const droneY = playerHeadY - 120;
            const droneWidth = 50;
            const droneHeight = 50;

            // Calculate fade-in opacity
            const elapsedTime = performance.now() - droneState.spawnTime;
            const fadeInOpacity = Math.min(1, elapsedTime / REAPER_DRONE_FADE_IN_DURATION_MS);

            // Combine fade-in and fade-out opacity
            const finalOpacity = fadeInOpacity * droneState.droneOpacity;

            // 1. DRAW DRONE
            ctx.save();
            ctx.globalAlpha = finalOpacity;
            ctx.drawImage(droneImage, droneX, droneY, droneWidth, droneHeight);

            // 2. DRAW SCANNING PULSE if waiting for target
            if (!droneState.hasFired && !droneState.fadingOut && elapsedTime >= REAPER_DRONE_FIRE_DELAY_MS) {
                const scanAlpha = Math.sin(elapsedTime / REAPER_DRONE_SCANNING_PULSE_SPEED) * 0.5 + 0.5;
                ctx.strokeStyle = `rgba(255, 100, 0, ${scanAlpha * finalOpacity})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(droneX + droneWidth / 2, droneY + droneHeight / 2, 60, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.restore();
        }

        // 3. DRAW MISSILE IF ACTIVE
        if (droneState.missileState.isActive) {
            const missileState = droneState.missileState;

            ctx.save();
            ctx.fillStyle = '#FF6600';
            ctx.shadowColor = '#FF9900';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(missileState.x, missileState.y, REAPER_DRONE_MISSILE_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 4. DRAW MISSILE TRAIL PARTICLES
            ctx.save();
            for (const particle of missileState.trailParticles) {
                const alpha = particle.life / particle.maxLife;
                ctx.fillStyle = `rgba(255, 100, 0, ${alpha * 0.6})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }
};
