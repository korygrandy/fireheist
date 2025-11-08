// =================================================================
// UI FUNCTIONS
// =================================================================

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
import state from './game-modules/state.js'; // Import the state object

// New UI Module Imports
import { initializeUIData, loadCustomData, financialMilestones, raceSegments, customEvents } from './ui-modules/data.js';
import { debugUnlockAllPersonas } from './ui-modules/debug.js';
import { displayHighScores } from './ui-modules/high-scores.js';
import { updateEmoji, updateObstacleEmoji, handleFrequencyChange, handlePowerUpToggle, handleAutoHurdleToggle, applySkillLevelSettings, handleSkillLevelChange, selectSuggestedEmoji, setupSuggestedEmojis, handleSpeedChange } from './ui-modules/input-handlers.js';
import { populatePersonaSelector, handlePersonaChange, applyPersona } from './ui-modules/persona.js';
import { showResultsScreen, hideResultsScreen } from './ui-modules/results.js';
import { saveSettings, loadSettings, savePlayerStats, loadPlayerStats } from './ui-modules/settings.js';
import { populateThemeSelector, handleThemeChange } from './ui-modules/theme.js';
import { switchTab, toggleFullScreen, exitFullScreenIfActive, updateControlPanelState } from './ui-modules/ui-helpers.js';
import { checkForNewUnlocks, displayUnlockNotification, isPersonaUnlocked, checkSkillUnlockStatus } from './ui-modules/unlocks.js';
import { armorySkills, handleArmorySkillSelection, handleArmorySkillDeselection, populateArmoryItems, displayArmoryUnlockNotification, getSkillUnlockProgress } from './ui-modules/armory.js';







































































export {
    initializeUIData,
    loadCustomData,
    financialMilestones,
    raceSegments,
    customEvents,
    debugUnlockAllPersonas,
    displayHighScores,
    updateEmoji,
    updateObstacleEmoji,
    handleFrequencyChange,
    handlePowerUpToggle,
    handleAutoHurdleToggle,
    applySkillLevelSettings,
    handleSkillLevelChange,
    selectSuggestedEmoji,
    setupSuggestedEmojis,
    handleSpeedChange,
    populatePersonaSelector,
    handlePersonaChange,
    applyPersona,
    showResultsScreen,
    hideResultsScreen,
    saveSettings,
    loadSettings,
    savePlayerStats,
    loadPlayerStats,
    populateThemeSelector,
    handleThemeChange,
    switchTab,
    toggleFullScreen,
    exitFullScreenIfActive,
    updateControlPanelState,
    checkForNewUnlocks,
    displayUnlockNotification,
    isPersonaUnlocked,
    checkSkillUnlockStatus,
    armorySkills,
    handleArmorySkillSelection,
    handleArmorySkillDeselection,
    populateArmoryItems,
    displayArmoryUnlockNotification,
    getSkillUnlockProgress
};


