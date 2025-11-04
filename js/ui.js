// =================================================================
// UI FUNCTIONS
// =================================================================

import { defaultDataString, defaultEventDataString, DIFFICULTY_SETTINGS, EMOJI_MUSIC_MAP, DEFAULT_MUSIC_URL } from './constants.js';
import { emojiInput, obstacleEmojiInput, frequencyValueSpan, dataInput, eventDataInput, dataMessage, chartContainer, tableContainer, tableBody, skillLevelSelector, disableSaveSettings, highScoresContainer, themeSelector, personaSelector } from './dom-elements.js';
import { parseData, parseEventData, prepareRaceData, drawChart, generateSummaryTable } from './utils.js';
import { themes, setTheme } from './theme.js';
import { setBackgroundMusicUrl } from './audio.js';
import state from './game-modules/state.js';
import { personas } from './personas.js';

export let financialMilestones = {};
export let raceSegments = [];
export let customEvents = {};
export let stickFigureEmoji = '🦹‍♂️';
export let obstacleEmoji = '🐌';
export let obstacleFrequencyPercent = 20;
export let currentSkillLevel = 'Rookie';
export let intendedSpeedMultiplier = 1.0;
export let enableRandomPowerUps = true;
export let selectedTheme = 'grass';
export let selectedPersona = 'custom';

const LOCAL_STORAGE_KEY = 'fireHeistSettings';
const HIGH_SCORE_KEY = 'fireHeistHighScores';

function saveSettings() {
    if (disableSaveSettings.checked) return;
    const settings = {
        selectedPersona,
        stickFigureEmoji,
        obstacleEmoji,
        obstacleFrequencyPercent,
        currentSkillLevel,
        intendedSpeedMultiplier,
        enableRandomPowerUps,
        selectedTheme,
        milestoneData: dataInput.value,
        eventData: eventDataInput.value
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    console.log("-> saveSettings: Settings saved to localStorage.");
}

async function loadSettings() {
    const savedSettings = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedSettings && !disableSaveSettings.checked) {
        const settings = JSON.parse(savedSettings);
        selectedPersona = settings.selectedPersona || 'custom';
        obstacleEmoji = settings.obstacleEmoji || '🐌';
        obstacleFrequencyPercent = settings.obstacleFrequencyPercent || 20;
        intendedSpeedMultiplier = parseFloat(settings.intendedSpeedMultiplier) || 1.0;
        enableRandomPowerUps = typeof settings.enableRandomPowerUps === 'boolean' ? settings.enableRandomPowerUps : true;
        selectedTheme = settings.selectedTheme || 'grass';

        personaSelector.value = selectedPersona;
        await handlePersonaChange({ target: { value: selectedPersona } }, false); // Pass false to avoid re-saving

        obstacleEmojiInput.value = obstacleEmoji;
        document.getElementById('obstacleFrequency').value = obstacleFrequencyPercent;
        frequencyValueSpan.textContent = `${obstacleFrequencyPercent}%`;
        document.getElementById('enablePowerUps').checked = enableRandomPowerUps;
        themeSelector.value = selectedTheme;
        setTheme(selectedTheme);

        const speedString = intendedSpeedMultiplier.toFixed(1);
        const speedRadio = document.querySelector(`input[name="gameSpeed"][value="${speedString}"]`);
        if (speedRadio) speedRadio.checked = true;

        if (selectedPersona === 'custom') {
            stickFigureEmoji = settings.stickFigureEmoji || '🦹‍♂️';
            currentSkillLevel = settings.currentSkillLevel || 'Rookie';
            emojiInput.value = stickFigureEmoji;
            const skillRadio = document.querySelector(`input[name="gameSkillLevel"][value="${currentSkillLevel}"]`);
            if (skillRadio) skillRadio.checked = true;
            dataInput.value = settings.milestoneData || defaultDataString.trim();
            eventDataInput.value = settings.eventData || defaultEventDataString.trim();
        }

        console.log("-> loadSettings: Settings loaded from localStorage.");
        return true;
    }
    return false;
}

export function populateThemeSelector() {
    for (const key in themes) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = themes[key].name;
        themeSelector.appendChild(option);
    }
}

