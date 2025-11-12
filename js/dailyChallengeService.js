// js/dailyChallengeService.js

import { themes } from './theme.js';

/**
 * A simple Mulberry32 pseudo-random number generator.
 * @param {number} seed - The seed for the PRNG.
 * @returns {function(): number} A function that returns a new pseudo-random number each time it's called.
 */
function mulberry32(seed) {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

/**
 * Generates a deterministic daily challenge configuration based on the UTC date.
 * @returns {object} The configuration object for the daily challenge.
 */
export function getDailyChallengeConfig() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1; // months are 0-indexed
    const day = now.getUTCDate();

    // Create a seed from the UTC date (e.g., 20251111)
    const seed = parseInt(`${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}`);
    const random = mulberry32(seed);

    // --- Deterministic Theme Selection (7 themes for 7 days) ---
    const availableThemes = ['grass', 'mountains', 'roadway', 'snow', 'desert', 'volcano', 'outerspace'];
    const dayOfWeek = now.getUTCDay(); // Sunday = 0, Monday = 1, etc.
    const themeName = availableThemes[dayOfWeek];
    const theme = themes[themeName];

    // --- Deterministic Obstacle Emoji ---
    const obstacleEmoji = theme.obstacleEmojis[Math.floor(random() * theme.obstacleEmojis.length)];

    // --- Deterministic Player Emoji ---
    const playerEmojis = ['🧑‍🚀', '🦸‍♀️', '🧟‍♂️', '🧛‍♀️', '👨‍🎤', '👩‍🎨', '👨‍🚒', '👮‍♀️', '🥷', '🧙‍♂️'];
    const playerEmoji = playerEmojis[Math.floor(random() * playerEmojis.length)];

    // --- Deterministic Skill Level ---
    const skillLevels = ['Rookie', 'Novice', 'Pro'];
    const skillLevel = skillLevels[Math.floor(random() * skillLevels.length)];

    // --- Deterministic Obstacle Frequency (between 10% and 40%) ---
    const obstacleFrequency = Math.floor(random() * 31) + 10;

    const config = {
        theme: themeName,
        playerEmoji: playerEmoji,
        obstacleEmoji: obstacleEmoji,
        skillLevel: skillLevel,
        obstacleFrequency: obstacleFrequency,
        date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
    };

    console.log("-> Daily Challenge Config Generated:", config);
    return config;
}
