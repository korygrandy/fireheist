// =================================================================
// DAILY CHALLENGE - UI
// =================================================================

import { getDailyChallengeData } from '../daily-challenge.js';

export function displayDailyChallenge() {
    const container = document.getElementById('daily-challenge-placeholder');
    if (!container) {
        console.error("-> Daily Challenge UI: Could not find the container element.");
        return;
    }

    const challengeData = getDailyChallengeData();

    const dailyChallengeHTML = `
        <div class="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 class="text-xl font-bold text-gray-800 mb-2">Daily Challenge</h3>
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

    // Replace the entire content of the container
    container.innerHTML = dailyChallengeHTML;
    container.className = ''; // Remove old classes
}

export function displayDailyChallengeResults(stats) {
    const container = document.getElementById('daily-challenge-placeholder');
    if (!container) {
        console.error("-> Daily Challenge UI: Could not find the container element for results.");
        return;
    }

    const resultsHTML = `
        <div class="text-center p-4 border-2 border-solid border-green-400 rounded-lg bg-green-50">
            <h3 class="text-xl font-bold text-green-800 mb-2">🎉 Daily Challenge Completed! 🎉</h3>
            <p class="text-sm text-gray-600 mb-4">Come back tomorrow for a new challenge. Here's how you did:</p>
            <div class="flex justify-around items-center space-x-4 mb-4">
                <div>
                    <p class="text-3xl font-bold text-gray-800">${stats.days.toLocaleString()}</p>
                    <p class="text-xs text-gray-500">Days Survived</p>
                </div>
                <div>
                    <p class="text-3xl font-bold text-gray-800">${stats.hits}</p>
                    <p class="text-xs text-gray-500">Obstacles Hit</p>
                </div>
            </div>
            <p class="text-xs text-gray-400 mt-4">Your regular sandbox settings are now restored.</p>
        </div>
    `;

    container.innerHTML = resultsHTML;
}


console.log("-> daily-challenge-ui.js loaded");