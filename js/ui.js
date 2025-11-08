// =================================================================
// UI FUNCTIONS
// =================================================================

import { suggestedEmojiList, defaultDataString, defaultEventDataString, DIFFICULTY_SETTINGS, EMOJI_MUSIC_MAP, DEFAULT_MUSIC_URL } from './constants.js';
import {
    emojiInput,
    obstacleEmojiInput,
    frequencyValueSpan,
    suggestedEmojisContainer,
    dataInput,
    eventDataInput,
    dataMessage,
    chartContainer,
    tableContainer,
    tableBody,
    skillLevelSelector,
    disableSaveSettings,
    highScoresContainer,
    themeSelector,
    personaSelector,
    customPersonaControls,
    personaDetailsContainer,
    armoryItemsContainer
} from './dom-elements.js';
import { parseData, parseEventData, prepareRaceData, drawChart, generateSummaryTable } from './utils.js';
import { themes, setTheme } from './theme.js';
import { personas } from './personas.js';
import { personaUnlocks } from './unlocks.js';
import { initializeMusicPlayer } from './audio.js';
import { PLAYER_STATS_KEY } from './game-modules/state.js'; // Import PLAYER_STATS_KEY
import state from './game-modules/state.js'; // Import the state object

// Define unlockable skills for the Armory
const armorySkills = {
    firestorm: {
        name: 'Firestorm',
        description: 'Unleash a continuous barrage of fire, incinerating all obstacles.',
        emoji: '🌪️',
        unlockCondition: {
            type: 'incinerateCount',
            count: 100,
            skillKey: 'firestorm'
        },
        unlockText: 'Incinerate 100 obstacles'
    },
    fireSpinner: {
        name: 'Fire Spinner',
        description: 'A fiery spinning jump that incinerates obstacles.',
        emoji: '🔥',
        unlockCondition: {
            type: 'consecutiveGroundPounds',
            count: 3,
            skillKey: 'fireSpinner'
        },
        unlockText: 'Destroy 3 obstacles in a row with Ground Pound'
    },
    fireDash: {
        name: 'Fire Dash',
        description: 'A quick burst of speed, leaving a trail of fire.',
        emoji: '💨',
        unlockCondition: {
            type: 'placeholder',
            skillKey: 'fireDash'
        },
        unlockText: 'Coming soon!'
    }
    // Add more skills here as needed
};

export function handleArmorySkillSelection(skillKey) {
    state.playerStats.activeArmorySkill = skillKey;
    savePlayerStats();
    populateArmoryItems(); // Refresh UI
    console.log(`-> Armory: Skill '${skillKey}' selected.`);
}

export function handleArmorySkillDeselection() {
    state.playerStats.activeArmorySkill = null;
    savePlayerStats();
    populateArmoryItems(); // Refresh UI
    console.log("-> Armory: Active skill deselected.");
}

function getSkillUnlockProgress(condition, stats) {
    if (!condition || !stats) return { current: 0, target: 0 };

    switch (condition.type) {
        case 'incinerateCount':
            return {
                current: stats.obstaclesIncinerated || 0,
                target: condition.count
            };
        case 'flawlessRun':
            const isComplete = stats.flawlessRuns && stats.flawlessRuns[condition.difficulty];
            return {
                current: isComplete ? 1 : 0,
                target: 1
            };
        case 'consecutiveGroundPounds':
            return {
                current: stats.consecutiveGroundPounds || 0,
                target: condition.count
            };
        // Add other progress tracking here
        default:
            return { current: 0, target: 0 };
    }
}

