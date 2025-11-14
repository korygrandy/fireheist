// js/game-modules/drawing/leaderboard-initials.js

import { canvas, ctx } from '../../dom-elements.js';
import { gameState } from '../state-manager.js';
import { saveLeaderboardScore } from '../../ui-modules/leaderboard.js';
import { displayDailyChallengeCompletedScreen } from '../../ui-modules/daily-challenge-ui.js';
import { updateDailyChallengeWinStreak } from '../../daily-challenge.js';
import { stopGame } from '../game-controller.js';

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
        // Advance to the next initial
        gameState.leaderboardInitials.selectedIndex++;
    } else {
        // On the last initial, save the score and end the game
        const scoreData = {
            days: Math.round(gameState.daysElapsedTotal),
            hits: gameState.hitsCounter
        };
        saveLeaderboardScore(initials.join(''), scoreData);

        const newWinStreak = updateDailyChallengeWinStreak(gameState.isVictory);
        const results = { ...scoreData, winStreak: newWinStreak };
        displayDailyChallengeCompletedScreen(results);

        gameState.leaderboardInitials.isActive = false;
        stopGame(false);
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
