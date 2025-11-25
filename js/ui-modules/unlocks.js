import { playAnimationSound } from '../audio.js';
import { personaUnlocks } from '../unlocks.js';
import { personas } from '../personas.js';
import { gameState } from '../game-modules/state-manager.js';
import { savePlayerStats } from './settings.js';
import { populatePersonaSelector } from './persona.js';
import { populateArmoryItems, displayArmoryUnlockNotification, checkForArmoryUnlocks } from './armory.js';
import { getSkillUnlockProgress, checkSkillUnlockStatus } from '../unlocks.js';

export function displayUnlockNotification(personaName) {
    const notificationElement = document.getElementById('unlock-notification');
    if (notificationElement) {
        notificationElement.textContent = `🎉 New Persona Unlocked: ${personaName}!`;
        notificationElement.classList.remove('hidden');
        playAnimationSound('skill-achieved');
        setTimeout(() => {
            notificationElement.classList.add('hidden');
        }, 5000); // Hide after 5 seconds
    }
}

export function isPersonaUnlocked(personaKey, stats) {
    const unlock = personaUnlocks[personaKey];
    if (!unlock) {
        return true; // No unlock condition means it's available by default
    }

    if (!stats) {
        return false; // If stats aren't loaded, assume locked
    }

    switch (unlock.condition.type) {
        case 'flawlessRun':
            return stats.flawlessRuns && stats.flawlessRuns[unlock.condition.difficulty];
        case 'incinerateCount':
            return stats.obstaclesIncinerated >= unlock.condition.count;
        default:
            return false;
    }
}

export function checkForNewUnlocks(stats) {
    if (!stats.notifiedUnlocks) {
        stats.notifiedUnlocks = [];
    }

    for (const key in personaUnlocks) {
        if (isPersonaUnlocked(key, stats) && !stats.notifiedUnlocks.includes(key)) {
            const personaName = personas[key]?.name || key;
            displayUnlockNotification(personaName);
            stats.notifiedUnlocks.push(key);
            populatePersonaSelector(); // Re-populate to enable the new persona
            savePlayerStats();
        }
    }
    checkForArmoryUnlocks(stats); // Also check for armory unlocks
}