export function populateArmoryItems() {
    armoryItemsContainer.innerHTML = ''; // Clear existing items

    for (const skillKey in armorySkills) {
        const skill = armorySkills[skillKey];
        const isUnlocked = checkSkillUnlockStatus(skill.unlockCondition, state.playerStats);

        const skillCard = document.createElement('div');
        skillCard.className = `armory-item p-4 rounded-lg shadow-md text-center ${isUnlocked ? 'bg-white unlocked' : 'bg-gray-200 opacity-50 cursor-not-allowed'}`;
        let lockedMessage = '';
        if (!isUnlocked) {
            const progress = getSkillUnlockProgress(skill.unlockCondition, state.playerStats);
            if (progress.target > 0) {
                lockedMessage = `<p class="text-xs text-red-500 mt-2">Locked: ${skill.unlockText} (${progress.current}/${progress.target})</p>`;
            } else {
                lockedMessage = `<p class="text-xs text-red-500 mt-2">Locked: ${skill.unlockText}</p>`;
            }
        }

        skillCard.innerHTML = `
            <span class="text-4xl armory-item-icon ${isUnlocked ? 'unlocked' : ''}">${skill.emoji}</span>
            <h4 class="font-semibold text-gray-800 mt-2">${skill.name}</h4>
            <p class="text-sm text-gray-600">${skill.description}</p>
            ${lockedMessage}
            <div class="mt-3">
                ${isUnlocked && state.playerStats.activeArmorySkill !== skillKey ? 
                    `<button class="control-btn primary-btn text-sm py-1 px-2" data-action="select" data-skill-key="${skillKey}">Select</button>` : ''}
                ${isUnlocked && state.playerStats.activeArmorySkill === skillKey ? 
                    `<button class="control-btn secondary-btn text-sm py-1 px-2" data-action="unselect">Unselect</button>` : ''}
            </div>
        `;
        armoryItemsContainer.appendChild(skillCard);
    }
}

function checkSkillUnlockStatus(condition, stats) {
    if (!stats) return false; // No stats means nothing is unlocked

    // If the skill is already in the unlockedArmoryItems array, it's unlocked.
    if (stats.unlockedArmoryItems && stats.unlockedArmoryItems.includes(condition.skillKey)) {
        return true;
    }

    if (!condition || condition.type === 'placeholder') return false; // Placeholder conditions are always locked for now

    switch (condition.type) {
        case 'incinerateCount':
            return stats.obstaclesIncinerated >= condition.count;
        case 'flawlessRun':
            return stats.flawlessRuns && stats.flawlessRuns[condition.difficulty];
        case 'consecutiveGroundPounds':
            return stats.consecutiveGroundPounds >= condition.count;
        // Add other unlock conditions here
        default:
            return false;
    }
}


export let financialMilestones = {};
export let raceSegments = [];
export let customEvents = {};
export let stickFigureEmoji = '🦹‍♂️'; // Default value
export let obstacleEmoji = '🐌'; // Default value
export let obstacleFrequencyPercent = 20;
export let currentSkillLevel = 'Rookie';
export let intendedSpeedMultiplier = 1.0;
export let enableRandomPowerUps = true;
export let isAutoHurdleEnabled = false;
export let selectedTheme = 'grass';
export let selectedPersona = 'custom';

const LOCAL_STORAGE_KEY = 'fireHeistSettings';
const HIGH_SCORE_KEY = 'fireHeistHighScores';

