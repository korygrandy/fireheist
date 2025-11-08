// =================================================================
// DAILY CHALLENGE - DATA GENERATION
// =================================================================

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
const themePacks = {
    space: {
        theme: '🌑 Outer Space',
        themeEmoji: '🌌',
        playerEmojis: ['🧑‍🚀', '👽', '🚀'],
        obstacleEmojis: ['☄️', '🪐', '🛰️']
    },
    forest: {
        theme: '🌲 Forest',
        themeEmoji: '🌳',
        playerEmojis: ['🧑‍🌾', '🦌', '🐻'],
        obstacleEmojis: ['🌲', '🍄', '🪵']
    },
    ocean: {
        theme: '🌊 Ocean',
        themeEmoji: '🌊',
        playerEmojis: ['🧜', '🐠', '🐙'],
        obstacleEmojis: ['🦀', '⚓', '🐡']
    },
    desert: {
        theme: '🏜️ Desert',
        themeEmoji: '🌵',
        playerEmojis: ['🤠', '🐪', '🦂'],
        obstacleEmojis: ['🌵', '🏜️', '🐍']
    }
};

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

    // TODO: Generate milestones and events

    return {
        theme: dailyThemePack.theme,
        themeEmoji: dailyThemePack.themeEmoji,
        playerEmoji: dailyPlayerEmoji,
        obstacleEmoji: dailyObstacleEmoji,
        milestones: [], // Placeholder
        events: [] // Placeholder
    };
}

console.log("-> daily-challenge.js loaded");