import { setCurrentThemeAnchorImage } from './state-manager.js';
import { themes } from '../theme.js';
import { ARMORY_ITEMS } from '../unlocks.js';

export const skillIconCache = {};

export function preloadSkillIcons() {
    const promises = [];
    for (const skillKey in ARMORY_ITEMS) {
        const skill = ARMORY_ITEMS[skillKey];
        if (skill.imageUnlocked) {
            const promise = new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    skillIconCache[skillKey] = img;
                    console.log(`-> Loaded skill icon for '${skillKey}'`);
                    resolve();
                };
                img.onerror = () => {
                    console.error(`Failed to load skill icon for '${skillKey}': ${skill.imageUnlocked}`);
                    reject();
                };
                img.src = skill.imageUnlocked;
            });
            promises.push(promise);
        }
    }
    return Promise.all(promises);
}

export function loadThemeAnchorImage(themeName) {
    const theme = themes[themeName];
    if (theme && theme.anchorImage) {
        const img = new Image();
        img.onload = () => {
            setCurrentThemeAnchorImage(img);
        };
        img.onerror = () => {
            console.error(`Failed to load anchor image for theme '${themeName}': ${theme.anchorImage}`);
            setCurrentThemeAnchorImage(null);
        };
        img.src = theme.anchorImage;
    } else {
        // If the theme has no anchor image, set the state to null
        setCurrentThemeAnchorImage(null);
    }
}