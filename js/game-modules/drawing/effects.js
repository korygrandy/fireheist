import { canvas, ctx } from '../../dom-elements.js';
import { STICK_FIGURE_TOTAL_HEIGHT, OBSTACLE_EMOJI_SIZE, GROUND_Y, STICK_FIGURE_FIXED_X } from '../../constants.js';
import { currentTheme } from '../../theme.js';
import { gameState } from '../state-manager.js';

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function createGroundPoundEffect(x, y, skillLevel = 1, colors) {
    let particleCount = 40;
    let speed = 5;

    if (skillLevel > 1) {
        particleCount += 10 * (skillLevel - 1);
        speed += 1 * (skillLevel - 1);
    }
    const groundColorRgb = !colors ? hexToRgb(currentTheme.ground) : null;

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI; // Upward semi-circle
        let particleColor;
        if (colors) {
            particleColor = colors[Math.floor(Math.random() * colors.length)];
        } else {
            particleColor = groundColorRgb ? `rgba(${groundColorRgb.r}, ${groundColorRgb.g}, ${groundColorRgb.b}, ${Math.random() * 0.5 + 0.3})` : `rgba(139, 69, 19, ${Math.random() * 0.5 + 0.3})`;
        }

        gameState.groundPoundParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
            vy: -Math.sin(angle) * speed, // Negative for upward motion
            size: Math.random() * 4 + 2,
            life: 1,
            gravity: 0.2,
            color: particleColor
        });
    }
}

