import state from '../game-modules/state.js';
import { populateArmoryItems } from './armory.js';
import { populatePersonaSelector } from './persona.js';
import { themePacks } from '../daily-challenge.js';
import { updateDailyChallengeUI } from './daily-challenge-ui.js';
import { stopGame } from '../game-modules/main.js';
import { personaUnlocks, ARMORY_ITEMS } from '../unlocks.js';
import { savePlayerStats } from './settings.js';

let currentThemeIndex = 0;

export function debugUnlockAllAchievements() {
    console.log("-> DEBUG: Unlocking all achievements...");

    if (!state.playerStats) {
        state.playerStats = {};
    }

    // Satisfy all known unlock conditions
    state.playerStats.obstaclesIncinerated = 9999;
    state.playerStats.consecutiveGroundPounds = 9999;
    state.playerStats.fieryGroundPoundCount = 9999;
    state.playerStats.flawlessRuns = {
        Novice: true,
        Pro: true,
        Veteran: true
    };

    // Directly unlock all armory items by their skillKey
    state.playerStats.unlockedArmoryItems = Object.keys(ARMORY_ITEMS);

    savePlayerStats();

    // Refresh the UI
    populatePersonaSelector();
    populateArmoryItems();

    alert('All personas and armory items have been unlocked!');
    console.log("-> DEBUG: All achievements unlocked.", state.playerStats);
}

export function debugEndGame(didWin) {
    if (!state.gameRunning) {
        alert("Please start the game first.");
        return;
    }
    state.hitsCounter = didWin ? 0 : 1;
    state.isVictory = didWin;
    stopGame(false);
    alert(`Immediately stopping game. Result: ${didWin ? 'WIN' : 'LOSS'}`);
}

export function debugCycleDailyTheme() {
    const themeKeys = Object.keys(themePacks);
    const themeKey = themeKeys[currentThemeIndex];
    const themePack = themePacks[themeKey];

    const mockChallengeData = {
        themeEmoji: themePack.themeEmoji,
        playerEmoji: themePack.playerEmojis[0],
        obstacleEmoji: themePack.obstacleEmojis[0]
    };

    updateDailyChallengeUI(mockChallengeData);
    alert(`Displaying theme: ${themePack.name}`);

    currentThemeIndex = (currentThemeIndex + 1) % themeKeys.length;
}
