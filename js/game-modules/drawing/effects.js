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

export function createGroundPoundEffect(x, y) {
    const particleCount = 40;
    const groundColorRgb = hexToRgb(currentTheme.ground);

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI; // Upward semi-circle
        const speed = Math.random() * 5 + 2;
        gameState.groundPoundParticles.push({
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
        gameState.fieryHoudiniParticles.push({
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

export function drawFieryHoudiniParticles() {
    for (let i = gameState.fieryHoudiniParticles.length - 1; i >= 0; i--) {
        const p = gameState.fieryHoudiniParticles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03; // Slower fade for a more lingering effect

        if (p.life <= 0) {
            gameState.fieryHoudiniParticles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowColor = 'orange';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
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
    const burstX = Math.random() * canvas.width;
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

export function drawFirestormFlashes() {
    for (let i = gameState.firestormParticles.length - 1; i >= 0; i--) {
        const p = gameState.firestormParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        p.size *= 0.95; // Shrink
        if (p.life <= 0 || p.size <= 0.5) {
            gameState.firestormParticles.splice(i, 1);
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
    if (gameState.playerEmberParticles.length >= gameState.MAX_EMBER_PARTICLES) return;
    const numEmbers = 3 + Math.floor(Math.random() * 3); // Create 3 to 5 embers per call
    for (let i = 0; i < numEmbers; i++) {
        gameState.playerEmberParticles.push({
            x: STICK_FIGURE_FIXED_X + (Math.random() - 0.5) * 30, // Wider spread
            y: playerY + Math.random() * STICK_FIGURE_TOTAL_HEIGHT,
            life: 1.2, // Slightly longer lifespan
            size: Math.random() * 4 + 2, // Slightly larger embers
            vx: (Math.random() - 0.5) * 1, // More varied velocity
            vy: (Math.random() - 0.5) * 1
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