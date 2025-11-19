import { gameState, setSunAnchorImage } from './state-manager.js';

export function loadSunAnchorImage() {
    if (gameState.sunAnchorImage) {
        return;
    }

    const img = new Image();
    img.onload = () => {
        setSunAnchorImage(img);
    };
    img.src = 'images/sun-anchor.png';
}
