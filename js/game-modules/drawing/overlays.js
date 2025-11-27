import { canvas, ctx } from '../../dom-elements.js';
import { FADE_DURATION, STICK_FIGURE_FIXED_X, STICK_FIGURE_TOTAL_HEIGHT, GROUND_Y } from '../../constants.js';
import { gameState } from '../state-manager.js';
import { drawLeaderboardInitials } from './leaderboard-initials.js';
import { skillIconCache, loadAndDrawSvg, loadAndDrawImage } from '../assets.js';
import { ARMORY_ITEMS } from '../../unlocks.js';
import { getActiveSkillMultiplier, getMultiplierTierColors, formatMultiplier } from '../skillCashMultipliers.js';

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
    if (!gameState.daysCounter) return;

    const { days, delta, frame } = gameState.daysCounter;
    const opacity = 1 - (frame / FADE_DURATION);
    if (opacity <= 0) {
        gameState.daysCounter = null;
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
    gameState.daysCounter.frame++;
}

export function drawVictoryOverlay(elapsedTime) {
    if (gameState.showDailyChallengeCompletedOverlay) return;

    const opacity = Math.min(1, elapsedTime / 1000);
    let mainText, subText, mainColor;
    const SUCCESS_COLOR = '#00FF88';
    const FAILURE_COLOR = '#FF0044';

    if (gameState.hitsCounter === 0) {
        mainText = '🎉 Congratulations!';
        subText = 'You reached financial independence!';
        mainColor = SUCCESS_COLOR;
    } else {
        mainText = 'FIRE Failed!';
        subText = `You encountered ${gameState.hitsCounter} obstacles`;
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

    if (gameState.leaderboardInitials.isActive) {
        drawLeaderboardInitials();
    }

    ctx.restore();
}

export function drawMoneyCounter() {
    const formattedCash = Math.round(gameState.displayCash).toLocaleString();
    const labelString = 'Total Haul: ';
    const valueString = `$${formattedCash}`;
    const fullString = labelString + valueString;
    const boxHeight = 40;
    const boxX = 10;
    const boxY = 10;
    const PADDING_X = 15;
    let fontSize = 24;

    if (fullString.length > 25) {
        fontSize = 14;
    } else if (fullString.length > 20) {
        fontSize = 18;
    }

    ctx.font = `bold ${fontSize}px Arial`;
    const fullTextMetrics = ctx.measureText(fullString);
    const dynamicBoxWidth = fullTextMetrics.width + (PADDING_X * 2);
    const textX = boxX + PADDING_X;
    const textY = boxY + boxHeight / 2;

    ctx.fillStyle = 'white';
    ctx.fillRect(boxX, boxY, dynamicBoxWidth, boxHeight);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(boxX, boxY, dynamicBoxWidth, boxHeight);

    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    // Draw the label
    ctx.fillText(labelString, textX, textY);
    
    // Measure the label and draw the value in green
    const labelMetrics = ctx.measureText(labelString);
    const valueX = textX + labelMetrics.width;
    ctx.fillStyle = '#28a745'; // Green color for money
    ctx.fillText(valueString, valueX, textY);
}

export function drawBonusHaul() {
    if (!gameState.isBonusGameComplete) return;

    const formattedCash = Math.round(gameState.bonusGameHaul).toLocaleString();
    const labelString = 'Bonus Haul: ';
    const valueString = `$${formattedCash}`;
    const fullString = labelString + valueString;
    const boxHeight = 40;
    const boxX = 10;
    const boxY = 60; // Position below the Total Haul box
    const PADDING_X = 15;
    let fontSize = 24;

    if (fullString.length > 25) {
        fontSize = 14;
    } else if (fullString.length > 20) {
        fontSize = 18;
    }

    ctx.font = `bold ${fontSize}px Arial`;
    const fullTextMetrics = ctx.measureText(fullString);
    const dynamicBoxWidth = fullTextMetrics.width + (PADDING_X * 2);
    const textX = boxX + PADDING_X;
    const textY = boxY + boxHeight / 2;

    ctx.fillStyle = 'white';
    ctx.fillRect(boxX, boxY, dynamicBoxWidth, boxHeight);
    ctx.strokeStyle = '#333';
    ctx.strokeRect(boxX, boxY, dynamicBoxWidth, boxHeight);

    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Draw the label
    ctx.fillText(labelString, textX, textY);

    // Measure the label and draw the value in green
    const labelMetrics = ctx.measureText(labelString);
    const valueX = textX + labelMetrics.width;
    ctx.fillStyle = '#28a745'; // Green color for money
    ctx.fillText(valueString, valueX, textY);
}

export function drawGameCounters() {
    const daysString = `Days Elapsed: ${Math.round(gameState.daysElapsedTotal).toLocaleString()}`;
    const hitsString = `Hits: ${gameState.hitsCounter} | 🔥: ${gameState.playerStats.consecutiveIncinerations} (${gameState.currentSkillLevel} Skill)`;

    const PADDING = 10;
    const LINE_HEIGHT = 20;
    const BOX_WIDTH = 250;
    const BOX_X = canvas.width - BOX_WIDTH - 10;
    const BOX_Y = 10;
    let BOX_HEIGHT = 50;

    let speedText = `Speed: ${gameState.gameSpeedMultiplier.toFixed(1)}x`;

    if (gameState.isDecelerating) {
        speedText += ` (📉)`;
        BOX_HEIGHT = 70;
    } else if (gameState.isAccelerating) {
        speedText += ` (🔥)`;
        BOX_HEIGHT = 70;
    } else if (gameState.isColliding) {
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

    // Draw 'Hits: ' label in black
    ctx.fillStyle = 'black';
    ctx.font = 'bold 14px Inter, sans-serif';
    const hitsLabel = 'Hits: ';
    ctx.fillText(hitsLabel, BOX_X + PADDING, BOX_Y + PADDING + LINE_HEIGHT);

    // Draw hits counter in red
    const hitsValueX = BOX_X + PADDING + ctx.measureText(hitsLabel).width;
    ctx.fillStyle = '#dc3545'; // Red color for hits
    const hitsValue = `${gameState.hitsCounter}`;
    ctx.fillText(hitsValue, hitsValueX, BOX_Y + PADDING + LINE_HEIGHT);

    // Draw the rest of the string (fire emoji and skill level) in the original color
    const incineratedAndSkillText = ` | 🔥: ${gameState.playerStats.totalInGameIncinerations} (${gameState.currentSkillLevel} Skill)`;
    const incineratedAndSkillTextX = hitsValueX + ctx.measureText(hitsValue).width;
    ctx.fillStyle = gameState.hitsCounter > 0 ? '#dc3545' : '#28a745'; // Original color logic
    ctx.fillText(incineratedAndSkillText, incineratedAndSkillTextX, BOX_Y + PADDING + LINE_HEIGHT);

    if (gameState.isAccelerating || gameState.isColliding || gameState.isDecelerating) {
        let speedTextColor = '#000000';
        if (gameState.isAccelerating) speedTextColor = '#ffaa00';
        if (gameState.isColliding || gameState.isDecelerating) speedTextColor = '#dc3545';

        ctx.fillStyle = speedTextColor;
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(speedText, BOX_X + PADDING, BOX_Y + PADDING + (LINE_HEIGHT * 2));
    }
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
    if (event.type === 'ACCELERATOR' && gameState.isAccelerating) {
        opacity = 0.5 + 0.5 * Math.sin(Date.now() / 100);
    } else if (event.type === 'DECELERATOR' && gameState.isDecelerating) {
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

export function drawEnergyBar() {
    const barWidth = 200;
    const barHeight = 20;
    const x = (canvas.width - barWidth) / 2;
    const y = 10;
    const energyPercentage = gameState.playerEnergy / gameState.maxPlayerEnergy;

    ctx.save();

    // Draw the background
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, barWidth, barHeight);

    // Draw the energy fill
    ctx.fillStyle = '#00FF88';
    const fillWidth = Math.round(Math.min(barWidth, barWidth * energyPercentage));
    ctx.fillRect(x, y, fillWidth, barHeight);

    // Draw the border
    ctx.strokeStyle = '#FFF';
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Draw the text
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`ENERGY`, x + barWidth / 2, y + barHeight / 2);

    ctx.restore();
}

export function drawCooldownIndicator() {
    const now = performance.now();
    const cooldownEndTime = gameState.tarzanState.cooldownEndTime || 0;
    const cooldownDuration = 5000; // 5 seconds for Tarzan Swing

    if (now < cooldownEndTime) {
        const remainingTime = cooldownEndTime - now;
        const progress = 1 - (remainingTime / cooldownDuration);

        const indicatorX = (canvas.width / 2) + 120; // Position next to the energy bar
        const indicatorY = 20;
        const radius = 15;

        ctx.save();
        ctx.beginPath();
        ctx.arc(indicatorX, indicatorY, radius, -Math.PI / 2, (Math.PI * 2 * progress) - Math.PI / 2, false);
        ctx.strokeStyle = '#00FF88';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${(remainingTime / 1000).toFixed(1)}s`, indicatorX, indicatorY);

        ctx.restore();
    }
}

export function drawCashMultiplierIndicator() {
    // Only show if a skill is selected
    if (!gameState.activeArmorySkill) return;

    const multiplier = getActiveSkillMultiplier(gameState);
    const colors = getMultiplierTierColors(gameState);
    
    // Position in bottom-right corner
    const indicatorX = canvas.width - 120;
    const indicatorY = canvas.height - 35;
    const boxWidth = 110;
    const boxHeight = 30;
    const borderRadius = 5;

    ctx.save();

    // Draw background box with rounded corners
    ctx.fillStyle = colors.backgroundColor;
    ctx.beginPath();
    ctx.roundRect(indicatorX - boxWidth / 2, indicatorY - boxHeight / 2, boxWidth, boxHeight, borderRadius);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = colors.textColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(indicatorX - boxWidth / 2, indicatorY - boxHeight / 2, boxWidth, boxHeight, borderRadius);
    ctx.stroke();

    // Draw multiplier text
    ctx.fillStyle = colors.textColor;
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${formatMultiplier(multiplier)} 💰`, indicatorX, indicatorY);

    ctx.restore();
}

export function drawDailyChallengeCompletedOverlay() {
    if (!gameState.showDailyChallengeCompletedOverlay) return;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '22px Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textLines = [
        'Stop back in a day for the next challenge!',
        'Check the Hall of Fame to see how you rank,',
        'choose a Persona, or customize your own!'
    ];
    const lines = textLines;
    const lineHeight = 30;
    const startY = canvas.height / 2 - (lineHeight * (lines.length - 1)) / 2;

    lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
    });

    ctx.restore();
}