function saveSettings() {
    if (disableSaveSettings.checked) {
        return; // Don't save if the checkbox is checked
    }
    const settings = {
        stickFigureEmoji,
        obstacleEmoji,
        obstacleFrequencyPercent,
        currentSkillLevel,
        intendedSpeedMultiplier,
        enableRandomPowerUps,
        isAutoHurdleEnabled,
        selectedTheme,
        selectedPersona,
        milestoneData: dataInput.value,
        eventData: eventDataInput.value
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    console.log("-> saveSettings: Settings saved to localStorage.");
}

function loadSettings() {
    const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSettings && !disableSaveSettings.checked) {
        const settings = JSON.parse(savedSettings);
        stickFigureEmoji = settings.stickFigureEmoji || '🦹‍♂️';
        obstacleEmoji = settings.obstacleEmoji || '🐌';
        obstacleFrequencyPercent = settings.obstacleFrequencyPercent || 20;
        currentSkillLevel = settings.currentSkillLevel || 'Rookie';
        intendedSpeedMultiplier = parseFloat(settings.intendedSpeedMultiplier) || 1.0;
        enableRandomPowerUps = typeof settings.enableRandomPowerUps === 'boolean' ? settings.enableRandomPowerUps : true;
        isAutoHurdleEnabled = typeof settings.isAutoHurdleEnabled === 'boolean' ? settings.isAutoHurdleEnabled : false;
        selectedTheme = settings.selectedTheme || 'grass';
        selectedPersona = settings.selectedPersona || 'custom';

        emojiInput.value = stickFigureEmoji;
        obstacleEmojiInput.value = obstacleEmoji;
        document.getElementById('obstacleFrequency').value = obstacleFrequencyPercent;
        frequencyValueSpan.textContent = `${obstacleFrequencyPercent}%`;
        document.getElementById('enablePowerUps').checked = enableRandomPowerUps;
        document.getElementById('enableAutoHurdle').checked = isAutoHurdleEnabled;
        themeSelector.value = selectedTheme;
        setTheme(selectedTheme);

        // Set skill level radio button
        const skillRadio = document.querySelector(`input[name="gameSkillLevel"][value="${currentSkillLevel}"]`);
        if (skillRadio) skillRadio.checked = true;

        // Set speed radio button
        const speedString = intendedSpeedMultiplier.toFixed(1);
        const speedRadio = document.querySelector(`input[name="gameSpeed"][value="${speedString}"]`);
        if (speedRadio) speedRadio.checked = true;

        // Load saved data into text areas, falling back to default if not present
        dataInput.value = settings.milestoneData || defaultDataString.trim();
        eventDataInput.value = settings.eventData || defaultEventDataString.trim();

        applyPersona(selectedPersona); // Apply persona settings and UI changes
        personaSelector.value = selectedPersona; // Set selector value AFTER applying persona

        console.log("-> loadSettings: Settings loaded from localStorage.");
        return true; // Indicate that settings were loaded
    } else {
        console.log("-> loadSettings: No settings found or saving is disabled. Using defaults.");
        return false; // Indicate that settings were not loaded
    }
}

export function populateThemeSelector() {
    for (const key in themes) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = themes[key].name;
        themeSelector.appendChild(option);
    }
}

export function handleThemeChange(event) {
    const themeName = event.target.value;
    selectedTheme = themeName;
    setTheme(themeName);
    saveSettings();
}

function displayUnlockNotification(personaName) {
    const notificationElement = document.getElementById('unlock-notification');
    if (notificationElement) {
        notificationElement.textContent = `🎉 New Persona Unlocked: ${personaName}!`;
        notificationElement.classList.remove('hidden');
        setTimeout(() => {
            notificationElement.classList.add('hidden');
        }, 5000); // Hide after 5 seconds
    }
}

function displayArmoryUnlockNotification(skillName) {
    const notificationElement = document.getElementById('unlock-notification');
    if (notificationElement) {
        notificationElement.textContent = `🛡️ New Armory Skill Unlocked: ${skillName}!`;
        notificationElement.classList.remove('hidden');
        setTimeout(() => {
            notificationElement.classList.add('hidden');
        }, 5000); // Hide after 5 seconds
    }
}

function isPersonaUnlocked(personaKey, stats) {
    const unlock = personaUnlocks[personaKey];
    if (!unlock) {
        return true; // No unlock condition means it's available by default
    }

    if (!stats) {
        return false; // If stats aren't loaded, assume locked
    }

    switch (unlock.condition.type) {
        case 'flawlessRun':
            return stats.flawlessRuns && stats.flawlessRuns[unlock.condition.difficulty];
        case 'incinerateCount':
            return stats.obstaclesIncinerated >= unlock.condition.count;
        default:
            return false;
    }
}

export function populatePersonaSelector() {
    // Clear all existing options
    personaSelector.innerHTML = '';

    // Add the default 'Custom Persona' option first
    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = 'Custom Persona';
    personaSelector.appendChild(customOption);

    for (const key in personas) {
        if (key === 'custom') continue; // Skip custom, it's already added

        const persona = personas[key];
        const unlockInfo = personaUnlocks[key];
        const option = document.createElement('option');
        option.value = key;

        const isUnlocked = isPersonaUnlocked(key, state.playerStats);

        // Use innerHTML to structure the content with spans for flexbox styling
        option.innerHTML = `
            <span class="flex justify-between items-center w-full">
                <span class="${!isUnlocked ? 'locked-persona' : ''}">${persona.emoji ? `${persona.emoji} ${persona.name}` : persona.name}</span>
                ${unlockInfo ? `<span class="text-xs">${isUnlocked ? '🔓' : '🔒'}</span>` : ''}
            </span>
        `;

        if (unlockInfo && !isUnlocked) {
            option.disabled = true;
            option.title = `LOCKED: ${unlockInfo.description || 'Unlock condition not specified'}`;
        } else {
            option.disabled = false;
        }

        personaSelector.appendChild(option);
    }
    // Ensure the currently selected persona is still selected after re-population
    personaSelector.value = selectedPersona;
}

