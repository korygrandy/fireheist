// js/game-modules/gamepad.js

/**
 * Gamepad Support Module
 *
 * This module handles all logic related to detecting and processing input
 * from a connected gamepad, including both in-game actions and UI navigation.
 */

import { gameState, setPlayerEnergy } from './state-manager.js';
import { startManualJump } from './actions.js';
import { togglePauseGame, handleExitOrReset } from './game-controller.js';
import { toggleFullScreen } from '../ui-modules/ui-helpers.js';
import { playAnimationSound } from '../audio.js';
import { 
    startFireStomper, 
    castFireball, startMoonwalk, startPhaseDash, 
    startBackflip, startFrontflip, startGroundPound, startHover, 
    startCartoonScramble, startShockwave, startHurdle, startDive,
    startJetPack, startHoudini, startBlinkStrike, startJetstreamDash,
    startEchoSlam,
    handleSpecialMove
} from './actions.js';
import { 
    cycleInitialLetter, 
    changeInitialSlot, 
    confirmInitialSelection 
} from './drawing/leaderboard-initials.js';
import { fieryHoudiniSkill } from './skills/fieryHoudini.js';
import { fireSpinnerSkill } from './skills/fireSpinner.js';
import { firestormSkill } from './skills/firestorm.js';
import { fieryGroundPoundSkill } from './skills/fieryGroundPound.js';
import { fireMageSkill } from './skills/fireMage.js';
import { mageSpinnerSkill } from './skills/mageSpinner.js';
import { fireballRollSkill } from './skills/fireballRoll.js';

let activeGamepad = null;
let gamepadConnected = false;

// --- UI Navigation State ---
let focusableElements = [];
let currentFocusIndex = -1;
let buttonStates = {};


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
    playAnimationSound('gamepad-connected');
    activeGamepad = event.gamepad;
    gamepadConnected = true;
    updateGamepadIndicator();
    updateInfoPanelForGamepad(true);
});

