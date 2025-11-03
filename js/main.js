// =================================================================
// MAIN APPLICATION ENTRY POINT
// =================================================================

import { startButton, stopButton, loadButton, emojiInput, obstacleEmojiInput, frequencyRange, speedSelector, soundToggleButton, skillLevelSelector, disableSaveSettings, enablePowerUps, themeSelector } from './dom-elements.js';
import { updateEmoji, updateObstacleEmoji, handleFrequencyChange, handleSkillLevelChange, setupSuggestedEmojis, handleSpeedChange, switchTab, initializeUIData, handlePowerUpToggle, loadCustomData, handleThemeChange } from './ui.js';
import { startGame, stopGame, startManualJump, draw, gameRunning, isPaused, togglePauseGame } from './game.js';
import { toggleSound, loadMuteSetting } from './audio.js';

async function loadVersion() {
    try {
        const response = await fetch('version.py');
        const text = await response.text();
        const match = text.match(/APP_VERSION = "(.+)"/);
        if (match) {
            const version = match[1];
            const versionDisplay = document.getElementById('version-display');
            if (versionDisplay) {
                versionDisplay.textContent = `v${version}`;
            }
        }
    } catch (error) {
        console.error('Error loading version:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("-> DOMContentLoaded: Initializing game components.");

    loadVersion();
    loadMuteSetting(); // Load mute setting on startup

    // 1. Set up event listeners

    // --- TAB SWITCHING ---
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    // --- END TAB SWITCHING ---

    if (emojiInput && speedSelector && obstacleEmojiInput && frequencyRange && skillLevelSelector) {
        setupSuggestedEmojis();
        emojiInput.addEventListener('input', updateEmoji);
        obstacleEmojiInput.addEventListener('input', updateObstacleEmoji);
        speedSelector.addEventListener('change', handleSpeedChange);
        frequencyRange.addEventListener('input', handleFrequencyChange);
        skillLevelSelector.addEventListener('change', handleSkillLevelChange);
        themeSelector.addEventListener('change', handleThemeChange);
    }

    if (enablePowerUps) {
        enablePowerUps.addEventListener('change', handlePowerUpToggle);
    }

    if (disableSaveSettings) {
        disableSaveSettings.addEventListener('change', () => {
            if (disableSaveSettings.checked) {
                localStorage.removeItem('fireHeistSettings');
                localStorage.removeItem('fireHeistMuteSetting');
                console.log("-> All settings cleared from localStorage.");
            }
        });
    }

    // 2. Load initial UI data
    initializeUIData();

    // 3. Set up main buttons and controls
    if (startButton) {
        startButton.addEventListener('click', () => {
            if (gameRunning) {
                togglePauseGame();
            } else {
                startGame();
            }
        });
    }
    if (stopButton) { stopButton.addEventListener('click', () => stopGame(true)); }
    if (loadButton) { loadButton.addEventListener('click', loadCustomData); }
    if (soundToggleButton) { soundToggleButton.addEventListener('click', () => toggleSound(soundToggleButton)); }

    // --- JUMP & PAUSE CONTROLS ---

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && gameRunning && !isPaused) {
            e.preventDefault();
            startManualJump();
        }
        if (e.code === 'KeyP' && gameRunning) {
            e.preventDefault();
            togglePauseGame();
        }
    });

    document.getElementById('gameCanvas').addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameRunning && !isPaused) {
            startManualJump();
        }
    }, { passive: false });

    // --- END JUMP & PAUSE CONTROLS ---

    frequencyRange.dispatchEvent(new Event('input')); // Trigger initial display of frequency value

    // Initial draw to show tips overlay
    draw();

    console.log("-> DOMContentLoaded: Initialization complete. Ready to start.");
});