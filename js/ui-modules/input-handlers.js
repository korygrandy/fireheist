import { playAnimationSound } from '../audio.js';
import { emojiInput, obstacleEmojiInput, frequencyValueSpan, suggestedEmojisContainer } from '../dom-elements.js';
import { saveSettings } from './settings.js';
import { gameState, setStickFigureEmoji, setObstacleEmoji, setObstacleFrequencyPercent, setUserObstacleFrequencyPercent, setEnableRandomPowerUps, setAutoHurdleEnabled, setCurrentSkillLevel, setMaxPlayerEnergy, setPassiveDrainRate, setAcceleratorFrequencyPercent, setIntendedSpeedMultiplier } from '../game-modules/state-manager.js';
import { DIFFICULTY_SETTINGS, suggestedEmojiList } from '../constants.js';
import { debugUnlockAllAchievements } from '../ui-modules/debug.js';
import { populatePersonaSelector } from './persona.js';
import { populateArmoryItems } from './armory.js';

export function updateEmoji(event) {
    let input = event.target.value.trim();
    if (input === '🔥') {
        debugUnlockAllAchievements();
        populatePersonaSelector(); // Refresh personas
        populateArmoryItems(); // Refresh armory
        alert('Cheat Activated: All content unlocked and 1,000,000,000 cash granted!');
    }
    setStickFigureEmoji(input.length > 0 ? input.slice(0, 2) : '🦹‍♂️');
    saveSettings();
}

export function updateObstacleEmoji(event) {
    let input = event.target.value.trim();
    setObstacleEmoji(input.length > 0 ? input.slice(0, 2) : '🐌');
    saveSettings();
}

export function handleFrequencyChange(event) {
    const userSelectedFrequency = parseInt(event.target.value, 10);
    setUserObstacleFrequencyPercent(userSelectedFrequency); // Save the user's actual selection
    // Reduce the actual frequency by 25% for gameplay balance
    setObstacleFrequencyPercent(Math.round(userSelectedFrequency * 0.75));
    frequencyValueSpan.textContent = `${userSelectedFrequency}%`; // UI shows the user's selection
    console.log(`-> handleFrequencyChange: User selected ${userSelectedFrequency}%, actual frequency set to ${gameState.obstacleFrequencyPercent}%`);
    saveSettings();
}

export function handlePowerUpToggle(event) {
    setEnableRandomPowerUps(event.target.checked);
    saveSettings();
}

export function handleAutoHurdleToggle(event) {
    setAutoHurdleEnabled(event.target.checked);
    saveSettings();
}

export function applySkillLevelSettings(level) {
    console.log(`-> applySkillLevelSettings: Setting skill level to ${level}.`);
    const settings = DIFFICULTY_SETTINGS[level];
    if (settings) {
        setCurrentSkillLevel(level); // Renamed
        setMaxPlayerEnergy(settings.maxPlayerEnergy);
        setPassiveDrainRate(settings.passiveDrainRate);
        setAcceleratorFrequencyPercent(settings.ACCELERATOR_FREQUENCY_PERCENT); // Set state here
        console.log(`-> applySkillLevelSettings: Jump Height: ${settings.manualJumpHeight}, Duration: ${settings.manualJumpDurationMs}ms, Collision Range: ${settings.COLLISION_RANGE_X}, Accelerator Freq: ${settings.ACCELERATOR_FREQUENCY_PERCENT}%`);
    } else {
        console.error(`Unknown skill level: ${level}.`);
    }
    saveSettings();
}

export function handleSkillLevelChange(event) {
    if (event.target.name === 'gameSkillLevel' && event.target.checked) {
        playAnimationSound('keypress');
        applySkillLevelSettings(event.target.value);
    }
}

export function selectSuggestedEmoji(emoji) {
    playAnimationSound('keypress');
    emojiInput.value = emoji;
    setStickFigureEmoji(emoji);
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
        playAnimationSound('keypress');
        setIntendedSpeedMultiplier(parseFloat(event.target.value));
        saveSettings();
    }
}
