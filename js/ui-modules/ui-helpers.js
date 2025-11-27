import { chartContainer, tableContainer, armoryItemsContainer, emojiInput, obstacleEmojiInput, skillLevelSelector, dataMessage, armoryNewIndicator } from '../dom-elements.js';
import { populateArmoryItems } from './armory.js';
import { gameState, setHasSeenNewArmoryIndicator } from '../game-modules/state-manager.js';
import { savePlayerStats } from './settings.js';
import { playAnimationSound } from '../audio.js';
import { draw } from '../game-modules/drawing.js';

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

// Responsive fullscreen canvas logic
function resizeCanvasForFullscreen() {
    const canvas = document.getElementById('gameCanvas');
    const canvasContainer = document.getElementById('canvas-container');
    const actionButtons = document.getElementById('actionButtons');
    if (!canvas) return;

    // Only apply fullscreen scaling when in fullscreen mode
    if (document.fullscreenElement) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Reserve space for action buttons at the bottom
        const buttonBarHeight = 60; // Height for action buttons
        const gapBetween = 5; // Gap between canvas and buttons
        const availableHeight = windowHeight - buttonBarHeight - gapBetween;
        
        // Aspect ratio bounds: 16:9 to 4:3
        const minAspect = 4 / 3;
        const maxAspect = 16 / 9;
        let targetWidth, targetHeight;
        const windowAspect = windowWidth / availableHeight;

        // Clamp aspect ratio between 16:9 and 4:3
        if (windowAspect > maxAspect) {
            // Window is too wide, limit width
            targetHeight = availableHeight;
            targetWidth = targetHeight * maxAspect;
        } else if (windowAspect < minAspect) {
            // Window is too tall, limit height
            targetWidth = windowWidth;
            targetHeight = targetWidth / minAspect;
        } else {
            // Window aspect is within bounds, fill available space
            targetWidth = windowWidth;
            targetHeight = availableHeight;
        }

        // Calculate vertical centering for canvas + buttons as a unit
        const totalContentHeight = targetHeight + gapBetween + buttonBarHeight;
        const topOffset = Math.max(0, Math.floor((windowHeight - totalContentHeight) / 2));

        // Apply fullscreen canvas sizing
        canvas.width = Math.floor(targetWidth);
        canvas.height = Math.floor(targetHeight);
        canvas.style.width = targetWidth + 'px';
        canvas.style.height = targetHeight + 'px';
        canvas.style.position = 'fixed';
        canvas.style.left = Math.floor((windowWidth - targetWidth) / 2) + 'px';
        canvas.style.top = topOffset + 'px';
        canvas.style.zIndex = '9999';
        canvas.style.backgroundColor = '#111';
        
        // Position action buttons directly below canvas with 5px gap
        if (actionButtons) {
            const buttonTop = topOffset + targetHeight + gapBetween;
            actionButtons.style.position = 'fixed';
            actionButtons.style.top = buttonTop + 'px';
            actionButtons.style.bottom = '';
            actionButtons.style.left = Math.floor((windowWidth - targetWidth) / 2) + 'px';
            actionButtons.style.width = targetWidth + 'px';
            actionButtons.style.zIndex = '10000';
            actionButtons.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            actionButtons.style.padding = '8px 16px';
            actionButtons.style.boxSizing = 'border-box';
            actionButtons.style.borderRadius = '8px';
        }
        
        // Allow canvas to escape container in fullscreen
        if (canvasContainer) {
            canvasContainer.style.overflow = 'visible';
        }
        
        // Redraw the current game state/theme after resizing canvas
        draw();
    } else {
        // Restore canvas to normal (non-fullscreen) state
        canvas.width = 800;
        canvas.height = 400;
        canvas.style.width = '100%';
        canvas.style.height = 'auto';
        canvas.style.position = '';
        canvas.style.left = '';
        canvas.style.top = '';
        canvas.style.zIndex = '';
        canvas.style.backgroundColor = '';
        
        // Restore action buttons to normal state
        if (actionButtons) {
            actionButtons.style.position = '';
            actionButtons.style.top = '';
            actionButtons.style.bottom = '';
            actionButtons.style.left = '';
            actionButtons.style.right = '';
            actionButtons.style.width = '';
            actionButtons.style.zIndex = '';
            actionButtons.style.backgroundColor = '';
            actionButtons.style.padding = '';
            actionButtons.style.boxSizing = '';
            actionButtons.style.borderRadius = '';
        }
        
        // Restore container overflow
        if (canvasContainer) {
            canvasContainer.style.overflow = 'hidden';
        }
        
        // Redraw the current game state/theme after restoring canvas
        draw();
    }
}

document.addEventListener('fullscreenchange', resizeCanvasForFullscreen);
window.addEventListener('resize', () => {
    if (document.fullscreenElement) {
        resizeCanvasForFullscreen();
    }
});

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
