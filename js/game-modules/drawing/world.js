import { canvas, ctx } from '../../dom-elements.js';
import { GROUND_Y, STICK_FIGURE_TOTAL_HEIGHT, ACCELERATOR_EMOJI_SIZE, ACCELERATOR_EMOJI, OBSTACLE_EMOJI_SIZE, EVENT_POPUP_HEIGHT, NUM_CLOUDS, CLOUD_SPEED_FACTOR, STICK_FIGURE_FIXED_X, OBSTACLE_EMOJI_Y_OFFSET, OBSTACLE_HEIGHT } from '../../constants.js';
import { currentTheme } from '../../theme.js';
import state, { GRASS_ANIMATION_INTERVAL_MS } from '../state.js';


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
            speedFactor: CLOUD_SPEED_FACTOR + (Math.random() * 0.05),
            opacity: 0.5 + Math.random() * 0.5, // Initial random opacity
            fadeDirection: Math.random() > 0.5 ? 1 : -1, // Random initial fade direction
            fadeSpeed: Math.random() * 0.0005 + 0.0001 // Random fade speed for each cloud
        });
    }
}

export function updateClouds() {
    state.clouds.forEach(cloud => {
        cloud.x -= (state.backgroundOffsetSpeed * cloud.speedFactor);

        // Wrap clouds around when they go off-screen
        if (cloud.x + cloud.size * 2 < 0) {
            cloud.x = canvas.width + cloud.size * 2;
            cloud.y = Math.random() * (canvas.height / 3) + 20; // New random height
        }

        if (state.selectedTheme === 'roadway') {
            // City Night theme: Fade out as the cloud crosses the midpoint of the screen.
            const screenMidpoint = canvas.width / 2;
            const minOpacity = 0.1;
            const maxOpacity = 1.0;

            if (cloud.x > screenMidpoint) {
                // On the right half of the screen, remain fully visible.
                cloud.opacity = maxOpacity;
            } else {
                // On the left half, fade out based on position.
                const progress = cloud.x / screenMidpoint; // Progress goes from 1 down to 0.
                cloud.opacity = minOpacity + (maxOpacity - minOpacity) * progress;
            }
            // Ensure opacity stays within the defined bounds.
            cloud.opacity = Math.max(minOpacity, Math.min(maxOpacity, cloud.opacity));

        } else {
            // Original fading logic for all other themes.
            cloud.opacity += cloud.fadeDirection * cloud.fadeSpeed;
            if (cloud.opacity > 1) { cloud.opacity = 1; cloud.fadeDirection = -1; }
            if (cloud.opacity < 0.3) { cloud.opacity = 0.3; cloud.fadeDirection = 1; }
        }
    });
}

export function drawClouds() {
    ctx.fillStyle = 'white';
    state.clouds.forEach(cloud => {
        const currentX = cloud.x;
        // console.log(`Drawing cloud at x: ${currentX}, y: ${cloud.y}, opacity: ${cloud.opacity}`); // Debug log

        ctx.save();
        ctx.globalAlpha = cloud.opacity;

        ctx.beginPath();
        ctx.arc(currentX, cloud.y, cloud.size * 0.6, 0, Math.PI * 2);
        ctx.arc(currentX + cloud.size * 0.5, cloud.y, cloud.size * 0.7, 0, Math.PI * 2);
        ctx.arc(currentX - cloud.size * 0.5, cloud.y, cloud.size * 0.7, 0, Math.PI * 2);
        ctx.arc(currentX + cloud.size * 0.25, cloud.y - cloud.size * 0.4, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.arc(currentX - cloud.size * 0.25, cloud.y - cloud.size * 0.4, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
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
    const currentAngleRad = state.raceSegments[state.currentSegmentIndex] ? state.raceSegments[state.currentSegmentIndex].angleRad : 0;
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
    if (!state.jumpState.isFireSpinner && !state.isMageSpinnerActive) return;

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

export function drawFlipAndCrumble(obstacle, angleRad) {
    const { x, emoji, animationProgress } = obstacle;
    const groundY = GROUND_Y - x * Math.tan(angleRad) + OBSTACLE_EMOJI_Y_OFFSET;

    ctx.save();
    ctx.translate(x, groundY);
    ctx.rotate(-angleRad);

    if (animationProgress < 0.5) { // Flipping phase
        const flipProgress = animationProgress / 0.5;
        const rotation = Math.PI * flipProgress; // 0 to 180 degrees
        const scale = 1 - (flipProgress * 0.2); // Shrinks to 80%
        const opacity = 1 - (flipProgress * 0.3); // Fades to 70%

        ctx.globalAlpha = opacity;
        ctx.rotate(rotation); // Apply flip rotation
        ctx.scale(scale, scale);

        ctx.font = `${OBSTACLE_EMOJI_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 0, 0);

    } else { // Crumbling phase
        const crumbleProgress = (animationProgress - 0.5) / 0.5;
        const numRubblePieces = 4; // 4 rubble pieces + 1 ember

        if (!obstacle.rubblePieces) {
            obstacle.rubblePieces = [];
            for (let i = 0; i < numRubblePieces; i++) {
                obstacle.rubblePieces.push({
                    emoji: '🪨',
                    offsetX: (Math.random() - 0.5) * 40,
                    offsetY: (Math.random() - 0.5) * 20,
                    initialScale: Math.random() * 0.5 + 0.5
                });
            }
            // Add one special ember piece
            obstacle.rubblePieces.push({
                isEmber: true,
                offsetX: (Math.random() - 0.5) * 20,
                offsetY: (Math.random() - 0.5) * 10,
                initialScale: 0.8
            });
        }

        obstacle.rubblePieces.forEach(piece => {
            if (piece.isEmber) {
                // Ember burnout animation
                const emberOpacity = 1 - crumbleProgress;
                const emberScale = piece.initialScale * (1 - crumbleProgress); // Shrinks to nothing
                const emberColor = `rgba(255, ${100 * (1 - crumbleProgress)}, 0, ${emberOpacity})`;

                ctx.globalAlpha = emberOpacity;
                ctx.fillStyle = emberColor;
                ctx.font = `${OBSTACLE_EMOJI_SIZE * emberScale}px Arial`;
                ctx.fillText('🔥', piece.offsetX, piece.offsetY);

            } else {
                // Regular rubble animation
                const pieceOpacity = 1 - crumbleProgress;
                const pieceScale = piece.initialScale * (1 - crumbleProgress * 0.5);
                const pieceYOffset = 30 * crumbleProgress;

                ctx.globalAlpha = pieceOpacity;
                ctx.font = `${OBSTACLE_EMOJI_SIZE * pieceScale * 0.5}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(piece.emoji, piece.offsetX, piece.offsetY + pieceYOffset);
            }
        });
    }

    ctx.restore();
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