window.addEventListener('gamepaddisconnected', (event) => {
    console.log('-> GAMEPAD DISCONNECTED:', event.gamepad.id);
    playAnimationSound('gamepad-disconnected');
    activeGamepad = null;
    gamepadConnected = false;
    updateGamepadIndicator();
    updateInfoPanelForGamepad(false);
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

export function reinitializeUINavigation() {
    console.log("-> Gamepad: Re-initializing UI navigation state.");
    currentFocusIndex = -1;
    updateFocusableElements();
    setFocus(0);
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

    // --- Global Actions (Pause/Unpause, Reset) ---
    const startButton = currentGamepad.buttons[9] ? currentGamepad.buttons[9].pressed : false;
    const backButton = currentGamepad.buttons[8] ? currentGamepad.buttons[8].pressed : false;

    if (startButton && !buttonStates['START_BUTTON']) {
        if (gameState.gameRunning) {
            togglePauseGame();
        }
    }
    if (backButton && !buttonStates['BACK_BUTTON']) {
        handleExitOrReset();
    }
    buttonStates['START_BUTTON'] = startButton;
    buttonStates['BACK_BUTTON'] = backButton;


    // --- Leaderboard Input Handling ---
    if (gameState.leaderboardInitials.isActive) {
        const dpadBtn_Up = currentGamepad.buttons[12].pressed;
        const dpadBtn_Down = currentGamepad.buttons[13].pressed;
        const dpadBtn_Left = currentGamepad.buttons[14].pressed;
        const dpadBtn_Right = currentGamepad.buttons[15].pressed;
        const aButton = currentGamepad.buttons[0].pressed;

        if (dpadBtn_Up && !buttonStates['DPAD_UP_INITIALS']) { cycleInitialLetter('up'); }
        if (dpadBtn_Down && !buttonStates['DPAD_DOWN_INITIALS']) { cycleInitialLetter('down'); }
        if (dpadBtn_Left && !buttonStates['DPAD_LEFT_INITIALS']) { changeInitialSlot('left'); }
        if (dpadBtn_Right && !buttonStates['DPAD_RIGHT_INITIALS']) { changeInitialSlot('right'); }
        if (aButton && !buttonStates['A_BUTTON_INITIALS']) { confirmInitialSelection(); }

        buttonStates['DPAD_UP_INITIALS'] = dpadBtn_Up;
        buttonStates['DPAD_DOWN_INITIALS'] = dpadBtn_Down;
        buttonStates['DPAD_LEFT_INITIALS'] = dpadBtn_Left;
        buttonStates['DPAD_RIGHT_INITIALS'] = dpadBtn_Right;
        buttonStates['A_BUTTON_INITIALS'] = aButton;
        return; // Prevent other logic
    }

    // --- Determine Mode: UI Navigation or Gameplay ---
    const isUIMode = (!gameState.gameRunning && !gameState.isMiniGameActive) || gameState.isPaused;

    // --- Store Gamepad State for Mini-Game ---
    // This needs to run regardless of UI or Game mode so the mini-game can access it.
    gameState.gamepad = {
        axes: currentGamepad.axes,
        buttons: currentGamepad.buttons
    };

    if (isUIMode) {
        // --- UI Navigation Logic ---
        updateFocusableElements(); // Always re-scan UI elements in this mode
        if (currentFocusIndex >= focusableElements.length) {
             currentFocusIndex = -1; // Reset if focus is out of bounds
        }
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

        if (dpadBtn_Up && !buttonStates['DPAD_UP']) { setFocus((currentFocusIndex - 1 + focusableElements.length) % focusableElements.length); }
        if (dpadBtn_Down && !buttonStates['DPAD_DOWN']) { setFocus((currentFocusIndex + 1) % focusableElements.length); }
        if (aButton && !buttonStates['A_BUTTON_UI']) {
            if (focusedElement && focusedElement.tagName !== 'SELECT') {
                focusedElement.click();
            }
        }

        buttonStates = {
            ...buttonStates, // Preserve global button states like START_BUTTON
            DPAD_UP: dpadBtn_Up,
            DPAD_DOWN: dpadBtn_Down,
            DPAD_LEFT: dpadBtn_Left,
            DPAD_RIGHT: dpadBtn_Right,
            A_BUTTON_UI: aButton,
        };

    } else {
        // --- In-Game Action Input Handling ---
        if (currentFocusIndex !== -1) {
            focusableElements[currentFocusIndex].classList.remove('gamepad-focus');
            currentFocusIndex = -1;
        }

        const leftBumperPressed = currentGamepad.buttons[4].pressed;
        const rightBumperPressed = currentGamepad.buttons[5].pressed;
        if (leftBumperPressed && rightBumperPressed && !buttonStates['CHEAT_COMBO']) {
            setPlayerEnergy(gameState.maxPlayerEnergy);
            console.log("-> CHEAT: Max energy granted via gamepad!");
        }
        buttonStates['CHEAT_COMBO'] = leftBumperPressed && rightBumperPressed;

        const buttonMap = {
            0: { action: startManualJump, name: 'A_BUTTON_GAME' },
            1: { action: handleSpecialMove, name: 'B_BUTTON_GAME' }, // Armory skill
            2: { action: startJetPack, name: 'X_BUTTON_GAME' }, // Dedicated skill
            3: { action: () => firestormSkill.activate(gameState), name: 'Y_BUTTON_GAME' }, // Dedicated skill
            4: { action: startBackflip, name: 'LB_BUTTON_GAME' },
            5: { action: startFrontflip, name: 'RB_BUTTON_GAME' },
            6: { action: startHoudini, name: 'LT_BUTTON_GAME' },
            7: { action: () => fieryGroundPoundSkill.activate(gameState), name: 'RT_BUTTON_GAME' },
            // 8 is now handled globally
            // 9 is now handled globally
            10: { action: startCartoonScramble, name: 'LSTICK_CLICK_GAME' },
            11: { action: startShockwave, name: 'RSTICK_CLICK_GAME' }
        };

        let newButtonStates = {};
        currentGamepad.buttons.forEach((button, index) => {
            const mapping = buttonMap[index];
            if (mapping) {
                const buttonName = mapping.name;
                const isPressed = button.pressed;
                if (isPressed && !buttonStates[buttonName]) {
                    mapping.action(gameState);
                }
                newButtonStates[buttonName] = isPressed;
            }
        });
        buttonStates = { ...buttonStates, ...newButtonStates };
    }
}

function gamepadLoop() {
    updateGamepadState();
    requestAnimationFrame(gamepadLoop);
}

export function initGamepad() {
    setTimeout(() => {
        const gamepads = navigator.getGamepads();
        const isConnected = Array.from(gamepads).some(g => g);
        if (isConnected) {
            console.log("-> Gamepad detected on startup.");
            activeGamepad = Array.from(gamepads).find(g => g);
            gamepadConnected = true;
            updateGamepadIndicator();
            updateInfoPanelForGamepad(true);
        } else {
            updateInfoPanelForGamepad(false);
        }
    }, 500);
    gamepadLoop();
}