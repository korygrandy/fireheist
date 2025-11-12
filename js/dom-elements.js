// =================================================================
// DOM ELEMENTS
// =================================================================

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;
export const startButton = document.getElementById('startButton');
export const stopButton = document.getElementById('stopButton');
export const loadButton = document.getElementById('loadButton');
export const dataInput = document.getElementById('dataInput');
export const eventDataInput = document.getElementById('eventDataInput');
export const chartContainer = document.getElementById('chartContainer');
export const tableContainer = document.getElementById('tableContainer');
export const tableBody = document.getElementById('milestoneTableBody');
export const dataMessage = document.getElementById('dataMessage');
export const emojiInput = document.getElementById('emojiInput');
export const suggestedEmojisContainer = document.getElementById('suggestedEmojis');
export const obstacleEmojiInput = document.getElementById('obstacleEmojiInput');
export const speedSelector = document.getElementById('speedSelector');
export const soundToggleButton = document.getElementById('soundToggleButton');
export const frequencyRange = document.getElementById('obstacleFrequency');
export const frequencyValueSpan = document.getElementById('frequencyValue');
export const skillLevelSelector = document.getElementById('skillLevelSelector');
export const disableSaveSettings = document.getElementById('disableSaveSettings');
export const enablePowerUps = document.getElementById('enablePowerUps');
export const enableAutoHurdle = document.getElementById('enableAutoHurdle');
export const themeSelector = document.getElementById('themeSelector');
export const highScoresContainer = document.getElementById('highScoresContainer');
export const personaSelector = document.getElementById('personaSelector');
export const customPersonaControls = document.getElementById('custom-persona-controls');
export const personaDetailsContainer = document.getElementById('personaDetailsContainer');
export const armoryItemsContainer = document.getElementById('armoryItemsContainer');
export const fullscreenToggleButton = document.getElementById('fullscreenToggleButton');
export const header = document.querySelector('header');
export const controlPanel = document.querySelector('.lg\\:col-span-1');
export const mainElement = document.querySelector('main');

// Skill Upgrade Modal Elements
export const skillUpgradeModal = document.getElementById('skillUpgradeModal');
export const skillModalTitle = document.getElementById('skillModalTitle');
export const skillModalContent = document.getElementById('skillModalContent');
export const closeSkillModalBtn = document.getElementById('closeSkillModalBtn');
export const totalCashDisplay = document.getElementById('totalCashDisplay');