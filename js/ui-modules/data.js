import { dataInput, eventDataInput, dataMessage } from '../dom-elements.js';
import { parseData, parseEventData, prepareRaceData } from '../utils.js';
import { defaultDataString, defaultEventDataString } from '../constants.js';
import { loadSettings, loadPlayerStats, savePlayerStats, saveSettings } from './settings.js';
import { exitFullScreenIfActive } from './ui-helpers.js';
import { displayHighScores } from "./high-scores.js";
import { populateThemeSelector } from './theme.js';
import { populatePersonaSelector } from './persona.js';
import { handleAutoHurdleToggle } from './input-handlers.js';
import { armorySkills } from './armory.js';
import { checkSkillUnlockStatus } from './unlocks.js';
import state from '../game-modules/state.js';

export let financialMilestones = {};
export let raceSegments = [];
export let customEvents = {};

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

    state.financialMilestones = customMilestoneData;
    raceSegments = prepareRaceData(state.financialMilestones);
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

    state.raceSegments = raceSegments;
    state.customEvents = customEvents;
    console.log(`-> loadCustomData: ${Object.values(state.customEvents).flat().length} Custom Events loaded.`);

    dataMessage.textContent = `Data successfully loaded! ${state.raceSegments.length} milestones and ${Object.values(state.customEvents).flat().length} custom events ready.`;
    dataMessage.style.color = 'green';
    console.log("-> loadCustomData: Data loaded and game reset for new segments.");
    saveSettings(); // Save the newly loaded custom data
    document.body.classList.remove('game-active-fullscreen'); // Remove immersive class
    exitFullScreenIfActive(); // Exit fullscreen when new data is loaded
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
    state.financialMilestones = parseData(dataInput.value);
    if (state.financialMilestones && Object.keys(state.financialMilestones).length >= 2) {
        state.raceSegments = prepareRaceData(state.financialMilestones);
        const firstMilestoneDate = Object.keys(state.financialMilestones)[0];
        state.customEvents = parseEventData(eventDataInput.value, firstMilestoneDate) || {};
        dataMessage.textContent = `Default data loaded. ${state.raceSegments.length} milestones and ${Object.values(state.customEvents).flat().length} events ready.`;
        dataMessage.style.color = 'green';
    } else {
        dataMessage.textContent = "Error: Default data is invalid. Please check 'milestones.json' or provide valid custom data.";
        dataMessage.style.color = 'red';
        state.financialMilestones = {};
        state.raceSegments = [];
        state.customEvents = {};
    }

    displayHighScores(); // Display high scores on startup
}
