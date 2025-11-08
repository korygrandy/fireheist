import { personaUnlocks } from '../unlocks.js';
import state from '../game-modules/state.js';
import { savePlayerStats } from './settings.js';
import { populatePersonaSelector } from './persona.js';
import { armorySkills, populateArmoryItems } from './armory.js'; // Import armory skills and UI updater

export function debugUnlockAllAchievements() {
    // Unlock all Personas
    for (const key in personaUnlocks) {
        const unlock = personaUnlocks[key];
        switch (unlock.condition.type) {
            case 'flawlessRun':
                if (!state.playerStats.flawlessRuns) state.playerStats.flawlessRuns = {};
                state.playerStats.flawlessRuns[unlock.condition.difficulty] = true;
                break;
            case 'incinerateCount':
                if (state.playerStats.obstaclesIncinerated < unlock.condition.count) {
                    state.playerStats.obstaclesIncinerated = unlock.condition.count;
                }
                break;
        }
    }

    // Unlock all Armory Skills
    if (!state.playerStats.unlockedArmoryItems) {
        state.playerStats.unlockedArmoryItems = [];
    }
    for (const key in armorySkills) {
        if (!state.playerStats.unlockedArmoryItems.includes(key)) {
            state.playerStats.unlockedArmoryItems.push(key);
        }
    }

    savePlayerStats();
    populatePersonaSelector(); // Re-populate to show unlocked personas
    populateArmoryItems(); // Re-populate to show unlocked skills
    alert('All achievements, personas, and skills have been unlocked.');
}
