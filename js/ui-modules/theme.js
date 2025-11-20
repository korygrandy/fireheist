import { themeSelector } from '../dom-elements.js';
import { themes, setTheme } from '../theme.js';
import { saveSettings } from './settings.js';
import { setSelectedTheme } from '../game-modules/state-manager.js';
import { playAmbientSound } from '../audio.js';
import { loadThemeAnchorImage } from '../game-modules/assets.js';

export function populateThemeSelector() {
    for (const key in themes) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = themes[key].name;
        themeSelector.appendChild(option);
    }
}

export function handleThemeChange(event) {
    const themeName = event.target.value;
    setSelectedTheme(themeName);
    setTheme(themeName);
    loadThemeAnchorImage(themeName); // Load the anchor image for the new theme
    playAmbientSound(themeName); // Update the ambient sound to match the new theme
    saveSettings();
}
