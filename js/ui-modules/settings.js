
import {
    disableSaveSettings,
    dataInput,
    eventDataInput,
    emojiInput,
    obstacleEmojiInput,
    frequencyValueSpan,
    themeSelector,
    personaSelector
} from '../dom-elements.js';
import { defaultDataString, defaultEventDataString } from '../constants.js';
import { setTheme } from '../theme.js';
import { applyPersona } from './persona.js'; // This will be created later
import state, { PLAYER_STATS_KEY } from '../game-modules/state.js';

const LOCAL_STORAGE_KEY = 'fireHeistSettings';

export function saveSettings() {
    if (disableSaveSettings.checked) {
        return; // Don't save if the checkbox is checked
    }
    const settings = {
        stickFigureEmoji: state.stickFigureEmoji,
        obstacleEmoji: state.obstacleEmoji,
        obstacleFrequencyPercent: state.obstacleFrequencyPercent,
        currentSkillLevel:
        state.currentSkillLevel,
        intendedSpeedMultiplier: state.intendedSpeedMultiplier,
        enableRandomPowerUps: state.enableRandomPowerUps,
        isAutoHurdleEnabled: state.isAutoHurdleEnabled,
        selectedTheme: state.selectedTheme,
        selectedPersona: state.selectedPersona,
        milestoneData: dataInput.value,
        eventData: eventDataInput.value
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    console.log("-> saveSettings: Settings saved to localStorage.");
}

export function loadSettings() {
    const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSettings && !disableSaveSettings.checked) {
        const settings = JSON.parse(savedSettings);
        state.stickFigureEmoji = settings.stickFigureEmoji || '🦹‍♂️';
        state.obstacleEmoji = settings.obstacleEmoji || '🐌';
        state.obstacleFrequencyPercent = settings.obstacleFrequencyPercent || 20;
        state.currentSkillLevel = settings.currentSkillLevel || 'Rookie';
        state.intendedSpeedMultiplier = parseFloat(settings.intendedSpeedMultiplier) || 1.0;
        state.enableRandomPowerUps = typeof settings.enableRandomPowerUps === 'boolean' ? settings.enableRandomPowerUps : true;
        state.isAutoHurdleEnabled = typeof settings.isAutoHurdleEnabled === 'boolean' ? settings.isAutoHurdleEnabled : false;
        state.selectedTheme = settings.selectedTheme || 'grass';
        state.selectedPersona = settings.selectedPersona || 'custom';

        emojiInput.value = state.stickFigureEmoji;
        obstacleEmojiInput.value = state.obstacleEmoji;
        document.getElementById('obstacleFrequency').value = state.obstacleFrequencyPercent;
        frequencyValueSpan.textContent = `${state.obstacleFrequencyPercent}%`;
        document.getElementById('enablePowerUps').checked = state.enableRandomPowerUps;
        document.getElementById('enableAutoHurdle').checked = state.isAutoHurdleEnabled;
        themeSelector.value = state.selectedTheme;
        setTheme(state.selectedTheme);

        // Set skill level radio button
        const skillRadio = document.querySelector(`input[name="gameSkillLevel"][value="${state.currentSkillLevel}"]`);
        if (skillRadio) skillRadio.checked = true;

        // Set speed radio button
        const speedString = state.intendedSpeedMultiplier.toFixed(1);
        const speedRadio = document.querySelector(`input[name="gameSpeed"][value="${speedString}"]`);
        if (speedRadio) speedRadio.checked = true;

        // Load saved data into text areas, falling back to default if not present
        dataInput.value = settings.milestoneData || defaultDataString.trim();
        eventDataInput.value = settings.eventData || defaultEventDataString.trim();

        applyPersona(state.selectedPersona); // Apply persona settings and UI changes
        personaSelector.value = state.selectedPersona; // Set selector value AFTER applying persona

        console.log("-> loadSettings: Settings loaded from localStorage.");
        return true; // Indicate that settings were loaded
    } else {
        console.log("-> loadSettings: No settings found or saving is disabled. Using defaults.");
        return false; // Indicate that settings were not loaded
    }
}

export function savePlayerStats() {
    if (disableSaveSettings.checked) {
        return;
    }
    // Read the latest from storage first to prevent overwriting with a stale object
    const savedStatsRaw = localStorage.getItem(PLAYER_STATS_KEY);
    const savedStats = savedStatsRaw ? JSON.parse(savedStatsRaw) : {};

    // Merge the current in-memory state onto the saved state
    const mergedStats = { ...savedStats, ...state.playerStats };

    localStorage.setItem(PLAYER_STATS_KEY, JSON.stringify(mergedStats));
    console.log("-> savePlayerStats: Player stats merged and saved to localStorage.");
}

export function loadPlayerStats() {
    if (disableSaveSettings.checked) {
        state.playerStats = { flawlessRuns: {}, obstaclesIncinerated: 0, notifiedArmoryUnlocks: [], unlockedArmoryItems: [], consecutiveGroundPounds: 0 }; // Reset if disabled
        return;
    }
    const savedStats = localStorage.getItem(PLAYER_STATS_KEY);
    if (savedStats) {
        const loadedStats = JSON.parse(savedStats);
        // Ensure all properties are present
        state.playerStats = {
            flawlessRuns: loadedStats.flawlessRuns || {},
            obstaclesIncinerated: loadedStats.obstaclesIncinerated || 0,
            notifiedArmoryUnlocks: loadedStats.notifiedArmoryUnlocks || [],
            unlockedArmoryItems: loadedStats.unlockedArmoryItems || [],
            notifiedUnlocks: loadedStats.notifiedUnlocks || [],
            activeArmorySkill: loadedStats.activeArmorySkill || null,
            consecutiveGroundPounds: loadedStats.consecutiveGroundPounds || 0
        };
        console.log("-> loadPlayerStats: Player stats loaded and assigned to state.");
    } else {
        state.playerStats = { flawlessRuns: {}, obstaclesIncinerated: 0, notifiedArmoryUnlocks: [], unlockedArmoryItems: [], notifiedUnlocks: [], activeArmorySkill: null, consecutiveGroundPounds: 0 };
        console.log("-> loadPlayerStats: No player stats found. Initializing defaults.");
    }
}