export function drawGroundPoundParticles() {
    for (let i = gameState.groundPoundParticles.length - 1; i >= 0; i--) {
        const p = gameState.groundPoundParticles[i];

        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;

        if (p.life <= 0) {
            gameState.groundPoundParticles.splice(i, 1);
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
    gameState.moonwalkParticles.push({
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
    for (let i = gameState.moonwalkParticles.length - 1; i >= 0; i--) {
        const p = gameState.moonwalkParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02; // Fade out slowly

        if (p.life <= 0) {
            gameState.moonwalkParticles.splice(i, 1);
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
    gameState.hoverParticles.push({
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
    for (let i = gameState.hoverParticles.length - 1; i >= 0; i--) {
        const p = gameState.hoverParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;

        if (p.life <= 0) {
            gameState.hoverParticles.splice(i, 1);
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
    gameState.scrambleParticles.push({
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
    for (let i = gameState.scrambleParticles.length - 1; i >= 0; i--) {
        const p = gameState.scrambleParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05; // Fade out fairly quickly

        if (p.life <= 0) {
            gameState.scrambleParticles.splice(i, 1);
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
    gameState.diveParticles.push({
        x: x,
        y: y + (Math.random() - 0.5) * 20, // Vary vertical position
        length: Math.random() * 15 + 5,
        life: 1,
        speed: Math.random() * 2 + 1,
        color: `rgba(200, 220, 255, ${Math.random() * 0.3 + 0.2})` // Light blueish-white
    });
}

export function drawDiveParticles() {
    for (let i = gameState.diveParticles.length - 1; i >= 0; i--) {
        const p = gameState.diveParticles[i];

        p.x -= p.speed; // Move left
        p.life -= 0.04;

        if (p.life <= 0) {
            gameState.diveParticles.splice(i, 1);
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

export function createJetstreamParticle(x, y) {
    gameState.jetstreamParticles.push({
        x: x,
        y: y + (Math.random() - 0.5) * 15, // Vary vertical position
        length: Math.random() * 20 + 10, // Longer particles
        life: 1,
        speed: Math.random() * 3 + 2, // Faster movement
        color: `rgba(180, 220, 255, ${Math.random() * 0.4 + 0.2})` // Light blueish-white, more transparent
    });
}

export function drawJetstreamParticles() {
    for (let i = gameState.jetstreamParticles.length - 1; i >= 0; i--) {
        const p = gameState.jetstreamParticles[i];

        p.x -= p.speed; // Move left
        p.life -= 0.05;

        if (p.life <= 0) {
            gameState.jetstreamParticles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.length, p.y);
            ctx.stroke();
            ctx.restore();
        }
    }
}

export function createSwooshParticle(x, y, vx, vy) {
    gameState.swooshParticles.push({
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
    for (let i = gameState.swooshParticles.length - 1; i >= 0; i--) {
        const p = gameState.swooshParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.08; // Fade out quickly

        if (p.life <= 0) {
            gameState.swooshParticles.splice(i, 1);
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

export function createHurdleJumpSpikes(x, y, sizeMultiplier = 1) {
    const particleCount = 20;
    const fireColors = [
        'rgba(255, 80, 0, 0.9)',   // Bright Orange
        'rgba(255, 165, 0, 1)',   // Orange
        'rgba(255, 100, 0, 0.9)',  // Deeper Orange
    ];

    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.random() * Math.PI * 2); // Full circle
        const speed = (Math.random() * 3 + 2) * sizeMultiplier;
        const length = (Math.random() * 8 + 5) * sizeMultiplier;

        gameState.swooshParticles.push({ // Reusing swooshParticles for line-based particles
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            length: length,
            life: 0.8, // Shorter life for a quick burst
            color: fireColors[Math.floor(Math.random() * fireColors.length)]
        });
    }
}

export function createFlipTrailParticle(x, y, rotation) {
    gameState.flipTrail.push({
        x: x,
        y: y,
        rotation: rotation,
        life: 1,
        size: STICK_FIGURE_TOTAL_HEIGHT
    });
}

export function drawFlipTrail() {
    for (let i = gameState.flipTrail.length - 1; i >= 0; i--) {
        const p = gameState.flipTrail[i];
        p.life -= 0.1; // Faster fade for a smoother trail

        if (p.life <= 0) {
            gameState.flipTrail.splice(i, 1);
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
    gameState.corkscrewTrail.push({
        x: x,
        y: y,
        headScale: headScale,
        bodyScale: bodyScale,
        life: 1
    });
}

export function drawCorkscrewTrail() {
    for (let i = gameState.corkscrewTrail.length - 1; i >= 0; i--) {
        const p = gameState.corkscrewTrail[i];
        p.life -= 0.15; // Fade out quickly

        if (p.life <= 0) {
            gameState.corkscrewTrail.splice(i, 1);
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
            ctx.fillText(gameState.stickFigureEmoji, 0, -STICK_FIGURE_TOTAL_HEIGHT);
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
        gameState.houdiniParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 10 + 5,
            life: 1, // Represents full life (100%)
            color: poofColor
        })
    }
}

export function createFieryHoudiniPoof(x, y) {
    const particleCount = 40; // More particles for a bigger effect
    const poofColor1 = 'rgba(255, 165, 0, 0.8)'; // Bright Orange
    const poofColor2 = 'rgba(255, 100, 0, 0.7)'; // Deeper Orange

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        gameState.houdiniParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 12 + 6,
            life: 1,
            color: Math.random() > 0.5 ? poofColor1 : poofColor2
        });
    }
}

export function drawHoudiniParticles() {
    for (let i = gameState.houdiniParticles.length - 1; i >= 0; i--) {
        const p = gameState.houdiniParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04; // Fade speed

        if (p.life <= 0) {
            gameState.houdiniParticles.splice(i, 1);
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



export function createFireTrail(x, y) {
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        gameState.fireTrail.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2,
            life: 1,
            color: `rgba(255, ${Math.floor(Math.random() * 100)}, 0, ${Math.random() * 0.5 + 0.5})`
        });
    }
}

export function drawFireTrail() {
    for (let i = gameState.fireTrail.length - 1; i >= 0; i--) {
        const p = gameState.fireTrail[i];
        p.life -= 0.05;
        p.size *= 0.95; // Shrink

        if (p.life <= 0 || p.size <= 0.5) {
            gameState.fireTrail.splice(i, 1);
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

export function createShatterEffect(x, y, emoji) {
    const particleCount = 10;
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        gameState.shatteredObstacles.push({
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
    for (let i = gameState.shatteredObstacles.length - 1; i >= 0; i--) {
        const p = gameState.shatteredObstacles[i];
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        if (p.life <= 0) {
            gameState.shatteredObstacles.splice(i, 1);
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

export function createFirestormFlashes(angleRad) {
    if (gameState.firestormParticles.length >= gameState.MAX_FIRESTORM_PARTICLES) return;

    const skillLevel = gameState.playerStats.skillLevels.firestorm || 1;
    const widerArea = skillLevel >= 4;
    const burstX = Math.random() * (widerArea ? canvas.width * 1.5 : canvas.width);

    const burstY = GROUND_Y - burstX * Math.tan(angleRad) - Math.random() * 10;
    const particleCount = 5 + Math.floor(Math.random() * 5); // 5 to 9 particles
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2; // Random direction
        const speed = Math.random() * 2 + 1;
        const color = Math.random() > 0.3 ? 'rgba(255, 80, 0, 0.7)' : 'rgba(255, 180, 0, 0.7)'; // Orange/Yellow
        gameState.firestormParticles.push({
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



export function createFireExplosion(x, y) {
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 3;
        gameState.firestormParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            size: Math.random() * 8 + 4,
            color: `rgba(255, ${Math.floor(Math.random() * 150)}, 0, 0.8)` // Fiery colors
        });
    }
}

export function drawPlayerEmbers() {
    for (let i = gameState.playerEmberParticles.length - 1; i >= 0; i--) {
        const p = gameState.playerEmberParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) {
            gameState.playerEmberParticles.splice(i, 1);
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

export function createAshParticle(x, y) {
    const particleCount = 25;
    for (let i = 0; i < particleCount; i++) {
        gameState.ashParticles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.2) * 1.2, // Move mostly right and slightly up/down
            vy: (Math.random() - 0.7) * 1, // Move mostly up
            size: Math.random() * 3 + 1,
            life: 1,
            color: `rgba(80, 80, 80, ${Math.random() * 0.5 + 0.3})`
        });
    }
}

export function drawAshParticles() {
    for (let i = gameState.ashParticles.length - 1; i >= 0; i--) {
        const p = gameState.ashParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;

        if (p.life <= 0) {
            gameState.ashParticles.splice(i, 1);
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

export function createMeteorStrikeEffect(targetObstacle, skillLevel) {
    if (!targetObstacle) return;

    const particleCount = 50 + 25 * (skillLevel - 1);
    const explosionSize = 10 + 5 * (skillLevel - 1);

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * explosionSize;
        const color = Math.random() > 0.3 ? `rgba(255, ${Math.floor(Math.random() * 150)}, 0, 0.8)` : `rgba(100, 100, 100, 0.6)`; // Fire and smoke

        gameState.firestormParticles.push({ // Re-using firestorm particles for the explosion
            x: targetObstacle.x,
            y: GROUND_Y - targetObstacle.x * Math.tan(gameState.raceSegments[gameState.currentSegmentIndex].angleRad),
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.5, // Longer life for a bigger boom
                        size: Math.random() * 8 + 4,
                        color: color
                    });
                }
            }
            
            export function drawFireShield(playerX, playerY) {
                if (!gameState.isFireShieldActive) return;
            
                const shieldRadius = STICK_FIGURE_TOTAL_HEIGHT / 2 + 15;
                const pulse = Math.sin(Date.now() / 200) * 5; // Gentle pulse effect
                const currentRadius = shieldRadius + pulse;
            
                // Determine opacity based on remaining time
                const remainingTime = gameState.fireShieldEndTime - Date.now();
                let opacity = 1;
                if (remainingTime < 1000) { // Fade out in the last second
                    opacity = remainingTime / 1000;
                }
            
                ctx.save();
                ctx.globalAlpha = opacity * 0.5; // Semi-transparent
            
                // Outer glow
                ctx.shadowColor = 'rgba(255, 165, 0, 0.9)';
                ctx.shadowBlur = 20;
            
                // Main shield circle
                ctx.fillStyle = 'rgba(255, 140, 0, 0.7)';
                ctx.beginPath();
                ctx.arc(playerX, playerY, currentRadius, 0, Math.PI * 2);
                ctx.fill();
            
                // Inner, brighter ring
                ctx.lineWidth = 2;
                ctx.strokeStyle = `rgba(255, 200, 100, ${opacity * 0.8})`;
                ctx.stroke();
            
                ctx.restore();
            }
            