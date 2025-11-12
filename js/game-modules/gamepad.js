// js/game-modules/gamepad.js

/**
 * Gamepad Support Module
 *
 * This module handles all logic related to detecting and processing input
 * from a connected gamepad, including both in-game actions and UI navigation.
 */

import { gameState, setPlayerEnergy } from './state-manager.js';
import { startManualJump } from './actions.js';
import { togglePauseGame, handleExitOrReset } from './lifecycle.js';
import { toggleFullScreen } from '../ui-modules/ui-helpers.js';
import { 
    startFirestorm, startFireSpinner, startFieryGroundPound, 
    startFireStomper, startMageSpinner, startFieryHoudini, 
    castFireball, startFireMage, startMoonwalk, startPhaseDash, 
    startBackflip, startFrontflip, startGroundPound, startHover, 
    startCartoonScramble, startShockwave, startHurdle, startDive,
    startMeteorStrike, startHoudini
} from './actions.js';

let activeGamepad = null;
let gamepadConnected = false;

// --- UI Navigation State ---
let focusableElements = [];
let currentFocusIndex = -1;
let uiNavigationMode = false;
let buttonStates = {};


// --- Game Action Mapping ---
const skillActionMap = {
    firestorm: startFirestorm,
    fireSpinner: startFireSpinner,
    fieryGroundPound: startFieryGroundPound,
    fireStomper: startFireStomper,
    mageSpinner: startMageSpinner,
    fieryHoudini: startFieryHoudini
};

function handleSpecialMove() {
    const activeSkill = gameState.playerStats.activeArmorySkill;
    if (activeSkill && skillActionMap[activeSkill]) {
        skillActionMap[activeSkill](gameState);
    } else {
        if (gameState.isFireMageActive) {
            castFireball(gameState);
        } else {
            startFireMage(gameState);
        }
    }
}


// --- Gamepad Connection Handling ---

function updateInfoPanelForGamepad(isConnected) {
    const keyboardControls = document.getElementById('keyboard-controls');
    const gamepadControls = document.getElementById('gamepad-controls');

    if (keyboardControls && gamepadControls) {
        if (isConnected) {
            keyboardControls.classList.add('hidden');
            gamepadControls.classList.remove('hidden');
        } else {
            keyboardControls.classList.remove('hidden');
            gamepadControls.classList.add('hidden');
        }
    }
}

window.addEventListener('gamepadconnected', (event) => {
    console.log('-> GAMEPAD CONNECTED:', event.gamepad.id);
    activeGamepad = event.gamepad;
    gamepadConnected = true;
    updateGamepadIndicator();
    updateInfoPanelForGamepad(true);
    if (!gameState.gameRunning) {
        enterUINavigationMode();
    }
});

window.addEventListener('gamepaddisconnected', (event) => {
    console.log('-> GAMEPAD DISCONNECTED:', event.gamepad.id);
    activeGamepad = null;
    gamepadConnected = false;
    updateGamepadIndicator();
    updateInfoPanelForGamepad(false);
    exitUINavigationMode();
});

function updateGamepadIndicator() {
    const indicator = document.getElementById('gamepad-indicator');
    if (indicator) {
        indicator.style.display = gamepadConnected ? 'block' : 'none';
    }
}

// --- UI Navigation Logic ---

function updateFocusableElements() {
    const selector = 'button, select, input[type="range"], input[type="radio"], input[type="checkbox"], #info-icon';
    focusableElements = Array.from(document.querySelectorAll(selector)).filter(el => {
        return el.offsetParent !== null && !el.disabled;
    });
}

