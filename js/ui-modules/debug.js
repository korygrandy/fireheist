import state from '../game-modules/state.js';
import { populateArmoryItems } from './armory.js';
import { populatePersonaSelector } from './persona.js';
import { themePacks } from '../daily-challenge.js';
import { updateDailyChallengeUI } from './daily-challenge-ui.js';
import { stopGame } from '../game-modules/main.js';

let currentThemeIndex = 0;

export function debugUnlockAllAchievements() {
    // ... (rest of the function)
}

export function debugEndGame(didWin) {
    if (!state.gameRunning) {
        alert("Please start the game first.");
        return;
    }
    state.hitsCounter = didWin ? 0 : 1; // Set hits to reflect win/loss
    state.isVictory = didWin; // Set victory state directly
    stopGame(false); // Stop the game, do not reset immediately, let results display
    alert(`Immediately stopping game. Result: ${didWin ? 'WIN' : 'LOSS'}`);
}

export function debugCycleDailyTheme() {
    const themeKeys = Object.keys(themePacks);
    const themeKey = themeKeys[currentThemeIndex];
    const themePack = themePacks[themeKey];

    // Construct a mock challengeData object
    const mockChallengeData = {
        themeEmoji: themePack.themeEmoji,
        playerEmoji: themePack.playerEmojis[0], // Just use the first emoji for simplicity
        obstacleEmoji: themePack.obstacleEmojis[0] // Just use the first emoji
    };

    updateDailyChallengeUI(mockChallengeData);
    alert(`Displaying theme: ${themePack.name}`);

    currentThemeIndex = (currentThemeIndex + 1) % themeKeys.length; // Cycle through themes
}
