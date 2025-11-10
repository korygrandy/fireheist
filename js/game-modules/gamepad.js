// js/game-modules/gamepad.js

/**
 * Gamepad Support Module
 *
 * This module handles all logic related to detecting and processing input
 * from a connected gamepad, including both in-game actions and UI navigation.
 */

import { gameState } from './state-manager.js';
import { startManualJump } from './actions.js';
import { togglePauseGame, stopGame } from './lifecycle.js';
import { startFirestorm, startFireSpinner, startFieryGroundPound, startFireStomper, startMageSpinner, startFieryHoudini, castFireball, startFireMage } from './actions.js';

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

window.addEventListener('gamepadconnected', (event) => {
    console.log('-> GAMEPAD CONNECTED:', event.gamepad.id);
    activeGamepad = event.gamepad;
    gamepadConnected = true;
    updateGamepadIndicator();
    if (!gameState.gameRunning) {
        enterUINavigationMode();
    }
});

window.addEventListener('gamepaddisconnected', (event) => {
    console.log('-> GAMEPAD DISCONNECTED:', event.gamepad.id);
    activeGamepad = null;
    gamepadConnected = false;
    updateGamepadIndicator();
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
    const selector = 'button, select, input[type="range"], input[type="radio"], input[type="checkbox"]';
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
    buttonStates = {};
    uiNavigationMode = true;
}

export function exitUINavigationMode() {
    console.log("Exiting UI Navigation Mode");
    buttonStates = {};
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

    } else {
        const buttonMap = {
            0: { action: startManualJump, name: 'A_BUTTON_GAME' },
            2: { action: handleSpecialMove, name: 'X_BUTTON_GAME' },
            8: { action: stopGame, name: 'BACK_BUTTON' },
            9: { action: togglePauseGame, name: 'START_BUTTON' }
        };

        currentGamepad.buttons.forEach((button, index) => {
            const mapping = buttonMap[index];
            if (mapping) {
                const buttonName = mapping.name;
                const isPressed = button.pressed;
                const wasPressed = buttonStates[buttonName] || false;

                if (isPressed && !wasPressed) {
                    if (mapping.action === stopGame || mapping.action === togglePauseGame) {
                        mapping.action();
                    } else if (gameState.gameRunning && !gameState.isPaused) {
                        mapping.action(gameState);
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
        if (Array.from(gamepads).some(g => g)) {
            console.log("-> Gamepad detected on startup, entering UI Navigation Mode.");
            enterUINavigationMode();
        }
    }, 500);

    // Start the dedicated gamepad polling loop
    gamepadLoop();
}