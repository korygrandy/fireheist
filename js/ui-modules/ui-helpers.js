import { chartContainer, tableContainer, armoryItemsContainer, emojiInput, obstacleEmojiInput, skillLevelSelector, dataMessage, armoryNewIndicator } from '../dom-elements.js';
import { populateArmoryItems } from './armory.js';
import { gameState, setHasSeenNewArmoryIndicator } from '../game-modules/state-manager.js';
import { savePlayerStats } from './settings.js';
import { playAnimationSound } from '../audio.js';
import { draw } from '../game-modules/drawing.js';
import { reinitializeUINavigation } from '../game-modules/gamepad.js';

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

    // Get or create fullscreen wrapper
    let fullscreenWrapper = document.getElementById('fullscreen-wrapper');

    // Only apply fullscreen scaling when in fullscreen mode
    if (document.fullscreenElement) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const isLandscape = windowWidth > windowHeight;
        
        // Create fullscreen wrapper if it doesn't exist
        if (!fullscreenWrapper) {
            fullscreenWrapper = document.createElement('div');
            fullscreenWrapper.id = 'fullscreen-wrapper';
            document.body.appendChild(fullscreenWrapper);
        }
        
        // Style the wrapper as a flex container
        fullscreenWrapper.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: #000;
            z-index: 9998;
            overflow: hidden;
        `;
        
        // Move canvas and buttons into wrapper
        fullscreenWrapper.appendChild(canvas);
        if (actionButtons) {
            fullscreenWrapper.appendChild(actionButtons);
        }
        
        // Compact button bar - estimate smaller height for fullscreen
        const buttonBarHeight = isLandscape ? 32 : 40;
        const gapBetween = 4;
        const availableHeight = windowHeight - buttonBarHeight - gapBetween;
        
        // Use 16:9 aspect ratio for canvas
        const targetAspect = 16 / 9;
        let targetWidth, targetHeight;
        
        // Calculate canvas size to fit available space while maintaining aspect ratio
        if (windowWidth / availableHeight > targetAspect) {
            // Screen is wider than 16:9 - fit to height
            targetHeight = availableHeight;
            targetWidth = targetHeight * targetAspect;
        } else {
            // Screen is taller than 16:9 - fit to width
            targetWidth = windowWidth;
            targetHeight = targetWidth / targetAspect;
            // Ensure we don't exceed available height
            if (targetHeight > availableHeight) {
                targetHeight = availableHeight;
                targetWidth = targetHeight * targetAspect;
            }
        }

        // IMPORTANT: Keep canvas internal resolution fixed at 800x450
        // Only scale the CSS display size - this prevents the game from appearing "zoomed in"
        canvas.width = 800;
        canvas.height = 450;
        canvas.style.cssText = `
            width: ${Math.floor(targetWidth)}px;
            height: ${Math.floor(targetHeight)}px;
            flex-shrink: 0;
            background-color: #111;
        `;
        
        // Style action buttons below canvas - compact for fullscreen
        if (actionButtons) {
            actionButtons.style.cssText = `
                position: relative;
                width: ${Math.floor(targetWidth)}px;
                margin-top: 4px;
                padding: ${isLandscape ? '2px 6px' : '4px 8px'};
                background-color: rgba(255, 255, 255, 0.9);
                border-radius: 6px;
                box-sizing: border-box;
                flex-shrink: 0;
                z-index: 10000;
            `;
            
            // Make buttons inside more compact
            const buttons = actionButtons.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.style.cssText = `
                    font-size: ${isLandscape ? '10px' : '12px'};
                    padding: ${isLandscape ? '4px 8px' : '6px 10px'};
                    min-height: unset;
                `;
            });
            
            // Compact the flex container gap
            const flexContainer = actionButtons.querySelector('.flex');
            if (flexContainer) {
                flexContainer.style.gap = isLandscape ? '4px' : '6px';
            }
        }
        
        // Redraw the current game state/theme after resizing canvas
        draw();
    } else {
        // Exit fullscreen - restore elements to original locations
        if (fullscreenWrapper) {
            // Move canvas back to container
            if (canvasContainer && canvas.parentElement === fullscreenWrapper) {
                canvasContainer.insertBefore(canvas, canvasContainer.firstChild);
            }
            // Move buttons back to their original position (after canvas-container)
            const gameResultsArea = document.getElementById('game-results-area');
            if (gameResultsArea && actionButtons && actionButtons.parentElement === fullscreenWrapper) {
                // Insert after canvas-container
                if (canvasContainer && canvasContainer.nextSibling) {
                    gameResultsArea.insertBefore(actionButtons, canvasContainer.nextSibling);
                } else {
                    gameResultsArea.appendChild(actionButtons);
                }
            }
            // Remove the wrapper
            fullscreenWrapper.remove();
        }
        
        // Restore canvas to normal (non-fullscreen) state - 16:9 aspect ratio
        canvas.width = 800;
        canvas.height = 450;
        canvas.style.cssText = 'width: 100%; height: 100%;';
        
        // Restore action buttons and inner buttons to normal state
        if (actionButtons) {
            actionButtons.style.cssText = '';
            
            // Restore button styles
            const buttons = actionButtons.querySelectorAll('button');
            buttons.forEach(btn => {
                btn.style.cssText = '';
            });
            
            // Restore flex container
            const flexContainer = actionButtons.querySelector('.flex');
            if (flexContainer) {
                flexContainer.style.gap = '';
            }
        }
        
        // Restore container overflow
        if (canvasContainer) {
            canvasContainer.style.overflow = 'hidden';
        }
        
        // Redraw the current game state/theme after restoring canvas
        draw();
        
        // Re-initialize gamepad UI navigation after DOM changes
        reinitializeUINavigation();
    }
}

document.addEventListener('fullscreenchange', resizeCanvasForFullscreen);
window.addEventListener('resize', () => {
    if (document.fullscreenElement) {
        resizeCanvasForFullscreen();
    } else {
        // Handle browser zoom - redraw canvas at 16:9 aspect ratio
        const canvas = document.getElementById('gameCanvas');
        const container = document.getElementById('canvas-container');
        if (canvas && container) {
            // Use 16:9 aspect ratio (e.g., 800x450)
            canvas.width = 800;
            canvas.height = 450;
            // CSS will scale it to fit container via width: 100% and aspect-ratio: 16/9
            draw();
        }
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
