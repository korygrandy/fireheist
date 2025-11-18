import state, { HIGH_SCORE_KEY } from './state.js';
import { displayHighScores } from '../ui-modules/high-scores.js';

export function updateHighScore() {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORE_KEY)) || {};
    const currentScore = {
        days: Math.round(state.daysElapsedTotal),
        hits: state.hitsCounter,
        totalIncinerated: state.obstaclesIncinerated,
        date: new Date().toISOString()
    };

    const existingScore = highScores[state.currentSkillLevel];

    if (!existingScore || currentScore.hits < existingScore.hits || (currentScore.hits === existingScore.hits && currentScore.days < existingScore.days)) {
        highScores[state.currentSkillLevel] = currentScore;
        localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(highScores));
        console.log(`-> updateHighScore: New high score for ${state.currentSkillLevel} saved!`);
        displayHighScores(); // Update the UI immediately
    }
}