export function checkForArmoryUnlocks(stats) {
    if (!stats.notifiedArmoryUnlocks) {
        stats.notifiedArmoryUnlocks = [];
    }

    for (const key in armorySkills) {
        const skill = armorySkills[key];
        if (checkSkillUnlockStatus(skill.unlockCondition, stats) && !stats.notifiedArmoryUnlocks.includes(key)) {
            displayArmoryUnlockNotification(skill.name);
            stats.notifiedArmoryUnlocks.push(key);
            stats.unlockedArmoryItems.push(key); // Add to unlocked items
            populateArmoryItems(); // Refresh the armory to show the unlocked item
            savePlayerStats();
            console.info(`-> ARMORY UNLOCK: '${skill.name}' unlocked! Condition met: ${skill.unlockText}`);
        }
    }
}

export function checkForNewUnlocks(stats) {
    if (!stats.notifiedUnlocks) {
        stats.notifiedUnlocks = [];
    }

    for (const key in personaUnlocks) {
        if (isPersonaUnlocked(key, stats) && !stats.notifiedUnlocks.includes(key)) {
            const personaName = personas[key]?.name || key;
            displayUnlockNotification(personaName);
            stats.notifiedUnlocks.push(key);
            populatePersonaSelector(); // Re-populate to enable the new persona
            savePlayerStats();
        }
    }
    checkForArmoryUnlocks(stats); // Also check for armory unlocks
}

export function handlePersonaChange(event) {
    const personaKey = event.target.value;
    applyPersona(personaKey);
}

export function applyPersona(personaKey) {
    selectedPersona = personaKey;
    const persona = personas[personaKey];

    if (personaKey === 'custom') {
        customPersonaControls.style.display = 'block';
        personaDetailsContainer.classList.add('hidden');
        const cleanEmoji = stickFigureEmoji.replace(/\uFE0F/g, '');
        const musicUrl = EMOJI_MUSIC_MAP[cleanEmoji] || DEFAULT_MUSIC_URL;
        initializeMusicPlayer(musicUrl);
    } else {
        customPersonaControls.style.display = 'none';
        personaDetailsContainer.classList.remove('hidden');

        // Populate and display persona details
        personaDetailsContainer.innerHTML = `
            <div class="flex items-center">
                <span class="text-2xl mr-3">${persona.emoji}</span>
                <div>
                    <p class="font-bold text-gray-800">${persona.name}</p>
                    <p class="text-gray-600">${persona.financialTrait}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2 text-center">
                <div class="bg-gray-100 p-1 rounded">
                    <p class="text-xs text-gray-500">Discipline</p>
                    <p class="font-semibold text-gray-800">${persona.financialDisciplineLevel}</p>
                </div>
                <div class="bg-gray-100 p-1 rounded">
                    <p class="text-xs text-gray-500">Skill Level</p>
                    <p class="font-semibold text-gray-800">${persona.skillLevel}</p>
                </div>
            </div>
        `;

        // Apply persona settings
        stickFigureEmoji = persona.emoji;
        emojiInput.value = persona.emoji;

        currentSkillLevel = persona.skillLevel;
        const skillRadio = document.querySelector(`input[name="gameSkillLevel"][value="${currentSkillLevel}"]`);
        if (skillRadio) skillRadio.checked = true;
        applySkillLevelSettings(currentSkillLevel);


        obstacleFrequencyPercent = persona.obstacleFrequencyPercent;
        document.getElementById('obstacleFrequency').value = obstacleFrequencyPercent;
        frequencyValueSpan.textContent = `${obstacleFrequencyPercent}%`;

        selectedTheme = persona.theme;
        themeSelector.value = selectedTheme;
        setTheme(selectedTheme);

        // Initialize music player with persona's music
        initializeMusicPlayer(persona.music);
    }
    saveSettings();
}

