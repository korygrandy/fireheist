import state from './state.js';
import { OBSTACLE_SPAWN_X, ACCELERATOR_EMOJI, EASTER_EGG_EMOJI, EASTER_EGG_SPAWN_CHANCE_PERCENT } from '../constants.js';

export function spawnObstacle() {
    const isEasterEgg = Math.random() * 100 < EASTER_EGG_SPAWN_CHANCE_PERCENT;
    const newObstacle = {
        x: OBSTACLE_SPAWN_X,
        emoji: isEasterEgg ? EASTER_EGG_EMOJI : state.obstacleEmoji,
        spawnTime: Date.now(),
        hasBeenHit: false,
        isEasterEgg: isEasterEgg,
        opacity: isEasterEgg ? 0.02 : 1.0
    };

    if (state.isFirestormActive) {
        const burnoutDuration = 500 + Math.random() * 1000; // Quicker burnout: 0.5 to 1.5 seconds
        newObstacle.burnoutTime = Date.now() + burnoutDuration;
        newObstacle.speedMultiplier = 1.2; // 20% faster
        state.ignitedObstacles.push(newObstacle);
        console.log("-> spawnObstacle: New obstacle spawned directly into Firestorm.");
    } else {
        state.currentObstacle = newObstacle;
        if (isEasterEgg) {
            console.log("-> spawnObstacle: An EASTER EGG has appeared!");
        } else {
            console.log(`-> spawnObstacle: New obstacle spawned.`);
        }
    }
}

export function spawnEasterEgg() {
    if (state.currentObstacle) {
        console.log("-> spawnEasterEgg: Obstacle already on screen, cannot spawn easter egg.");
        return;
    }
    const newObstacle = {
        x: OBSTACLE_SPAWN_X,
        emoji: EASTER_EGG_EMOJI,
        spawnTime: Date.now(),
        hasBeenHit: false,
        isEasterEgg: true,
        opacity: 0.02
    };
    state.currentObstacle = newObstacle;
    console.log("-> spawnEasterEgg: DEBUG - Easter egg spawned via key press.");
}

export function spawnAccelerator() {
    state.currentAccelerator = {
        x: OBSTACLE_SPAWN_X,
        emoji: ACCELERATOR_EMOJI,
        spawnTime: Date.now(),
        hasBeenCollected: false
    };
    console.log(`-> spawnAccelerator: New accelerator spawned.`);
}

export function spawnProximityEvent(eventData) {
    state.onScreenCustomEvent = {
        ...eventData,
        x: OBSTACLE_SPAWN_X,
        spawnTime: Date.now(),
        hasBeenCollected: false
    };
    const originalEvent = state.activeCustomEvents.find(e => e.daysSinceStart === eventData.daysSinceStart);
    if (originalEvent) {
        originalEvent.wasSpawned = true;
    }
    console.log(`-> spawnProximityEvent: New ${eventData.type} event spawned by proximity.`);
}
