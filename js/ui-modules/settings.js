
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
import { gameState, setStickFigureEmoji, setObstacleEmoji, setObstacleFrequencyPercent, setCurrentSkillLevel, setIntendedSpeedMultiplier, setEnableRandomPowerUps, setAutoHurdleEnabled, setSelectedTheme, setSelectedPersona, setPlayerStats } from '../game-modules/state-manager.js';
import { PLAYER_STATS_KEY } from '../game-modules/state.js';

const LOCAL_STORAGE_KEY = 'fireHeistSettings';

export function saveSettings() {
    if (disableSaveSettings.checked || gameState.isDailyChallengeActive) {
        return; // Don't save if the checkbox is checked or if a daily challenge is active
    }
    const settings = {
        stickFigureEmoji: gameState.stickFigureEmoji,
        obstacleEmoji: gameState.obstacleEmoji,
        obstacleFrequencyPercent: gameState.obstacleFrequencyPercent,
        currentSkillLevel:
        gameState.currentSkillLevel,
        intendedSpeedMultiplier: gameState.intendedSpeedMultiplier,
        enableRandomPowerUps: gameState.enableRandomPowerUps,
        isAutoHurdleEnabled: gameState.isAutoHurdleEnabled,
        selectedTheme: gameState.selectedTheme,
        selectedPersona: gameState.selectedPersona,
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
        setStickFigureEmoji(settings.stickFigureEmoji || '🦹‍♂️');
        setObstacleEmoji(settings.obstacleEmoji || '🐌');
        setObstacleFrequencyPercent(settings.obstacleFrequencyPercent || 20);
        setCurrentSkillLevel(settings.currentSkillLevel || 'Rookie');
        setIntendedSpeedMultiplier(parseFloat(settings.intendedSpeedMultiplier) || 1.0);
        setEnableRandomPowerUps(typeof settings.enableRandomPowerUps === 'boolean' ? settings.enableRandomPowerUps : true);
        setAutoHurdleEnabled(typeof settings.isAutoHurdleEnabled === 'boolean' ? settings.isAutoHurdleEnabled : false);
        setSelectedTheme(settings.selectedTheme || 'grass');
        setSelectedPersona(settings.selectedPersona || 'custom');

        emojiInput.value = gameState.stickFigureEmoji;
        obstacleEmojiInput.value = gameState.obstacleEmoji;
        document.getElementById('obstacleFrequency').value = gameState.obstacleFrequencyPercent;
        frequencyValueSpan.textContent = `${gameState.obstacleFrequencyPercent}%`;
        document.getElementById('enablePowerUps').checked = gameState.enableRandomPowerUps;
        document.getElementById('enableAutoHurdle').checked = gameState.isAutoHurdleEnabled;
        themeSelector.value = gameState.selectedTheme;
        setTheme(gameState.selectedTheme);

        // Set skill level radio button
        const skillRadio = document.querySelector(`input[name="gameSkillLevel"][value="${gameState.currentSkillLevel}"]`);
        if (skillRadio) skillRadio.checked = true;

        // Set speed radio button
        const speedString = gameState.intendedSpeedMultiplier.toFixed(1);
        const speedRadio = document.querySelector(`input[name="gameSpeed"][value="${speedString}"]`);
        if (speedRadio) speedRadio.checked = true;

        // Load saved data into text areas, falling back to default if not present
        dataInput.value = settings.milestoneData || defaultDataString.trim();
        eventDataInput.value = settings.eventData || defaultEventDataString.trim();

        applyPersona(gameState.selectedPersona); // Apply persona settings and UI changes
        personaSelector.value = gameState.selectedPersona; // Set selector value AFTER applying persona

        console.log("-> loadSettings: Settings loaded from localStorage.");
        return true; // Indicate that settings were loaded
    } else {
        console.log("-> loadSettings: No settings found or saving is disabled. Using defaults.");
        // Explicitly set defaults on the state object
        setStickFigureEmoji('🦹‍♂️');
        setObstacleEmoji('🐌');
        setObstacleFrequencyPercent(20);
        setCurrentSkillLevel('Rookie');
        setIntendedSpeedMultiplier(1.0);
        setEnableRandomPowerUps(true);
        setAutoHurdleEnabled(false);
        setSelectedTheme('grass');
        setSelectedPersona('custom');
        return false; // Indicate that settings were not loaded
    }
}

export function savePlayerStats() {
    if (disableSaveSettings.checked || gameState.isDailyChallengeActive) {
        return;
    }
    // Read the latest from storage first to prevent overwriting with a stale object
    const savedStatsRaw = localStorage.getItem(PLAYER_STATS_KEY);
    const savedStats = savedStatsRaw ? JSON.parse(savedStatsRaw) : {};

    // Merge the current in-memory state onto the saved state
    const mergedStats = {
        ...savedStats,
        ...gameState.playerStats,
        totalGroundPoundCollisions: (savedStats.totalGroundPoundCollisions || 0) + gameState.playerStats.totalGroundPoundCollisions,
        obstaclesIncinerated: (savedStats.obstaclesIncinerated || 0) + gameState.playerStats.obstaclesIncinerated
    };

    localStorage.setItem(PLAYER_STATS_KEY, JSON.stringify(mergedStats));
    console.log("-> savePlayerStats: Player stats merged and saved to localStorage.");
}

export function loadPlayerStats() {
    if (disableSaveSettings.checked) {
        setPlayerStats({ flawlessRuns: {}, obstaclesIncinerated: 0, notifiedArmoryUnlocks: [], unlockedArmoryItems: [], consecutiveGroundPounds: 0 }); // Reset if disabled
        return;
    }
    const savedStats = localStorage.getItem(PLAYER_STATS_KEY);
    if (savedStats) {
        const loadedStats = JSON.parse(savedStats);
        // Ensure all properties are present
        setPlayerStats({
            flawlessRuns: loadedStats.flawlessRuns || {},
            obstaclesIncinerated: loadedStats.obstaclesIncinerated || 0,
            notifiedArmoryUnlocks: loadedStats.notifiedArmoryUnlocks || [],
            unlockedArmoryItems: loadedStats.unlockedArmoryItems || [],
            notifiedUnlocks: loadedStats.notifiedUnlocks || [],
            activeArmorySkill: loadedStats.activeArmorySkill || null,
            consecutiveGroundPounds: loadedStats.consecutiveGroundPounds || 0,
            totalGroundPoundCollisions: loadedStats.totalGroundPoundCollisions || 0,
            consecutiveIncinerations: loadedStats.consecutiveIncinerations || 0,
            totalAccumulatedCash: loadedStats.totalAccumulatedCash || 0
        });
        console.log("-> loadPlayerStats: Player stats loaded and assigned to state.");
    } else {
        setPlayerStats({ flawlessRuns: {}, obstaclesIncinerated: 0, notifiedArmoryUnlocks: [], unlockedArmoryItems: [], notifiedUnlocks: [], activeArmorySkill: null, consecutiveGroundPounds: 0, totalGroundPoundCollisions: 0, consecutiveIncinerations: 0, totalAccumulatedCash: 0 });
        console.log("-> loadPlayerStats: No player stats found. Initializing defaults.");
    }
}
