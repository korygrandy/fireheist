import { canvas, ctx } from '../dom-elements.js';
import { GROUND_Y, STICK_FIGURE_TOTAL_HEIGHT, FADE_DURATION, COLLISION_DURATION_MS, CASH_BAG_EMOJI, CASH_BAG_FONT_SIZE, ACCELERATOR_EMOJI_SIZE, ACCELERATOR_EMOJI, OBSTACLE_EMOJI_SIZE, EVENT_POPUP_HEIGHT, NUM_CLOUDS, CLOUD_SPEED_FACTOR, STICK_FIGURE_FIXED_X, JUMP_HEIGHT_RATIO, OBSTACLE_EMOJI_Y_OFFSET, OBSTACLE_HEIGHT, ACCELERATOR_DURATION_MS } from '../constants.js';
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

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
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

        // Dynamic label color for Outer Space theme
        if (currentTheme.name === '🌑 Outer Space') {
            ctx.fillStyle = '#FFA500'; // Bright orange
            ctx.shadowColor = '#FFA500';
            ctx.shadowBlur = 10;
        } else {
            ctx.fillStyle = 'black';
            ctx.shadowBlur = 0; // No shadow for other themes
        }

        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(hurdleData.label, 0, -hurdleData.hurdleHeight - 25);

        ctx.font = '12px Arial';
        ctx.fillText(hurdleData.dateLabel, 0, -hurdleData.hurdleHeight - 10);

        ctx.restore();
    }
}

export function createGroundPoundEffect(x, y) {
    const particleCount = 40;
    const groundColorRgb = hexToRgb(currentTheme.ground);

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI; // Upward semi-circle
        const speed = Math.random() * 5 + 2;
        state.groundPoundParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
            vy: -Math.sin(angle) * speed, // Negative for upward motion
            size: Math.random() * 4 + 2,
            life: 1,
            gravity: 0.2,
            color: groundColorRgb ? `rgba(${groundColorRgb.r}, ${groundColorRgb.g}, ${groundColorRgb.b}, ${Math.random() * 0.5 + 0.3})` : `rgba(139, 69, 19, ${Math.random() * 0.5 + 0.3})` // Fallback to brown
        });
    }
}

