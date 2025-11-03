// =================================================================
// UI FUNCTIONS
// =================================================================

import { suggestedEmojiList, defaultDataString, defaultEventDataString, DIFFICULTY_SETTINGS } from './constants.js';
import { emojiInput, obstacleEmojiInput, frequencyValueSpan, suggestedEmojisContainer, dataInput, eventDataInput, dataMessage, chartContainer, tableContainer, tableBody, skillLevelSelector, disableSaveSettings, highScoresContainer } from './dom-elements.js';
import { parseData, parseEventData, prepareRaceData, drawChart, generateSummaryTable } from './utils.js';

export let financialMilestones = {};
export let raceSegments = [];
export let customEvents = {};
export let stickFigureEmoji = '🦹‍♂️'; // Default value
export let obstacleEmoji = '🐌'; // Default value
export let obstacleFrequencyPercent = 20;
export let currentSkillLevel = 'Rookie';
export let intendedSpeedMultiplier = 1.0;
export let enableRandomPowerUps = true;

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

        emojiInput.value = stickFigureEmoji;
        obstacleEmojiInput.value = obstacleEmoji;
        document.getElementById('obstacleFrequency').value = obstacleFrequencyPercent;
        frequencyValueSpan.textContent = `${obstacleFrequencyPercent}%`;
        document.getElementById('enablePowerUps').checked = enableRandomPowerUps;

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

        console.log("-> loadSettings: Settings loaded from localStorage.");
        return true; // Indicate that settings were loaded
    } else {
        console.log("-> loadSettings: No settings found or saving is disabled. Using defaults.");
        return false; // Indicate that settings were not loaded
    }
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
    obstacleFrequencyPercent = parseInt(event.target.value, 10);
    frequencyValueSpan.textContent = `${obstacleFrequencyPercent}%`;
    console.log(`-> handleFrequencyChange: Obstacle frequency updated to ${obstacleFrequencyPercent}%`);
    saveSettings();
}

export function handlePowerUpToggle(event) {
    enableRandomPowerUps = event.target.checked;
    saveSettings();
}

export function applySkillLevelSettings(level) {
    console.log(`-> applySkillLevelSettings: Setting skill level to ${level}.`);
    const settings = DIFFICULTY_SETTINGS[level];
    if (settings) {
        currentSkillLevel = level; // Renamed
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
}
export async function initializeUIData() {
    const settingsLoaded = loadSettings();
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

export function updateControlPanelState(gameRunning, isPaused) {
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const loadButton = document.getElementById('loadButton');

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
        startButton.textContent = "Start the Heist!";
    } else {
        startButton.disabled = false; // It's now the pause/resume button
        if (isPaused) {
            startButton.textContent = "Unpause (P)";
        } else {
            startButton.textContent = "Pause (P)";
        }
    }

    if (!gameRunning) {
        dataMessage.textContent = "";
    }
}