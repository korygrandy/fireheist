import { themeSelector } from '../dom-elements.js';
import { themes, setTheme } from '../theme.js';
import { saveSettings } from './settings.js';
import state from '../game-modules/state.js';

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
    state.selectedTheme = themeName;
    setTheme(themeName);
    saveSettings();
}
