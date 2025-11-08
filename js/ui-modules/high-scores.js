import { highScoresContainer } from '../dom-elements.js';

const HIGH_SCORE_KEY = 'fireHeistHighScores';

export function displayHighScores() {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORE_KEY)) || {};
    highScoresContainer.innerHTML = ''; // Clear existing scores

    ['Rookie', 'Novice', 'Pro'].forEach(level => {
        const score = highScores[level];
        const scoreCard = document.createElement('div');
        scoreCard.className = 'p-3 bg-gray-100 rounded-lg';

        let content;
        if (score) {
            const isFlawless = score.hits === 0;
            content = `
                <div class="flex justify-between items-center">
                    <div>
                        <span class="font-bold text-lg text-gray-700">${level}</span>
                        ${isFlawless ? '<span class="text-yellow-500 ml-2">🏆 Flawless!</span>' : ''}
                    </div>
                    <div class="text-right">
                        <span class="text-2xl">${score.emoji}</span>
                    </div>
                </div>
                <div class="text-sm text-gray-600 mt-1">
                    <span>Days: <strong>${score.days.toLocaleString()}</strong></span> | 
                    <span>Hits: <strong>${score.hits}</strong></span> | 
                    <span>Speed: <strong>${score.speed.toFixed(1)}x</strong></span>
                </div>
            `;
        } else {
            content = `
                <div class="font-bold text-lg text-gray-500">${level}</div>
                <div class="text-sm text-gray-400 mt-1">No record yet.</div>
            `;
        }
        scoreCard.innerHTML = content;
        highScoresContainer.appendChild(scoreCard);
    });
}
