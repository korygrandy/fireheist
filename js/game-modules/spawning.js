import state from './state.js';
import { OBSTACLE_SPAWN_X, ACCELERATOR_EMOJI } from '../constants.js';

export function spawnObstacle() {
    const newObstacle = {
        x: OBSTACLE_SPAWN_X,
        emoji: state.obstacleEmoji,
        spawnTime: Date.now(),
        hasBeenHit: false
    };

    if (state.isFirestormActive) {
        const burnoutDuration = 500 + Math.random() * 1000; // Quicker burnout: 0.5 to 1.5 seconds
        newObstacle.burnoutTime = Date.now() + burnoutDuration;
        newObstacle.speedMultiplier = 1.2; // 20% faster
        state.ignitedObstacles.push(newObstacle);
        console.log("-> spawnObstacle: New obstacle spawned directly into Firestorm.");
    } else {
        state.currentObstacle = newObstacle;
        console.log(`-> spawnObstacle: New obstacle spawned.`);
    }
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
