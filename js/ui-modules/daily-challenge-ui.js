// =================================================================
// DAILY CHALLENGE - UI
// =================================================================

import { getDailyChallengeData, getDailyChallengeWinStreak } from '../daily-challenge.js';

export function updateDailyChallengeUI(challengeData) {
    const container = document.getElementById('daily-challenge-placeholder');
    if (!container) {
        console.error("-> Daily Challenge UI: Could not find the container element.");
        return;
    }

    const winStreak = getDailyChallengeWinStreak();

    const dailyChallengeHTML = `
        <div class="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-xl font-bold text-gray-800">Daily Challenge</h3>
                <div class="text-sm font-semibold text-orange-500">
                    🔥 Current Win Streak: ${winStreak}
                </div>
            </div>
            <p class="text-sm text-gray-600 mb-4">A unique, randomly generated challenge every day. Good luck!</p>
            <div class="flex justify-center items-center space-x-4 mb-4">
                <div>
                    <span class="text-3xl" title="Daily Theme">${challengeData.themeEmoji}</span>
                    <p class="text-xs text-gray-500">Theme</p>
                </div>
                <div>
                    <span class="text-3xl" title="Your Character">${challengeData.playerEmoji}</span>
                    <p class="text-xs text-gray-500">Runner</p>
                </div>
                <div>
                    <span class="text-3xl" title="Daily Obstacle">${challengeData.obstacleEmoji}</span>
                    <p class="text-xs text-gray-500">Obstacle</p>
                </div>
            </div>
            <button id="startDailyChallengeBtn" class="control-btn primary-btn w-full">Start Daily Challenge</button>
        </div>
    `;

    container.innerHTML = dailyChallengeHTML;
    container.className = ''; // Remove old classes
}

export function displayDailyChallenge() {
    const challengeData = getDailyChallengeData();
    updateDailyChallengeUI(challengeData);
}

export function displayDailyChallengeCompletedScreen(results) {
    const container = document.getElementById('daily-challenge-placeholder');
    if (!container) {
        console.error("-> Daily Challenge UI: Could not find the container element for the completed screen.");
        return;
    }

    const resultsHTML = `
        <div class="text-center p-4 border-2 border-solid border-green-400 rounded-lg bg-green-50">
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-sm font-bold text-green-600">🎉  Challenge Complete! 🎉</h3>
                <div class="text-sm font-semibold text-orange-500">
                    🔥 Win Streak: ${results.winStreak}
                </div>
            </div>
            <p class="text-sm text-gray-600 mb-4">Here's how you did today. Come back tomorrow for a new challenge!</p>
            <div class="flex justify-around items-center space-x-4 mb-4">
                <div>
                    <p class="text-3xl font-bold text-gray-800">${results.days.toLocaleString()}</p>
                    <p class="text-xs text-gray-500">Days Survived</p>
                </div>
                <div>
                    <p class="text-3xl font-bold text-gray-800">${results.hits}</p>
                    <p class="text-xs text-gray-500">Obstacles Hit</p>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = resultsHTML;
}

export function showCountdown(button, callback) {
    button.disabled = true;
    let count = 3;
    button.textContent = count;

    const interval = setInterval(() => {
        count--;
        if (count > 0) {
            button.textContent = count;
        } else if (count === 0) {
            button.textContent = "Go!";
        } else {
            clearInterval(interval);
            callback();
        }
    }, 1000);
}


console.log("-> daily-challenge-ui.js loaded");