function setFocus(index) {
    if (currentFocusIndex >= 0 && currentFocusIndex < focusableElements.length) {
        focusableElements[currentFocusIndex].classList.remove('gamepad-focus');
    }
    currentFocusIndex = index;
    if (currentFocusIndex >= 0 && currentFocusIndex < focusableElements.length) {
        const element = focusableElements[currentFocusIndex];
        element.classList.add('gamepad-focus');
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

export function enterUINavigationMode() {
    if (!gamepadConnected) return;
    console.log("Entering UI Navigation Mode");
    buttonStates = {}; // Clear all previous button states
    uiNavigationMode = true;
    // The main loop will now handle updating elements and setting initial focus.
}

export function exitUINavigationMode() {
    console.log("Exiting UI Navigation Mode");
    buttonStates = {}; // Clear all previous button states
    uiNavigationMode = false;
    if (currentFocusIndex >= 0 && currentFocusIndex < focusableElements.length) {
        focusableElements[currentFocusIndex].classList.remove('gamepad-focus');
    }
    currentFocusIndex = -1;
    focusableElements = [];
}


// --- Main Input Polling Function ---

function updateGamepadState() {
    if (!gamepadConnected || !activeGamepad) {
        return;
    }

    const gamepads = navigator.getGamepads();
    const currentGamepad = Array.from(gamepads).find(g => g && g.index === activeGamepad.index);

    if (!currentGamepad) {
        return;
    }

    const shouldBeUIMode = !gameState.gameRunning || gameState.isPaused;
    if (shouldBeUIMode && !uiNavigationMode) {
        enterUINavigationMode();
    } else if (!shouldBeUIMode && uiNavigationMode) {
        exitUINavigationMode();
    }

    if (uiNavigationMode) {
        updateFocusableElements();
        if (currentFocusIndex === -1 && focusableElements.length > 0) {
            setFocus(0);
        }

        const focusedElement = focusableElements[currentFocusIndex];
        const dpadBtn_Up = currentGamepad.buttons[12].pressed;
        const dpadBtn_Down = currentGamepad.buttons[13].pressed;
        const dpadBtn_Left = currentGamepad.buttons[14].pressed;
        const dpadBtn_Right = currentGamepad.buttons[15].pressed;
        const aButton = currentGamepad.buttons[0].pressed;
        const startButton = currentGamepad.buttons[9].pressed;

        if (startButton && !buttonStates['START_BUTTON_UI']) {
            togglePauseGame();
        }

        if (focusedElement && focusedElement.tagName === 'SELECT') {
            if (dpadBtn_Right && !buttonStates['DPAD_RIGHT']) {
                focusedElement.selectedIndex = Math.min(focusedElement.options.length - 1, focusedElement.selectedIndex + 1);
                focusedElement.dispatchEvent(new Event('change'));
            }
            if (dpadBtn_Left && !buttonStates['DPAD_LEFT']) {
                focusedElement.selectedIndex = Math.max(0, focusedElement.selectedIndex - 1);
                focusedElement.dispatchEvent(new Event('change'));
            }
        }

        if (dpadBtn_Up && !buttonStates['DPAD_UP']) {
            const nextIndex = (currentFocusIndex - 1 + focusableElements.length) % focusableElements.length;
            setFocus(nextIndex);
        }
        if (dpadBtn_Down && !buttonStates['DPAD_DOWN']) {
            const nextIndex = (currentFocusIndex + 1) % focusableElements.length;
            setFocus(nextIndex);
        }
        if (aButton && !buttonStates['A_BUTTON_UI']) {
            if (focusedElement && focusedElement.tagName !== 'SELECT') {
                focusedElement.click();
            }
        }

        buttonStates['DPAD_UP'] = dpadBtn_Up;
        buttonStates['DPAD_DOWN'] = dpadBtn_Down;
        buttonStates['DPAD_LEFT'] = dpadBtn_Left;
        buttonStates['DPAD_RIGHT'] = dpadBtn_Right;
        buttonStates['A_BUTTON_UI'] = aButton;
        buttonStates['START_BUTTON_UI'] = startButton;

    } else {
        // --- In-Game Action Input Handling ---

        // Cheat Code: Press Left Bumper (4) and Right Bumper (5) simultaneously for max energy
        const leftBumperPressed = currentGamepad.buttons[4].pressed;
        const rightBumperPressed = currentGamepad.buttons[5].pressed;
        if (leftBumperPressed && rightBumperPressed && !buttonStates['CHEAT_COMBO']) {
            if (gameState.gameRunning && !gameState.isPaused) {
                setPlayerEnergy(gameState.maxPlayerEnergy);
                console.log("-> CHEAT: Max energy granted via gamepad!");
            }
        }
        // Use a combined state to detect a single "chord" press
        buttonStates['CHEAT_COMBO'] = leftBumperPressed && rightBumperPressed;


        const buttonMap = {
            0: { action: startManualJump, name: 'A_BUTTON_GAME', requiresState: true },
            1: { action: handleSpecialMove, name: 'B_BUTTON_GAME', requiresState: true },
            2: { action: startMeteorStrike, name: 'X_BUTTON_GAME', requiresState: true },
            3: { action: startFirestorm, name: 'Y_BUTTON_GAME', requiresState: true },
            4: { action: startBackflip, name: 'LB_BUTTON_GAME', requiresState: true },
            5: { action: startFrontflip, name: 'RB_BUTTON_GAME', requiresState: true },
            6: { action: startHoudini, name: 'LT_BUTTON_GAME', requiresState: true },
            7: { action: startFieryGroundPound, name: 'RT_BUTTON_GAME', requiresState: true },
            8: { action: handleExitOrReset, name: 'BACK_BUTTON', requiresState: false },
            9: { action: togglePauseGame, name: 'START_BUTTON_GAME', requiresState: false },
            10: { action: startCartoonScramble, name: 'LSTICK_CLICK_GAME', requiresState: true },
            11: { action: startShockwave, name: 'RSTICK_CLICK_GAME', requiresState: true }
        };

        currentGamepad.buttons.forEach((button, index) => {
            const mapping = buttonMap[index];
            if (mapping) {
                const buttonName = mapping.name;
                const isPressed = button.pressed;
                const wasPressed = buttonStates[buttonName] || false;

                if (isPressed && !wasPressed) {
                    if (mapping.requiresState) {
                        if (gameState.gameRunning && !gameState.isPaused) {
                            mapping.action(gameState);
                        }
                    } else {
                        mapping.action();
                    }
                }
                buttonStates[buttonName] = isPressed;
            }
        });
    }
}

function gamepadLoop() {
    updateGamepadState();
    requestAnimationFrame(gamepadLoop);
}

export function initGamepad() {
    // Check for already-connected gamepads on startup
    setTimeout(() => {
        const gamepads = navigator.getGamepads();
        const isConnected = Array.from(gamepads).some(g => g);
        if (isConnected) {
            console.log("-> Gamepad detected on startup.");
            activeGamepad = Array.from(gamepads).find(g => g);
            gamepadConnected = true;
            updateGamepadIndicator();
            updateInfoPanelForGamepad(true);
            if (!gameState.gameRunning) {
                enterUINavigationMode();
            }
        } else {
            updateInfoPanelForGamepad(false);
        }
    }, 500);

    // Start the dedicated gamepad polling loop
    gamepadLoop();
}