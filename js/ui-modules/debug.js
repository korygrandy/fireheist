import { personaUnlocks } from '../unlocks.js';
import state from '../game-modules/state.js';
import { savePlayerStats } from './settings.js';
import { populatePersonaSelector } from './persona.js';
import { populateArmoryItems } from './armory.js';
import { checkForNewUnlocks } from './unlocks.js';

export function debugUnlockAllPersonas() {
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
    savePlayerStats();
    populatePersonaSelector(); // Re-populate to show unlocked personas
    alert('All personas have been unlocked.');
}
