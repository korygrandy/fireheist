// =================================================================
// GAME LOGIC
// =================================================================

import { canvas, ctx } from './dom-elements.js';
import {
    MS_PER_DAY, MIN_VISUAL_DURATION_MS, MAX_VISUAL_DURATION_MS, VICTORY_DISPLAY_TIME,
    MAX_HURDLE_HEIGHT, HURDLE_FIXED_START_DISTANCE, GROUND_Y, STICK_FIGURE_TOTAL_HEIGHT, JUMP_HEIGHT_RATIO,
    STICK_FIGURE_FIXED_X, FADE_DURATION, COLLISION_DURATION_MS, AUTO_JUMP_START_PROGRESS, AUTO_JUMP_DURATION,
    OBSTACLE_SAFE_ZONE_PROGRESS, CASH_BAG_ANIMATION_DURATION, CASH_BAG_EMOJI, CASH_BAG_FONT_SIZE,
    COUNTER_TARGET_Y, COUNTER_TARGET_X, OBSTACLE_EMOJI_SIZE, OBSTACLE_EMOJI_Y_OFFSET, OBSTACLE_SPAWN_X,
    OBSTACLE_WIDTH, OBSTACLE_HEIGHT, ACCELERATOR_EMOJI_SIZE, ACCELERATOR_EMOJI, ACCELERATOR_BASE_SPEED_BOOST,
    ACCELERATOR_DURATION_MS, DECELERATOR_BASE_SPEED_DEBUFF, DECELERATOR_DURATION_MS, OBSTACLE_BASE_VELOCITY_PX_MS,
    EVENT_PROXIMITY_VISUAL_STEPS, EVENT_POPUP_HEIGHT, DIFFICULTY_SETTINGS, NUM_CLOUDS, CLOUD_SPEED_FACTOR
} from './constants.js';
import { isMuted, backgroundMusic, chaChingSynth, collisionSynth, debuffSynth, initializeMusicPlayer, playChaChing, playCollisionSound, playDebuffSound, playQuackSound, playPowerUpSound } from './audio.js';
import { financialMilestones, raceSegments, customEvents, stickFigureEmoji, obstacleEmoji, obstacleFrequencyPercent, currentSkillLevel, intendedSpeedMultiplier, applySkillLevelSettings, showResultsScreen, hideResultsScreen, updateControlPanelState, displayHighScores, enableRandomPowerUps } from './ui.js';
import { drawChart, generateSummaryTable } from './utils.js';
import { currentTheme } from './theme.js';

// Game State Variables
let activeCustomEvents = []; // Stores events to be triggered in game (by days elapsed)
export let gameRunning = false;
export let isPaused = false;
let currentSegmentIndex = 0;
let segmentProgress = 0;
let lastTime = 0;
let backgroundOffset = 0;
let frameCount = 0;
let accumulatedCash = 0;
let daysCounter = null;
let gameSpeedMultiplier = 1.0; // The CURRENT speed (affected by effects)

const HIGH_SCORE_KEY = 'fireHeistHighScores';

function updateHighScore() {
    const highScores = JSON.parse(localStorage.getItem(HIGH_SCORE_KEY)) || {};
    const currentScore = {
        days: Math.round(daysElapsedTotal),
        hits: hitsCounter,
        emoji: stickFigureEmoji,
        speed: intendedSpeedMultiplier
    };

    const existingScore = highScores[currentSkillLevel];

    if (!existingScore || currentScore.hits < existingScore.hits || (currentScore.hits === existingScore.hits && currentScore.days < existingScore.days)) {
        highScores[currentSkillLevel] = currentScore;
        localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(highScores));
        console.log(`-> updateHighScore: New high score for ${currentSkillLevel} saved!`);
        displayHighScores(); // Update the UI immediately
    }
}

// Modifiable Jump/Collision Constants (from DIFFICULTY_SETTINGS)
let COLLISION_RANGE_X = DIFFICULTY_SETTINGS.Rookie.COLLISION_RANGE_X;
let manualJumpDurationMs = DIFFICULTY_SETTINGS.Rookie.manualJumpDurationMs;
let manualJumpHeight = DIFFICULTY_SETTINGS.Rookie.manualJumpHeight;
let acceleratorFrequencyPercent = DIFFICULTY_SETTINGS.Rookie.ACCELERATOR_FREQUENCY_PERCENT;

// Jump State
let jumpState = { isJumping: false, progress: 0 };
let manualJumpOverride = { isActive: false, startTime: 0, duration: manualJumpDurationMs };

// New Counters
let hitsCounter = 0;
let daysElapsedTotal = 0;
let daysAccumulatedAtSegmentStart = 0;

// New Obstacle & Collision State
let currentObstacle = null;
let isColliding = false;
let collisionDuration = 0;

// New Accelerator State
let currentAccelerator = null;
let isAccelerating = false;
let accelerationDuration = 0;

// NEW DECELERATOR STATE
let isDecelerating = false;
let decelerationDuration = 0;

// NEW PROXIMITY EVENT STATE
let onScreenCustomEvent = null;

// NEW GAME OVER SEQUENCE STATES
let isVictory = false;
let isGameOverSequence = false;
let gameOverSequenceStartTime = 0;

// NEW: Screen flash, turbo boost, and stick figure burst animation states
let screenFlash = { opacity: 0, duration: 0, startTime: 0 };
let turboBoost = { active: false, frame: 0, lastFrameTime: 0 };
let stickFigureBurst = { active: false, duration: 200, startTime: 0, progress: 0, maxOffset: 150 };

// NEW: Grass animation state
const GRASS_ANIMATION_INTERVAL_MS = 200; // Update grass blades every 200ms
let grassAnimationState = { blades: [], lastUpdateTime: 0 };

const clouds = [];
let activeCashBags = [];// =================================================================
// DRAWING FUNCTIONS
// =================================================================

function drawPausedOverlay() {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 48px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    ctx.restore();
}

