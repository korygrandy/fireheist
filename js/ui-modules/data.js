import { dataInput, eventDataInput, dataMessage } from '../dom-elements.js';
import { parseData, parseEventData, prepareRaceData } from '../utils.js';
import { defaultDataString, defaultEventDataString } from '../constants.js';
import { loadSettings, loadPlayerStats, savePlayerStats, saveSettings } from './settings.js';
import { exitFullScreenIfActive } from './ui-helpers.js';
import { displayLeaderboard } from "./leaderboard.js";
import { populateThemeSelector } from './theme.js';
import { populatePersonaSelector } from './persona.js';
import { handleAutoHurdleToggle } from './input-handlers.js';
import { populateArmoryItems } from './armory.js';
import { ARMORY_ITEMS } from '../unlocks.js';
import { checkSkillUnlockStatus } from '../unlocks.js';
import { gameState, setFinancialMilestones, setRaceSegments, setCustomEvents, setActiveArmorySkill, setTotalAccumulatedCash } from '../game-modules/state-manager.js';

export let financialMilestones = {};
export let raceSegments = [];
export let customEvents = {};

export function loadCustomData() {
    console.log("-> loadCustomData: Attempting to load custom data.");
    let isDataValid = true;

    // 1. Load and Validate Milestone Data
    const customMilestoneData = parseData(dataInput.value);
    if (!customMilestoneData || Object.keys(customMilestoneData).length < 2) {
        const errorMsg = "Error: Milestone Data is invalid. Please provide at least two 'MM/DD/YYYY: VALUE' pairs.";
        dataMessage.textContent = errorMsg;
        dataMessage.style.color = 'red';
        console.error("-> loadCustomData: Milestone Data loading failed.", errorMsg);

        // Clear game state on error
        setFinancialMilestones({});
        setRaceSegments([]);
        setCustomEvents({});
        isDataValid = false;
    } else {
        setFinancialMilestones(customMilestoneData);
        const raceSegments = prepareRaceData(gameState.financialMilestones);
        setRaceSegments(raceSegments);
        const firstMilestoneDate = Object.keys(gameState.financialMilestones)[0];

        // 2. Load and Validate Custom Event Data
        const customEventData = parseEventData(eventDataInput.value, firstMilestoneDate);
        if (customEventData === null) {
            const errorMsg = "Warning: Custom Event Data is invalid. Events will be ignored.";
            dataMessage.textContent = errorMsg;
            dataMessage.style.color = 'orange'; // Use orange for a warning
            console.warn("-> loadCustomData: Custom Event Data loading failed.", errorMsg);
            setCustomEvents({}); // Clear events but proceed with valid milestones
        } else {
            setCustomEvents(customEventData);
            console.log(`-> loadCustomData: ${Object.values(gameState.customEvents).flat().length} Custom Events loaded.`);
        }
    }

    // 3. Update UI Message and Save Settings
    if (isDataValid) {
        dataMessage.textContent = `Data successfully loaded! ${gameState.raceSegments.length} milestones and ${Object.values(gameState.customEvents).flat().length} custom events ready.`;
        dataMessage.style.color = 'green';
        console.log("-> loadCustomData: Data loaded and game reset for new segments.");
    }

    saveSettings(); // ALWAYS save the current state of the inputs
    document.body.classList.remove('game-active-fullscreen');
    exitFullScreenIfActive();
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
    
    // Ensure the game state's cash reflects the total saved stats for the upgrade system
    if (gameState.playerStats.totalAccumulatedCash !== undefined) {
        setTotalAccumulatedCash(gameState.playerStats.totalAccumulatedCash);
    }

    // Sanity check: If an active skill is somehow no longer unlocked, deselect it.
    const activeSkill = gameState.playerStats.activeArmorySkill;
    if (activeSkill) {
        const skill = ARMORY_ITEMS[activeSkill];
        if (skill && !checkSkillUnlockStatus(skill.unlockCondition, gameState.playerStats)) {
            console.warn(`-> Sanity Check: Active skill '${activeSkill}' is no longer unlocked. Deselecting.`);
            setActiveArmorySkill(null);
            savePlayerStats(); // Re-save the corrected stats
        }
    }

    // Directly parse and prepare the initial data based on what loadSettings() has put into the inputs
    const financialMilestones = parseData(dataInput.value);
    setFinancialMilestones(financialMilestones);
    if (gameState.financialMilestones && Object.keys(gameState.financialMilestones).length >= 2) {
        const raceSegments = prepareRaceData(gameState.financialMilestones);
        setRaceSegments(raceSegments);
        const firstMilestoneDate = Object.keys(gameState.financialMilestones)[0];
        const customEvents = parseEventData(eventDataInput.value, firstMilestoneDate) || {};
        setCustomEvents(customEvents);
        dataMessage.textContent = `Data loaded. ${gameState.raceSegments.length} milestones and ${Object.values(gameState.customEvents).flat().length} events ready.`;
        dataMessage.style.color = 'green';
    } else {
        dataMessage.textContent = "Error: Milestone data is invalid. Please check your input or provide valid data.";
        dataMessage.style.color = 'red';
        setFinancialMilestones({});
        setRaceSegments([]);
        setCustomEvents({});
    }

    displayLeaderboard(); // Display leaderboard on startup
    populateArmoryItems(); // Refresh armory UI
}
