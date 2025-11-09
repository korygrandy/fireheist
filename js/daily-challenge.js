import state from './game-modules/state.js';
import { startGame } from './game-modules/lifecycle.js';
import { setTheme } from './theme.js';
import { initializeMusicPlayer } from './audio.js';
import { EMOJI_MUSIC_MAP, DEFAULT_MUSIC_URL } from './constants.js';
import { dataInput, eventDataInput } from './dom-elements.js';
import { loadCustomData } from './ui-modules/data.js';
import { hideSandboxControls } from './ui-modules/ui-helpers.js';

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
    const storedValue = localStorage.getItem(getDailyChallengeKey());
    if (!storedValue) return null;

    try {
        const results = JSON.parse(storedValue);
        // Check if it's a valid results object, not just `true` from the old format
        if (typeof results === 'object' && results !== null && 'days' in results) {
            return results;
        }
        // If not, it's old data. Clear it.
        localStorage.removeItem(getDailyChallengeKey());
        return null;
    } catch (e) {
        // If parsing fails, it's invalid data. Clear it.
        console.warn("-> Daily Challenge: Clearing invalid data from localStorage.", e);
        localStorage.removeItem(getDailyChallengeKey());
        return null;
    }
}

export function markDailyChallengeAsPlayed(stats, winStreak) {
    const results = { ...stats, winStreak };
    localStorage.setItem(getDailyChallengeKey(), JSON.stringify(results));
    console.log("-> Daily Challenge: Marked as played for today with results.");
}


// --- Seeded Random Number Generator ---
// A simple LCG (Linear Congruential Generator) to produce a predictable sequence of numbers.
function createSeededRandom(seed) {
    let state = seed;
    return function() {
        state = (state * 1103515245 + 12345) % 2147483648;
        return state / 2147483648;
    };
}

// --- Theme Packs ---
export const themePacks = {
    space: {
        key: 'outerspace',
        name: '🌑 Outer Space',
        themeEmoji: '🌌',
        playerEmojis: ['🧑‍🚀', '👽', '🚀'],
        obstacleEmojis: ['☄️', '🪐', '🛰️'],
        music: 'fx/alien.mp3'
    },
    forest: {
        key: 'grass', // Using 'grass' as the key for the forest theme
        name: '🌲 Forest',
        themeEmoji: '🌳',
        playerEmojis: ['🧑‍🌾', '🦌', '🐻'],
        obstacleEmojis: ['🌲', '🍄', '🪵'],
        music: 'fx/funk.mp3'
    },
    ocean: {
        key: 'volcano', // Using 'volcano' as a stand-in for an ocean theme
        name: '🌊 Ocean',
        themeEmoji: '🌊',
        playerEmojis: ['🧜', '🐠', '🐙'],
        obstacleEmojis: ['🦀', '⚓', '🐡'],
        music: 'fx/ufo-hover.mp3'
    },
    desert: {
        key: 'desert',
        name: '🏜️ Desert',
        themeEmoji: '🌵',
        playerEmojis: ['🤠', '🐪', '🦂'],
        obstacleEmojis: ['🌵', '🏜️', '🐍'],
        music: 'fx/bomb.mp3'
    }
};

// --- Data Generation Functions ---
function generateMilestones(seededRandom) {
    const milestones = [];
    let currentDate = new Date(2000, 0, 1); // Start date
    let currentValue = 0;

    milestones.push(`${currentDate.toLocaleDateString('en-US')}: ${currentValue}`);

    for (let i = 0; i < 10; i++) { // Generate 10 milestones
        const daysToAdd = Math.floor(seededRandom() * 365 * 3) + 365; // 1 to 3 years
        currentDate.setDate(currentDate.getDate() + daysToAdd);
        currentValue += Math.floor(seededRandom() * 50000) + 10000; // $10,000 to $60,000 increase
        milestones.push(`${currentDate.toLocaleDateString('en-US')}: ${currentValue}`);
    }
    return milestones;
}

function generateEvents(seededRandom) {
    const events = [];
    const eventTypes = ['ACCELERATOR', 'DECELERATOR'];

    for (let i = 0; i < 3; i++) { // Generate 3 events
        const daysSinceStart = Math.floor(seededRandom() * 365 * 10); // Within 10 years
        const eventType = eventTypes[Math.floor(seededRandom() * eventTypes.length)];
        const emoji = eventType === 'ACCELERATOR' ? '📈' : '📉';
        events.push(`${daysSinceStart}: ${emoji} : ${eventType}`);
    }
    return events;
}

// --- Main Data Generation Function ---
export function getDailyChallengeData() {
    // 1. Generate a seed from the current UTC date
    const today = new Date();
    const seed = parseInt(`${today.getUTCFullYear()}${String(today.getUTCMonth() + 1).padStart(2, '0')}${String(today.getUTCDate()).padStart(2, '0')}`);
    const seededRandom = createSeededRandom(seed);

    // 2. Select a theme pack for the day
    const themeKeys = Object.keys(themePacks);
    const dailyThemeKey = themeKeys[Math.floor(seededRandom() * themeKeys.length)];
    const dailyThemePack = themePacks[dailyThemeKey];

    // 3. Select emojis from the chosen theme pack
    const dailyPlayerEmoji = dailyThemePack.playerEmojis[Math.floor(seededRandom() * dailyThemePack.playerEmojis.length)];
    const dailyObstacleEmoji = dailyThemePack.obstacleEmojis[Math.floor(seededRandom() * dailyThemePack.obstacleEmojis.length)];

    // 4. Generate milestones and events
    const milestones = generateMilestones(seededRandom);
    const events = generateEvents(seededRandom);

    return {
        themeKey: dailyThemePack.key,
        themeName: dailyThemePack.name,
        themeEmoji: dailyThemePack.themeEmoji,
        playerEmoji: dailyPlayerEmoji,
        obstacleEmoji: dailyObstacleEmoji,
        music: dailyThemePack.music,
        milestones: milestones,
        events: events
    };
}

import { showCountdown } from './ui-modules/daily-challenge-ui.js';

// ... (other imports)

export function startDailyChallengeGame() {
    console.log("-> Daily Challenge: Starting game.");

    // Disable the reset button immediately
    const stopButton = document.getElementById('stopButton');
    if (stopButton) {
        stopButton.disabled = true;
    }

    const startButton = document.getElementById('startDailyChallengeBtn');
    if (!startButton) return;

    showCountdown(startButton, () => {
        const challengeData = getDailyChallengeData();

        // Update global state with daily challenge parameters
        state.isDailyChallengeActive = true;
        state.selectedTheme = challengeData.themeKey;
        state.stickFigureEmoji = challengeData.playerEmoji;
        state.obstacleEmoji = challengeData.obstacleEmoji;

        // Apply theme and music
        setTheme(challengeData.themeKey);
        initializeMusicPlayer(challengeData.music);

        // Update milestone and event data
        const originalDataInput = dataInput.value;
        const originalEventDataInput = eventDataInput.value;
        dataInput.value = challengeData.milestones.join('\n');
        eventDataInput.value = challengeData.events.join('\n');
        loadCustomData();
        dataInput.value = originalDataInput;
        eventDataInput.value = originalEventDataInput;

        // Hide control panel tabs
        hideSandboxControls();

        // Start the game
        startGame();

        // Disable the reset button AFTER startGame has run
        const stopButton = document.getElementById('stopButton');
        if (stopButton) {
            stopButton.disabled = true;
        }
    });
}

console.log("-> daily-challenge.js loaded");