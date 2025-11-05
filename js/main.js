// =================================================================
// MAIN APPLICATION ENTRY POINT
// =================================================================

import { startButton, stopButton, loadButton, emojiInput, obstacleEmojiInput, frequencyRange, speedSelector, soundToggleButton, skillLevelSelector, disableSaveSettings, enablePowerUps, themeSelector, personaSelector } from './dom-elements.js';
import { updateEmoji, updateObstacleEmoji, handleFrequencyChange, handleSkillLevelChange, setupSuggestedEmojis, handleSpeedChange, switchTab, initializeUIData, handlePowerUpToggle, loadCustomData, handleThemeChange, handlePersonaChange } from './ui.js';
import { draw, setInitialLoad } from './game-modules/drawing.js';
import { startGame, stopGame, togglePauseGame } from './game-modules/main.js';
import { startManualJump, startHurdle, startSpecialMove, startDive, startCorkscrewSpin, startScissorKick, startPhaseDash, startHover, startGroundPound, startCartoonScramble, startMoonwalk, startShockwave, startBackflip, startFrontflip, startHoudini, startMeteorStrike } from './game-modules/actions.js';
import state from './game-modules/state.js';
import { toggleSound, loadMuteSetting, preloadGameStartSound, playGameStartSound } from './audio.js';

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

    const infoIcon = document.getElementById('info-icon');
    const infoPanel = document.getElementById('info-panel');

    if (infoIcon && infoPanel) {
        infoIcon.addEventListener('click', () => {
            infoPanel.classList.toggle('hidden');
        });
    }

    if (emojiInput && speedSelector && obstacleEmojiInput && frequencyRange && skillLevelSelector) {
        setupSuggestedEmojis();
        emojiInput.addEventListener('input', updateEmoji);
        obstacleEmojiInput.addEventListener('input', updateObstacleEmoji);
        speedSelector.addEventListener('change', handleSpeedChange);
        frequencyRange.addEventListener('input', handleFrequencyChange);
        skillLevelSelector.addEventListener('change', handleSkillLevelChange);
        themeSelector.addEventListener('change', handleThemeChange);
        personaSelector.addEventListener('change', (event) => {
            handlePersonaChange(event);
            if (state.gameRunning) {
                stopGame(true);
            }
        });
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
    preloadGameStartSound();

    // 3. Set up main buttons and controls
    if (startButton) {
        startButton.addEventListener('click', () => {
            if (state.gameRunning) {
                togglePauseGame();
            } else {
                playGameStartSound();
                startGame();
            }
        });
    }
    if (stopButton) { stopButton.addEventListener('click', () => stopGame(true)); }
    if (loadButton) { loadButton.addEventListener('click', loadCustomData); }
    if (soundToggleButton) { soundToggleButton.addEventListener('click', () => toggleSound(soundToggleButton)); }

    // --- JUMP & PAUSE CONTROLS ---

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startManualJump();
        }
        if (e.code === 'KeyP' && state.gameRunning) {
            e.preventDefault();
            togglePauseGame();
        }
        if (e.code === 'KeyJ' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startHurdle();
        }
        if (e.code === 'KeyK' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startSpecialMove();
        }
        if (e.code === 'KeyD' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startDive();
        }
        if (e.code === 'KeyC' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startCorkscrewSpin();
        }
        if (e.code === 'KeyS' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startScissorKick();
        }
        if (e.code === 'KeyV' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startPhaseDash();
        }
        if (e.code === 'KeyH' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startHover();
        }
        if (e.code === 'KeyG' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startGroundPound();
        }
        if (e.code === 'KeyB' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startBackflip();
        }
        if (e.code === 'KeyM' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startMoonwalk();
        }
        if (e.code === 'KeyN' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startShockwave();
        }
        if (e.code === 'KeyZ' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startCartoonScramble();
        }
        if (e.code === 'KeyF' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startFrontflip();
        }
        if (e.code === 'KeyI' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startHoudini();
        }
        if (e.code === 'KeyT' && state.gameRunning && !state.isPaused) {
            e.preventDefault();
            startMeteorStrike();
        }
    });

    const gameCanvas = document.getElementById('gameCanvas');
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let lastTap = 0;
    let longPressTimer;

    gameCanvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!state.gameRunning || state.isPaused) return;

        touchStartTime = new Date().getTime();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        // Multi-finger taps
        if (e.touches.length === 5) {
            startShockwave();
            return;
        }
        if (e.touches.length === 4) {
            startCartoonScramble();
            return;
        }
        if (e.touches.length === 3) {
            startHoudini();
            return;
        }
        if (e.touches.length === 2) {
            startDive();
            return;
        }

        // Long press timer
        longPressTimer = setTimeout(() => {
            startHover();
        }, 500); // 500ms for long press

    }, { passive: false });

    gameCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        clearTimeout(longPressTimer); // Cancel long press if finger moves
    }, { passive: false });

    gameCanvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearTimeout(longPressTimer); // Cancel long press on touch end
        if (!state.gameRunning || state.isPaused) return;

        const touchEndTime = new Date().getTime();
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const touchDuration = touchEndTime - touchStartTime;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // It's a swipe if moved more than 30px and for less than 500ms
        if (touchDuration < 500 && (Math.abs(deltaX) > 30 || Math.abs(deltaY) > 30)) {
            if (Math.abs(deltaX) > Math.abs(deltaY)) { // Horizontal swipe
                if (deltaX > 0) {
                    startBackflip(); // Swipe Right
                } else {
                    startMoonwalk(); // Swipe Left
                }
            } else { // Vertical swipe
                if (deltaY > 0) {
                    startGroundPound(); // Swipe Down
                } else {
                    startFrontflip(); // Swipe Up
                }
            }
        } else { // It's a tap
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                // Double tap
                startPhaseDash();
                lastTap = 0; // Reset lastTap to prevent triple taps
            } else {
                // Single tap
                startManualJump();
            }
            lastTap = currentTime;
        }
    }, { passive: false });

    // --- END JUMP & PAUSE CONTROLS ---

    frequencyRange.dispatchEvent(new Event('input')); // Trigger initial display of frequency value

    // Initial draw to show tips overlay
    draw();

    console.log("-> DOMContentLoaded: Initialization complete. Ready to start.");
});