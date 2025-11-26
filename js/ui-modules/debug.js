import { gameState, setPlayerStats, setHitsCounter, setVictory } from '../game-modules/state-manager.js';
import { populateArmoryItems } from './armory.js';
import { populatePersonaSelector } from './persona.js';
import { themes } from '../theme.js';
import { displayDailyChallenge } from './daily-challenge-ui.js';
import { stopGame } from '../game-modules/game-controller.js';
import { personaUnlocks, ARMORY_ITEMS } from '../unlocks.js';
import { savePlayerStats } from './settings.js';
import { checkForNewUnlocks } from './unlocks.js';

let currentThemeIndex = 0;

export { ARMORY_ITEMS };

export function debugUnlockSkill(skillKey) {
    if (!skillKey) return;

    let playerStats = gameState.playerStats || {};
    if (!playerStats.unlockedArmoryItems) {
        playerStats.unlockedArmoryItems = [];
    }

    if (!playerStats.unlockedArmoryItems.includes(skillKey)) {
        playerStats.unlockedArmoryItems.push(skillKey);
    }

    setPlayerStats(playerStats);
    savePlayerStats();

    populateArmoryItems();

    alert(`'${skillKey}' has been unlocked!`);
}

export function debugSetCash(amount) {
    let playerStats = gameState.playerStats || {};
    playerStats.totalAccumulatedCash = amount;

    setPlayerStats(playerStats);
    savePlayerStats();

    populateArmoryItems(); // Refresh armory to reflect new cash amount

    alert(`Player cash set to $${amount.toLocaleString()}.`);
}


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

    // Grant max cash for upgrades
    playerStats.totalAccumulatedCash = 1000000000;

    setPlayerStats(playerStats);
    savePlayerStats();

    // Refresh the UI
    populatePersonaSelector();
    populateArmoryItems();

    // Trigger notifications
    checkForNewUnlocks(playerStats);

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

export function debugResetNewIndicator() {
    let playerStats = gameState.playerStats || {};
    playerStats.hasSeenNewArmoryIndicator = false;
    setPlayerStats(playerStats);
    savePlayerStats();
    alert("'NEW' indicator has been reset. It will now show on the next unlock.");
}

export function debugCycleDailyTheme() {
    const themeKeys = Object.keys(themes);
    const themeKey = themeKeys[currentThemeIndex];
    const theme = themes[themeKey];

    // Note: This now re-renders the entire component, which is the intended behavior
    // with the new architecture. We can't just update parts of it anymore.
    displayDailyChallenge();
    alert(`Cycling to next theme. The displayed theme is now based on the current date.`);

    currentThemeIndex = (currentThemeIndex + 1) % themeKeys.length;
}
