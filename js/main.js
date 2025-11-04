// =================================================================
// MAIN APPLICATION ENTRY POINT
// =================================================================

import { startButton, stopButton, loadButton, obstacleEmojiInput, frequencyRange, speedSelector, soundToggleButton, disableSaveSettings, enablePowerUps, themeSelector, personaSelector, emojiInput, skillLevelSelector } from './dom-elements.js';
import { updateObstacleEmoji, handleFrequencyChange, handleSpeedChange, switchTab, initializeUIData, handlePowerUpToggle, loadCustomData, handleThemeChange, handlePersonaChange, handleCustomPersonaChange } from './ui.js';
import { draw } from './game-modules/drawing.js';
import { startGame, stopGame, togglePauseGame } from './game-modules/main.js';
import {     startManualJump, startHurdle, startSpecialMove, startPowerStomp, startDive,
    startCorkscrewSpin, startSpinningTop, startScissorKick, startPhaseDash, startHover,
    startGroundPound, startCartoonScramble, startMoonwalk, startShockwave,
    startBackflip, startFrontflip, startHoudini
} from './game-modules/actions.js';
import state from './game-modules/state.js';
import { toggleSound, loadMuteSetting } from './audio.js';

async function loadVersion() {
    try {
        const response = await fetch('version.py');
        const text = await response.text();
        const match = text.match(/APP_VERSION = "(.+)"/);
        if (match) {
            const version = match[1];
            const versionDisplay = document.getElementById('version-display');
            if (versionDisplay) versionDisplay.textContent = `v${version}`;
        }
    } catch (error) {
        console.error('Error loading version:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("-> DOMContentLoaded: Initializing game components.");

    loadVersion();
    loadMuteSetting();

    // --- EVENT LISTENERS ---
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => switchTab(button.getAttribute('data-tab')));
    });

    const infoIcon = document.getElementById('info-icon');
    const infoPanel = document.getElementById('info-panel');
    if (infoIcon && infoPanel) infoIcon.addEventListener('click', () => infoPanel.classList.toggle('hidden'));

    if (personaSelector) personaSelector.addEventListener('change', handlePersonaChange);
    if (emojiInput) emojiInput.addEventListener('input', handleCustomPersonaChange);
    if (skillLevelSelector) skillLevelSelector.addEventListener('change', handleCustomPersonaChange);
    if (obstacleEmojiInput) obstacleEmojiInput.addEventListener('input', updateObstacleEmoji);
    if (speedSelector) speedSelector.addEventListener('change', handleSpeedChange);
    if (frequencyRange) frequencyRange.addEventListener('input', handleFrequencyChange);
    if (themeSelector) themeSelector.addEventListener('change', handleThemeChange);
    if (enablePowerUps) enablePowerUps.addEventListener('change', handlePowerUpToggle);

    if (disableSaveSettings) {
        disableSaveSettings.addEventListener('change', () => {
            if (disableSaveSettings.checked) {
                localStorage.removeItem('fireHeistSettings');
                localStorage.removeItem('fireHeistMuteSetting');
                console.log("-> All settings cleared from localStorage.");
            }
        });
    }

    initializeUIData();

    if (startButton) startButton.addEventListener('click', () => state.gameRunning ? togglePauseGame() : startGame());
    if (stopButton) stopButton.addEventListener('click', () => stopGame(true));
    if (loadButton) loadButton.addEventListener('click', () => loadCustomData());
    if (soundToggleButton) soundToggleButton.addEventListener('click', () => toggleSound(soundToggleButton));

    // --- JUMP & PAUSE CONTROLS ---
    document.addEventListener('keydown', (e) => {
        // Handle pause key separately as it needs to function while the game is paused.
        if (e.code === 'KeyP' && state.gameRunning) {
            e.preventDefault();
            togglePauseGame();
            return;
        }

        if (!state.gameRunning || state.isPaused) return;

        const keyMap = {
            'Space': startManualJump, 'KeyJ': startHurdle,
            'KeyK': startSpecialMove, 'KeyX': startPowerStomp, 'KeyD': startDive,
            'KeyC': startCorkscrewSpin, 'KeyT': startSpinningTop, 'KeyS': startScissorKick, 'KeyV': startPhaseDash,
            'KeyH': startHover, 'KeyG': startGroundPound, 'KeyB': startCartoonScramble,
            'KeyM': startMoonwalk, 'KeyN': startShockwave, 'KeyZ': startBackflip,
            'KeyF': startFrontflip, 'KeyI': startHoudini
        };
        if (keyMap[e.code]) {
            e.preventDefault();
            keyMap[e.code]();
        }
    });

    const gameCanvas = document.getElementById('gameCanvas');
    let touchStartTime = 0, touchStartX = 0, touchStartY = 0, lastTap = 0, longPressTimer;

    gameCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!state.gameRunning || state.isPaused) return;
        touchStartTime = Date.now();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        const touchCount = e.touches.length;
        if (touchCount === 5) { startShockwave(); return; }
        if (touchCount === 4) { startCartoonScramble(); return; }
        if (touchCount === 3) { startHoudini(); return; }
        if (touchCount === 2) { startDive(); return; }
        longPressTimer = setTimeout(startHover, 500);
    }, { passive: false });

    gameCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        clearTimeout(longPressTimer);
    }, { passive: false });

    gameCanvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearTimeout(longPressTimer);
        if (!state.gameRunning || state.isPaused) return;
        const touchDuration = Date.now() - touchStartTime;
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;

        if (touchDuration < 500 && (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30)) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                deltaX > 0 ? startBackflip() : startMoonwalk();
            } else {
                deltaY > 0 ? startPowerStomp() : startFrontflip();
            }
        } else {
            const currentTime = Date.now();
            if (currentTime - lastTap < 300) {
                startPhaseDash();
                lastTap = 0;
            } else {
                startManualJump();
            }
            lastTap = currentTime;
        }
    }, { passive: false });

    frequencyRange.dispatchEvent(new Event('input'));
    draw();
    console.log("-> DOMContentLoaded: Initialization complete. Ready to start.");
});