export function drawActiveSkillIndicator() {
    const activeSkillKey = gameState.playerStats.activeArmorySkill;

    if (!activeSkillKey) return;

    console.log(`[DEBUG] drawActiveSkillIndicator: Drawing skill '${activeSkillKey}'`);

    const skill = ARMORY_ITEMS[activeSkillKey];
    if (!skill) return;

    const indicatorX = 20;
    const indicatorY = 60; // Moved down to avoid overlap, 10px below Total Haul
    const iconSize = 32;
    const textOffset = 10;

    ctx.save();

    // Add glow effect for the icon
    ctx.shadowColor = 'orange';
    ctx.shadowBlur = 10; // Adjust blur radius as needed

    // Draw skill icon
    if (skill.imageUnlocked && skill.imageUnlocked.endsWith('.svg')) {
        loadAndDrawSvg(ctx, skill.imageUnlocked, indicatorX, indicatorY, iconSize, iconSize);
    } else if (skill.imageUnlocked) {
        loadAndDrawImage(ctx, skill.imageUnlocked, indicatorX, indicatorY, iconSize, iconSize);
    } else {
        // For skills with emojis, draw the emoji
        ctx.font = `${iconSize}px Arial`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        
        // Rotate frontflip icon 180 degrees
        if (activeSkillKey === 'frontflip') {
            ctx.save();
            ctx.translate(indicatorX + iconSize / 2, indicatorY + iconSize / 2);
            ctx.rotate(Math.PI); // 180 degrees
            ctx.fillText(skill.emoji || '❓', -iconSize / 2, -iconSize / 2);
            ctx.restore();
        } else {
            ctx.fillText(skill.emoji || '❓', indicatorX, indicatorY);
        }
    }

    // Reset shadow for text to avoid glowing text
    ctx.shadowBlur = 0;

    // Draw ammunition count if applicable
    let ammoCount = null;
    if (activeSkillKey === 'sixShooterPistol') {
        ammoCount = gameState.sixShooterAmmo;
    } else if (activeSkillKey === 'molotovCocktail') {
        ammoCount = gameState.molotovCocktailsRemaining;
    }

    if (ammoCount !== null) {
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'orange'; // Orange glow for ammo count
        ctx.shadowBlur = 5; // Adjust blur radius as needed
        ctx.fillText(`x ${ammoCount}`, indicatorX + iconSize + textOffset, indicatorY + iconSize / 2);
        ctx.shadowBlur = 0; // Reset shadow blur after drawing ammo count
    }

    ctx.restore();
}

export function drawCashBags() {
    gameState.activeCashBags.forEach(bag => {
        ctx.save();
        ctx.globalAlpha = bag.opacity;
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💰', bag.currentX, bag.currentY);
        ctx.restore();
    });
}
