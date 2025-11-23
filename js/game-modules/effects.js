import { gameState, setAccelerating, setAccelerationDuration, setDecelerating, setDecelerationDuration, setGameSpeedMultiplier, setScreenFlash } from './state-manager.js';
import {
    ACCELERATOR_DURATION_MS,
    ACCELERATOR_BASE_SPEED_BOOST,
    DECELERATOR_DURATION_MS,
    DECELERATOR_BASE_SPEED_DEBUFF
} from '../constants.js';
import { playChaChing, playDebuffSound } from '../audio.js';

export function applySpeedEffect(type) {
    if (gameState.isColliding) {
        return;
    }

    if (gameState.isAccelerating) {
        setAccelerating(false);
        setAccelerationDuration(0);
        gameState.activeCustomEvents.forEach(e => {
            if (e.type === 'ACCELERATOR') e.isActive = false;
        });
    }
    if (gameState.isDecelerating) {
        setDecelerating(false);
        setDecelerationDuration(0);
        gameState.activeCustomEvents.forEach(e => {
            if (e.type === 'DECELERATOR') e.isActive = false;
        });
    }

    if (type === 'ACCELERATOR') {
        setAccelerating(true);
        setAccelerationDuration(ACCELERATOR_DURATION_MS);
        setGameSpeedMultiplier(gameState.intendedSpeedMultiplier * ACCELERATOR_BASE_SPEED_BOOST);
        playChaChing();
        setScreenFlash(0.7, 200, performance.now());
        console.info("-> APPLY SPEED: Accelerator (2x) applied!");
    } else if (type === 'DECELERATOR') {
        setDecelerating(true);
        setDecelerationDuration(DECELERATOR_DURATION_MS);
        setGameSpeedMultiplier(gameState.intendedSpeedMultiplier * DECELERATOR_BASE_SPEED_DEBUFF);
        setTimeout(() => playDebuffSound(), 10);
        console.warn("-> APPLY SPEED: Decelerator (0.5x) applied!");
    }
}
