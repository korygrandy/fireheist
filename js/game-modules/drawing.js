import { canvas, ctx } from '../dom-elements.js';
import { GROUND_Y, STICK_FIGURE_TOTAL_HEIGHT, FADE_DURATION, COLLISION_DURATION_MS, CASH_BAG_EMOJI, CASH_BAG_FONT_SIZE, ACCELERATOR_EMOJI_SIZE, ACCELERATOR_EMOJI, OBSTACLE_EMOJI_SIZE, EVENT_POPUP_HEIGHT, NUM_CLOUDS, CLOUD_SPEED_FACTOR, STICK_FIGURE_FIXED_X, JUMP_HEIGHT_RATIO, OBSTACLE_EMOJI_Y_OFFSET, OBSTACLE_HEIGHT } from '../constants.js';
import { currentTheme } from '../theme.js';
import state, { GRASS_ANIMATION_INTERVAL_MS } from './state.js';
import { raceSegments, stickFigureEmoji, currentSkillLevel } from '../ui.js';

// =================================================================
// DRAWING FUNCTIONS
// =================================================================

export let isInitialLoad = true; // Global flag for initial state
export function setInitialLoad(value) {
    isInitialLoad = value;
}

export function drawPausedOverlay() {
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

export function drawTipsOverlay() {
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

export function drawDaysCounter() {
    if (!state.daysCounter) return;

    const { days, delta, frame } = state.daysCounter;
    const opacity = 1 - (frame / FADE_DURATION);
    if (opacity <= 0) {
        state.daysCounter = null;
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
    state.daysCounter.frame++;
}

export function drawVictoryOverlay(elapsedTime) {
    const opacity = Math.min(1, elapsedTime / 1000);
    let mainText, subText, mainColor;
    const SUCCESS_COLOR = '#00FF88';
    const FAILURE_COLOR = '#FF0044';

    if (state.hitsCounter === 0) {
        mainText = '🎉 Congratulations!';
        subText = 'You reached financial independence!';
        mainColor = SUCCESS_COLOR;
    } else {
        mainText = 'FIRE Failed!';
        subText = `You encountered ${state.hitsCounter} obstacles`;
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

export function drawMoneyCounter() {
    const formattedCash = Math.round(state.accumulatedCash).toLocaleString();
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

export function drawGameCounters() {
    const daysString = `Days Elapsed: ${Math.round(state.daysElapsedTotal).toLocaleString()}`;
    const hitsString = `Hits: ${state.hitsCounter} (${currentSkillLevel} Skill)`;

    const PADDING = 10;
    const LINE_HEIGHT = 20;
    const BOX_WIDTH = 250;
    const BOX_X = canvas.width - BOX_WIDTH - 10;
    const BOX_Y = 10;
    let BOX_HEIGHT = 50;

    let speedText = `Speed: ${state.gameSpeedMultiplier.toFixed(1)}x`;

    if (state.isDecelerating) {
        speedText += ` (📉)`;
        BOX_HEIGHT = 70;
    } else if (state.isAccelerating) {
        speedText += ` (🔥)`;
        BOX_HEIGHT = 70;
    } else if (state.isColliding) {
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

    ctx.fillStyle = state.hitsCounter > 0 ? '#dc3545' : '#28a745';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText(hitsString, BOX_X + PADDING, BOX_Y + PADDING + LINE_HEIGHT);

    if (state.isAccelerating || state.isColliding || state.isDecelerating) {
        let speedTextColor = '#000000';
        if (state.isAccelerating) speedTextColor = '#ffaa00';
        if (state.isColliding || state.isDecelerating) speedTextColor = '#dc3545';

        ctx.fillStyle = speedTextColor;
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(speedText, BOX_X + PADDING, BOX_Y + PADDING + (LINE_HEIGHT * 2));
    }
    ctx.restore();
}

export function drawAccelerator(accelerator, angleRad) {
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

export function drawCustomEventStatus(event, angleRad) {
    const eventX = STICK_FIGURE_FIXED_X;
    const eventY = GROUND_Y - eventX * Math.tan(angleRad) - STICK_FIGURE_TOTAL_HEIGHT * 2;

    ctx.save();
    ctx.translate(eventX, eventY);
    ctx.rotate(-angleRad);

    ctx.font = 'bold 40px Impact';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let opacity = 1.0;
    if (event.type === 'ACCELERATOR' && state.isAccelerating) {
        opacity = 0.5 + 0.5 * Math.sin(Date.now() / 100);
    } else if (event.type === 'DECELERATOR' && state.isDecelerating) {
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

export function drawProximityEvent(event, angleRad) {
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

export function initializeClouds() {
    state.clouds.length = 0;
    for (let i = 0; i < NUM_CLOUDS; i++) {
        state.clouds.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height / 3) + 20,
            size: Math.random() * 20 + 30,
            speedFactor: CLOUD_SPEED_FACTOR + (Math.random() * 0.05)
        });
    }
}

export function drawClouds() {
    ctx.fillStyle = 'white';
    state.clouds.forEach(cloud => {
        const currentX = cloud.x - (state.backgroundOffset * cloud.speedFactor);
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

export function drawCashBagEmoji(x, y, opacity = 1) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.font = CASH_BAG_FONT_SIZE;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(CASH_BAG_EMOJI, x, y);
    ctx.restore();
}

export function generateGrassBlades(angleRad) {
    state.grassAnimationState.blades = [];
    const bladeHeight = 8;
    const bladeDensity = 5; // Lower number means more dense
    for (let x = 0; x < canvas.width; x += bladeDensity) {
        const groundYatX = GROUND_Y - x * Math.tan(angleRad);
        const randomSway = (Math.random() - 0.5) * 5;
        const heightFactor = (0.75 + Math.random() * 0.5);
        state.grassAnimationState.blades.push({ x: x + randomSway, y: groundYatX, heightFactor: heightFactor });
    }
    state.grassAnimationState.lastUpdateTime = performance.now();
}

export function drawSlantedGround(angleRad) {
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
        if (performance.now() - state.grassAnimationState.lastUpdateTime > GRASS_ANIMATION_INTERVAL_MS || state.grassAnimationState.blades.length === 0) {
            generateGrassBlades(angleRad);
        }

        // Draw grass blade texture
        const bladeHeight = 8;
        state.grassAnimationState.blades.forEach(blade => {
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
            const startX = (i * patternLength - state.backgroundOffset * 0.1) % (canvas.width + patternLength) - patternLength;
            const startY = GROUND_Y - 14 - startX * Math.tan(angleRad);
            const endX = startX + lineLength;
            const endY = GROUND_Y - 14 - endX * Math.tan(angleRad);
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
        }
        ctx.stroke();
    }

    if (currentTheme.curb) {
        ctx.strokeStyle = currentTheme.curb;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const curbY = GROUND_Y - 25;
        ctx.moveTo(0, curbY);
        ctx.lineTo(canvas.width, curbY - Math.tan(angleRad) * canvas.width);
        ctx.stroke();
    }
}

export function drawHurdle(hurdleData) {
    if (!hurdleData || !hurdleData.isMilestone) return; // Only draw if it's a milestone

    const hurdleDrawX = canvas.width - 100 - state.backgroundOffset;
    const currentAngleRad = raceSegments[state.currentSegmentIndex] ? raceSegments[state.currentSegmentIndex].angleRad : 0;
    const groundAtHurdleY = GROUND_Y - hurdleDrawX * Math.tan(currentAngleRad);

    if (hurdleDrawX > -34 && hurdleDrawX < canvas.width) {
        ctx.save();
        ctx.translate(hurdleDrawX + 15, groundAtHurdleY);
        ctx.rotate(-currentAngleRad);

        let scale = 1;
        let opacity = 1;

        if (hurdleData.animationState === 'idle') {
            scale = 0.7;
            opacity = 0.33;
        } else if (hurdleData.animationState === 'approaching') {
            // Scale up as it approaches
            scale = 0.7 + (hurdleData.animationProgress * 0.3); // Scales from 0.7 to 1.0
            opacity = 0.33 + (hurdleData.animationProgress * 0.67); // Fades from 33% to 100%
        } else if (hurdleData.animationState === 'cleared') {
            // Fade out and shrink after being cleared, but not completely
            scale = 1 - (hurdleData.animationProgress * 0.5); // Shrinks to 50%
            opacity = 1 - (hurdleData.animationProgress * 0.67); // Fades to 33%
        }

        ctx.globalAlpha = opacity;
        ctx.scale(scale, scale);

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

export function drawStickFigure(x, y, jumpState, angleRad) {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-angleRad);

    let headY = -STICK_FIGURE_TOTAL_HEIGHT;
    let bodyY = 0;

    const isFading = state.collisionDuration > 0;
    const fadeProgress = isFading ? state.collisionDuration / COLLISION_DURATION_MS : 0;

    const legOpacity = 1;

    let legColor = 'black';
    if (state.isColliding) {
        const R = Math.round(255 * fadeProgress);
        legColor = `rgb(${R}, 0, 0)`;
    } else if (state.isAccelerating) {
        legColor = '#00FF00'; // Green for acceleration
    }

    let legMovementX1, legMovementY1, legMovementX2, legMovementY2;
    let armMovementX1, armMovementY1, armMovementX2, armMovementY2;
    let animationRotation = 0;

    // Default running animation
    const runSpeed = 0.25;
    const tRun = state.frameCount * runSpeed;
    const legSpreadRun = 10;
    const armSpreadRun = 10;
    legMovementX1 = Math.sin(tRun + Math.PI / 4) * legSpreadRun;
    legMovementY1 = bodyY + 5;
    legMovementX2 = Math.sin(tRun + Math.PI + Math.PI / 4) * legSpreadRun;
    legMovementY2 = bodyY + 5;
    armMovementX1 = Math.sin(tRun + Math.PI / 2 + Math.PI / 4) * armSpreadRun;
    armMovementY1 = headY + 15;
    armMovementX2 = Math.sin(tRun - Math.PI / 2 + Math.PI / 4) * armSpreadRun;
    armMovementY2 = headY + 15;

    // Override with special move animations if active
    if (jumpState.isHurdle) { // "Yikes!" Jump
        const t = jumpState.hurdleDuration / 300;
        const angle = Math.sin(t * Math.PI) * Math.PI / 4;
        animationRotation = angle / 4;
        legMovementX1 = 20 * Math.sin(angle); legMovementY1 = bodyY + 5;
        legMovementX2 = -20 * Math.sin(angle); legMovementY2 = bodyY + 5;
        armMovementX1 = 20 * Math.cos(angle); armMovementY1 = headY + 15;
        armMovementX2 = -20 * Math.cos(angle); armMovementY2 = headY + 15;
    } else if (jumpState.isSpecialMove) { // Original "K" move
        animationRotation = state.frameCount * 0.5;
        legMovementX1 = 10; legMovementY1 = bodyY + 5;
        legMovementX2 = -10; legMovementY2 = bodyY + 5;
        armMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    } else if (jumpState.isPowerStomp) {
        const t = jumpState.powerStompDuration / 300;
        const stompY = 20 * Math.sin(t * Math.PI);
        ctx.translate(0, stompY);
        legMovementX1 = 5; legMovementY1 = bodyY + 5;
        legMovementX2 = -5; legMovementY2 = bodyY + 5;
        armMovementX1 = 15; armMovementY1 = headY + 10;
        armMovementX2 = -15; armMovementY2 = headY + 10;
    } else if (jumpState.isDive) {
        animationRotation = Math.PI / 2;
        legMovementX1 = 0; legMovementY1 = bodyY - 10;
        legMovementX2 = 0; legMovementY2 = bodyY + 10;
        armMovementX1 = 15; armMovementY1 = headY + 15;
        armMovementX2 = 10; armMovementY2 = headY + 15;
    } else if (jumpState.isCorkscrewSpin) {
        animationRotation = state.frameCount * 0.8;
        legMovementX1 = 15; legMovementY1 = bodyY;
        legMovementX2 = -15; legMovementY2 = bodyY;
        armMovementX1 = 0; armMovementY1 = headY + 15;
        armMovementX2 = 0; armMovementY2 = headY + 15;
    } else if (jumpState.isScissorKick) {
        const t = state.frameCount * 0.4;
        legMovementX1 = 15 * Math.sin(t); legMovementY1 = bodyY + 5;
        legMovementX2 = -15 * Math.sin(t); legMovementY2 = bodyY + 5;
        armMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    } else if (jumpState.isPhaseDash) { // Enhanced Phase Dash
        ctx.globalAlpha = 0.4 + 0.3 * Math.sin(state.frameCount * 0.8);
        const dashOffset = (1 - (jumpState.phaseDashDuration / 600)) * 50; // Dash forward
        ctx.translate(dashOffset, 0);
        legMovementX1 = 15; legMovementY1 = bodyY + 5;
        legMovementX2 = -5; legMovementY2 = bodyY + 5;
        armMovementX1 = 15; armMovementY1 = headY + 15;
        armMovementX2 = -5; armMovementY2 = headY + 15;
    } else if (jumpState.isHover) { // Smoother Hover
        const hoverHeight = -25 - 5 * Math.sin(state.frameCount * 0.1); // Gentle bobbing motion
        ctx.translate(0, hoverHeight);
        const t = state.frameCount * 0.2;
        legMovementX1 = 5 * Math.sin(t); legMovementY1 = bodyY + 5;
        legMovementX2 = -5 * Math.sin(t); legMovementY2 = bodyY + 5;
        armMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    } else if (jumpState.isGroundPound) { // Ground Pound with landing effect
        const t = jumpState.groundPoundDuration / 400;
        let poundY = 0;
        if (t > 0.5) { // Coming down
            poundY = 40 * Math.sin((t - 0.5) * 2 * Math.PI);
        } else { // Going up
            poundY = -40 * Math.sin(t * 2 * Math.PI);
        }
        ctx.translate(0, poundY);
        if (t < 0.1) {
            ctx.beginPath();
            ctx.arc(0, bodyY + 10, 30, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            ctx.fill();
        }
        legMovementX1 = 0; legMovementY1 = bodyY + 15;
        legMovementX2 = 0; legMovementY2 = bodyY + 15;
        armMovementX1 = 5; armMovementY1 = headY + 5;
        armMovementX2 = -5; armMovementY2 = headY + 5;
    } else if (jumpState.isCartoonScramble) {
        const t = state.frameCount * 1.5;
        const legAngle = t;
        const legLength = 15;
        legMovementX1 = legLength * Math.cos(legAngle);
        legMovementY1 = bodyY + legLength * Math.sin(legAngle);
        legMovementX2 = legLength * Math.cos(legAngle + Math.PI);
        legMovementY2 = bodyY + legLength * Math.sin(legAngle + Math.PI);
        armMovementX1 = 15; armMovementY1 = headY + 5;
        armMovementX2 = -15; armMovementY2 = headY + 5;
    } else if (jumpState.isMoonwalking) {
        animationRotation = -Math.PI / 16;
        const t = state.frameCount * 0.2;
        const slide = 10 * Math.sin(t);
        legMovementX1 = slide; legMovementY1 = bodyY + 5;
        legMovementX2 = -slide; legMovementY2 = bodyY + 5;
        armMovementX1 = 5; armMovementY1 = headY + 15;
        armMovementX2 = -5; armMovementY2 = headY + 15;
    } else if (jumpState.isShockwave) {
        const t = jumpState.shockwaveDuration / 500;
        const radius = 50 * (1 - t);
        const opacity = t;
        const gradient = ctx.createRadialGradient(0, bodyY + 10, radius / 2, 0, bodyY + 10, radius);
        gradient.addColorStop(0, `rgba(173, 216, 230, ${opacity})`);
        gradient.addColorStop(1, `rgba(128, 128, 128, 0)`);
        ctx.beginPath();
        ctx.arc(0, bodyY + 10, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        legMovementX1 = 5; legMovementY1 = bodyY + 5;
        legMovementX2 = -5; legMovementY2 = bodyY + 5;
        armMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    } else if (jumpState.isBackflip) {
        const t = (500 - jumpState.backflipDuration) / 500;
        animationRotation = -t * Math.PI * 2;
        legMovementX1 = 10; legMovementY1 = bodyY + 5;
        legMovementX2 = -10; legMovementY2 = bodyY + 5;
        armMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    } else if (jumpState.isFrontflip) {
        const t = (500 - jumpState.frontflipDuration) / 500;
        animationRotation = t * Math.PI * 2;
        legMovementX1 = 10; legMovementY1 = bodyY + 5;
        legMovementX2 = -10; legMovementY2 = bodyY + 5;
        armMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    } else if (jumpState.isHoudini) {
        const duration = 800;
        const t = (duration - jumpState.houdiniDuration) / duration;
        if (jumpState.houdiniPhase === 'disappearing') {
            ctx.globalAlpha = 1 - (t * 2);
            ctx.font = '48px Arial';
            ctx.fillText('💨', 0, headY);
        } else {
            ctx.globalAlpha = (t - 0.5) * 2;
            ctx.font = '48px Arial';
            ctx.fillText('💨', 0, headY);
        }
        legMovementX1 = 10; legMovementY1 = bodyY + 5;
        legMovementX2 = -10; legMovementY2 = bodyY + 5;
        armMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    }

    ctx.save();
    ctx.rotate(animationRotation);

    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(stickFigureEmoji, 0, headY);

    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(0, headY + 5);
    ctx.lineTo(0, bodyY - 10);
    ctx.stroke();

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

    ctx.restore();
}

export function drawObstacle(obstacle, angleRad) {
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

export function draw() {
    ctx.fillStyle = currentTheme.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawClouds();

    let groundAngleRad = 0;
    let stickFigureGroundY = GROUND_Y;

    if (state.currentSegmentIndex < raceSegments.length || state.isGameOverSequence) {
        const currentSegment = raceSegments[Math.min(state.currentSegmentIndex, raceSegments.length - 1)];

        groundAngleRad = currentSegment.angleRad;
        drawSlantedGround(groundAngleRad);

        stickFigureGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(groundAngleRad);

                    if (!state.isGameOverSequence) {
                        // Update hurdle animation state
                        if (currentSegment.isMilestone) {
                            const hurdleDrawX = canvas.width - 100 - state.backgroundOffset;
                            const distanceToHurdle = hurdleDrawX - STICK_FIGURE_FIXED_X;
                            const animationThreshold = 300; // Distance at which animation starts
                            const previousState = currentSegment.animationState;

                            if (distanceToHurdle < animationThreshold && distanceToHurdle > 0) {
                                currentSegment.animationState = 'approaching';
                                currentSegment.animationProgress = 1 - (distanceToHurdle / animationThreshold);
                            } else if (distanceToHurdle <= 0) {
                                // On the frame we pass the hurdle, reset the progress to start the 'cleared' animation
                                if (previousState !== 'cleared') {
                                    currentSegment.animationProgress = 0;
                                }
                                currentSegment.animationState = 'cleared';
                                currentSegment.animationProgress = Math.min(1, currentSegment.animationProgress + 0.015); // Fade out more gradually
                            } else {
                                currentSegment.animationState = 'idle';
                                currentSegment.animationProgress = 0;
                            }
                        }
                        drawHurdle(currentSegment);
            if (state.currentObstacle) {
                drawObstacle(state.currentObstacle, groundAngleRad);
            }
            if (state.currentAccelerator) {
                drawAccelerator(state.currentAccelerator, groundAngleRad);
            }

            if (state.onScreenCustomEvent) {
                drawProximityEvent(state.onScreenCustomEvent, groundAngleRad);
            }

            if (state.isAccelerating && !state.currentAccelerator) {
                const activeEvent = state.activeCustomEvents.find(e => e.type === 'ACCELERATOR' && e.isActive);
                if (activeEvent) { drawCustomEventStatus(activeEvent, groundAngleRad); }
            } else if (state.isDecelerating) {
                const activeEvent = state.activeCustomEvents.find(e => e.type === 'DECELERATOR' && e.isActive);
                if (activeEvent) { drawCustomEventStatus(activeEvent, groundAngleRad); }
            }
        }

        let stickFigureOffsetX = 0;
        let stickFigureOffsetY = 0;
        if (state.stickFigureBurst.active) {
            const p = state.stickFigureBurst.progress;
            let burstDistance = 0;

            if (p < 0.3) {
                // Phase 1: First stutter
                const phaseProgress = p / 0.3;
                burstDistance = state.stickFigureBurst.maxOffset * 0.4 * Math.sin(phaseProgress * Math.PI);
            } else if (p < 0.6) {
                // Phase 2: Second stutter
                const phaseProgress = (p - 0.3) / 0.3;
                burstDistance = state.stickFigureBurst.maxOffset * 0.7 * Math.sin(phaseProgress * Math.PI);
            } else {
                // Phase 3: Final boost
                const phaseProgress = (p - 0.6) / 0.4;
                burstDistance = state.stickFigureBurst.maxOffset * 1.0 * Math.sin(phaseProgress * Math.PI);
            }

            const burstAngleRad = 15 * (Math.PI / 180); // 15 degrees in radians
            stickFigureOffsetX = burstDistance * Math.cos(burstAngleRad);
            stickFigureOffsetY = -burstDistance * Math.sin(burstAngleRad); // Negative for upward movement
        }
        const currentX = STICK_FIGURE_FIXED_X + stickFigureOffsetX;
        let currentY = stickFigureGroundY + stickFigureOffsetY;

        if (state.jumpState.isJumping) {
            let maxJumpHeight = 0;
            let jumpProgress = state.jumpState.progress;

            if (state.manualJumpOverride.isActive) {
                maxJumpHeight = state.manualJumpHeight;
            } else {
                maxJumpHeight = currentSegment.hurdleHeight * JUMP_HEIGHT_RATIO;
            }

            const jumpOffset = -4 * maxJumpHeight * (jumpProgress - jumpProgress * jumpProgress);
            currentY += jumpOffset;
        }

        drawStickFigure(currentX, currentY, state.jumpState, groundAngleRad);

        for (let i = state.activeCashBags.length - 1; i >= 0; i--) {
            const bag = state.activeCashBags[i];
            if (bag.isDone) {
                state.activeCashBags.splice(i, 1);
            } else {
                drawCashBagEmoji(bag.currentX, bag.currentY, bag.opacity);
            }
        }

        drawMoneyCounter();
        drawGameCounters();

        if (state.daysCounter) { drawDaysCounter(); }

        if (state.isColliding && state.collisionDuration > 0) {
            const fadeProgress = state.collisionDuration / COLLISION_DURATION_MS;
            ctx.save();
            ctx.fillStyle = `rgba(255, 0, 0, ${fadeProgress * 0.4})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }

        // Draw screen flash
        if (state.screenFlash.opacity > 0) {
            ctx.save();
            ctx.fillStyle = `rgba(255, 165, 0, ${state.screenFlash.opacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();
        }
    }

    if (!state.gameRunning && isInitialLoad) {
        drawTipsOverlay();
    }

    if (state.isPaused) {
        drawPausedOverlay();
    }

    if (state.currentSegmentIndex >= raceSegments.length && !state.isGameOverSequence) {
        return;
    }
}