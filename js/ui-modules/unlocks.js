import { personaUnlocks } from '../unlocks.js';
import { personas } from '../personas.js';
import state from '../game-modules/state.js';
import { savePlayerStats } from './settings.js';
import { populatePersonaSelector } from './persona.js';
import { populateArmoryItems, displayArmoryUnlockNotification, checkForArmoryUnlocks } from './armory.js';

export function displayUnlockNotification(personaName) {
    const notificationElement = document.getElementById('unlock-notification');
    if (notificationElement) {
        notificationElement.textContent = `🎉 New Persona Unlocked: ${personaName}!`;
        notificationElement.classList.remove('hidden');
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

export function checkSkillUnlockStatus(condition, stats) {
    if (!stats) return false; // No stats means nothing is unlocked

    // If the skill is already in the unlockedArmoryItems array, it's unlocked.
    if (stats.unlockedArmoryItems && stats.unlockedArmoryItems.includes(condition.skillKey)) {
        return true;
    }

    if (!condition || condition.type === 'placeholder') return false; // Placeholder conditions are always locked for now

    switch (condition.type) {
        case 'incinerateCount':
            return stats.obstaclesIncinerated >= condition.count;
        case 'flawlessRun':
            return stats.flawlessRuns && stats.flawlessRuns[condition.difficulty];
        case 'consecutiveGroundPounds':
            return stats.consecutiveGroundPounds >= condition.count;
        // Add other unlock conditions here
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
