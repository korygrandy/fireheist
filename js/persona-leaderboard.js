// js/persona-leaderboard.js
import { personas } from './personas.js';

const PERSONA_LEADERBOARD_KEY = 'fireHeistPersonaLeaderboard';

/**
 * Saves a score to the persona leaderboard in localStorage.
 * @param {string} initials - The player's initials (3 characters).
 * @param {object} scoreData - The score data (e.g., { days, hits, persona, totalIncinerated }).
 */
export function savePersonaLeaderboardScore(initials, scoreData) {
    const leaderboard = JSON.parse(localStorage.getItem(PERSONA_LEADERBOARD_KEY)) || [];

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
        if (a.hits !== b.hits) {
            return a.hits - b.hits;
        }
        return (b.totalIncinerated || 0) - (a.totalIncinerated || 0);
    });

    // Keep only the top 5 scores
    const topScores = leaderboard.slice(0, 5);

    localStorage.setItem(PERSONA_LEADERBOARD_KEY, JSON.stringify(topScores));
    console.log("-> Persona Leaderboard score saved:", newScore);
}

/**
 * Displays the persona leaderboard in the Hall of Fame tab.
 */
export function displayPersonaLeaderboard() {
    const container = document.getElementById('personaLeaderboardContainer');
    if (!container) return;

    const leaderboard = JSON.parse(localStorage.getItem(PERSONA_LEADERBOARD_KEY)) || [];
    const playerInitials = localStorage.getItem('fireHeistPlayerInitials');

    if (leaderboard.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No persona scores yet. Play a game with a persona to get on the board!</p>';
        return;
    }

    container.innerHTML = leaderboard.map((score, index) => {
        const isPlayer = playerInitials && score.initials === playerInitials;
        const bgColor = isPlayer ? 'bg-yellow-100' : (index % 2 === 0 ? 'bg-gray-100' : 'bg-white');
        return `
        <div class="flex justify-between items-center p-3 rounded-lg ${bgColor}">
            <div class="flex items-center">
                <span class="text-lg font-bold text-gray-700 mr-4">${index + 1}.</span>
                <span class="text-xl font-mono font-bold text-orange-500">${score.initials}</span>
                <span class="text-lg font-bold text-gray-700 ml-4">${personas[score.persona].emoji}</span>
            </div>
            <div class="text-right">
                <p class="font-semibold text-gray-800">${score.days.toLocaleString()} Days</p>
                <p class="text-sm text-red-500">${score.hits} Hits</p>
                <p class="text-sm text-orange-500">🔥 ${score.totalIncinerated || 0}</p>
                <p class="text-xs text-gray-400">${new Date(score.timestamp).toLocaleDateString()}</p>
            </div>
        </div>
    `}).join('');
}