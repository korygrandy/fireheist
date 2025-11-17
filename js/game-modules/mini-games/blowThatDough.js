import state from '../state.js';
import { canvas } from '../../dom-elements.js';

// --- Constants ---
const FAN_EMOJI = '🌬️';
const GUST_EMOJI = '💨';
const FAN_POWER = 1.5; // Increased power for a satisfying "gust"
const CASH_EMOJI = '💵';
const CASH_VALUE = 10000;
const CASH_SPAWN_INTERVAL = 200; // ms
const MAX_CASH_ITEMS = 50;
const GRAVITY = 0.05; // Lighter gravity
const GUST_DURATION = 150; // ms

// --- State ---
let miniGameState = {
    fan: {
        x: canvas.width / 2,
        y: canvas.height - 50,
        angle: -Math.PI / 2, // Pointing straight up
        size: 80
    },
    cashItems: [],
    collectorZone: { x: canvas.width - 150, y: 0, width: 150, height: 100 },
    ledge: { x: 0, y: canvas.height - 100, width: canvas.width },
    lastSpawnTime: 0,
    score: 0,
    isGusting: false,
    gustTimer: 0,
    isAiming: false, // For mouse/touch input
    isGameOver: false
};

// --- Input Handlers ---
// These are bound/unbound in init/closeResults to keep the logic encapsulated
function handleAimStart(event) {
    event.preventDefault();
    miniGameState.isAiming = true;
    updateAim(event);
}

function handleAimMove(event) {
    if (miniGameState.isAiming) {
        event.preventDefault();
        updateAim(event);
    }
}

function handleAimEnd(event) {
    event.preventDefault();
    if (miniGameState.isAiming) {
        miniGameState.isAiming = false;
        triggerGust();
    }
}

function updateAim(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;
    const mouseX = (clientX - rect.left) * scaleX;
    const mouseY = (clientY - rect.top) * scaleY;

    const dx = mouseX - miniGameState.fan.x;
    const dy = mouseY - miniGameState.fan.y;
    miniGameState.fan.angle = Math.atan2(dy, dx);
}

function triggerGust() {
    if (!miniGameState.isGusting) {
        miniGameState.isGusting = true;
        miniGameState.gustTimer = GUST_DURATION;
        // TODO: Add a "whoosh" sound effect here
    }
}


// --- Core Functions ---

export function init() {
    console.log("Initializing 'Rotational Gust' mini-game...");
    state.isMiniGameActive = true;
    state.miniGameType = 'blowThatDough';
    state.miniGameTimer = 15000;

    miniGameState.cashItems = [];
    miniGameState.score = 0;
    miniGameState.fan.angle = -Math.PI / 2;
    miniGameState.lastSpawnTime = 0;
    miniGameState.isGusting = false;
    miniGameState.gustTimer = 0;
    miniGameState.isGameOver = false;

    // Add event listeners
    canvas.addEventListener('mousedown', handleAimStart, { passive: false });
    canvas.addEventListener('mousemove', handleAimMove, { passive: false });
    canvas.addEventListener('mouseup', handleAimEnd, { passive: false });
    canvas.addEventListener('touchstart', handleAimStart, { passive: false });
    canvas.addEventListener('touchmove', handleAimMove, { passive: false });
    canvas.addEventListener('touchend', handleAimEnd, { passive: false });
}

export function update(deltaTime) {
    if (state.miniGameTimer <= 0 && !miniGameState.isGusting && !miniGameState.isGameOver) {
        endGame();
        return;
    }
    if (miniGameState.isGameOver) return; // Don't update if the game is over

    state.miniGameTimer -= deltaTime;

    // --- Handle Gamepad Input ---
    const GAMEPAD_AXIS_THRESHOLD = 0.2;
    if (state.gamepad) {
        const [xAxis, yAxis] = state.gamepad.axes;
        if (Math.abs(xAxis) > GAMEPAD_AXIS_THRESHOLD || Math.abs(yAxis) > GAMEPAD_AXIS_THRESHOLD) {
            miniGameState.fan.angle = Math.atan2(yAxis, xAxis);
        }
        // Use a button (e.g., right trigger, 'A' button) to gust
        if (state.gamepad.buttons[0].pressed || state.gamepad.buttons[7].pressed) {
            triggerGust();
        }
    }

    // --- Update Gust Timer ---
    if (miniGameState.isGusting) {
        miniGameState.gustTimer -= deltaTime;
        if (miniGameState.gustTimer <= 0) {
            miniGameState.isGusting = false;
        }
    }

    // --- Spawn new cash ---
    const now = performance.now();
    if (now - miniGameState.lastSpawnTime > CASH_SPAWN_INTERVAL && miniGameState.cashItems.length < MAX_CASH_ITEMS) {
        miniGameState.cashItems.push({
            x: Math.random() * (canvas.width - 100) + 50,
            y: -40, // Spawn above the screen
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 2 + 1
        });
        miniGameState.lastSpawnTime = now;
    }

    // --- Update cash items physics ---
    miniGameState.cashItems.forEach((item, index) => {
        // 1. Apply gust force
        if (miniGameState.isGusting) {
            const dx = item.x - miniGameState.fan.x;
            const dy = item.y - miniGameState.fan.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angleToItem = Math.atan2(dy, dx);
            const angleDifference = Math.abs(angleToItem - miniGameState.fan.angle);

            // Check if item is within the "cone" of the gust
            if (angleDifference < Math.PI / 4 && distance < 400) {
                const force = (1 - distance / 400) * FAN_POWER;
                item.vx += Math.cos(miniGameState.fan.angle) * force;
                item.vy += Math.sin(miniGameState.fan.angle) * force;
            }
        }

        // 2. Apply gravity
        item.vy += GRAVITY;

        // 3. Update position
        item.x += item.vx;
        item.y += item.vy;

        // 4. Check for collection
        if (item.y < miniGameState.collectorZone.height && item.x > miniGameState.collectorZone.x) {
            miniGameState.score += CASH_VALUE;
            miniGameState.cashItems.splice(index, 1);
        }
        // 5. Remove if off-screen
        else if (item.y > canvas.height + 50) {
            miniGameState.cashItems.splice(index, 1);
        }
    });
}