function drawTipsOverlay() {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);
    ctx.fillStyle = '#00FF88';
    ctx.font = 'bold 30px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('HEIST TIPS & TRICKS', canvas.width / 2, 95);
    ctx.fillStyle = 'white';
    ctx.font = '16px Inter, sans-serif';
    ctx.textAlign = 'left';
    let lineY = 135;
    const LINE_SPACING = 25;
    const PADDING = 70;
    const textX = 50 + PADDING;

    ctx.fillText('1. JUMP: Press **SPACE** or **TAP** the screen.', textX, lineY);
    lineY += LINE_SPACING;
    ctx.fillText('2. PAUSE: Press **P** to pause or resume the game.', textX, lineY);
    lineY += LINE_SPACING;
    ctx.fillText('3. OBSTACLES (🐌): Avoid them! They cause a temporary slow-down (hit).', textX, lineY);
    lineY += LINE_SPACING;
    ctx.fillText('4. ACCELERATORS (🔥): Collect them for a temporary **2x speed boost**!', textX, lineY);
    lineY += LINE_SPACING;
    ctx.fillText('5. MILESTONES: The large hurdles are milestones. They are cleared automatically.', textX, lineY);
    lineY += LINE_SPACING;
    ctx.fillText('6. SKILL LEVEL: Affects jump clearance needed and the frequency of obstacles.', textX, lineY);
    lineY += LINE_SPACING;
    ctx.fillText('7. DATA: Segment length /slopes are based on the **time** between data points.', textX, lineY);
    lineY += LINE_SPACING;
    ctx.fillText('8. WINNING: Finish the final milestone with **zero hits** for the ultimate victory!', textX, lineY);
    ctx.fillStyle = '#FFDD00';
    ctx.font = 'bold 22px Impact, sans-serif';
    ctx.fillText('Click "Start the Heist!" to begin!', canvas.width / 2, canvas.height - 70);
    ctx.restore();
}

function drawDaysCounter() {
    if (!daysCounter) return;

    const { days, delta, frame } = daysCounter;
    const opacity = 1 - (frame / FADE_DURATION);
    if (opacity <= 0) {
        daysCounter = null;
        return;
    }

    const textY = canvas.height / 2 + 50 - (frame * 0.5);
    const deltaY = textY + 30;
    const centerX = canvas.width / 2;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.textAlign = 'center';

    ctx.fillStyle = 'black';
    ctx.font = 'bold 36px Impact';
    ctx.fillText(`${days} DAYS`, centerX, textY);

    if (delta !== 0) {
        let deltaText;
        let deltaColor;

        if (delta > 0) {
            deltaText = `+${delta.toLocaleString()} days (Faster!)`;
            deltaColor = '#28a745';
        } else {
            deltaText = `${delta.toLocaleString()} days (Slower!)`;
            deltaColor = '#dc3545';
        }

        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = deltaColor;
        ctx.fillText(deltaText, centerX, deltaY);

    } else if (days > 0) {
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = 'gray';
        ctx.fillText(`Duration: ${days} days`, centerX, deltaY);
    }

    ctx.restore();
    daysCounter.frame++;
}

function drawVictoryOverlay(elapsedTime) {
    const opacity = Math.min(1, elapsedTime / 1000);
    let mainText, subText, mainColor;
    const SUCCESS_COLOR = '#00FF88';
    const FAILURE_COLOR = '#FF0044';

    if (hitsCounter === 0) {
        mainText = 'Congratulations!';
        subText = 'You reached financial independence!';
        mainColor = SUCCESS_COLOR;
    } else {
        mainText = 'FIRE Failed!';
        subText = `You encountered ${hitsCounter} obstacles`;
        mainColor = FAILURE_COLOR;
    }

    ctx.save();
    ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.7})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = opacity;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const baseFontSize = 36;
    const dynamicFontSize = Math.min(baseFontSize, canvas.width / 15);
    ctx.fillStyle = mainColor;
    ctx.font = `bold ${dynamicFontSize}px Impact, monospace`;
    let mainY = canvas.height / 2 - (dynamicFontSize / 2) - 10;
    ctx.strokeText(mainText, canvas.width / 2, mainY);
    ctx.fillText(mainText, canvas.width / 2, mainY);
    ctx.fillStyle = 'white';
    ctx.font = `${dynamicFontSize * 0.6}px Impact, monospace`;
    let subY = canvas.height / 2 + (dynamicFontSize * 0.6 / 2) + 15;
    ctx.fillText(subText, canvas.width / 2, subY);
    ctx.restore();
}

function drawMoneyCounter() {
    const formattedCash = Math.round(accumulatedCash).toLocaleString();
    const displayString = `Total Haul: $${formattedCash}`;
    const boxHeight = 40;
    const boxX = 10;
    const boxY = 10;
    const PADDING_X = 15;
    let fontSize = 24;

    if (displayString.length > 25) {
        fontSize = 14;
    } else if (displayString.length > 20) {
        fontSize = 18;
    }

    ctx.font = `bold ${fontSize}px Arial`;
    const textMetrics = ctx.measureText(displayString);
    const dynamicBoxWidth = textMetrics.width + (PADDING_X * 2);
    const textX = boxX + PADDING_X;
    const textY = boxY + boxHeight / 2;

    ctx.fillStyle = 'white';
    ctx.fillRect(boxX, boxY, dynamicBoxWidth, boxHeight);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(boxX, boxY, dynamicBoxWidth, boxHeight);

    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayString, textX, textY);
}

function drawGameCounters() {
    const daysString = `Days Elapsed: ${Math.round(daysElapsedTotal).toLocaleString()}`;
    const hitsString = `Hits: ${hitsCounter} (${currentSkillLevel} Skill)`;

    const PADDING = 10;
    const LINE_HEIGHT = 20;
    const BOX_WIDTH = 250;
    const BOX_X = canvas.width - BOX_WIDTH - 10;
    const BOX_Y = 10;
    let BOX_HEIGHT = 50;

    let speedText = `Speed: ${gameSpeedMultiplier.toFixed(1)}x`;

    if (isDecelerating) {
        speedText += ` (📉)`;
        BOX_HEIGHT = 70;
    } else if (isAccelerating) {
        speedText += ` (🔥)`;
        BOX_HEIGHT = 70;
    } else if (isColliding) {
        speedText += ` (🐌)`;
        BOX_HEIGHT = 70;
    }

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(BOX_X, BOX_Y, BOX_WIDTH, BOX_HEIGHT);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(BOX_X, BOX_Y, BOX_WIDTH, BOX_HEIGHT);

    ctx.fillStyle = '#1a4f78';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    ctx.fillText(daysString, BOX_X + PADDING, BOX_Y + PADDING);

    ctx.fillStyle = hitsCounter > 0 ? '#dc3545' : '#28a745';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(hitsString, BOX_X + PADDING, BOX_Y + PADDING + LINE_HEIGHT);

    if (isAccelerating || isColliding || isDecelerating) {
        let speedTextColor = '#000000';
        if (isAccelerating) speedTextColor = '#ffaa00';
        if (isColliding || isDecelerating) speedTextColor = '#dc3545';

        ctx.fillStyle = speedTextColor;
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(speedText, BOX_X + PADDING, BOX_Y + PADDING + (LINE_HEIGHT * 2));
    }
    ctx.restore();
}

