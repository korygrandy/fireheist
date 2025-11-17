import state from '../state.js';
import { canvas, miniGameOverlay, predictionAddictionContent, crystalBall, predictUpButton, predictDownButton, predictionOutcome, predictionReward, miniGameResults, miniGameTitle, miniGameScoreDisplay } from '../../dom-elements.js';

// --- Constants ---
const REWARD_AMOUNT = 75000; // Base reward for a correct prediction
const SHAKE_DURATION = 1500; // ms
const RESULT_DISPLAY_DURATION = 2000; // ms

// --- State ---
let miniGameState = {
    isPredicting: false,
    playerPrediction: null, // 'up' or 'down'
    marketOutcome: null, // 'up' or 'down'
    isGameOver: false
};

// --- Event Handlers ---
function handlePredictUp() {
    if (!miniGameState.isPredicting) {
        handlePrediction('up');
    }
}

function handlePredictDown() {
    if (!miniGameState.isPredicting) {
        handlePrediction('down');
    }
}

// --- Core Functions ---

export function init() {
    console.log("Initializing 'Prediction Addiction' mini-game...");
    state.isMiniGameActive = true;
    state.miniGameType = 'predictionAddiction';
    state.miniGameTimer = 0; // Not time-based

    // Reset local state
    miniGameState.isPredicting = false;
    miniGameState.playerPrediction = null;
    miniGameState.marketOutcome = null;
    miniGameState.isGameOver = false;

    // Reset UI
    predictionOutcome.classList.add('hidden');
    predictionReward.classList.add('hidden');
    crystalBall.classList.remove('shake');
    predictUpButton.disabled = false;
    predictDownButton.disabled = false;
    predictUpButton.classList.remove('bg-green-700', 'bg-red-700');
    predictDownButton.classList.remove('bg-green-700', 'bg-red-700');

    // Show Prediction Addiction UI, hide others
    miniGameOverlay.classList.remove('hidden');
    predictionAddictionContent.classList.remove('hidden');
    // Ensure other mini-game content is hidden if it exists
    const blowThatDoughContent = document.getElementById('miniGameContent');
    if (blowThatDoughContent) blowThatDoughContent.classList.add('hidden');
    miniGameResults.classList.add('hidden');

    // Add event listeners
    predictUpButton.addEventListener('click', handlePredictUp);
    predictDownButton.addEventListener('click', handlePredictDown);
}

export function update(deltaTime) {
    // No continuous update logic for this mini-game
}

function handlePrediction(choice) {
    miniGameState.isPredicting = true;
    miniGameState.playerPrediction = choice;

    predictUpButton.disabled = true;
    predictDownButton.disabled = true;

    crystalBall.classList.add('shake');

    setTimeout(() => {
        revealOutcome();
    }, SHAKE_DURATION);
}

function revealOutcome() {
    miniGameState.marketOutcome = Math.random() < 0.5 ? 'up' : 'down'; // 50/50 chance

    let outcomeText = '';
    let reward = 0;

    if (miniGameState.playerPrediction === miniGameState.marketOutcome) {
        outcomeText = `The spirits agree! Market goes ${miniGameState.marketOutcome}!`;
        reward = REWARD_AMOUNT + Math.floor(Math.random() * REWARD_AMOUNT); // Base + random bonus
        predictionOutcome.classList.add('prediction-correct');
        predictionReward.textContent = `You won $${reward.toLocaleString()}!`;
        state.miniGameBonus = reward;
    } else {
        outcomeText = `The spirits disagree! Market goes ${miniGameState.marketOutcome}!`;
        predictionOutcome.classList.add('prediction-incorrect');
        predictionReward.textContent = `You won $0.`;
        state.miniGameBonus = 0;
    }

    predictionOutcome.textContent = outcomeText;
    predictionOutcome.classList.remove('hidden');
    predictionReward.classList.remove('hidden');

    // Update generic results screen
    miniGameTitle.textContent = 'Prediction Result';
    miniGameScoreDisplay.innerHTML = `Total Haul: <span class="${miniGameState.playerPrediction === miniGameState.marketOutcome ? 'text-green-400' : 'text-red-400'}">$${state.miniGameBonus.toLocaleString()}</span>`;
    miniGameResults.classList.remove('hidden');

    // Hide prediction UI and show generic results after a delay
    setTimeout(() => {
        predictionAddictionContent.classList.add('hidden');
        // The generic miniGameResults is already shown above
    }, RESULT_DISPLAY_DURATION);

    // After showing results, fade out the overlay and return to main game
    setTimeout(() => {
        if(miniGameOverlay) miniGameOverlay.classList.add('fade-out');
        setTimeout(() => {
            closeResults();
        }, 1000); // Corresponds to the animation duration in style.css
    }, RESULT_DISPLAY_DURATION + 1000); // Wait for results to be seen + 1 second fade
}

export function draw() {
    // No custom drawing for this mini-game, UI is HTML-based
}

export function closeResults() {
    state.isMiniGameActive = false;
    state.miniGameType = null;
    state.lastTime = 0;

    // Clean up event listeners
    predictUpButton.removeEventListener('click', handlePredictUp);
    predictDownButton.removeEventListener('click', handlePredictDown);

    // Hide and reset the overlay for the next time
    if (miniGameOverlay) {
        miniGameOverlay.classList.add('hidden');
        miniGameOverlay.classList.remove('fade-out');
    }
    if (predictionAddictionContent) {
        predictionAddictionContent.classList.add('hidden');
    }
    if (miniGameResults) {
        miniGameResults.classList.add('hidden');
    }
}
