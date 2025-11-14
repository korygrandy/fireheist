// Placeholder for persona module
import { personaSelector, customPersonaControls, personaDetailsContainer, emojiInput, frequencyValueSpan, themeSelector } from '../dom-elements.js';
import { personas } from '../personas.js';
import { personaUnlocks } from '../unlocks.js';
import { gameState, setSelectedPersona, setStickFigureEmoji, setCurrentSkillLevel, setObstacleFrequencyPercent, setUserObstacleFrequencyPercent, setSelectedTheme } from '../game-modules/state-manager.js';
import { EMOJI_MUSIC_MAP, DEFAULT_MUSIC_URL } from '../constants.js';
import { initializeMusicPlayer } from '../audio.js';
import { saveSettings } from './settings.js';
import { setTheme } from '../theme.js';
import { applySkillLevelSettings } from './input-handlers.js';

export function applyPersona(personaKey) {
    setSelectedPersona(personaKey);
    const persona = personas[personaKey];

    if (personaKey === 'custom') {
        customPersonaControls.style.display = 'block';
        personaDetailsContainer.classList.add('hidden');
        const cleanEmoji = gameState.stickFigureEmoji.replace(/\uFE0F/g, '');
        const musicUrl = EMOJI_MUSIC_MAP[cleanEmoji] || DEFAULT_MUSIC_URL;
        initializeMusicPlayer(musicUrl);
    } else {
        customPersonaControls.style.display = 'none';
        personaDetailsContainer.classList.remove('hidden');

        // Populate and display persona details
        personaDetailsContainer.innerHTML = `
            <div class="flex items-center">
                <span class="text-2xl mr-3">${persona.emoji}</span>
                <div>
                    <p class="font-bold text-gray-800">${persona.name}</p>
                    <p class="text-gray-600">${persona.financialTrait}</p>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-2 mt-2 text-center">
                <div class="bg-gray-100 p-1 rounded">
                    <p class="text-xs text-gray-500">Discipline</p>
                    <p class="font-semibold text-gray-800">${persona.financialDisciplineLevel}</p>
                </div>
                <div class="bg-gray-100 p-1 rounded">
                    <p class="text-xs text-gray-500">Skill Level</p>
                    <p class="font-semibold text-gray-800">${persona.skillLevel}</p>
                </div>
            </div>
        `;

        // Apply persona settings
        setStickFigureEmoji(persona.emoji);
        emojiInput.value = persona.emoji;

        setCurrentSkillLevel(persona.skillLevel);
        const skillRadio = document.querySelector(`input[name="gameSkillLevel"][value="${gameState.currentSkillLevel}"]`);
        if (skillRadio) skillRadio.checked = true;
        applySkillLevelSettings(gameState.currentSkillLevel);


        setUserObstacleFrequencyPercent(persona.obstacleFrequencyPercent);
        setObstacleFrequencyPercent(Math.round(persona.obstacleFrequencyPercent * 0.75));
        document.getElementById('obstacleFrequency').value = gameState.userObstacleFrequencyPercent;
        frequencyValueSpan.textContent = `${gameState.userObstacleFrequencyPercent}%`;

        setSelectedTheme(persona.theme);
        themeSelector.value = gameState.selectedTheme;
        setTheme(gameState.selectedTheme);

        // Initialize music player with persona's music
        initializeMusicPlayer(persona.music);
    }
    saveSettings();
}

export function handlePersonaChange(event) {
    const personaKey = event.target.value;
    applyPersona(personaKey);
}

export function isPersonaUnlocked(personaKey, stats) {
    const unlock = personaUnlocks[personaKey];
    if (!unlock) {
        return true; // No unlock condition means it's available by default
    }

    if (!stats) {
        return false; // If stats aren't loaded, assume locked
    }

    switch (unlock.condition.type) {
        case 'flawlessRun':
            return stats.flawlessRuns && stats.flawlessRuns[unlock.condition.difficulty];
        case 'incinerateCount':
            return stats.obstaclesIncinerated >= unlock.condition.count;
        default:
            return false;
    }
}

export function populatePersonaSelector() {
    // Clear all existing options
    personaSelector.innerHTML = '';

    // Add the default 'Custom Persona' option first
    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = 'Custom Persona';
    personaSelector.appendChild(customOption);

    for (const key in personas) {
        if (key === 'custom') continue; // Skip custom, it's already added

        const persona = personas[key];
        const unlockInfo = personaUnlocks[key];
        const option = document.createElement('option');
        option.value = key;

        const isUnlocked = isPersonaUnlocked(key, gameState.playerStats);

        // Use innerHTML to structure the content with spans for flexbox styling
        option.innerHTML = `
            <span class="flex justify-between items-center w-full">
                <span class="${!isUnlocked ? 'locked-persona' : ''}">${persona.emoji ? `${persona.emoji} ${persona.name}` : persona.name}</span>
                ${unlockInfo ? `<span class="text-xs">${isUnlocked ? '🔓' : '🔒'}</span>` : ''}
            </span>
        `;

        if (unlockInfo && !isUnlocked) {
            option.disabled = true;
            option.title = `LOCKED: ${unlockInfo.description || 'Unlock condition not specified'}`;
        } else {
            option.disabled = false;
        }

        personaSelector.appendChild(option);
    }
    // Ensure the currently selected persona is still selected after re-population
    personaSelector.value = gameState.selectedPersona;
}