function drawAccelerator(accelerator, angleRad) {
    if (!accelerator) return;

    const accelX = accelerator.x;
    const accelY = GROUND_Y - accelX * Math.tan(angleRad) + OBSTACLE_EMOJI_Y_OFFSET;

    ctx.save();
    ctx.translate(accelX, accelY);
    ctx.rotate(-angleRad);

    ctx.font = ACCELERATOR_EMOJI_SIZE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(ACCELERATOR_EMOJI, 0, 0);

    ctx.restore();
}

function drawCustomEventStatus(event, angleRad) {
    const eventX = STICK_FIGURE_FIXED_X;
    const eventY = GROUND_Y - eventX * Math.tan(angleRad) - STICK_FIGURE_TOTAL_HEIGHT * 2;

    ctx.save();
    ctx.translate(eventX, eventY);
    ctx.rotate(-angleRad);

    ctx.font = 'bold 40px Impact';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let opacity = 1.0;
    if (event.type === 'ACCELERATOR' && isAccelerating) {
        opacity = 0.5 + 0.5 * Math.sin(Date.now() / 100);
    } else if (event.type === 'DECELERATOR' && isDecelerating) {
        opacity = 0.5 + 0.5 * Math.sin(Date.now() / 100);
    }

    ctx.globalAlpha = opacity;
    ctx.fillText(event.emoji, 0, 0);

    ctx.globalAlpha = 1.0;
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = event.type === 'ACCELERATOR' ? '#00FF88' : '#FF0044';
    ctx.fillText(event.type, 0, 30);

    ctx.restore();
}

function drawProximityEvent(event, angleRad) {
    if (!event) return;

    const eventX = event.x;
    const groundAtEventY = GROUND_Y - eventX * Math.tan(angleRad);
    const distance = eventX - STICK_FIGURE_FIXED_X;
    const spawnDistance = canvas.width - STICK_FIGURE_FIXED_X;
    const normalizedDistance = Math.min(1, Math.max(0, (spawnDistance - distance) / spawnDistance));
    const popUpProgress = Math.min(1, Math.max(0, 1.5 - (distance / 150)));
    const yOffset = -EVENT_POPUP_HEIGHT * (popUpProgress);
    const eventY = groundAtEventY + yOffset + OBSTACLE_EMOJI_Y_OFFSET;

    ctx.save();
    ctx.translate(eventX, eventY);
    ctx.rotate(-angleRad);

    ctx.font = ACCELERATOR_EMOJI_SIZE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = Math.min(1, popUpProgress * 2);
    ctx.fillText(event.emoji, 0, 0);

    ctx.restore();
}

function initializeClouds() {
    clouds.length = 0;
    for (let i = 0; i < NUM_CLOUDS; i++) {
        clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height / 3) + 20,
            size: Math.random() * 20 + 30,
            speedFactor: CLOUD_SPEED_FACTOR + (Math.random() * 0.05)
        });
    }
}