export function populatePersonaSelector() {
    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = 'Custom Character';
    personaSelector.appendChild(customOption);

    for (const key in personas) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${personas[key].emoji} ${personas[key].name}`;
        personaSelector.appendChild(option);
    }
}

export async function handlePersonaChange(event, doSave = true) {
    selectedPersona = event.target.value;
    
    // Validate that the persona exists, otherwise default to custom
    if (selectedPersona !== 'custom' && !personas[selectedPersona]) {
        console.warn(`-> handlePersonaChange: Persona "${selectedPersona}" not found. Defaulting to custom.`);
        selectedPersona = 'custom';
        personaSelector.value = 'custom';
    }

    const customControls = document.getElementById('custom-persona-controls');
    const themeSelectorContainer = document.getElementById('theme-selector-container');
    const characteristicsDisplay = document.getElementById('persona-characteristics-display');

    if (selectedPersona === 'custom') {
        customControls.style.display = 'block';
        themeSelectorContainer.style.display = 'block';
        characteristicsDisplay.style.display = 'none';
        
        const savedSettings = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
        if (savedSettings) {
            const currentEmoji = savedSettings.stickFigureEmoji || '🦹‍♂️';
            emojiInput.value = currentEmoji;
            setBackgroundMusicUrl(EMOJI_MUSIC_MAP[currentEmoji] || DEFAULT_MUSIC_URL);
            
            obstacleFrequencyPercent = savedSettings.obstacleFrequencyPercent || 20;
            document.getElementById('obstacleFrequency').value = obstacleFrequencyPercent;
            frequencyValueSpan.textContent = `${obstacleFrequencyPercent}%`;
            
            const skillRadio = document.querySelector(`input[name="gameSkillLevel"][value="${savedSettings.currentSkillLevel || 'Rookie'}"]`);
            if (skillRadio) skillRadio.checked = true;
            
            dataInput.value = savedSettings.milestoneData || defaultDataString.trim();
            eventDataInput.value = savedSettings.eventData || defaultEventDataString.trim();
        }
    } else {
        customControls.style.display = 'none';
        themeSelectorContainer.style.display = 'none';
        characteristicsDisplay.style.display = 'block';

        const persona = personas[selectedPersona];
        stickFigureEmoji = persona.emoji;
        currentSkillLevel = persona.skillLevel;
        obstacleFrequencyPercent = persona.obstacleFrequencyPercent;
        document.getElementById('obstacleFrequency').value = obstacleFrequencyPercent;
        frequencyValueSpan.textContent = `${obstacleFrequencyPercent}%`;

        // Populate characteristics display
        characteristicsDisplay.innerHTML = `
            <p class="text-sm text-gray-600"><strong class="font-semibold text-gray-800">Trait:</strong> ${persona.financialTrait}</p>
            <p class="text-sm text-gray-600"><strong class="font-semibold text-gray-800">Discipline:</strong> ${persona.financialDisciplineLevel}</p>
            <p class="text-sm text-gray-600"><strong class="font-semibold text-gray-800">Skill Level:</strong> ${persona.skillLevel}</p>
            <p class="text-sm text-gray-600"><strong class="font-semibold text-gray-800">Obstacle Freq:</strong> ${persona.obstacleFrequencyPercent}%</p>
        `;

        // Set theme and music
        selectedTheme = persona.theme;
        themeSelector.value = selectedTheme;
        setTheme(selectedTheme);
        setBackgroundMusicUrl(persona.music);

        try {
            const milestoneResponse = await fetch(`data/personas/${selectedPersona}/milestones.json`);
            const eventResponse = await fetch(`data/personas/${selectedPersona}/events.json`);
            if (!milestoneResponse.ok || !eventResponse.ok) throw new Error(`Failed to fetch persona data for ${selectedPersona}`);
            const milestoneData = await milestoneResponse.json();
            const eventData = await eventResponse.json();
            dataInput.value = milestoneData.milestones.join('\n');
            eventDataInput.value = eventData.events.join('\n');
        } catch (error) {
            console.error('Error loading persona data:', error);
            dataMessage.textContent = `Error loading data for ${persona.name}.`;
            dataMessage.style.color = 'red';
            dataInput.value = defaultDataString.trim();
            eventDataInput.value = defaultEventDataString.trim();
        }
    }
    loadCustomData(doSave);
}

export function handleThemeChange(event) {
    selectedTheme = event.target.value;
    setTheme(selectedTheme);
    saveSettings();
}

export function handleCustomPersonaChange(event) {
    if (event.target.id === 'emojiInput') {
        stickFigureEmoji = event.target.value.trim().length > 0 ? event.target.value.trim().slice(0, 2) : '🦹‍♂️';
        setBackgroundMusicUrl(EMOJI_MUSIC_MAP[stickFigureEmoji] || DEFAULT_MUSIC_URL);
    } else if (event.target.name === 'gameSkillLevel' && event.target.checked) {
        currentSkillLevel = event.target.value;
        const settings = DIFFICULTY_SETTINGS[currentSkillLevel];
        state.manualJumpHeight = settings.manualJumpHeight;
        state.manualJumpDurationMs = settings.manualJumpDurationMs;
        state.COLLISION_RANGE_X = settings.COLLISION_RANGE_X;
        state.acceleratorFrequencyPercent = settings.ACCELERATOR_FREQUENCY_PERCENT;
    }
    saveSettings();
}

export function selectSuggestedEmoji(emoji) {
    emojiInput.value = emoji;
    stickFigureEmoji = emoji;
    setBackgroundMusicUrl(EMOJI_MUSIC_MAP[emoji] || DEFAULT_MUSIC_URL);
    saveSettings();
}

export function setupSuggestedEmojis() {
    const suggestedEmojiList = ['🧟', '🥷', '🦁', '💃', '🐶', '🚀', '👽', '👨‍🚀'];
    const suggestedEmojisContainer = document.getElementById('suggestedEmojis');
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

export function displayHighScores() {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORE_KEY)) || {};
    highScoresContainer.innerHTML = '';
    ['Rookie', 'Novice', 'Pro'].forEach(level => {
        const score = highScores[level];
        const scoreCard = document.createElement('div');
        scoreCard.className = 'p-3 bg-gray-100 rounded-lg';
        let content;
        if (score) {
            const isFlawless = score.hits === 0;
            content = `<div class="flex justify-between items-center"><div><span class="font-bold text-lg text-gray-700">${level}</span>${isFlawless ? '<span class="text-yellow-500 ml-2">🏆 Flawless!</span>' : ''}</div><div class="text-right"><span class="text-2xl">${score.emoji}</span></div></div><div class="text-sm text-gray-600 mt-1"><span>Days: <strong>${score.days.toLocaleString()}</strong></span> | <span>Hits: <strong>${score.hits}</strong></span> | <span>Speed: <strong>${score.speed.toFixed(1)}x</strong></span></div>`;
        } else {
            content = `<div class="font-bold text-lg text-gray-500">${level}</div><div class="text-sm text-gray-400 mt-1">No record yet.</div>`;
        }
        scoreCard.innerHTML = content;
        highScoresContainer.appendChild(scoreCard);
    });
}

export function updateObstacleEmoji(event) {
    obstacleEmoji = event.target.value.trim().length > 0 ? event.target.value.trim().slice(0, 2) : '🐌';
    saveSettings();
}

export function handleFrequencyChange(event) {
    obstacleFrequencyPercent = parseInt(event.target.value, 10);
    frequencyValueSpan.textContent = `${obstacleFrequencyPercent}%`;
    saveSettings();
}

export function handlePowerUpToggle(event) {
    enableRandomPowerUps = event.target.checked;
    saveSettings();
}

export function handleSpeedChange(event) {
    if (event.target.name === 'gameSpeed' && event.target.checked) {
        intendedSpeedMultiplier = parseFloat(event.target.value);
        saveSettings();
    }
}

export function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('tab-button-active');
        button.classList.add('tab-button-inactive');
    });
    document.getElementById(tabId + 'Tab').classList.remove('hidden');
    document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('tab-button-active');
}

export function loadCustomData(doSave = true) {
    console.log("-> loadCustomData: Attempting to load custom data.");
    const customMilestoneData = parseData(dataInput.value);
    if (!customMilestoneData || Object.keys(customMilestoneData).length < 2) {
        dataMessage.textContent = "Error: Please check Milestone Data format. Need at least two valid 'MM/DD/YYYY: VALUE' pairs.";
        dataMessage.style.color = 'red';
        customEvents = {};
        return;
    }
    financialMilestones = customMilestoneData;
    raceSegments = prepareRaceData(financialMilestones);
    const firstMilestoneDate = Object.keys(financialMilestones)[0];
    const customEventData = parseEventData(eventDataInput.value, firstMilestoneDate);
    if (customEventData === null) {
        dataMessage.textContent = "Warning: Custom Event Data format/dates are invalid. Events were not loaded.";
        dataMessage.style.color = 'orange';
        customEvents = {};
    } else {
        customEvents = customEventData;
        dataMessage.textContent = `Data successfully loaded! ${raceSegments.length} milestones and ${Object.values(customEvents).flat().length} custom events ready.`;
        dataMessage.style.color = 'green';
    }
    if (doSave) saveSettings();
}

export async function initializeUIData() {
    populateThemeSelector();
    populatePersonaSelector();
    setupSuggestedEmojis();
    const settingsLoaded = await loadSettings();
    if (!settingsLoaded) {
        try {
            const response = await fetch('milestones.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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
    displayHighScores();
}

export function showResultsScreen(financialMilestones, raceSegments) {
    if (!financialMilestones || Object.keys(financialMilestones).length === 0 || !raceSegments || raceSegments.length === 0) return;
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
    const disableControls = gameRunning && !isPaused;
    loadButton.disabled = disableControls;
    obstacleEmojiInput.disabled = disableControls;
    document.getElementById('obstacleFrequency').disabled = disableControls;
    document.getElementById('speedSelector').querySelectorAll('input').forEach(input => input.disabled = disableControls);
    personaSelector.disabled = disableControls;
    document.getElementById('custom-persona-controls').querySelectorAll('input, select').forEach(el => el.disabled = disableControls);
    stopButton.disabled = !gameRunning;
    if (!gameRunning) {
        startButton.disabled = false;
        startButton.textContent = "Start the Heist!";
    } else {
        startButton.disabled = false;
        startButton.textContent = isPaused ? "Unpause (P)" : "Pause (P)";
    }
    if (!gameRunning) dataMessage.textContent = "";
}
