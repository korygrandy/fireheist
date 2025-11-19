import state, { HIGH_SCORE_KEY } from './state.js';
import { displayHighScores } from '../ui-modules/high-scores.js';

export function updateHighScore(state) {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORE_KEY)) || [];

    const newScore = {
        emoji: state.stickFigureEmoji,
        days: Math.round(state.daysElapsedTotal),
        hits: state.hitsCounter,
        totalIncinerated: state.playerStats.obstaclesIncinerated,
        date: new Date().toISOString()
    };

    highScores.push(newScore);

    highScores.sort((a, b) => {
        if (b.days !== a.days) {
            return b.days - a.days;
        }
        if (a.hits !== b.hits) {
            return a.hits - b.hits;
        }
        return (b.totalIncinerated || 0) - (a.totalIncinerated || 0);
    });

    const topScores = highScores.slice(0, 5);

    localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(topScores));
    console.log("-> High score saved:", newScore);
}