export function drawGroundPoundParticles() {
    for (let i = state.groundPoundParticles.length - 1; i >= 0; i--) {
        const p = state.groundPoundParticles[i];

        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;

        if (p.life <= 0) {
            state.groundPoundParticles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

export function createMoonwalkSparkle(x, y) {
    state.moonwalkParticles.push({
        x: x,
        y: y,
        size: Math.random() * 2 + 1,
        life: 1, // 100% life
        vx: (Math.random() - 0.5) * 0.5, // Slight horizontal movement
        vy: (Math.random() - 0.5) * 0.5, // Slight vertical movement
        color: `rgba(255, 255, 200, ${Math.random() * 0.5 + 0.5})` // Yellowish white sparkle
    });
}

export function drawMoonwalkParticles() {
    for (let i = state.moonwalkParticles.length - 1; i >= 0; i--) {
        const p = state.moonwalkParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02; // Fade out slowly

        if (p.life <= 0) {
            state.moonwalkParticles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

export function createHoverParticle(x, y) {
    state.hoverParticles.push({
        x: x + (Math.random() - 0.5) * 10, // Emerge from under the player
        y: y,
        size: Math.random() * 3 + 2,
        life: 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: Math.random() * 1 + 1, // Move downwards
        color: `rgba(173, 216, 230, ${Math.random() * 0.5 + 0.3})` // Light blueish color
    });
}

export function drawHoverParticles() {
    for (let i = state.hoverParticles.length - 1; i >= 0; i--) {
        const p = state.hoverParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;

        if (p.life <= 0) {
            state.hoverParticles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

export function createScrambleDust(x, y) {
    state.scrambleParticles.push({
        x: x + (Math.random() - 0.5) * 20, // Spawn around the feet
        y: y,
        size: Math.random() * 8 + 4,
        life: 1,
        vx: (Math.random() - 0.5) * 1.5, // Chaotic horizontal movement
        vy: (Math.random() - 0.5) * 0.5, // Slight vertical movement
        color: `rgba(160, 125, 90, ${Math.random() * 0.4 + 0.3})` // Brownish dust color
    });
}

export function drawScrambleDust() {
    for (let i = state.scrambleParticles.length - 1; i >= 0; i--) {
        const p = state.scrambleParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05; // Fade out fairly quickly

        if (p.life <= 0) {
            state.scrambleParticles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

export function createDiveParticle(x, y) {
    state.diveParticles.push({
        x: x,
        y: y + (Math.random() - 0.5) * 20, // Vary vertical position
        length: Math.random() * 15 + 5,
        life: 1,
        speed: Math.random() * 2 + 1,
        color: `rgba(200, 220, 255, ${Math.random() * 0.3 + 0.2})` // Light blueish-white
    });
}

export function drawDiveParticles() {
    for (let i = state.diveParticles.length - 1; i >= 0; i--) {
        const p = state.diveParticles[i];

        p.x -= p.speed; // Move left
        p.life -= 0.04;

        if (p.life <= 0) {
            state.diveParticles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.length, p.y);
            ctx.stroke();
            ctx.restore();
        }
    }
}

export function createSwooshParticle(x, y, vx, vy) {
    state.swooshParticles.push({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        length: 10,
        life: 1,
        color: 'rgba(255, 255, 255, 0.7)'
    });
}

export function drawSwooshParticles() {
    for (let i = state.swooshParticles.length - 1; i >= 0; i--) {
        const p = state.swooshParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.08; // Fade out quickly

        if (p.life <= 0) {
            state.swooshParticles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * p.length, p.y - p.vy * p.length);
            ctx.stroke();
            ctx.restore();
        }
    }
}

export function createFlipTrailParticle(x, y, rotation) {
    state.flipTrail.push({
        x: x,
        y: y,
        rotation: rotation,
        life: 1,
        size: STICK_FIGURE_TOTAL_HEIGHT
    });
}

export function drawFlipTrail() {
    for (let i = state.flipTrail.length - 1; i >= 0; i--) {
        const p = state.flipTrail[i];
        p.life -= 0.1; // Faster fade for a smoother trail

        if (p.life <= 0) {
            state.flipTrail.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life * 0.5; // Make it semi-transparent
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);

            // Draw a simplified ghost of the stick figure
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -p.size + 5);
            ctx.lineTo(0, -p.size / 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, -p.size, 5, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();
        }
    }
}

export function createCorkscrewParticle(x, y, headScale, bodyScale) {
    state.corkscrewTrail.push({
        x: x,
        y: y,
        headScale: headScale,
        bodyScale: bodyScale,
        life: 1
    });
}

export function drawCorkscrewTrail() {
    for (let i = state.corkscrewTrail.length - 1; i >= 0; i--) {
        const p = state.corkscrewTrail[i];
        p.life -= 0.15; // Fade out quickly

        if (p.life <= 0) {
            state.corkscrewTrail.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life * 0.4;
            ctx.translate(p.x, p.y);

            // Draw ghost head
            ctx.save();
            ctx.scale(p.headScale, 1);
            ctx.font = '28px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(stickFigureEmoji, 0, -STICK_FIGURE_TOTAL_HEIGHT);
            ctx.restore();

            // Draw ghost body
            ctx.save();
            ctx.scale(p.bodyScale, 1);
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, -STICK_FIGURE_TOTAL_HEIGHT + 5);
            ctx.lineTo(0, -10);
            ctx.stroke();
            ctx.restore();

            ctx.restore();
        }
    }
}

export function createHoudiniPoof(x, y) {
    const particleCount = 30;
    const poofColor = 'rgba(128, 128, 128, 0.7)'; // Grey smoke color

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        state.houdiniParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 10 + 5,
            life: 1, // Represents full life (100%)
            color: poofColor
        });
    }
}

export function drawHoudiniParticles() {
    for (let i = state.houdiniParticles.length - 1; i >= 0; i--) {
        const p = state.houdiniParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04; // Fade speed

        if (p.life <= 0) {
            state.houdiniParticles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

export function drawFireTrail() {
    for (let i = state.fireTrail.length - 1; i >= 0; i--) {
        const p = state.fireTrail[i];
        p.life -= 0.05;
        p.size *= 0.95; // Shrink

        if (p.life <= 0 || p.size <= 0.5) {
            state.fireTrail.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

export function drawStickFigure(x, y, jumpState, angleRad) {

    // Determine the base color based on the theme
    const baseColor = (currentTheme.name === '🌑 Outer Space') ? '#555555' : 'black';

    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-angleRad);

    let headY = -STICK_FIGURE_TOTAL_HEIGHT;
    let bodyY = 0;

    const isFading = state.collisionDuration > 0;
    const fadeProgress = isFading ? state.collisionDuration / COLLISION_DURATION_MS : 0;

    const legOpacity = 1;

    let legColor = baseColor; // Use the dynamic base color for legs
    if (state.isColliding) {
        const R = Math.round(255 * fadeProgress);
        legColor = `rgb(${R}, 0, 0)`;
    } else if (state.isAccelerating) {
        const accelerationFadeProgress = state.accelerationDuration > 0 ? state.accelerationDuration / ACCELERATOR_DURATION_MS : 0;
        const G = Math.round(255 * accelerationFadeProgress);
        legColor = `rgb(0, ${G}, 0)`; // Fades from green to black
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
    if (jumpState.isHurdle) { // Aerial Split Jump
        const t = (500 - jumpState.hurdleDuration) / 500; // t goes from 0 to 1
        const splitProgress = Math.sin(t * Math.PI); // Goes 0 -> 1 -> 0

        // Legs extend up and out
        legMovementX1 = 25 * splitProgress; legMovementY1 = bodyY - 20 * splitProgress;
        legMovementX2 = -25 * splitProgress; legMovementY2 = bodyY - 20 * splitProgress;

        // Arms extend down
        armMovementX1 = 10 * splitProgress; armMovementY1 = headY + 25 * splitProgress;
        armMovementX2 = -10 * splitProgress; armMovementY2 = headY + 25 * splitProgress;

        // Create "swoosh" particles when legs are extending
        if (t > 0.2 && t < 0.5) {
            createSwooshParticle(x + legMovementX1, y + legMovementY1, legMovementX1 * 0.2, legMovementY1 * 0.2);
            createSwooshParticle(x + legMovementX2, y + legMovementY2, legMovementX2 * 0.2, legMovementY2 * 0.2);
        }

        animationRotation = 0; // No rotation for this move
    } else if (jumpState.isSpecialMove) { // Original "K" move
        animationRotation = state.frameCount * 0.5;
        legMovementX1 = 10; legMovementY1 = bodyY + 5;
        legMovementX2 = -10; legMovementY2 = bodyY + 5;
        armMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    } else if (jumpState.isDive) {
        // Create a linear wind trail
        if (state.frameCount % 2 === 0) {
            createDiveParticle(x, y - STICK_FIGURE_TOTAL_HEIGHT / 2);
        }

        animationRotation = Math.PI / 2;
        legMovementX1 = 0; legMovementY1 = bodyY - 10;
        legMovementX2 = 0; legMovementY2 = bodyY + 10;
        armMovementX1 = 15; armMovementY1 = headY + 15;
        armMovementX2 = 10; armMovementY2 = headY + 15;
    } else if (jumpState.isCorkscrewSpin) {
        const duration = 500;
        const t = (duration - jumpState.corkscrewSpinDuration) / duration; // t goes from 0 to 1

        // Head animation: Sin wave from 0 -> 1 -> 0, completing two cycles
        const headProgress = Math.sin(t * Math.PI * 2); // Two cycles
        const headScaleX = 1 - (Math.abs(headProgress) * 0.95); // Shrinks to 5% and back

        // Body animation: Same wave, but delayed and completing two cycles
        const delay = 0.2; // 20% delay
        const bodyT = Math.max(0, t - delay);
        const bodyProgress = Math.sin(bodyT * (Math.PI * 2 / (1 - delay))); // Two cycles, adjusted for delay
        const bodyScaleX = 1 - (Math.abs(bodyProgress) * 0.95);

        // Create trail particles
        if (state.frameCount % 2 === 0) {
            createCorkscrewParticle(x, y, headScaleX, bodyScaleX);
        }

        // --- Draw Head ---
        ctx.save();
        ctx.scale(headScaleX, 1);
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(stickFigureEmoji, 0, headY);
        ctx.restore();

        // --- Draw Body and Limbs ---
        ctx.save();
        ctx.scale(bodyScaleX, 1);

        // Body
        ctx.strokeStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(0, headY + 5);
        ctx.lineTo(0, bodyY - 10);
        ctx.stroke();

        // Limbs (simple animation for now)
        legMovementX1 = 15 * bodyScaleX; legMovementY1 = bodyY + 5;
        legMovementX2 = -15 * bodyScaleX; legMovementY2 = bodyY + 5;
        armMovementX1 = 10 * bodyScaleX; armMovementY1 = headY + 15;
        armMovementX2 = -10 * bodyScaleX; armMovementY2 = headY + 15;

        ctx.save();
        ctx.globalAlpha = legOpacity;
        ctx.strokeStyle = legColor;
        ctx.beginPath();
        ctx.moveTo(0, bodyY - 10); ctx.lineTo(legMovementX1, legMovementY1);
        ctx.moveTo(0, bodyY - 10); ctx.lineTo(legMovementX2, legMovementY2);
        ctx.stroke();
        ctx.restore();

        ctx.strokeStyle = baseColor;
        ctx.beginPath();
        ctx.moveTo(0, headY + 10); ctx.lineTo(armMovementX1, armMovementY1);
        ctx.moveTo(0, headY + 10); ctx.lineTo(armMovementX2, armMovementY2);
        ctx.stroke();

        ctx.restore(); // Restore from body scaling

        // Prevent default drawing by returning after custom drawing
        ctx.restore(); // from the main translate/rotate
        return;
    } else if (jumpState.isScissorKick) {
        const t = state.frameCount * 0.4;
        legMovementX1 = 15 * Math.sin(t); legMovementY1 = bodyY + 5;
        legMovementX2 = -15 * Math.sin(t); legMovementY2 = bodyY + 5;
        armMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    } else if (jumpState.isPhaseDash) { // Enhanced to Fire Dash
        // Create a trail of fire particles
        for (let i = 0; i < 2; i++) {
            const color = Math.random() > 0.3 ? 'rgba(255, 80, 0, 0.7)' : 'rgba(255, 180, 0, 0.7)'; // Orange/Yellow
            state.fireTrail.push({
                x: x - 10 + Math.random() * 20,
                y: y - STICK_FIGURE_TOTAL_HEIGHT / 2 + Math.random() * 20,
                size: Math.random() * 5 + 2,
                life: 1,
                color: color
            });
        }

        // Add a fiery glow to the player
        ctx.shadowColor = 'orange';
        ctx.shadowBlur = 15;

        const dashOffset = (1 - (jumpState.phaseDashDuration / 600)) * 50; // Dash forward
        ctx.translate(dashOffset, 0);
        legMovementX1 = 15; legMovementY1 = bodyY + 5;
        legMovementX2 = -5; legMovementY2 = bodyY + 5;
        armMovementX1 = 15; armMovementY1 = headY + 15;
        armMovementX2 = -5; armMovementY2 = headY + 15;
    } else if (jumpState.isHover) { // Enhanced Hover
        const hoverHeight = -25 - 5 * Math.sin(state.frameCount * 0.1); // Gentle bobbing motion
        ctx.translate(0, hoverHeight);

        // Create downward propulsion particles
        if (state.frameCount % 3 === 0) {
            createHoverParticle(x, y + bodyY);
        }

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

        legMovementX1 = 0; legMovementY1 = bodyY + 15;
        legMovementX2 = 0; legMovementY2 = bodyY + 15;
        armMovementX1 = 5; armMovementY1 = headY + 5;
        armMovementX2 = -5; armMovementY2 = headY + 5;
    } else if (jumpState.isCartoonScramble) {
        // Create a dust cloud at the feet
        if (state.frameCount % 2 === 0) {
            createScrambleDust(x, y + 10); // y+10 to be at ground level
        }

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
        // Create sparkle particles at the feet
        if (state.frameCount % 2 === 0) { // Generate particles every other frame
            createMoonwalkSparkle(x + legMovementX1, y + legMovementY1 + 5);
            createMoonwalkSparkle(x + legMovementX2, y + legMovementY2 + 5);
        }

        animationRotation = -Math.PI / 16; // Slight backward lean
        const t = (700 - jumpState.moonwalkDuration) / 700; // t goes 0 -> 1
        const cycle = t * Math.PI * 2; // Two full cycles for a complete moonwalk step

        // Use a sine wave to create the glide-and-pause effect
        const leg1Progress = Math.sin(cycle);
        const leg2Progress = Math.sin(cycle + Math.PI);

        // Move legs back and forth
        legMovementX1 = leg1Progress * 15;
        legMovementX2 = leg2Progress * 15;
        legMovementY1 = bodyY + 5;
        legMovementY2 = bodyY + 5;

        // Keep arms relatively still to emphasize leg movement
        armMovementX1 = 5; armMovementY1 = headY + 15;
        armMovementX2 = -5; armMovementY2 = headY + 15;
    } else if (jumpState.isShockwave) {
        const t = (400 - jumpState.shockwaveDuration) / 400; // t goes 0 -> 1

        // Draw multiple expanding rings for a particle effect
        for (let i = 0; i < 3; i++) {
            // Stagger the start of each ring
            const ringT = Math.max(0, t - i * 0.1);
            if (ringT > 0) {
                const radius = 100 * ringT; // Larger radius
                const opacity = (1 - ringT) * 0.7; // Fade out

                ctx.beginPath();
                ctx.arc(0, bodyY + 10, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(173, 216, 230, ${opacity})`;
                ctx.lineWidth = 4;
                ctx.stroke();
            }
        }

        legMovementX1 = 5; legMovementY1 = bodyY + 5;
        legMovementX2 = -5; legMovementY2 = bodyY + 5;
        armMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    } else if (jumpState.isBackflip) {
        const t = (500 - jumpState.backflipDuration) / 500;
        animationRotation = -t * Math.PI * 2;

        if (state.frameCount % 2 === 0) {
            createFlipTrailParticle(x, y, animationRotation);
        }

        legMovementX1 = 10; legMovementY1 = bodyY + 5;
        legMovementX2 = -10; legMovementY2 = bodyY + 5;
        armMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    } else if (jumpState.isFrontflip) {
        const t = (500 - jumpState.frontflipDuration) / 500;
        animationRotation = t * Math.PI * 2;

        if (state.frameCount % 2 === 0) {
            createFlipTrailParticle(x, y, animationRotation);
        }

        legMovementX1 = 10; legMovementY1 = bodyY + 5;
        legMovementX2 = -10; legMovementY2 = bodyY + 5;
        armMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    } else if (jumpState.isHoudini) {
        const duration = 800;
        const t = (duration - jumpState.houdiniDuration) / duration;

        if (jumpState.houdiniPhase === 'disappearing') {
            // The character is gone, only the smoke cloud (drawn separately) is visible.
            // We return early to prevent drawing the character.
            ctx.restore(); // Restore the main transform to not break subsequent draws
            return;
        } else { // Reappearing phase
            // Fade the character back in
            ctx.globalAlpha = (t - 0.5) * 2;
        }

        // Keep the stick figure static during the effect
        legMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    } else if (jumpState.isMeteorStrike) {
        const t = (800 - jumpState.meteorStrikeDuration) / 800;
        animationRotation = t * Math.PI * 1.5; // Rotate into a downward arc

        // Engulf in flames
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 20;

        // Trail of smoke and embers
        if (state.frameCount % 2 === 0) {
            const color = Math.random() > 0.3 ? 'rgba(255, 80, 0, 0.7)' : 'rgba(100, 100, 100, 0.5)'; // Orange/Grey
            state.fireTrail.push({ // Re-using fireTrail for smoke/embers
                x: x,
                y: y - STICK_FIGURE_TOTAL_HEIGHT / 2,
                size: Math.random() * 4 + 2,
                life: 1,
                color: color
            });
        }

        // Tucked in "ball" pose
        legMovementX1 = 5; legMovementY1 = bodyY;
        legMovementX2 = -5; legMovementY2 = bodyY;
        armMovementX1 = 5; armMovementY1 = headY + 20;
        armMovementX2 = -5; armMovementY2 = headY + 20;
    }

    // Reset shadow properties if they were set by a special move
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

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

export function drawFireSpinner(playerX, playerY) {
    if (!state.jumpState.isFireSpinner) return;

    const numFireballs = 5;
    const orbitRadius = 50;
    const rotationSpeed = 0.1;
    const angle = state.frameCount * rotationSpeed;

    for (let i = 0; i < numFireballs; i++) {
        const fireballAngle = angle + (i * (Math.PI * 2 / numFireballs));
        const x = playerX + orbitRadius * Math.cos(fireballAngle);
        const y = playerY - STICK_FIGURE_TOTAL_HEIGHT / 2 + orbitRadius * Math.sin(fireballAngle);

        ctx.save();
        ctx.globalAlpha = 0.8 + 0.2 * Math.sin(state.frameCount * 0.2 + i);
        ctx.font = '24px Arial';
        ctx.fillText('🔥', x, y);
        ctx.restore();
    }
}

export function drawIncineration(obstacle, angleRad) {
    const { x, emoji, animationProgress } = obstacle;
    const groundY = GROUND_Y - x * Math.tan(angleRad) + OBSTACLE_EMOJI_Y_OFFSET;

    ctx.save();
    ctx.translate(x, groundY);
    ctx.rotate(-angleRad);

    if (animationProgress < 0.9) { // Burning phase extended to 90% of the animation
        const scale = 1 + animationProgress * 0.5; // Expands slightly
        const opacity = 1 - (animationProgress / 0.9); // Fade out over the new duration
        ctx.globalAlpha = opacity;
        ctx.font = `${OBSTACLE_EMOJI_SIZE * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 0, 0);

        // Fire effect
        for (let i = 0; i < 5; i++) {
            const fireX = (Math.random() - 0.5) * 20;
            const fireY = (Math.random() - 0.5) * 20;
            ctx.fillText('🔥', fireX, fireY);
        }
    } else { // Ash phase shortened to the last 10%
        // Assign random offset only once when the ash phase begins
        if (obstacle.ashOffsetX === undefined) {
            obstacle.ashOffsetX = (Math.random() - 0.5) * 20;
            obstacle.ashOffsetY = (Math.random() - 0.5) * 10;
        }

        const ashProgress = (animationProgress - 0.9) / 0.1;
        const opacity = 1 - ashProgress;
        const yOffset = 10 * ashProgress; // Sinks into the ground

        ctx.globalAlpha = opacity;
        ctx.font = '24px Arial';
        ctx.fillStyle = '#555';
        ctx.fillText('💨', obstacle.ashOffsetX, yOffset + obstacle.ashOffsetY); // Ash pile with random offset
    }

    ctx.restore();
}

export function createShatterEffect(x, y, emoji) {
    const particleCount = 10;
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        state.shatteredObstacles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            emoji: emoji,
            size: OBSTACLE_EMOJI_SIZE / 2,
            gravity: 0.1
        });
    }
}

export function drawShatteredObstacles() {
    for (let i = state.shatteredObstacles.length - 1; i >= 0; i--) {
        const p = state.shatteredObstacles[i];
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        if (p.life <= 0) {
            state.shatteredObstacles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.font = `${p.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.emoji, p.x, p.y);
            ctx.restore();
        }
    }
}

export function drawIgnitedObstacle(obstacle, angleRad) {
    // First, draw the original obstacle
    drawObstacle(obstacle, angleRad);

    // Then, draw a more dynamic fire effect on top of it
    ctx.save();
    const groundY = GROUND_Y - obstacle.x * Math.tan(angleRad) + OBSTACLE_EMOJI_Y_OFFSET;
    ctx.translate(obstacle.x, groundY);
    ctx.rotate(-angleRad);

    const numFlames = 1 + Math.floor(Math.random() * 3); // 1 to 3 flames
    for (let i = 0; i < numFlames; i++) {
        const fireX = (Math.random() - 0.5) * OBSTACLE_EMOJI_SIZE;
        const fireY = (Math.random() - 0.5) * OBSTACLE_HEIGHT;
        const fireSize = Math.random() * 12 + 6; // Larger, more varied flames
        const opacity = 0.6 + Math.random() * 0.4; // Varied opacity

        ctx.globalAlpha = opacity;
        ctx.fillStyle = `rgba(255, ${100 + Math.random() * 100}, 0, ${opacity})`;
        ctx.beginPath();
        ctx.arc(fireX, fireY, fireSize, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

export function draw() {
    ctx.fillStyle = currentTheme.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGroundPoundParticles();
    drawHoudiniParticles();
    drawMoonwalkParticles();
    drawHoverParticles();
    drawScrambleDust();
    drawDiveParticles();
    drawSwooshParticles();
    drawFlipTrail();
    drawCorkscrewTrail();
    drawFireTrail();
    drawShatteredObstacles();
    drawClouds();
    drawFirestormFlashes();
    drawPlayerEmbers();

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
        drawFireSpinner(currentX, currentY); // Draw fireballs around the player

        // Draw incinerating obstacles
        state.incineratingObstacles.forEach(obstacle => {
            drawIncineration(obstacle, groundAngleRad);
        });

        // Draw ignited obstacles
        state.ignitedObstacles.forEach(obstacle => {
            drawIgnitedObstacle(obstacle, groundAngleRad);
        });

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

    

    export function createFirestormFlashes(angleRad) {

    

        if (state.firestormParticles.length >= state.MAX_FIRESTORM_PARTICLES) return;

    

    

    

        const burstX = Math.random() * canvas.width;

    

        const burstY = GROUND_Y - burstX * Math.tan(angleRad) - Math.random() * 10;

    

        const particleCount = 5 + Math.floor(Math.random() * 5); // 5 to 9 particles

    

    

    

        for (let i = 0; i < particleCount; i++) {

    

            const angle = Math.random() * Math.PI * 2; // Random direction

    

            const speed = Math.random() * 2 + 1;

    

            const color = Math.random() > 0.3 ? 'rgba(255, 80, 0, 0.7)' : 'rgba(255, 180, 0, 0.7)'; // Orange/Yellow

    

    

    

            state.firestormParticles.push({

    

                x: burstX,

    

                y: burstY,

    

                vx: Math.cos(angle) * speed,

    

                vy: Math.sin(angle) * speed, // Particles will spread out

    

                life: 1,

    

                size: Math.random() * 6 + 3, // a bit larger than dash particles

    

                color: color

    

            });

    

        }

    

    }

    

    

    

    export function drawFirestormFlashes() {

    

        for (let i = state.firestormParticles.length - 1; i >= 0; i--) {

    

            const p = state.firestormParticles[i];

    

            p.x += p.vx;

    

            p.y += p.vy;

    

            p.life -= 0.05;

    

            p.size *= 0.95; // Shrink

    

    

    

            if (p.life <= 0 || p.size <= 0.5) {

    

                state.firestormParticles.splice(i, 1);

    

            } else {

    

                ctx.save();

    

                ctx.globalAlpha = p.life;

    

                ctx.fillStyle = p.color;

    

                ctx.beginPath();

    

                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

    

                ctx.fill();

    

                ctx.restore();

    

            }

    

        }

    

    }

    

    export function createPlayerEmbers(playerY) {

    

        if (state.playerEmberParticles.length >= state.MAX_EMBER_PARTICLES) return;

    

    

    

        const numEmbers = 3 + Math.floor(Math.random() * 3); // Create 3 to 5 embers per call

    

        for (let i = 0; i < numEmbers; i++) {

    

            state.playerEmberParticles.push({

    

                x: STICK_FIGURE_FIXED_X + (Math.random() - 0.5) * 30, // Wider spread

    

                y: playerY + Math.random() * STICK_FIGURE_TOTAL_HEIGHT,

    

                life: 1.2, // Slightly longer lifespan

    

                size: Math.random() * 4 + 2, // Slightly larger embers

    

                vx: (Math.random() - 0.5) * 1, // More varied velocity

    

                vy: (Math.random() - 0.5) * 1

    

            });

    

        }

    

    }

    

    export function drawPlayerEmbers() {

        for (let i = state.playerEmberParticles.length - 1; i >= 0; i--) {

            const p = state.playerEmberParticles[i];

            p.x += p.vx;

            p.y += p.vy;

            p.life -= 0.05;

            if (p.life <= 0) {

                state.playerEmberParticles.splice(i, 1);

            } else {

                ctx.save();

                ctx.globalAlpha = p.life;

                ctx.fillStyle = `rgba(255, ${Math.random() * 200}, 0, ${p.life})`;

                ctx.beginPath();

                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

                ctx.fill();

                ctx.restore();

            }

        }

    }

    