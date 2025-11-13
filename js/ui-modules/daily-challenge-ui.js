import { getDailyChallengeConfig } from '../dailyChallengeService.js';
import { getDailyChallengeWinStreak } from '../daily-challenge.js';
import { themes } from '../theme.js';

function createChallengeHTML(config, results = null) {
    const container = document.getElementById('daily-challenge-placeholder');
    if (!container) {
        console.error("-> createChallengeHTML: CRITICAL - Could not find the container element '#daily-challenge-placeholder'.");
        return;
    }

    const winStreak = results ? results.winStreak : getDailyChallengeWinStreak();
    const theme = themes[config.theme];

    const frontContent = `
        <div class="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-xl font-bold text-gray-800">Daily Challenge</h3>
                <div class="text-sm font-semibold text-orange-500">
                    🔥 Current Win Streak: ${winStreak}
                </div>
            </div>
            <p class="text-sm text-gray-600 mb-4">A unique, deterministic challenge every day. Good luck!</p>
            <div class="flex justify-center items-center space-x-4 mb-4">
                <div>
                    <span class="text-3xl" title="Daily Theme">${theme ? theme.name.split(' ')[0] : '❓'}</span>
                    <p class="text-xs text-gray-500">Theme</p>
                </div>
                <div>
                    <span class="text-3xl" title="Your Character">${config.playerEmoji}</span>
                    <p class="text-xs text-gray-500">Runner</p>
                </div>
                <div>
                    <span class="text-3xl" title="Skill Level">${config.skillLevel}</span>
                    <p class="text-xs text-gray-500">Skill</p>
                </div>
            </div>
            <button id="startDailyChallengeBtn" class="control-btn primary-btn w-full">Start Daily Challenge</button>
        </div>
    `;

    const backContent = `
        <div class="text-center p-4 border-2 border-solid border-green-400 rounded-lg bg-green-50">
            <div class="flex justify-between items-center mb-2">
                <h3 class="text-sm font-bold text-green-600">🎉 Challenge Complete! 🎉</h3>
                <div class="text-sm font-semibold text-orange-500">
                    🔥 Win Streak: ${results ? results.winStreak : ''}
                </div>
            </div>
            <p class="text-sm text-gray-600 mb-4">Here's how you did today. Come back tomorrow for a new challenge!</p>
            <div class="flex justify-around items-center space-x-4 mb-4">
                <div>
                    <p class="text-3xl font-bold text-gray-800">${results ? results.days.toLocaleString() : ''}</p>
                    <p class="text-xs text-gray-500">Days Survived</p>
                </div>
                <div>
                    <p class="text-3xl font-bold text-gray-800">${results ? results.hits : ''}</p>
                    <p class="text-xs text-gray-500">Obstacles Hit</p>
                </div>
            </div>
            <div id="next-challenge-countdown" class="text-sm"></div>
        </div>
    `;

    const flipperClass = results ? 'flipper flipped' : 'flipper';
    const finalHTML = `
        <div class="daily-challenge-container">
            <div class="flip-container">
                <div class="${flipperClass}">
                    <div class="front">
                        ${frontContent}
                    </div>
                    <div class="back">
                        ${results ? backContent : ''}
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = finalHTML;

    setTimeout(() => {
        const challengeContainer = container.querySelector('.daily-challenge-container');
        if (challengeContainer) {
            challengeContainer.classList.add('expanded');
        } else {
            console.error("-> createChallengeHTML: Could not find '.daily-challenge-container' to expand.");
        }
    }, 10);
}

export function displayDailyChallenge() {
    const config = getDailyChallengeConfig();
    createChallengeHTML(config);
}

export function displayDailyChallengeCompletedScreen(results) {
    const config = getDailyChallengeConfig();
    createChallengeHTML(config, results);
    startNextChallengeCountdown();
}

function startNextChallengeCountdown() {
    const countdownElement = document.getElementById('next-challenge-countdown');
    if (!countdownElement) return;

    const interval = setInterval(() => {
        const now = new Date();
        const tomorrow = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
        tomorrow.setUTCHours(0, 0, 0, 0);

        const diff = tomorrow.getTime() - now.getTime();

        if (diff <= 0) {
            countdownElement.textContent = "A new challenge is available!";
            clearInterval(interval);
            return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        countdownElement.innerHTML = `Next challenge in: <span class="font-semibold text-gray-700">${hours}h ${mins}m ${secs}s</span>`;
    }, 1000);
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