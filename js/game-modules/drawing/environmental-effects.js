import state from '../state.js';
import { canvas, ctx } from '../../dom-elements.js';

const RAIN_DENSITY = 100; // Number of raindrops
const RAIN_DURATION = 5000; // 5 seconds

// --- Rain Effect Logic ---

export function startRainShower() {
    if (state.environmentalEffects.raindrops.length > 0) return; // Prevent starting a new shower if one is active

    for (let i = 0; i < RAIN_DENSITY; i++) {
        state.environmentalEffects.raindrops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height, // Start off-screen
            length: Math.random() * 20 + 10,
            speed: Math.random() * 5 + 5
        });
    }

    // Set a timer to clear the rain after the specified duration
    setTimeout(() => {
        state.environmentalEffects.raindrops = [];
    }, RAIN_DURATION);
}

function updateGrassThemeEffects(deltaTime) {
    // The deltaTime is not used here for simplicity, but it's good practice to pass it for future physics-based effects.
    for (const drop of state.environmentalEffects.raindrops) {
        drop.y += drop.speed;
        // Reset drop when it goes off-screen
        if (drop.y > canvas.height) {
            drop.y = Math.random() * -canvas.height;
            drop.x = Math.random() * canvas.width;
        }
    }
}

function drawGrassThemeEffects() {
    if (state.environmentalEffects.raindrops.length === 0) return;

    ctx.strokeStyle = 'rgba(174,194,224,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (const drop of state.environmentalEffects.raindrops) {
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length);
    }
    ctx.stroke();
}

// --- Placeholder for Space Theme ---
function updateSpaceThemeEffects(deltaTime) {}
function drawSpaceThemeEffects() {}

// --- Placeholder for Night Theme ---
function updateNightThemeEffects(deltaTime) {}
function drawNightThemeEffects() {}


// --- Manager Functions ---

/**
 * Updates the state of the current theme's environmental effects.
 * This function is called from the main animate() loop.
 * @param {number} deltaTime - Time since the last frame.
 */
export function updateEnvironmentalEffects(deltaTime) {
    switch (state.selectedTheme) {
        case 'grass':
            updateGrassThemeEffects(deltaTime);
            // Trigger rain randomly during gameplay
            if (Math.random() < 0.001 && state.gameRunning) {
                startRainShower();
            }
            break;
        case 'space':
            updateSpaceThemeEffects(deltaTime);
            break;
        case 'night':
            updateNightThemeEffects(deltaTime);
            break;
    }
}

/**
 * Draws the current theme's environmental effects to the canvas.
 * This function is called from the main draw() loop.
 */
export function drawEnvironmentalEffects() {
    switch (state.selectedTheme) {
        case 'grass':
            drawGrassThemeEffects();
            break;
        case 'space':
            drawSpaceThemeEffects();
            break;
        case 'night':
            drawNightThemeEffects();
            break;
    }
}
