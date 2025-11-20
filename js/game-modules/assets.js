import { setCurrentThemeAnchorImage } from './state-manager.js';
import { themes } from '../theme.js';

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