export function displayHighScores() {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORE_KEY)) || {};
    highScoresContainer.innerHTML = ''; // Clear existing scores

    ['Rookie', 'Novice', 'Pro'].forEach(level => {
        const score = highScores[level];
        const scoreCard = document.createElement('div');
        scoreCard.className = 'p-3 bg-gray-100 rounded-lg';

        let content;
        if (score) {
            const isFlawless = score.hits === 0;
            content = `
                <div class="flex justify-between items-center">
                    <div>
                        <span class="font-bold text-lg text-gray-700">${level}</span>
                        ${isFlawless ? '<span class="text-yellow-500 ml-2">🏆 Flawless!</span>' : ''}
                    </div>
                    <div class="text-right">
                        <span class="text-2xl">${score.emoji}</span>
                    </div>
                </div>
                <div class="text-sm text-gray-600 mt-1">
                    <span>Days: <strong>${score.days.toLocaleString()}</strong></span> | 
                    <span>Hits: <strong>${score.hits}</strong></span> | 
                    <span>Speed: <strong>${score.speed.toFixed(1)}x</strong></span>
                </div>
            `;
        } else {
            content = `
                <div class="font-bold text-lg text-gray-500">${level}</div>
                <div class="text-sm text-gray-400 mt-1">No record yet.</div>
            `;
        }
        scoreCard.innerHTML = content;
        highScoresContainer.appendChild(scoreCard);
    });
}

export function updateEmoji(event) {
    let input = event.target.value.trim();
    stickFigureEmoji = input.length > 0 ? input.slice(0, 2) : '🦹‍♂️';
    saveSettings();
}

export function updateObstacleEmoji(event) {
    let input = event.target.value.trim();
    obstacleEmoji = input.length > 0 ? input.slice(0, 2) : '🐌';
    saveSettings();
}

export function handleFrequencyChange(event) {
    const userSelectedFrequency = parseInt(event.target.value, 10);
    // Reduce the actual frequency by 25% for gameplay balance
    obstacleFrequencyPercent = Math.round(userSelectedFrequency * 0.75);
    frequencyValueSpan.textContent = `${userSelectedFrequency}%`; // UI shows the user's selection
    console.log(`-> handleFrequencyChange: User selected ${userSelectedFrequency}%, actual frequency set to ${obstacleFrequencyPercent}%`);
    saveSettings();
}

export function handlePowerUpToggle(event) {
    enableRandomPowerUps = event.target.checked;
    saveSettings();
}

export function handleAutoHurdleToggle(event) {
    isAutoHurdleEnabled = event.target.checked;
    saveSettings();
}

export function applySkillLevelSettings(level) {
    console.log(`-> applySkillLevelSettings: Setting skill level to ${level}.`);
    const settings = DIFFICULTY_SETTINGS[level];
    if (settings) {
        currentSkillLevel = level; // Renamed
        state.acceleratorFrequencyPercent = settings.ACCELERATOR_FREQUENCY_PERCENT; // Set state here
        console.log(`-> applySkillLevelSettings: Jump Height: ${settings.manualJumpHeight}, Duration: ${settings.manualJumpDurationMs}ms, Collision Range: ${settings.COLLISION_RANGE_X}, Accelerator Freq: ${settings.ACCELERATOR_FREQUENCY_PERCENT}%`);
    } else {
        console.error(`Unknown skill level: ${level}.`);
    }
    saveSettings();
}

export function handleSkillLevelChange(event) {
    if (event.target.name === 'gameSkillLevel' && event.target.checked) {
        applySkillLevelSettings(event.target.value);
    }
}

export function selectSuggestedEmoji(emoji) {
    emojiInput.value = emoji;
    stickFigureEmoji = emoji;
    saveSettings();
}

export function setupSuggestedEmojis() {
    suggestedEmojiList.forEach(emoji => {
        const span = document.createElement('span');
        span.textContent = emoji;
        span.className = 'emoji-suggestion';
        span.setAttribute('role', 'button');
        span.setAttribute('aria-label', `Use ${emoji} as runner`);
        span.addEventListener('click', () => selectSuggestedEmoji(emoji));
        suggestedEmojisContainer.appendChild(span);
    });
}

