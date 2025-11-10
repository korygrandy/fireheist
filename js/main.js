// =================================================================
// MAIN APPLICATION ENTRY POINT
// =================================================================

import { startButton, stopButton, loadButton, emojiInput, obstacleEmojiInput, frequencyRange, speedSelector, soundToggleButton, skillLevelSelector, disableSaveSettings, enablePowerUps, themeSelector, personaSelector, fullscreenToggleButton, header, controlPanel, mainElement, armoryItemsContainer } from './dom-elements.js';

import { initializeUIData, loadCustomData } from './ui-modules/data.js';
import { switchTab, toggleFullScreen, updateControlPanelState } from './ui-modules/ui-helpers.js';
import { setupSuggestedEmojis, updateEmoji, updateObstacleEmoji, handleFrequencyChange, handleSkillLevelChange, handleSpeedChange, handlePowerUpToggle, handleAutoHurdleToggle, applySkillLevelSettings } from './ui-modules/input-handlers.js';
import { debugUnlockAllAchievements, debugEndGame, debugCycleDailyTheme } from './ui-modules/debug.js';
import { savePlayerStats } from './ui-modules/settings.js';
import { checkForNewUnlocks } from './ui-modules/unlocks.js';
import { populateThemeSelector, handleThemeChange } from './ui-modules/theme.js';
import { populatePersonaSelector, handlePersonaChange } from './ui-modules/persona.js';
import { handleArmorySkillSelection, handleArmorySkillDeselection, populateArmoryItems } from './ui-modules/armory.js';
import { startDailyChallengeGame, getDailyChallengeResults } from './daily-challenge.js';
import { displayDailyChallenge, displayDailyChallengeCompletedScreen } from './ui-modules/daily-challenge-ui.js';

import { draw, setInitialLoad } from './game-modules/drawing.js';
import { startGame, stopGame, togglePauseGame } from './game-modules/lifecycle.js';
import { startManualJump, startHurdle, startSpecialMove, startDive, startCorkscrewSpin, startScissorKick, startPhaseDash, startHover, startGroundPound, startCartoonScramble, startMoonwalk, startShockwave, startBackflip, startFrontflip, startHoudini, startMeteorStrike, startFireSpinner, startFieryGroundPound, startFireStomper, startFirestorm, startFireMage, castFireball, startMageSpinner, startFieryHoudini } from './game-modules/actions.js';
import { startThemeEffect } from './game-modules/drawing/environmental-effects.js';
import { gameState, setObstaclesIncinerated, setPlayerEnergy } from './game-modules/state-manager.js';
import { toggleSound, loadMuteSetting, preloadGameStartSound, playGameStartSound, preloadAnimationSounds } from './audio.js';
import { initGamepad } from './game-modules/gamepad.js';

