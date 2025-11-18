import { setDailyChallengeActive, setSelectedTheme, setStickFigureEmoji, setObstacleEmoji, setObstacleFrequency, setSkillLevel } from './game-modules/state-manager.js';
import { startGame } from './game-modules/game-controller.js';
import { setTheme } from './theme.js';
import { getDailyChallengeConfig } from './dailyChallengeService.js';
import { hideSandboxControls } from './ui-modules/ui-helpers.js';
import { showCountdown } from './ui-modules/daily-challenge-ui.js';

const WIN_STREAK_KEY = 'dailyChallengeWinStreak';

export function getDailyChallengeWinStreak() {
    return parseInt(localStorage.getItem(WIN_STREAK_KEY) || '0', 10);
}

export function updateDailyChallengeWinStreak(didWin) {
    let currentStreak = getDailyChallengeWinStreak();
    if (didWin) {
        currentStreak++;
        console.log(`-> Daily Challenge: Win streak incremented to ${currentStreak}.`);
    } else {
        currentStreak = 0;
        console.log("-> Daily Challenge: Win streak reset.");
    }
    localStorage.setItem(WIN_STREAK_KEY, currentStreak);
    return currentStreak; // Return the new streak
}

// --- Daily Challenge Played Status ---
function getDailyChallengeKey() {
    const today = new Date();
    return `dailyChallengePlayed_${today.getUTCFullYear()}${String(today.getUTCMonth() + 1).padStart(2, '0')}${String(today.getUTCDate()).padStart(2, '0')}`;
}

export function getDailyChallengeResults() {
    const key = getDailyChallengeKey();
    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
        return null;
    }

    try {
        const results = JSON.parse(storedValue);
        if (typeof results === 'object' && results !== null && 'days' in results) {
            return results;
        }
        console.warn("-> getDailyChallengeResults: Stored value is invalid, removing.", results);
        localStorage.removeItem(key);
        return null;
    } catch (e) {
        console.error("-> getDailyChallengeResults: Error parsing stored value. Clearing.", e);
        localStorage.removeItem(key);
        return null;
    }
}

export function markDailyChallengeAsPlayed(stats, winStreak) {
    const results = { ...stats, winStreak };
    localStorage.setItem(getDailyChallengeKey(), JSON.stringify(results));
    console.log("-> Daily Challenge: Marked as played for today with results.");
}

export function startDailyChallengeGame() {
    if (getDailyChallengeResults()) {
        console.warn("-> Daily Challenge: Already played today. Cannot start again.");
        return;
    }

    console.log("-> Daily Challenge: Starting game.");

    const stopButton = document.getElementById('stopButton');
    if (stopButton) {
        stopButton.disabled = true;
    }

    const startButton = document.getElementById('startDailyChallengeBtn');
    if (!startButton) return;

    showCountdown(startButton, () => {
        const config = getDailyChallengeConfig();

        // Apply theme FIRST so it's available in the game state for music selection
        setTheme(config.theme);

        // Update global state with daily challenge parameters
        setDailyChallengeActive(true);
        setSelectedTheme(config.theme);
        setStickFigureEmoji(config.playerEmoji);
        setObstacleEmoji(config.obstacleEmoji);
        setObstacleFrequency(config.obstacleFrequency);
        setSkillLevel(config.skillLevel);

        // Hide sandbox controls
        hideSandboxControls();

        // Show the info panel with controls
        const infoPanel = document.getElementById('info-panel');
        if (infoPanel) {
            infoPanel.classList.remove('hidden');
        }

        // Start the game
        startGame();

        if (stopButton) {
            stopButton.disabled = true;
        }
    });
}

console.log("-> daily-challenge.js loaded");