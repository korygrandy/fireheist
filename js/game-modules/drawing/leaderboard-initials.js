// js/game-modules/drawing/leaderboard-initials.js

import { canvas, ctx } from '../../dom-elements.js';
import { gameState } from '../state-manager.js';
import { saveLeaderboardScore, displayLeaderboard } from '../../ui-modules/leaderboard.js';
import { savePersonaLeaderboardScore, displayPersonaLeaderboard } from '../../persona-leaderboard.js';
import { displayDailyChallengeCompletedScreen } from '../../ui-modules/daily-challenge-ui.js';
import { updateDailyChallengeWinStreak, markDailyChallengeAsPlayed } from '../../daily-challenge.js';
import { savePlayerInitials } from '../../ui-modules/settings.js';
import { stopGame } from '../game-controller.js';
import { playAnimationSound } from '../../audio.js';
import { switchTab } from '../../ui-modules/ui-helpers.js';
import * as drawing from '../drawing.js';
import { setTheme } from '../../theme.js';
import { setStickFigureEmoji } from '../state-manager.js';
import { emojiInput, themeSelector } from '../../dom-elements.js';
import { loadDefaultData } from '../../ui-modules/data.js';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BOX_SIZE = 60;
const BOX_SPACING = 20;
const TOTAL_WIDTH = (BOX_SIZE * 3) + (BOX_SPACING * 2);
const START_X = (canvas.width - TOTAL_WIDTH) / 2;
const START_Y = canvas.height / 2 + 80;

function getNextLetter(letter) {
    const index = ALPHABET.indexOf(letter);
    return ALPHABET[(index + 1) % ALPHABET.length];
}

function getPrevLetter(letter) {
    const index = ALPHABET.indexOf(letter);
    return ALPHABET[(index - 1 + ALPHABET.length) % ALPHABET.length];
}

// Centralized input handlers for both keyboard and gamepad
export function cycleInitialLetter(direction) {
    if (!gameState.leaderboardInitials.isActive) return;
    const { initials, selectedIndex } = gameState.leaderboardInitials;
    if (direction === 'up') {
        initials[selectedIndex] = getPrevLetter(initials[selectedIndex]);
    } else if (direction === 'down') {
        initials[selectedIndex] = getNextLetter(initials[selectedIndex]);
    }
    playAnimationSound('keypress');
}

export function changeInitialSlot(direction) {
    if (!gameState.leaderboardInitials.isActive) return;
    const { selectedIndex } = gameState.leaderboardInitials;
    if (direction === 'left') {
        gameState.leaderboardInitials.selectedIndex = (selectedIndex - 1 + 3) % 3;
    } else if (direction === 'right') {
        gameState.leaderboardInitials.selectedIndex = (selectedIndex + 1) % 3;
    }
}

export function confirmInitialSelection() {
    if (!gameState.leaderboardInitials.isActive) return;
    const { initials, selectedIndex } = gameState.leaderboardInitials;

    if (selectedIndex < 2) {
        gameState.leaderboardInitials.selectedIndex++;
    } else {
        savePlayerInitials(initials.join(''));
        const scoreData = {
            days: Math.round(gameState.daysElapsedTotal),
            hits: gameState.hitsCounter,
            persona: gameState.selectedPersona,
            totalIncinerated: gameState.playerStats.consecutiveIncinerations,
            cheated: gameState.cheatsUsed || false
        };
        console.log('-> leaderboard-initials: scoreData:', scoreData);

        playAnimationSound('submit-chime');
        gameState.leaderboardInitials.isActive = false;
        gameState.leaderboardInitials.submitted = true;

        const wasDailyChallenge = gameState.isDailyChallengeActive;

        if (wasDailyChallenge) {
            gameState.showDailyChallengeCompletedOverlay = true;
            drawing.draw(); // Show the overlay

            setTimeout(() => {
                // Hide overlay and save results
                gameState.showDailyChallengeCompletedOverlay = false;
                const newWinStreak = updateDailyChallengeWinStreak(gameState.isVictory);
                const results = { ...scoreData, winStreak: newWinStreak };
                markDailyChallengeAsPlayed(results);
                saveLeaderboardScore(initials.join(''), results);

                // Stop the game, which will show the main UI panels
                stopGame(false);

                // Now update the UI with the completed screen and switch to it
                displayDailyChallengeCompletedScreen(results);
                switchTab('player');

                // Reset to default theme and emoji before redrawing
                setTheme('grass');
                setStickFigureEmoji('🦹‍♂️');
                if (emojiInput) emojiInput.value = '🦹‍♂️';
                if (themeSelector) themeSelector.value = 'grass';
                loadDefaultData();

                // Redraw the canvas in its initial "tips" state
                drawing.setInitialLoad(true);
                drawing.draw();

                // Ensure the main start button is enabled
                const startButton = document.getElementById('startButton');
                if (startButton) {
                    startButton.disabled = false;
                }

            }, 3000);
        } else {
            // This is for persona games
            if (gameState.selectedPersona !== 'custom') {
                savePersonaLeaderboardScore(initials.join(''), scoreData);
            }
            stopGame(false);
            displayLeaderboard();
            displayPersonaLeaderboard();
            switchTab('hallOfFame');
        }
    }
}

export function drawLeaderboardInitials() {
    if (!gameState.leaderboardInitials.isActive) return;

    const { initials, selectedIndex } = gameState.leaderboardInitials;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Draw the three boxes and letters
    for (let i = 0; i < 3; i++) {
        const x = START_X + i * (BOX_SIZE + BOX_SPACING);
        const y = START_Y;

        // Draw box
        ctx.strokeStyle = i === selectedIndex ? '#00FF88' : '#FFFFFF';
        ctx.lineWidth = i === selectedIndex ? 4 : 2;
        ctx.strokeRect(x, y, BOX_SIZE, BOX_SIZE);

        // Draw letter
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px "Courier New", Courier, monospace';
        ctx.fillText(initials[i], x + BOX_SIZE / 2, y + BOX_SIZE / 2);

        // Draw up/down arrows for the selected box
        if (i === selectedIndex) {
            ctx.fillStyle = '#00FF88';
            ctx.font = '24px "Courier New", Courier, monospace';
            ctx.fillText('▲', x + BOX_SIZE / 2, y - 20);
            ctx.fillText('▼', x + BOX_SIZE / 2, y + BOX_SIZE + 20);
        }
    }

    ctx.restore();
}

export function handleLeaderboardInitialsInput(key) {
    if (!gameState.leaderboardInitials.isActive) return;

    switch (key) {
        case 'ArrowUp':
            cycleInitialLetter('up');
            break;
        case 'ArrowDown':
            cycleInitialLetter('down');
            break;
        case 'ArrowLeft':
            changeInitialSlot('left');
            break;
        case 'ArrowRight':
            changeInitialSlot('right');
            break;
        case 'Enter':
            confirmInitialSelection();
            break;
    }
}