function initializeDailyChallengeUI() {
    const results = getDailyChallengeResults();
    if (results) {
        displayDailyChallengeCompletedScreen(results);
    } else {
        displayDailyChallenge();
    }
    // Event listener is now handled by delegation in DOMContentLoaded
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("-> DOMContentLoaded: Initializing game components.");

    // Delegated event listener for the daily challenge start button
    const controlPanelContainer = document.getElementById('control-panel-container');
    if (controlPanelContainer) {
        controlPanelContainer.addEventListener('click', (event) => {
            if (event.target.id === 'startDailyChallengeBtn') {
                startDailyChallengeGame();
            }
        });
    }

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

    function initializeDebugPanel() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('debug') === 'true') {
            const debugPanel = document.getElementById('debug-panel');
            if (debugPanel) {
                debugPanel.classList.remove('hidden');

                const unlockAllBtn = document.getElementById('debugUnlockAllBtn');
                const setShowDailyResultsBtn = document.getElementById('debugShowDailyResultsBtn');
                const debugWinBtn = document.getElementById('debugWinBtn');
                const debugLoseBtn = document.getElementById('debugLoseBtn');
                const debugCycleThemeBtn = document.getElementById('debugCycleThemeBtn');
                const setIncinerateCountBtn = document.getElementById('debugSetIncinerateCountBtn');
                const incinerateCountInput = document.getElementById('debugIncinerateCountInput');

                function debugSetIncinerationCount(count) {
                    setObstaclesIncinerated(count);
                    checkForNewUnlocks(gameState.playerStats); // Check for unlocks first
                    savePlayerStats(); // Then save the updated stats
                    populatePersonaSelector(); // Re-populate in case this unlocks a persona
                    populateArmoryItems(); // Also refresh the armory view
                    alert(`Obstacle incineration count set to ${count}.`);
                }

                if (unlockAllBtn) {
                    unlockAllBtn.addEventListener('click', debugUnlockAllAchievements);
                }
                if (setShowDailyResultsBtn) {
                    setShowDailyResultsBtn.addEventListener('click', () => {
                        displayDailyChallengeResults({ days: 1234, hits: 5 });
                    });
                }
                if (debugWinBtn) {
                    debugWinBtn.addEventListener('click', () => debugEndGame(true));
                }
                if (debugLoseBtn) {
                    debugLoseBtn.addEventListener('click', () => debugEndGame(false));
                }
                if (debugCycleThemeBtn) {
                    debugCycleThemeBtn.addEventListener('click', debugCycleDailyTheme);
                }
                if (setIncinerateCountBtn && incinerateCountInput) {
                    setIncinerateCountBtn.addEventListener('click', () => {
                        const count = parseInt(incinerateCountInput.value, 10);
                        if (!isNaN(count) && count >= 0) {
                            debugSetIncinerationCount(count);
                        } else {
                            alert('Please enter a valid number.');
                        }
                    });
                }
            }
        }
    }

    loadVersion();
    loadMuteSetting(); // Load mute setting on startup

    // 1. Set up event listeners
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            switchTab(tab);
        });
    });

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
            if (gameState.gameRunning) {
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

    // Armory item selection
    if (armoryItemsContainer) {
        armoryItemsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;

            const action = button.dataset.action;
            if (action === 'select') {
                const skillKey = button.dataset.skillKey;
                handleArmorySkillSelection(skillKey);
            } else if (action === 'unselect') {
                handleArmorySkillDeselection();
            }
        });
    }

    // 2. Load initial UI data, then initialize debug panel
    await initializeUIData();
    preloadGameStartSound();
    preloadAnimationSounds(); // Preload all animation sounds
    initializeDebugPanel(); // Initialize the debug panel AFTER UI data is loaded
    initializeDailyChallengeUI(); // Initialize the Daily Challenge UI after all other UI is ready

    // 3. Set up main buttons and controls
    if (startButton) {
        startButton.addEventListener('click', () => {
            if (gameState.gameRunning) {
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
    if (fullscreenToggleButton) { fullscreenToggleButton.addEventListener('click', toggleFullScreen); }

    // Listen for fullscreen changes to update button text and apply immersive class
    document.addEventListener('fullscreenchange', () => {
        updateControlPanelState(gameState.gameRunning, gameState.isPaused);
        const actionButtons = document.getElementById('actionButtons');
        if (document.fullscreenElement && gameState.gameRunning) {
            document.body.classList.add('game-active-fullscreen');
            header.classList.add('hidden');
            controlPanel.classList.add('hidden');
            actionButtons.classList.add('hidden');
            mainElement.classList.remove('grid', 'lg:grid-cols-3', 'gap-8');
            document.body.style.backgroundColor = '#000';
        } else {
            document.body.classList.remove('game-active-fullscreen');
            header.classList.remove('hidden');
            controlPanel.classList.remove('hidden');
            actionButtons.classList.remove('hidden');
            mainElement.classList.add('grid', 'lg:grid-cols-3', 'gap-8');
            document.body.style.backgroundColor = '';
        }
    });

    // --- JUMP & PAUSE CONTROLS ---

    const skillActionMap = {
        firestorm: startFirestorm,
        fireSpinner: startFireSpinner,
        fieryGroundPound: startFieryGroundPound,
        fireStomper: startFireStomper,
        mageSpinner: startMageSpinner,
        fieryHoudini: startFieryHoudini
        // Add other skills here as they are implemented
    };

    function handleSpecialMove() {
        const activeSkill = gameState.playerStats.activeArmorySkill;
        if (activeSkill && skillActionMap[activeSkill]) {
            skillActionMap[activeSkill](gameState);
        } else {
            // Default action if no skill is selected or if the skill is not in the map
            if (gameState.isFireMageActive) {
                castFireball(gameState);
            } else {
                startFireMage(gameState);
            }
        }
    }

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startManualJump(gameState);
        }
        if (e.code === 'KeyP' && gameState.gameRunning) {
            e.preventDefault();
            togglePauseGame();
        }
        if (e.code === 'KeyJ' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startHurdle(gameState);
        }
        if (e.code === 'KeyK' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            handleSpecialMove();
        }
        if (e.code === 'KeyD' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startDive(gameState);
        }
        if (e.code === 'KeyC' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startCorkscrewSpin(gameState);
        }
        if (e.code === 'KeyS' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startScissorKick(gameState);
        }
        if (e.code === 'KeyV' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startPhaseDash(gameState);
        }
        if (e.code === 'KeyH' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startHover(gameState);
        }
        if (e.code === 'KeyG' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startGroundPound(gameState);
        }
        if (e.code === 'KeyB' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startBackflip(gameState);
        }
        if (e.code === 'KeyM' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startMoonwalk(gameState);
        }
        if (e.code === 'KeyN' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startShockwave(gameState);
        }
        if (e.code === 'KeyZ' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startCartoonScramble(gameState);
        }
        if (e.code === 'KeyF' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startFrontflip(gameState);
        }
        if (e.code === 'KeyI' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startHoudini(gameState);
        }
        if (e.code === 'KeyT' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startMeteorStrike(gameState);
        }
        if (e.code === 'KeyR' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startFireSpinner(gameState);
        }
        if (e.code === 'KeyY' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            startFirestorm(gameState);
        }
        if (e.code === 'KeyU' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            if (gameState.isMageSpinnerActive) {
                castFireball(gameState);
            } else {
                startMageSpinner(gameState);
            }
        }

        // Cheat code for max energy
        if (e.ctrlKey && e.altKey && e.code === 'KeyE') {
            if (gameState.gameRunning && !gameState.isPaused) {
                e.preventDefault();
                setPlayerEnergy(gameState.maxPlayerEnergy);
                console.log("-> CHEAT: Max energy granted!");
            }
        }

        // Debug hotkey for environmental effects
        if (e.code === 'KeyQ' && gameState.gameRunning && !gameState.isPaused) {
            e.preventDefault();
            console.log("-> DEBUG: 'Q' key pressed, calling startThemeEffect...");
            startThemeEffect();
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
        if (!gameState.gameRunning || gameState.isPaused) return;

        touchStartTime = new Date().getTime();
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        // Multi-finger taps
        if (e.touches.length === 5) {
            startShockwave(gameState);
            return;
        }
        if (e.touches.length === 4) {
            startCartoonScramble(gameState);
            return;
        }
        if (e.touches.length === 3) {
            startHoudini(gameState);
            return;
        }
        if (e.touches.length === 2) {
            startDive(gameState);
            return;
        }

        // Long press timer
        longPressTimer = setTimeout(() => {
            startHover(gameState);
        }, 500); // 500ms for long press

    }, { passive: false });

    gameCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        clearTimeout(longPressTimer); // Cancel long press if finger moves
    }, { passive: false });

    gameCanvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearTimeout(longPressTimer); // Cancel long press on touch end
        if (!gameState.gameRunning || gameState.isPaused) return;

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
                    startBackflip(gameState); // Swipe Right
                } else {
                    startMoonwalk(gameState); // Swipe Left
                }
            } else { // Vertical swipe
                if (deltaY > 0) {
                    startGroundPound(gameState); // Swipe Down
                } else {
                    startFrontflip(gameState); // Swipe Up
                }
            }
        } else { // It's a tap
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                // Double tap
                handleSpecialMove();
                lastTap = 0; // Reset lastTap to prevent triple taps
            } else {
                // Single tap
                startManualJump(gameState);
            }
            lastTap = currentTime;
        }
    }, { passive: false });

    // --- END JUMP & PAUSE CONTROLS ---

    frequencyRange.dispatchEvent(new Event('input')); // Trigger initial display of frequency value

    // Use a timeout to ensure the DOM is fully painted before we try to manipulate it
    setTimeout(() => {
        initializeDailyChallengeUI();
    }, 0);

    // Initial draw to show tips overlay
    draw();

    // Initialize the dedicated gamepad polling loop
    initGamepad();

    console.log("-> DOMContentLoaded: Initialization complete. Ready to start.");
});