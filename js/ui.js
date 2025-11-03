// =================================================================
// UI FUNCTIONS
// =================================================================

import { suggestedEmojiList, defaultDataString, defaultEventDataString, DIFFICULTY_SETTINGS } from './constants.js';
import { emojiInput, obstacleEmojiInput, frequencyValueSpan, suggestedEmojisContainer, dataInput, eventDataInput, dataMessage, chartContainer, tableContainer, tableBody, skillLevelSelector } from './dom-elements.js';
import { parseData, parseEventData, prepareRaceData, drawChart, generateSummaryTable } from './utils.js';

export let financialMilestones = {};
export let raceSegments = [];
export let customEvents = {};
export let stickFigureEmoji = '🦹‍♂️'; // Default value
export let obstacleEmoji = '🐌'; // Default value
export let obstacleFrequencyPercent = 20;
export let currentSkillLevel = 'Rookie';
export let intendedSpeedMultiplier = 1.0;

export function updateEmoji(event) {
    let input = event.target.value.trim();
    stickFigureEmoji = input.length > 0 ? input.slice(0, 2) : '🦹‍♂️';
}

export function updateObstacleEmoji(event) {
    let input = event.target.value.trim();
    obstacleEmoji = input.length > 0 ? input.slice(0, 2) : '🐌';
}

export function handleFrequencyChange(event) {
    obstacleFrequencyPercent = parseInt(event.target.value, 10);
    frequencyValueSpan.textContent = `${obstacleFrequencyPercent}%`;
    console.log(`-> handleFrequencyChange: Obstacle frequency updated to ${obstacleFrequencyPercent}%`);
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
}

export function handleSkillLevelChange(event) {
    if (event.target.name === 'gameSkillLevel' && event.target.checked) {
        applySkillLevelSettings(event.target.value);
    }
}

export function selectSuggestedEmoji(emoji) {
    emojiInput.value = emoji;
    stickFigureEmoji = emoji;
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
}
export async function initializeUIData() {
    try {
        const response = await fetch('milestones.json');
        const data = await response.json();
        dataInput.value = data.milestones.join('\n');
        eventDataInput.value = data.events.join('\n');
    } catch (error) {
        console.error('Error loading default milestone data:', error);
        dataInput.value = defaultDataString.trim();
        eventDataInput.value = defaultEventDataString.trim();
    }
    loadCustomData();
}

export function showResultsScreen(financialMilestones, raceSegments) {
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
            startButton.textContent = "Unpause";
        } else {
            startButton.textContent = "Pause";
        }
    }

    if (!gameRunning) {
        dataMessage.textContent = "";
    }
}