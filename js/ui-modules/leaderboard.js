import { gameState } from '../game-modules/state-manager.js';

const LEADERBOARD_KEY = 'fireHeistLeaderboard';

/**
 * Saves a score to the leaderboard in localStorage.
 * @param {string} initials - The player's initials (3 characters).
 * @param {object} scoreData - The score data (e.g., { days, hits }).
 */
export function saveLeaderboardScore(initials, scoreData) {
    const leaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];

    const newScore = {
        initials: initials.toUpperCase(),
        ...scoreData,
        timestamp: new Date().toISOString()
    };

    leaderboard.push(newScore);

    // Sort by days survived (desc) and then hits (asc)
    leaderboard.sort((a, b) => {
        if (b.days !== a.days) {
            return b.days - a.days;
        }
        return a.hits - b.hits;
    });

    // Keep only the top 10 scores
    const topScores = leaderboard.slice(0, 10);

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(topScores));
    console.log("-> Leaderboard score saved:", newScore);
}

/**
 * Displays the all-time incinerations count.
 */
function displayAllTimeIncinerations() {
    const container = document.getElementById('allTimeIncinerationsContainer');
    if (!container) return;

    const allTimeIncinerations = gameState.playerStats.obstaclesIncinerated || 0;
    container.innerHTML = `<h3 class="text-xl font-semibold text-gray-700 mb-2">All-time incinerations 🔥: ${allTimeIncinerations.toLocaleString()}</h3>`;
}

/**
 * Displays the leaderboard in the Hall of Fame tab.
 */
export function displayLeaderboard() {
    displayAllTimeIncinerations();
    const container = document.getElementById('highScoresContainer');
    if (!container) return;

    const leaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY)) || [];

    if (leaderboard.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No scores yet. Play a Daily Challenge to get on the board!</p>';
        return;
    }

    container.innerHTML = leaderboard.map((score, index) => {
        const cheaterBadge = score.cheated ? '<span class="ml-2 text-xs bg-red-500 text-white px-1 rounded" title="Cheats were used during this run">🎮💀</span>' : '';
        return `
        <div class="flex justify-between items-center p-3 rounded-lg ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}">
            <div class="flex items-center">
                <span class="text-lg font-bold text-gray-700 mr-4">${index + 1}.</span>
                <span class="text-xl font-mono font-bold text-orange-500">${score.initials}</span>${cheaterBadge}
            </div>
            <div class="text-right">
                <p class="font-semibold text-gray-800">${score.days.toLocaleString()} Days</p>
                <p class="text-sm text-red-500">${score.hits} Hits</p>
            </div>
        </div>
    `}).join('');
}
