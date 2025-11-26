import { chartContainer, tableContainer, armoryItemsContainer, emojiInput, obstacleEmojiInput, skillLevelSelector, dataMessage, armoryNewIndicator } from '../dom-elements.js';
import { populateArmoryItems } from './armory.js';
import { gameState, setHasSeenNewArmoryIndicator } from '../game-modules/state-manager.js';
import { savePlayerStats } from './settings.js';
import { playAnimationSound } from '../audio.js';

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
        playAnimationSound('armory-tab'); // Play sound when armory tab is clicked

        // Hide the "NEW" indicator and update player stats
        if (gameState.hasNewSkillBeenUnlocked && !gameState.playerStats.hasSeenNewArmoryIndicator) {
            armoryNewIndicator.classList.add('hidden');
            setHasSeenNewArmoryIndicator(true);
            setHasNewSkillBeenUnlocked(false); 
            savePlayerStats(); // Save the change to local storage
        }
    } else if (tabId === 'hallOfFame') {
        playAnimationSound('hof-tab'); // Play sound when Hall of Fame tab is clicked
    } else if (['player', 'gameplay', 'data'].includes(tabId)) {
        playAnimationSound('beep'); // Play beep sound for other tabs
    }
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

export function hideSandboxControls() {
    const tabButtonsContainer = document.getElementById('tab-buttons-container');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabButtonsContainer) {
        tabButtonsContainer.classList.add('hidden');
    }
    tabContents.forEach(tab => {
        tab.classList.add('hidden');
    });
    console.log("-> UI: Sandbox controls hidden for Daily Challenge.");
}

export function showSandboxControls() {
    const tabButtonsContainer = document.getElementById('tab-buttons-container');
    const playerTab = document.getElementById('playerTab');

    if (tabButtonsContainer) {
        tabButtonsContainer.classList.remove('hidden');
    }
    if (playerTab) {
        playerTab.classList.remove('hidden'); // Show the default tab
    }
    // Ensure other tabs are hidden by default, handled by switchTab logic
    console.log("-> UI: Sandbox controls restored.");
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
    if (!gameState.isDailyChallengeActive) {
        stopButton.disabled = !gameRunning;
    }

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
