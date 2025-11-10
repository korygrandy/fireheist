import { gameState, setPlayerStats, setHitsCounter, setVictory } from '../game-modules/state-manager.js';
import { populateArmoryItems } from './armory.js';
import { populatePersonaSelector } from './persona.js';
import { themePacks } from '../daily-challenge.js';
import { updateDailyChallengeUI } from './daily-challenge-ui.js';
import { stopGame } from '../game-modules/lifecycle.js';
import { personaUnlocks, ARMORY_ITEMS } from '../unlocks.js';
import { savePlayerStats } from './settings.js';

let currentThemeIndex = 0;

export function debugUnlockAllAchievements() {
    console.log("-> DEBUG: Unlocking all achievements...");

    let playerStats = gameState.playerStats || {};

    // Satisfy all known unlock conditions
    playerStats.obstaclesIncinerated = 9999;
    playerStats.consecutiveGroundPounds = 9999;
    playerStats.fieryGroundPoundCount = 9999;
    playerStats.flawlessRuns = {
        Novice: true,
        Pro: true,
        Veteran: true
    };

    // Directly unlock all armory items by their skillKey
    playerStats.unlockedArmoryItems = Object.keys(ARMORY_ITEMS);

    setPlayerStats(playerStats);
    savePlayerStats();

    // Refresh the UI
    populatePersonaSelector();
    populateArmoryItems();

    alert('All personas and armory items have been unlocked!');
    console.log("-> DEBUG: All achievements unlocked.", gameState.playerStats);
}

export function debugEndGame(didWin) {
    if (!gameState.gameRunning) {
        alert("Please start the game first.");
        return;
    }
    setHitsCounter(didWin ? 0 : 1);
    setVictory(didWin);
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