export function handleSpeedChange(event) {
    if (event.target.name === 'gameSpeed' && event.target.checked) {
        intendedSpeedMultiplier = parseFloat(event.target.value);
        saveSettings();
    }
}

export function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');

    tabs.forEach(tab => {
        tab.classList.add('hidden');
    });

    buttons.forEach(button => {
        button.classList.remove('tab-button-active');
        button.classList.add('tab-button-inactive');
    });

    const activeTab = document.getElementById(tabId + 'Tab');
    const activeButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);

    if (activeTab) {
        activeTab.classList.remove('hidden');
    }
    if (activeButton) {
        activeButton.classList.add('tab-button-active');
        activeButton.classList.remove('tab-button-inactive');
    }

    // If the Armory tab is activated, populate it with items
    if (tabId === 'armory') {
        populateArmoryItems();
    }
}

export function loadCustomData() {
    console.log("-> loadCustomData: Attempting to load custom data.");

    // 1. Load Milestone Data
    const customMilestoneData = parseData(dataInput.value);
    if (!customMilestoneData || Object.keys(customMilestoneData).length < 2) {
        const errorMsg = "Error: Please check Milestone Data format. Need at least two valid 'MM/DD/YYYY: VALUE' pairs. Data load failed.";
        dataMessage.textContent = errorMsg;
        dataMessage.style.color = 'red';
        console.error("-> loadCustomData: Milestone Data loading failed.", errorMsg);
        // Clear out events to prevent mismatch
        customEvents = {};
        return;
    }

    financialMilestones = customMilestoneData;
    raceSegments = prepareRaceData(financialMilestones);
    const firstMilestoneDate = Object.keys(financialMilestones)[0];

    // 2. Load Custom Event Data (Only if milestones loaded successfully)
    const customEventData = parseEventData(eventDataInput.value, firstMilestoneDate);

    if (customEventData === null) {
        const errorMsg = "Error: Please check Custom Event Data format/dates. Events load failed.";
        dataMessage.textContent = errorMsg;
        dataMessage.style.color = 'red';
        console.error("-> loadCustomData: Custom Event Data loading failed.", errorMsg);
        // Continue with just milestone data, but warn user.
        customEvents = {};
        return;
    }

    customEvents = customEventData;
    console.log(`-> loadCustomData: ${Object.values(customEvents).flat().length} Custom Events loaded.`);

    dataMessage.textContent = `Data successfully loaded! ${raceSegments.length} milestones and ${Object.values(customEvents).flat().length} custom events ready.`;
    dataMessage.style.color = 'green';
    console.log("-> loadCustomData: Data loaded and game reset for new segments.");
    saveSettings(); // Save the newly loaded custom data
    document.body.classList.remove('game-active-fullscreen'); // Remove immersive class
    exitFullScreenIfActive(); // Exit fullscreen when new data is loaded
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

export async function initializeUIData() {
    // First, populate the UI elements
    populateThemeSelector();
    populatePersonaSelector();

    const enableAutoHurdle = document.getElementById('enableAutoHurdle');
    if (enableAutoHurdle) {
        enableAutoHurdle.addEventListener('change', handleAutoHurdleToggle);
    }

    // Then, load the saved settings
    const settingsLoaded = loadSettings();
    loadPlayerStats(); // Load player stats here

    // Sanity check: If an active skill is somehow no longer unlocked, deselect it.
    const activeSkill = state.playerStats.activeArmorySkill;
    if (activeSkill) {
        const skill = armorySkills[activeSkill];
        if (skill && !checkSkillUnlockStatus(skill.unlockCondition, state.playerStats)) {
            console.warn(`-> Sanity Check: Active skill '${activeSkill}' is no longer unlocked. Deselecting.`);
            state.playerStats.activeArmorySkill = null;
            savePlayerStats(); // Re-save the corrected stats
        }
    }

    if (!settingsLoaded) {
        try {
            const response = await fetch('milestones.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            dataInput.value = data.milestones.join('\n');
            eventDataInput.value = data.events.join('\n');
        } catch (error) {
            console.error('Error loading default milestone data:', error);
            dataInput.value = defaultDataString.trim();
            eventDataInput.value = defaultEventDataString.trim();
        }
    }

    // Directly parse and prepare the initial data
    financialMilestones = parseData(dataInput.value);
    if (financialMilestones && Object.keys(financialMilestones).length >= 2) {
        raceSegments = prepareRaceData(financialMilestones);
        const firstMilestoneDate = Object.keys(financialMilestones)[0];
        customEvents = parseEventData(eventDataInput.value, firstMilestoneDate) || {};
        dataMessage.textContent = `Default data loaded. ${raceSegments.length} milestones and ${Object.values(customEvents).flat().length} events ready.`;
        dataMessage.style.color = 'green';
    } else {
        dataMessage.textContent = "Error: Default data is invalid. Please check 'milestones.json' or provide valid custom data.";
        dataMessage.style.color = 'red';
        financialMilestones = {};
        raceSegments = [];
        customEvents = {};
    }

    displayHighScores(); // Display high scores on startup
}

export function showResultsScreen(financialMilestones, raceSegments) {
    if (!financialMilestones || Object.keys(financialMilestones).length === 0 || !raceSegments || raceSegments.length === 0) {
        console.error("-> showResultsScreen: Called with invalid or empty data. Aborting render.");
        return;
    }
    chartContainer.style.display = 'block';
    tableContainer.style.display = 'block';
    drawChart(financialMilestones, document.getElementById('milestoneChart').getContext('2d'));
    generateSummaryTable(raceSegments, tableBody);
}

export function hideResultsScreen() {
    chartContainer.style.display = 'none';
    tableContainer.style.display = 'none';
}

export function toggleFullScreen() {
    const elem = document.documentElement; // Target the whole page
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
}

export function exitFullScreenIfActive() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
}

export function updateControlPanelState(gameRunning, isPaused) {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const loadButton = document.getElementById('loadButton');
    const fullscreenToggleButton = document.getElementById('fullscreenToggleButton');

    // Main game state controls button disabling
    const disableControls = gameRunning && !isPaused;
    loadButton.disabled = disableControls;
    emojiInput.disabled = disableControls;
    obstacleEmojiInput.disabled = disableControls;
    document.getElementById('obstacleFrequency').disabled = disableControls;
    document.getElementById('speedSelector').querySelectorAll('input').forEach(input => input.disabled = disableControls);
    skillLevelSelector.querySelectorAll('input').forEach(input => input.disabled = disableControls);

    // Stop button is enabled only when the game is actively running or paused
    stopButton.disabled = !gameRunning;

    // Start button state logic
    if (!gameRunning) {
        startButton.disabled = false;
        startButton.textContent = "▶️ Start the Heist!";
    } else {
        startButton.disabled = false; // It's now the pause/resume button
        if (isPaused) {
            startButton.textContent = "▶️ Unpause (P)";
        } else {
            startButton.textContent = "⏸️ Pause (P)";
        }
    }

    // Fullscreen button text
    if (fullscreenToggleButton) { // Check if the button exists
        if (document.fullscreenElement) {
            fullscreenToggleButton.textContent = "↙️ Exit";
        } else {
            fullscreenToggleButton.textContent = "↗️ Fullscreen";
        }
    }

    if (!gameRunning) {
        dataMessage.textContent = "";
    }
}

// =================================================================
// DEBUG FUNCTIONS
// =================================================================

export function debugUnlockAllPersonas() {
    for (const key in personaUnlocks) {
        const unlock = personaUnlocks[key];
        switch (unlock.condition.type) {
            case 'flawlessRun':
                if (!state.playerStats.flawlessRuns) state.playerStats.flawlessRuns = {};
                state.playerStats.flawlessRuns[unlock.condition.difficulty] = true;
                break;
            case 'incinerateCount':
                if (state.playerStats.obstaclesIncinerated < unlock.condition.count) {
                    state.playerStats.obstaclesIncinerated = unlock.condition.count;
                }
                break;
        }
    }
    savePlayerStats();
    populatePersonaSelector(); // Re-populate to show unlocked personas
    alert('All personas have been unlocked.');
}