function drawClouds() {
    ctx.fillStyle = 'white';
    clouds.forEach(cloud => {
        const currentX = cloud.x - (backgroundOffset * cloud.speedFactor);
        const wrappedX = currentX % (canvas.width + cloud.size * 2);

        ctx.beginPath();
        ctx.arc(wrappedX, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
        ctx.arc(wrappedX + cloud.size * 0.5, cloud.y, cloud.size * 0.7, 0, Math.PI * 2);
        ctx.arc(wrappedX - cloud.size * 0.5, cloud.y, cloud.size * 0.7, 0, Math.PI * 2);
        ctx.arc(wrappedX + cloud.size * 0.25, cloud.y - cloud.size * 0.4, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.arc(wrappedX - cloud.size * 0.25, cloud.y - cloud.size * 0.4, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawCashBagEmoji(x, y, opacity = 1) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.font = CASH_BAG_FONT_SIZE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(CASH_BAG_EMOJI, x, y);
    ctx.restore();
}

function generateGrassBlades(angleRad) {
    grassAnimationState.blades = [];
    const bladeHeight = 8;
    const bladeDensity = 5; // Lower number means more dense
    for (let x = 0; x < canvas.width; x += bladeDensity) {
        const groundYatX = GROUND_Y - x * Math.tan(angleRad);
        const randomSway = (Math.random() - 0.5) * 5;
        const heightFactor = (0.75 + Math.random() * 0.5);
        grassAnimationState.blades.push({ x: x + randomSway, y: groundYatX, heightFactor: heightFactor });
    }
    grassAnimationState.lastUpdateTime = performance.now();
}

function drawSlantedGround(angleRad) {
    const slopeHeight = Math.tan(angleRad) * canvas.width;
    const endY = GROUND_Y - slopeHeight;

    // Main ground color from theme
    ctx.fillStyle = currentTheme.ground;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(canvas.width, endY);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

    // Lighter green for texture lines (grass blades)
    if (currentTheme.grassBlades) {
        ctx.strokeStyle = currentTheme.grassBlades;
        ctx.lineWidth = 1.5;
        ctx.beginPath();

        // Draw the main slope line
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(canvas.width, endY);

        // Update grass blades if interval passed or if not yet generated
        if (performance.now() - grassAnimationState.lastUpdateTime > GRASS_ANIMATION_INTERVAL_MS || grassAnimationState.blades.length === 0) {
            generateGrassBlades(angleRad);
        }

        // Draw grass blade texture
        const bladeHeight = 8;
        grassAnimationState.blades.forEach(blade => {
            ctx.moveTo(blade.x, blade.y);
            ctx.lineTo(blade.x, blade.y - bladeHeight * blade.heightFactor);
        });
        ctx.stroke();
    }

    if (currentTheme.roadLines) {
        ctx.strokeStyle = currentTheme.roadLines;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const lineLength = 40;
        const gapLength = 60;
        const patternLength = lineLength + gapLength;
        const numLines = canvas.width / patternLength;
        for (let i = 0; i < numLines * 2; i++) {
            const startX = (i * patternLength - backgroundOffset * 0.1) % (canvas.width + patternLength) - patternLength;
            const startY = GROUND_Y - 20 - startX * Math.tan(angleRad);
            const endX = startX + lineLength;
            const endY = GROUND_Y - 20 - endX * Math.tan(angleRad);
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
        }
        ctx.stroke();
    }
}

function drawHurdle(hurdleData) {
    const hurdleDrawX = canvas.width - 100 - backgroundOffset;
    const currentAngleRad = raceSegments[currentSegmentIndex] ? raceSegments[currentSegmentIndex].angleRad : 0;
    const groundAtHurdleY = GROUND_Y - hurdleDrawX * Math.tan(currentAngleRad);

    if (hurdleDrawX > -34 && hurdleDrawX < canvas.width) {
        ctx.save();
        ctx.translate(hurdleDrawX + 15, groundAtHurdleY);
        ctx.rotate(-currentAngleRad);

        ctx.fillStyle = currentTheme.hurdle.fill;
        ctx.fillRect(-17, -hurdleData.hurdleHeight, 4, hurdleData.hurdleHeight);
        ctx.fillRect(13, -hurdleData.hurdleHeight, 4, hurdleData.hurdleHeight);
        ctx.fillRect(-17, -hurdleData.hurdleHeight, 34, 5);

        ctx.strokeStyle = currentTheme.hurdle.stroke;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-17, -hurdleData.hurdleHeight + 10); ctx.lineTo(17, -hurdleData.hurdleHeight + 10);
        ctx.moveTo(-17, -hurdleData.hurdleHeight + 20); ctx.lineTo(17, -hurdleData.hurdleHeight + 20);
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(hurdleData.label, 0, -hurdleData.hurdleHeight - 25);

        ctx.font = '12px Arial';
        ctx.fillText(hurdleData.dateLabel, 0, -hurdleData.hurdleHeight - 10);

        ctx.restore();
    }
}

function drawStickFigure(x, y, jumpState, angleRad) {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-angleRad);

    let headY = -STICK_FIGURE_TOTAL_HEIGHT;
    let bodyY = 0;

    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stickFigureEmoji, 0, headY);

    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(0, headY + 5);
    ctx.lineTo(0, bodyY - 10);
    ctx.stroke();

    const isFading = collisionDuration > 0;
    const fadeProgress = isFading ? collisionDuration / COLLISION_DURATION_MS : 0;

    const legOpacity = 1;

    let legColor = 'black';
    if (isColliding) {
        const R = Math.round(255 * fadeProgress);
        legColor = `rgb(${R}, 0, 0)`;
    } else if (isAccelerating) {
        legColor = '#00FF00'; // Green for acceleration
    }

    let legMovementX1, legMovementY1, legMovementX2, legMovementY2;
    let armMovementX1, armMovementY1, armMovementX2, armMovementY2;

    if (jumpState.isJumping) {
        const t = jumpState.progress;
        const legSpread = 5 + 10 * Math.sin(t * Math.PI);
        const armOffset = 10 * (1 - Math.sin(t * Math.PI));

        legMovementX1 = -legSpread; legMovementY1 = bodyY + 5;
        legMovementX2 = legSpread; legMovementY2 = bodyY + 5;
        armMovementX1 = armOffset; armMovementY1 = headY + 15;
        armMovementX2 = -armOffset; armMovementY2 = headY + 15;
    } else {
        const runSpeed = 0.25;
        const t = frameCount * runSpeed;
        const legSpread = 10;
        const armSpread = 10;
        const legOffset1 = Math.sin(t + Math.PI / 4) * legSpread;
        const legOffset2 = Math.sin(t + Math.PI + Math.PI / 4) * legSpread;
        const armOffset1 = Math.sin(t + Math.PI / 2 + Math.PI / 4) * armSpread;
        const armOffset2 = Math.sin(t - Math.PI / 2 + Math.PI / 4) * armSpread;

        legMovementX1 = legOffset1; legMovementY1 = bodyY + 5;
        legMovementX2 = legOffset2; legMovementY2 = bodyY + 5;
        armMovementX1 = armOffset1; armMovementY1 = headY + 15;
        armMovementX2 = armOffset2; armMovementY2 = headY + 15;
    }

    ctx.save();
    ctx.globalAlpha = legOpacity;
    ctx.strokeStyle = legColor;
    ctx.beginPath();
    ctx.moveTo(0, bodyY - 10); ctx.lineTo(legMovementX1, legMovementY1);
    ctx.moveTo(0, bodyY - 10); ctx.lineTo(legMovementX2, legMovementY2);
    ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(0, headY + 10); ctx.lineTo(armMovementX1, armMovementY1);
    ctx.moveTo(0, headY + 10); ctx.lineTo(armMovementX2, armMovementY2);
    ctx.stroke();

    ctx.restore();
}

function drawObstacle(obstacle, angleRad) {
    if (!obstacle) return;

    const obstacleX = obstacle.x;
    const obstacleY = GROUND_Y - obstacleX * Math.tan(angleRad) + OBSTACLE_EMOJI_Y_OFFSET;

    ctx.save();
    ctx.translate(obstacleX, obstacleY);
    ctx.rotate(-angleRad);

    ctx.font = OBSTACLE_EMOJI_SIZE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(obstacle.emoji, 0, 0);

    ctx.restore();
}

export let isInitialLoad = true; // Global flag for initial state

export function draw() {
    ctx.fillStyle = currentTheme.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawClouds();

    let groundAngleRad = 0;
    let stickFigureGroundY = GROUND_Y;

    if (currentSegmentIndex < raceSegments.length || isGameOverSequence) {
        const currentSegment = raceSegments[Math.min(currentSegmentIndex, raceSegments.length - 1)];

        groundAngleRad = currentSegment.angleRad;
        drawSlantedGround(groundAngleRad);

        stickFigureGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(groundAngleRad);

        if (!isGameOverSequence) {
            drawHurdle(currentSegment);

            if (currentObstacle) {
                drawObstacle(currentObstacle, groundAngleRad);
            }
            if (currentAccelerator) {
                drawAccelerator(currentAccelerator, groundAngleRad);
            }

            if (onScreenCustomEvent) {
                drawProximityEvent(onScreenCustomEvent, groundAngleRad);
            }

            if (isAccelerating && !currentAccelerator) {
                const activeEvent = activeCustomEvents.find(e => e.type === 'ACCELERATOR' && e.isActive);
                if (activeEvent) { drawCustomEventStatus(activeEvent, groundAngleRad); }
            } else if (isDecelerating) {
                const activeEvent = activeCustomEvents.find(e => e.type === 'DECELERATOR' && e.isActive);
                if (activeEvent) { drawCustomEventStatus(activeEvent, groundAngleRad); }
            }
        }

        let stickFigureOffsetX = 0;
        let stickFigureOffsetY = 0;
        if (stickFigureBurst.active) {
            const p = stickFigureBurst.progress;
            let burstDistance = 0;

            if (p < 0.3) {
                // Phase 1: First stutter
                const phaseProgress = p / 0.3;
                burstDistance = stickFigureBurst.maxOffset * 0.4 * Math.sin(phaseProgress * Math.PI);
            } else if (p < 0.6) {
                // Phase 2: Second stutter
                const phaseProgress = (p - 0.3) / 0.3;
                burstDistance = stickFigureBurst.maxOffset * 0.7 * Math.sin(phaseProgress * Math.PI);
            } else {
                // Phase 3: Final boost
                const phaseProgress = (p - 0.6) / 0.4;
                burstDistance = stickFigureBurst.maxOffset * 1.0 * Math.sin(phaseProgress * Math.PI);
            }

            const burstAngleRad = 15 * (Math.PI / 180); // 15 degrees in radians
            stickFigureOffsetX = burstDistance * Math.cos(burstAngleRad);
            stickFigureOffsetY = -burstDistance * Math.sin(burstAngleRad); // Negative for upward movement
        }
        const currentX = STICK_FIGURE_FIXED_X + stickFigureOffsetX;
        let currentY = stickFigureGroundY + stickFigureOffsetY;

        if (jumpState.isJumping) {
            let maxJumpHeight = 0;
            let jumpProgress = jumpState.progress;

            if (manualJumpOverride.isActive) {
                maxJumpHeight = manualJumpHeight;
            } else {
                maxJumpHeight = currentSegment.hurdleHeight * JUMP_HEIGHT_RATIO;
            }

            const jumpOffset = -4 * maxJumpHeight * (jumpProgress - jumpProgress * jumpProgress);
            currentY += jumpOffset;
        }

        drawStickFigure(currentX, currentY, jumpState, groundAngleRad);

        activeCashBags = activeCashBags.filter(bag => {
            if (bag.isDone) { return false; }
            drawCashBagEmoji(bag.currentX, bag.currentY, bag.opacity);
            return true;
        });

        drawMoneyCounter();
        drawGameCounters();

        if (daysCounter) { drawDaysCounter(); }

        if (isColliding && collisionDuration > 0) {
            const fadeProgress = collisionDuration / COLLISION_DURATION_MS;
            ctx.save();
            ctx.fillStyle = `rgba(255, 0, 0, ${fadeProgress * 0.4})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }

        // Draw screen flash
        if (screenFlash.opacity > 0) {
            ctx.save();
            ctx.fillStyle = `rgba(255, 165, 0, ${screenFlash.opacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    }

    if (!gameRunning && isInitialLoad) {
        drawTipsOverlay();
    }

    if (isPaused) {
        drawPausedOverlay();
    }

    if (currentSegmentIndex >= raceSegments.length && !isGameOverSequence) {
        return;
    }
}

let deltaTime = 0;

export function startManualJump() {
    if (!gameRunning || jumpState.isJumping || isPaused) return;

    manualJumpOverride.duration = manualJumpDurationMs;

    jumpState.isJumping = true;
    jumpState.progress = 0;
    manualJumpOverride.isActive = true;
    manualJumpOverride.startTime = Date.now();
    console.log("-> startManualJump: Manual jump initiated.");
}

function spawnObstacle() {
    currentObstacle = {
        x: OBSTACLE_SPAWN_X,
        emoji: obstacleEmoji,
        spawnTime: Date.now(),
        hasBeenHit: false
    };
    console.log(`-> spawnObstacle: New obstacle spawned.`);
}

function spawnAccelerator() {
    currentAccelerator = {
        x: OBSTACLE_SPAWN_X,
        emoji: ACCELERATOR_EMOJI,
        spawnTime: Date.now(),
        hasBeenCollected: false
    };
    console.log(`-> spawnAccelerator: New accelerator spawned.`);
}

function spawnProximityEvent(eventData) {
    onScreenCustomEvent = {
        ...eventData,
        x: OBSTACLE_SPAWN_X,
        spawnTime: Date.now(),
        hasBeenCollected: false
    };
    const originalEvent = activeCustomEvents.find(e => e.daysSinceStart === eventData.daysSinceStart);
    if (originalEvent) {
        originalEvent.wasSpawned = true;
    }
    console.log(`-> spawnProximityEvent: New ${eventData.type} event spawned by proximity.`);
}

function checkCollision(runnerY, angleRad) {
    if (!currentObstacle || currentObstacle.hasBeenHit || isColliding) return false;

    const obstacleX = currentObstacle.x;
    const runnerX = STICK_FIGURE_FIXED_X;

    const groundAtObstacleY = GROUND_Y - obstacleX * Math.tan(angleRad);
    const runnerBottomY = runnerY + STICK_FIGURE_TOTAL_HEIGHT;
    const obstacleTopY = groundAtObstacleY + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    const horizontalDistance = Math.abs(obstacleX - runnerX);
    if (horizontalDistance > COLLISION_RANGE_X) return false;

    const minClearanceY = obstacleTopY - STICK_FIGURE_TOTAL_HEIGHT + 5;

    const runnerIsJumpingClear = jumpState.isJumping && (runnerY < minClearanceY);

    if (horizontalDistance < COLLISION_RANGE_X) {
        const collisionTolerance = 5;
        if (!runnerIsJumpingClear && (runnerBottomY >= obstacleTopY - collisionTolerance)) {
            return true;
        }
    }
    return false;
}

function checkAcceleratorCollision(runnerY, angleRad) {
    if (!currentAccelerator || currentAccelerator.hasBeenCollected || isAccelerating) return false;

    const accelX = currentAccelerator.x;
    const runnerX = STICK_FIGURE_FIXED_X;

    const COLLECTION_RANGE_X = COLLISION_RANGE_X + 10;
    const horizontalDistance = Math.abs(accelX - runnerX);
    if (horizontalDistance > COLLECTION_RANGE_X) return false;

    const groundAtAccelY = GROUND_Y - accelX * Math.tan(angleRad);
    const runnerBottomY = runnerY + STICK_FIGURE_TOTAL_HEIGHT;
    const accelTopY = groundAtAccelY + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    if (horizontalDistance < COLLECTION_RANGE_X) {
        if (runnerBottomY >= accelTopY) {
            currentAccelerator.hasBeenCollected = true;
            return true;
        }
    }
    return false;
}

function checkProximityEventCollection(runnerY, angleRad) {
    if (!onScreenCustomEvent || onScreenCustomEvent.hasBeenCollected) return false;

    const eventX = onScreenCustomEvent.x;
    const runnerX = STICK_FIGURE_FIXED_X;

    const COLLECTION_RANGE_X = COLLISION_RANGE_X + 10;
    const horizontalDistance = Math.abs(eventX - runnerX);
    if (horizontalDistance > COLLECTION_RANGE_X) return false;

    const groundAtEventY = GROUND_Y - eventX * Math.tan(angleRad);
    const runnerBottomY = runnerY + STICK_FIGURE_TOTAL_HEIGHT;
    const eventTopY = groundAtEventY + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    if (horizontalDistance < COLLECTION_RANGE_X) {
        if (runnerBottomY >= eventTopY) {
            onScreenCustomEvent.hasBeenCollected = true;
            return true;
        }
    }
    return false;
}

function applySpeedEffect(type) {
    if (isColliding) {
        console.log(`-> SPEED EFFECT BLOCKED: ${type} blocked by active collision.`);
        return;
    }

    if (isAccelerating) {
        isAccelerating = false;
        accelerationDuration = 0;
        activeCustomEvents.forEach(e => { if (e.type === 'ACCELERATOR') e.isActive = false; });
    }
    if (isDecelerating) {
        isDecelerating = false;
        decelerationDuration = 0;
        activeCustomEvents.forEach(e => { if (e.type === 'DECELERATOR') e.isActive = false; });
    }

    if (type === 'ACCELERATOR') {
        isAccelerating = true;
        accelerationDuration = ACCELERATOR_DURATION_MS;
        gameSpeedMultiplier = intendedSpeedMultiplier * ACCELERATOR_BASE_SPEED_BOOST;
        playChaChing();
        screenFlash = { opacity: 0.7, duration: 200, startTime: performance.now() };
        console.info("-> APPLY SPEED: Accelerator (2x) applied!");
    } else if (type === 'DECELERATOR') {
        isDecelerating = true;
        decelerationDuration = DECELERATOR_DURATION_MS;
        gameSpeedMultiplier = intendedSpeedMultiplier * DECELERATOR_BASE_SPEED_DEBUFF;
        playDebuffSound();
        console.warn("-> APPLY SPEED: Decelerator (0.5x) applied!");
    }
}

export function togglePauseGame() {
    if (!gameRunning) return;
    isPaused = !isPaused;
    if (isPaused) {
        Tone.Transport.pause();
        console.log("-> GAME PAUSED");
    } else {
        Tone.Transport.start();
        console.log("-> GAME RESUMED");
        lastTime = performance.now();
    }
    updateControlPanelState(gameRunning, isPaused);
    draw();
}

export function animate(timestamp) {
    if (!gameRunning && !isGameOverSequence) return;

    if (isPaused) {
        requestAnimationFrame(animate);
        return;
    }

    if (!lastTime) {
        lastTime = timestamp;
        console.log(`-- ANIME START -- Segment ${currentSegmentIndex} initialized.`);
        requestAnimationFrame(animate);
        return;
    }

    deltaTime = timestamp - lastTime;

    if (currentSegmentIndex >= raceSegments.length) {
        if (!isGameOverSequence) {
            isVictory = (hitsCounter === 0);
            isGameOverSequence = true;
            gameOverSequenceStartTime = timestamp;
            console.log(`-> GAME OVER: Starting sequence. Victory: ${isVictory}`);
            gameRunning = false;
            updateHighScore();
        }

        draw();
        drawVictoryOverlay(timestamp - gameOverSequenceStartTime);

        if (timestamp - gameOverSequenceStartTime >= VICTORY_DISPLAY_TIME) {
            stopGame(false);
            isGameOverSequence = false;
            return;
        }

        lastTime = timestamp;
        requestAnimationFrame(animate);
        return;
    }

    const currentHurdle = raceSegments[currentSegmentIndex];
    const targetSegmentDuration = currentHurdle.visualDurationMs / intendedSpeedMultiplier;

    if (manualJumpOverride.isActive) {
        const elapsed = Date.now() - manualJumpOverride.startTime;
        jumpState.progress = elapsed / manualJumpOverride.duration;

        if (jumpState.progress >= 1) {
            jumpState.isJumping = false;
            manualJumpOverride.isActive = false;
            jumpState.progress = 0;
        }
    } else {
        if (segmentProgress >= AUTO_JUMP_START_PROGRESS && segmentProgress <= AUTO_JUMP_START_PROGRESS + AUTO_JUMP_DURATION) {
            jumpState.isJumping = true;
            jumpState.progress = (segmentProgress - AUTO_JUMP_START_PROGRESS) / AUTO_JUMP_DURATION;
        } else {
            jumpState.isJumping = false;
            jumpState.progress = 0;
        }
    }

    segmentProgress += deltaTime / targetSegmentDuration;
    backgroundOffset = (HURDLE_FIXED_START_DISTANCE) * segmentProgress;

    const totalDaysForCurrentSegment = currentHurdle.durationDays;
    const progressInDays = totalDaysForCurrentSegment * Math.min(1, segmentProgress);
    daysElapsedTotal = daysAccumulatedAtSegmentStart + progressInDays;

    const daysCheck = daysElapsedTotal;

    if (!onScreenCustomEvent) {
        const nextEventToTrigger = activeCustomEvents.find(event => !event.wasTriggered && !event.wasSpawned);
        if (nextEventToTrigger) {
            const daysPerCanvas = totalDaysForCurrentSegment;
            const proximityDays = daysPerCanvas * (EVENT_PROXIMITY_VISUAL_STEPS * (MIN_VISUAL_DURATION_MS/MAX_VISUAL_DURATION_MS));

            if (nextEventToTrigger.daysSinceStart <= daysCheck + proximityDays) {
                spawnProximityEvent(nextEventToTrigger);
            }
        }
    }

    activeCustomEvents.forEach(event => {
        if (!event.wasTriggered && daysCheck >= event.daysSinceStart) {
            if (!onScreenCustomEvent || onScreenCustomEvent.daysSinceStart !== event.daysSinceStart) {
                console.info(`-> CUSTOM EVENT AUTO-TRIGGERED: Date: ${event.date}. Object missed or spawned late. Applying effect directly.`);
                event.wasTriggered = true;
                event.isActive = true;
                applySpeedEffect(event.type);
            }
        }
    });

    const stickFigureGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(currentHurdle.angleRad);
    let runnerY = stickFigureGroundY - STICK_FIGURE_TOTAL_HEIGHT;

    if (jumpState.isJumping) {
        let maxJumpHeightForSegment = manualJumpOverride.isActive ? manualJumpHeight : currentHurdle.hurdleHeight * JUMP_HEIGHT_RATIO;
        const jumpProgress = jumpState.progress;
        const jumpOffset = -4 * maxJumpHeightForSegment * (jumpProgress - jumpProgress * jumpProgress);
        runnerY += jumpOffset;
    }

    if (frameCount % 60 === 0) {
        if (!currentObstacle && !currentAccelerator && !onScreenCustomEvent) {
            const randomRoll = Math.random() * 100;
            let effectiveAcceleratorFrequency = enableRandomPowerUps ? acceleratorFrequencyPercent : 0;

            if (randomRoll < obstacleFrequencyPercent) {
                spawnObstacle();
            } else if (randomRoll < obstacleFrequencyPercent + effectiveAcceleratorFrequency) {
                spawnAccelerator();
            }
        }
    }

    const angleRad = currentHurdle.angleRad;
    const objectMovementDelta = deltaTime * OBSTACLE_BASE_VELOCITY_PX_MS * gameSpeedMultiplier;

    if (currentObstacle) {
        currentObstacle.x -= objectMovementDelta;
        if (checkCollision(runnerY, angleRad)) {
            if (!isColliding) {
                hitsCounter++;
                isColliding = true;
                collisionDuration = COLLISION_DURATION_MS;
                playCollisionSound();
                playQuackSound();
                console.warn(`-> COLLISION: Hit obstacle! Total hits: ${hitsCounter}. Speed penalty applied.`);
            }
            currentObstacle.hasBeenHit = true;
            isAccelerating = false;
            accelerationDuration = 0;
            isDecelerating = false;
            decelerationDuration = 0;
            activeCustomEvents.forEach(e => e.isActive = false);
        }
        if (currentObstacle.x < -OBSTACLE_WIDTH) {
            currentObstacle = null;
        }
    }

    if (currentAccelerator) {
        currentAccelerator.x -= objectMovementDelta;

        if (checkAcceleratorCollision(runnerY, angleRad)) {
            if (!isAccelerating && !isDecelerating) {
                stickFigureBurst = { ...stickFigureBurst, active: true, startTime: timestamp, progress: 0 };
                applySpeedEffect('ACCELERATOR');
                playPowerUpSound();
            }
        }
        if (currentAccelerator.x < -OBSTACLE_WIDTH) {
            currentAccelerator = null;
        }
    }

    if (onScreenCustomEvent) {
        onScreenCustomEvent.x -= objectMovementDelta;

        if (checkProximityEventCollection(runnerY, angleRad)) {
            if (!isAccelerating && !isDecelerating) {
                if (onScreenCustomEvent.type === 'ACCELERATOR') {
                    stickFigureBurst = { ...stickFigureBurst, active: true, startTime: timestamp, progress: 0 };
                }
                applySpeedEffect(onScreenCustomEvent.type);
            }
            const originalEvent = activeCustomEvents.find(e => e.daysSinceStart === onScreenCustomEvent.daysSinceStart);
            if (originalEvent) {
                originalEvent.wasTriggered = true;
                originalEvent.isActive = true;
            }
        }
        if (onScreenCustomEvent.x < -OBSTACLE_WIDTH) {
            onScreenCustomEvent = null;
        }
    }

    // Update screen flash
    if (screenFlash.opacity > 0) {
        const elapsed = timestamp - screenFlash.startTime;
        if (elapsed > screenFlash.duration) {
            screenFlash.opacity = 0;
        } else {
            screenFlash.opacity = (1 - elapsed / screenFlash.duration) * 0.7;
        }
    }

    // Update stick figure burst animation
    if (stickFigureBurst.active) {
        const elapsed = timestamp - stickFigureBurst.startTime;
        if (elapsed >= stickFigureBurst.duration) {
            stickFigureBurst.active = false;
            stickFigureBurst.progress = 0;
        } else {
            stickFigureBurst.progress = elapsed / stickFigureBurst.duration;
        }
    }

    // Update turbo boost animation
    const turboBoostEl = document.getElementById('turbo-boost-animation');
    if (isAccelerating) {
        const frames = ['> ', '>>', ' >', '  '];
        const frameDuration = 100; // ms per frame
        if (timestamp - turboBoost.lastFrameTime > frameDuration) {
            turboBoost.frame = (turboBoost.frame + 1) % frames.length;
            turboBoost.lastFrameTime = timestamp;
        }
        turboBoostEl.textContent = frames[turboBoost.frame];
        turboBoostEl.style.opacity = '1';
    } else {
        turboBoostEl.style.opacity = '0';
    }

    if (isColliding) {
        collisionDuration -= deltaTime;
        if (collisionDuration <= 0) {
            isColliding = false;
            collisionDuration = 0;
            gameSpeedMultiplier = intendedSpeedMultiplier;
            console.info("-> COLLISION: Penalty ended. Speed restored.");
        } else {
            gameSpeedMultiplier = intendedSpeedMultiplier * 0.1;
        }
    } else {
        // If not in a burst (or burst just ended), check for regular acceleration/deceleration
        if (!stickFigureBurst.active) {
            if (isDecelerating) {
                decelerationDuration -= deltaTime;
                gameSpeedMultiplier = intendedSpeedMultiplier * DECELERATOR_BASE_SPEED_DEBUFF;
                if (decelerationDuration <= 0) {
                    isDecelerating = false;
                    decelerationDuration = 0;
                    activeCustomEvents.forEach(e => { if (e.type === 'DECELERATOR') e.isActive = false; });
                    gameSpeedMultiplier = intendedSpeedMultiplier;
                    console.info("-> DECELERATOR: Debuff ended. Speed restored.");
                }
            } else if (isAccelerating) {
                accelerationDuration -= deltaTime;
                gameSpeedMultiplier = intendedSpeedMultiplier * ACCELERATOR_BASE_SPEED_BOOST;
                if (accelerationDuration <= 0) {
                    isAccelerating = false;
                    accelerationDuration = 0;
                    activeCustomEvents.forEach(e => { if (e.type === 'ACCELERATOR') e.isActive = false; });
                    gameSpeedMultiplier = intendedSpeedMultiplier;
                    console.info("-> ACCELERATOR: Boost ended. Speed restored.");
                }
            } else {
                gameSpeedMultiplier = intendedSpeedMultiplier;
            }
        }
    }

    const stickFigureGroundYForBags = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(currentHurdle.angleRad);
    const collectionY = stickFigureGroundYForBags;

    activeCashBags = activeCashBags.filter(bag => {
        if (bag.isDone) { return false; }
        bag.progress += deltaTime / CASH_BAG_ANIMATION_DURATION;
        const t = bag.progress;

        if (t < 1) {
            if (t < 0.5) {
                const hopProgress = t * 2;
                const hopHeight = 80;
                const yOffset = -4 * hopHeight * (hopProgress - hopProgress * hopProgress);
                bag.currentY = bag.y + yOffset;
                bag.currentX = bag.x;
                bag.opacity = 1.0;
            } else {
                const moveProgress = (t - 0.5) * 2;
                bag.currentX = bag.x + (COUNTER_TARGET_X - bag.x) * moveProgress;
                bag.currentY = bag.currentY + (COUNTER_TARGET_Y - bag.currentY) * moveProgress * 0.5;
                bag.opacity = 1 - Math.max(0, (t - 0.8) / 0.2);
            }
        } else {
            bag.isDone = true;
            return false;
        }
        return true;
    });

    if (segmentProgress >= 1) {
        const completedSegment = raceSegments[currentSegmentIndex];
        console.log(`-> SEGMENT COMPLETE: Reached Milestone ${currentSegmentIndex}. Value: $${completedSegment.milestoneValue.toLocaleString()}`);

        daysCounter = {
            days: completedSegment.durationDays,
            delta: completedSegment.durationDelta,
            frame: 0
        };

        if (currentSegmentIndex > 0) {
            accumulatedCash = completedSegment.milestoneValue;
            activeCashBags.push({ x: STICK_FIGURE_FIXED_X, y: collectionY, currentX: STICK_FIGURE_FIXED_X, currentY: collectionY, opacity: 1.0, progress: 0, isDone: false });
            playChaChing();
        }

        daysAccumulatedAtSegmentStart += completedSegment.durationDays;

        currentSegmentIndex++;
        segmentProgress = 0;
        backgroundOffset = 0;

        isAccelerating = false;
        accelerationDuration = 0;
        isColliding = false;
        collisionDuration = 0;
        isDecelerating = false;
        decelerationDuration = 0;
        activeCustomEvents.forEach(e => e.isActive = false);
        gameSpeedMultiplier = intendedSpeedMultiplier;

        currentObstacle = null;
        currentAccelerator = null;
        onScreenCustomEvent = null;

        if (currentSegmentIndex < raceSegments.length) {
            console.log(`-> NEW SEGMENT START: Index ${currentSegmentIndex}. Visual Duration: ${raceSegments[currentSegmentIndex].visualDurationMs.toFixed(0)}ms`);
        }
    }

    frameCount++;

    lastTime = timestamp;
    draw();
    requestAnimationFrame(animate);
}

export function resetGameState() {
    console.log("-> RESET GAME: Initiated.");
    gameRunning = false;
    isPaused = false;
    currentSegmentIndex = 0;
    segmentProgress = 0;
    lastTime = 0;
    backgroundOffset = 0;
    frameCount = 0;
    accumulatedCash = raceSegments.length > 0 ? raceSegments[0].milestoneValue : 0;
    activeCashBags = [];
    manualJumpOverride = { isActive: false, startTime: 0, duration: manualJumpDurationMs };
    jumpState = { isJumping: false, progress: 0 };
    currentObstacle = null;
    isColliding = false;
    collisionDuration = 0;
    currentAccelerator = null;
    isAccelerating = false;
    accelerationDuration = 0;
    isDecelerating = false;
    decelerationDuration = 0;
    gameSpeedMultiplier = intendedSpeedMultiplier;

    activeCustomEvents = Object.values(customEvents).flat().map(event => ({
        ...event,
        wasTriggered: false,
        isActive: false,
        wasSpawned: false
    })).sort((a, b) => a.daysSinceStart - b.daysSinceStart);
    console.log(`-> RESET GAME: Prepared ${activeCustomEvents.length} custom events.`);
    onScreenCustomEvent = null;

    hitsCounter = 0;
    daysElapsedTotal = 0;
    daysAccumulatedAtSegmentStart = 0;

    isVictory = false;
    isGameOverSequence = false;
    gameOverSequenceStartTime = 0;

    Tone.Transport.stop();
    Tone.Transport.cancel();

    initializeClouds();
    generateGrassBlades(0); // Initialize grass blades on reset

    hideResultsScreen();
    updateControlPanelState(false, false);

    console.log("-> RESET GAME: Complete.");
}

export function startGame() {
    if (raceSegments.length < 2) {
        // dataMessage.textContent = "Error: Cannot start. Load valid data with at least two milestones."; // Handled in UI
        // dataMessage.style.color = 'red';
        console.error("-> START GAME FAILED: Insufficient milestones.");
        return;
    }
    if (gameRunning) return;

    console.log("-> START GAME: Initiating game start sequence.");

    isInitialLoad = false;

    applySkillLevelSettings(currentSkillLevel);

    gameSpeedMultiplier = intendedSpeedMultiplier;
    initializeMusicPlayer(stickFigureEmoji);

    hideResultsScreen();

    if (Tone.context.state !== 'running') { Tone.start(); }
    if (!isMuted) {
        chaChingSynth.mute = false;
        collisionSynth.mute = false;
        debuffSynth.mute = false;
        Tone.loaded().then(() => {
            backgroundMusic.sync().start(0);
            Tone.Transport.start();
        });
    }

    currentSegmentIndex = 0;
    segmentProgress = 0;
    lastTime = 0;
    backgroundOffset = 0;
    frameCount = 0;
    accumulatedCash = raceSegments[0].milestoneValue;
    activeCashBags = [];
    jumpState = { isJumping: false, progress: 0 };
    manualJumpOverride = { isActive: false, startTime: 0, duration: manualJumpDurationMs };
    isColliding = false;
    collisionDuration = 0;
    currentObstacle = null;
    currentAccelerator = null;
    isAccelerating = false;
    accelerationDuration = 0;
    isDecelerating = false;
    decelerationDuration = 0;
    onScreenCustomEvent = null;

    hitsCounter = 0;
    daysElapsedTotal = 0;
    daysAccumulatedAtSegmentStart = 0;
    isVictory = false;
    isGameOverSequence = false;
    gameOverSequenceStartTime = 0;
    isPaused = false;

    activeCustomEvents = Object.values(customEvents).flat().map(event => ({
        ...event,
        wasTriggered: false,
        isActive: false,
        wasSpawned: false
    })).sort((a, b) => a.daysSinceStart - b.daysSinceStart);
    console.log(`-> START GAME: ${activeCustomEvents.length} custom events enabled.`);

    initializeClouds();
    generateGrassBlades(0); // Initialize grass blades on game start

    gameRunning = true;

    updateControlPanelState(true, false);

    const mobileBreakpoint = 768;
    if (window.innerWidth < mobileBreakpoint) {
        document.getElementById('gameCanvas').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    requestAnimationFrame(animate);
    console.log("-> START GAME: Animation loop started.");
}

export function stopGame(shouldReset = true) {
    if (!gameRunning && !shouldReset && !isGameOverSequence) return;

    console.log("-> STOP GAME: Game execution halted.");
    gameRunning = false;
    isPaused = false;

    Tone.Transport.stop();

    if (shouldReset) {
        isInitialLoad = true;
        resetGameState();
        draw();
    } else {
        showResultsScreen(financialMilestones, raceSegments);
        updateControlPanelState(false, false);
        document.getElementById('startButton').textContent = "Restart Heist!";
        console.log("-> STOP GAME: Game ended, displaying results.");
    }
}