import { emojiInput, obstacleEmojiInput, frequencyValueSpan, suggestedEmojisContainer } from '../dom-elements.js';
import { saveSettings } from './settings.js';
import state from '../game-modules/state.js';
import { DIFFICULTY_SETTINGS, suggestedEmojiList } from '../constants.js';

export function updateEmoji(event) {
    let input = event.target.value.trim();
    state.stickFigureEmoji = input.length > 0 ? input.slice(0, 2) : '🦹‍♂️';
    saveSettings();
}

export function updateObstacleEmoji(event) {
    let input = event.target.value.trim();
    state.obstacleEmoji = input.length > 0 ? input.slice(0, 2) : '🐌';
    saveSettings();
}

export function handleFrequencyChange(event) {
    const userSelectedFrequency = parseInt(event.target.value, 10);
    // Reduce the actual frequency by 25% for gameplay balance
    state.obstacleFrequencyPercent = Math.round(userSelectedFrequency * 0.75);
    frequencyValueSpan.textContent = `${userSelectedFrequency}%`; // UI shows the user's selection
    console.log(`-> handleFrequencyChange: User selected ${userSelectedFrequency}%, actual frequency set to ${state.obstacleFrequencyPercent}%`);
    saveSettings();
}

export function handlePowerUpToggle(event) {
    state.enableRandomPowerUps = event.target.checked;
    saveSettings();
}

export function handleAutoHurdleToggle(event) {
    state.isAutoHurdleEnabled = event.target.checked;
    saveSettings();
}

export function applySkillLevelSettings(level) {
    console.log(`-> applySkillLevelSettings: Setting skill level to ${level}.`);
    const settings = DIFFICULTY_SETTINGS[level];
    if (settings) {
        state.currentSkillLevel = level; // Renamed
        state.acceleratorFrequencyPercent = settings.ACCELERATOR_FREQUENCY_PERCENT; // Set state here
        console.log(`-> applySkillLevelSettings: Jump Height: ${settings.manualJumpHeight}, Duration: ${settings.manualJumpDurationMs}ms, Collision Range: ${settings.COLLISION_RANGE_X}, Accelerator Freq: ${settings.ACCELERATOR_FREQUENCY_PERCENT}%`);
    } else {
        console.error(`Unknown skill level: ${level}.`);
    }
    saveSettings();
}

export function handleSkillLevelChange(event) {
    if (event.target.name === 'gameSkillLevel' && event.target.checked) {
        applySkillLevelSettings(event.target.value);
    }
}

export function selectSuggestedEmoji(emoji) {
    emojiInput.value = emoji;
    state.stickFigureEmoji = emoji;
    saveSettings();
}

export function setupSuggestedEmojis() {
    suggestedEmojiList.forEach(emoji => {
        const span = document.createElement('span');
        span.textContent = emoji;
        span.className = 'emoji-suggestion';
        span.setAttribute('role', 'button');
        span.setAttribute('aria-label', `Use ${emoji} as runner`);
        span.addEventListener('click', () => selectSuggestedEmoji(emoji));
        suggestedEmojisContainer.appendChild(span);
    });
}

export function handleSpeedChange(event) {
    if (event.target.name === 'gameSpeed' && event.target.checked) {
        state.intendedSpeedMultiplier = parseFloat(event.target.value);
        saveSettings();
    }
}
