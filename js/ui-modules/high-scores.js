import { highScoresContainer } from '../dom-elements.js';

const HIGH_SCORE_KEY = 'fireHeistHighScores';

export function displayHighScores() {

    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORE_KEY)) || [];

    highScoresContainer.innerHTML = ''; // Clear existing scores



    if (highScores.length === 0) {

        highScoresContainer.innerHTML = '<p class="text-center text-gray-500">No best runs yet. Play a game to get on the board!</p>';

        return;

    }



    highScoresContainer.innerHTML = highScores.map((score, index) => `

        <div class="flex justify-between items-center p-3 rounded-lg ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}">

            <div class="flex items-center">

                <span class="text-lg font-bold text-gray-700 mr-4">${index + 1}.</span>

                <span class="text-2xl">${score.emoji}</span>

            </div>

            <div class="text-right">

                <p class="font-semibold text-gray-800">${score.days.toLocaleString()} Days</p>

                <p class="text-sm text-red-500">${score.hits} Hits</p>

                <p class="text-sm text-orange-500">🔥 ${score.totalIncinerated || 0}</p>

                <p class="text-xs text-gray-400">${new Date(score.date).toLocaleDateString()}</p>

            </div>

        </div>

    `).join('');

}