function endGame() {
    miniGameState.isGameOver = true;
    state.miniGameBonus = miniGameState.score;
    const miniGameResults = document.getElementById('miniGameResults');
    const miniGameScoreDisplay = document.getElementById('miniGameScoreDisplay');
    const miniGameOverlay = document.getElementById('miniGameOverlay');
    
    if (miniGameScoreDisplay) {
        miniGameScoreDisplay.innerHTML = `Total Haul: <span class="text-green-400">$${miniGameState.score.toLocaleString()}</span>`;
    }
    
    // Stop further updates by ensuring timer is 0
    state.miniGameTimer = 0;

    // Show the results, then start the fade out process
    if (miniGameResults) miniGameResults.classList.remove('hidden');
    
    // After a short delay to show the score, start the fade out
    setTimeout(() => {
        if(miniGameOverlay) miniGameOverlay.classList.add('fade-out');
        
        // Wait for the fade-out animation to finish before closing
        setTimeout(() => {
            closeResults();
        }, 1000); // Corresponds to the animation duration in style.css
    }, 2000); // Show score for 2 seconds before fading
}

export function draw() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // --- Draw Artistic Background ---
    const gradient = ctx.createRadialGradient(
        miniGameState.fan.x, miniGameState.fan.y, 50,
        miniGameState.fan.x, miniGameState.fan.y, canvas.height
    );
    gradient.addColorStop(0, '#f6ad55'); // Bright, fiery orange
    gradient.addColorStop(1, '#dd6b20'); // Deeper, darker orange
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- Draw Cash Items ---
    ctx.font = '32px Arial';
    miniGameState.cashItems.forEach(item => {
        ctx.fillText(CASH_EMOJI, item.x, item.y);
    });

    // --- Draw Fan ---
    ctx.save();
    ctx.translate(miniGameState.fan.x, miniGameState.fan.y);
    ctx.rotate(miniGameState.fan.angle);
    ctx.font = `${miniGameState.fan.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(FAN_EMOJI, 0, 0);
    ctx.restore();

    // --- Draw Gust ---
    if (miniGameState.isGusting) {
        ctx.save();
        ctx.translate(miniGameState.fan.x, miniGameState.fan.y);
        ctx.rotate(miniGameState.fan.angle);
        const gustProgress = miniGameState.gustTimer / GUST_DURATION;
        ctx.font = `${120 * (1 - gustProgress)}px Arial`;
        ctx.globalAlpha = gustProgress;
        ctx.fillText(GUST_EMOJI, 100 + (50 * (1-gustProgress)), 0);
        ctx.restore();
    }

    // --- Draw UI ---
    ctx.fillStyle = 'white';
    ctx.font = '36px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Time: ${(Math.max(0, state.miniGameTimer) / 1000).toFixed(1)}s`, 20, 50);
    ctx.textAlign = 'right';
    ctx.fillText(`Score: $${miniGameState.score.toLocaleString()}`, canvas.width - 20, 50);

    // --- Draw "Blow That Dough!" Banner ---
    const gameTime = 15000 - state.miniGameTimer;
    if (gameTime < 2000) {
        const bannerProgress = gameTime / 2000;
        const opacity = Math.sin(bannerProgress * Math.PI); // Fade in and out
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.font = 'bold 80px Arial';
        ctx.fillStyle = '#48bb78'; // Tailwind green-500
        ctx.textAlign = 'center';
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 10;
        ctx.fillText('Blow That Dough!', canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
}

export function closeResults() {
    state.isMiniGameActive = false;
    state.miniGameType = null;
    state.lastTime = 0;
    
    // Clean up event listeners
    canvas.removeEventListener('mousedown', handleAimStart);
    canvas.removeEventListener('mousemove', handleAimMove);
    canvas.removeEventListener('mouseup', handleAimEnd);
    canvas.removeEventListener('touchstart', handleAimStart);
    canvas.removeEventListener('touchmove', handleAimMove);
    canvas.removeEventListener('touchend', handleAimEnd);

    // Hide and reset the overlay for the next time
    const miniGameOverlay = document.getElementById('miniGameOverlay');
    if (miniGameOverlay) {
        miniGameOverlay.classList.add('hidden');
        miniGameOverlay.classList.remove('fade-out');
    }
    const miniGameResults = document.getElementById('miniGameResults');
    if (miniGameResults) {
        miniGameResults.classList.add('hidden');
    }
}
