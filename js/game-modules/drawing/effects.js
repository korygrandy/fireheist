import { canvas, ctx } from '../../dom-elements.js';
import { STICK_FIGURE_TOTAL_HEIGHT, OBSTACLE_EMOJI_SIZE, GROUND_Y, STICK_FIGURE_FIXED_X, CHRISTMAS_COLLISION_SPARKLE_COLORS } from '../../constants.js';
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

export function createFireWallShatterEffect(x, y) {
    gameState.fireWall.shattered = true;
    const letters = ['F', 'I', 'R', 'E'];
    const letterHeight = 60; // Match the new size

    // Add initial spark burst for impact
    const sparkCount = 30;
    for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 10 + 5;
        gameState.fireWall.sparks.push({
            x: x,
            y: y - 120, // Center of the wall
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            color: `rgba(255, ${180 + Math.random() * 75}, 0, 1)`
        });
    }

    // Create shattering letter particles (with a slight delay)
    setTimeout(() => {
        letters.forEach((letter, i) => {
            const yPos = y - (3 - i) * letterHeight; // Position from top to bottom
            for (let j = 0; j < 5; j++) { // 5 fragments per letter
                gameState.fireWall.letterParticles.push({
                    x: x + (Math.random() - 0.5) * 50,
                    y: yPos + (Math.random() - 0.5) * 20,
                    vx: (Math.random() - 0.5) * 15,
                    vy: (Math.random() - 0.5) * 15,
                    rotation: 0,
                    vr: (Math.random() - 0.5) * 0.5,
                    life: 1.0,
                    text: letter
                });
            }
        });
    }, 50); // 50ms delay

    // Create black smoke cloud (with a slightly longer delay)
    setTimeout(() => {
        for (let i = 0; i < 40; i++) {
            gameState.fireWall.smokeParticles.push({
                x: x + (Math.random() - 0.5) * 100,
                y: y - 150 + (Math.random() - 0.5) * 100,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 40 + 20,
                life: 1.0
            });
        }
    }, 100); // 100ms delay
}

export function drawFireWallShatterEffect() {
    // Draw and update spark particles
    for (let i = gameState.fireWall.sparks.length - 1; i >= 0; i--) {
        const p = gameState.fireWall.sparks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05; // Sparks fade quickly

        if (p.life <= 0) {
            gameState.fireWall.sparks.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.life * 3, 0, Math.PI * 2); // Size shrinks with life
            ctx.fill();
            ctx.restore();
        }
    }

    // Draw and update letter particles
    for (let i = gameState.fireWall.letterParticles.length - 1; i >= 0; i--) {
        const p = gameState.fireWall.letterParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vr;
        p.life -= 0.02;

        if (p.life <= 0) {
            gameState.fireWall.letterParticles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.font = 'bold 40px Impact';
            ctx.fillStyle = `rgba(255, ${150 * p.life}, 0, ${p.life})`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.text, 0, 0);
            ctx.restore();
        }
    }

    // Draw and update smoke particles
    for (let i = gameState.fireWall.smokeParticles.length - 1; i >= 0; i--) {
        const p = gameState.fireWall.smokeParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.size *= 1.02; // Smoke expands
        p.life -= 0.015;

        if (p.life <= 0) {
            gameState.fireWall.smokeParticles.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life * 0.5; // Make smoke semi-transparent and fade with life
            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

export function createImpactSpark(x, y) {
    const sparkCount = 10;
    const sparks = [];
    for (let i = 0; i < sparkCount; i++) {
        sparks.push({
            x,
            y,
            size: Math.random() * 3 + 1,
            velocityX: (Math.random() - 0.5) * 4,
            velocityY: (Math.random() - 0.5) * 4,
            life: 100, // Lifespan of the spark
        });
    }
    gameState.activeImpactSparks.push(sparks);
}

export function createChristmasCollisionBurst(x, y) {
    const colors = CHRISTMAS_COLLISION_SPARKLE_COLORS;
    const emojis = ['✨', '⭐', '💫'];
    const sparkCount = 12;
    
    for (let i = 0; i < sparkCount; i++) {
        const angle = (i / sparkCount) * Math.PI * 2;
        const velocity = 3 + Math.random() * 3;
        const sparkCluster = [{
            x,
            y,
            velocityX: Math.cos(angle) * velocity,
            velocityY: Math.sin(angle) * velocity,
            life: 80,
            color: colors[Math.floor(Math.random() * colors.length)],
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            rotation: Math.random() * Math.PI * 2
        }];
        gameState.activeImpactSparks.push(sparkCluster);
    }
}

export function drawImpactSparks() {
    gameState.activeImpactSparks.forEach((sparkCluster, clusterIndex) => {
        sparkCluster.forEach((spark, sparkIndex) => {
            if (spark.emoji) {
                // Christmas emoji sparkles
                ctx.globalAlpha = spark.life / 80;
                ctx.save();
                ctx.translate(spark.x, spark.y);
                ctx.rotate(spark.rotation || 0);
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(spark.emoji, 0, 0);
                ctx.restore();
                ctx.globalAlpha = 1;
            } else {
                // Regular sparkles
                ctx.fillStyle = `rgba(255, 223, 186, ${spark.life / 100})`;
                ctx.fillRect(spark.x, spark.y, spark.size, spark.size);
            }

            spark.x += spark.velocityX;
            spark.y += spark.velocityY;
            spark.life -= 2;

            if (spark.life <= 0) {
                sparkCluster.splice(sparkIndex, 1);
            }
        });

        if (sparkCluster.length === 0) {
            gameState.activeImpactSparks.splice(clusterIndex, 1);
        }
    });
}

// ============================================================================
// PHASE 2C: CASH REWARD PARTICLE SYSTEM
// ============================================================================
// Creates tier-colored particle effects when cash is earned with skill multipliers

/**
 * Tier color palette for cash reward particles
 */
const TIER_PARTICLE_COLORS = {
    BASIC: ['#9ca3af', '#6b7280', '#d1d5db'],           // Gray tones
    COSMETIC: ['#10b981', '#34d399', '#6ee7b7'],        // Green tones
    ENLISTED: ['#8b5cf6', '#a78bfa', '#c4b5fd'],        // Purple tones
    MASTER: ['#fbbf24', '#f59e0b', '#fcd34d'],          // Gold/orange tones
    LEGENDARY: ['#f59e0b', '#ef4444', '#fbbf24']        // Fire tones (gold/red/orange)
};

/**
 * Create cash reward particles at a position
 * Shows tier-colored burst when cash is earned with multiplier
 * 
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {string} tier - Skill tier (BASIC, ENLISTED, MASTER, LEGENDARY)
 * @param {number} amount - Cash amount earned
 */
export function createCashRewardParticles(x, y, tier, amount) {
    const colors = TIER_PARTICLE_COLORS[tier] || TIER_PARTICLE_COLORS.BASIC;
    
    // Scale particle count by tier importance
    let particleCount = 8;
    let speed = 2;
    
    switch (tier) {
        case 'LEGENDARY':
            particleCount = 25;
            speed = 4;
            break;
        case 'MASTER':
            particleCount = 18;
            speed = 3;
            break;
        case 'ENLISTED':
            particleCount = 12;
            speed = 2.5;
            break;
        case 'COSMETIC':
            particleCount = 10;
            speed = 2;
            break;
        case 'BASIC':
        default:
            particleCount = 6;
            speed = 1.5;
            break;
    }

    // Create burst particles
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
        const velocity = speed * (0.5 + Math.random() * 0.5);
        
        gameState.cashRewardParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - 1, // Slight upward bias
            size: Math.random() * 3 + 2,
            life: 1.0,
            color: colors[Math.floor(Math.random() * colors.length)],
            tier: tier
        });
    }

    // Add sparkle particles for MASTER and LEGENDARY
    if (tier === 'MASTER' || tier === 'LEGENDARY') {
        for (let i = 0; i < 5; i++) {
            gameState.cashRewardParticles.push({
                x: x + (Math.random() - 0.5) * 30,
                y: y + (Math.random() - 0.5) * 30,
                vx: (Math.random() - 0.5) * 2,
                vy: -Math.random() * 2 - 1,
                size: Math.random() * 2 + 1,
                life: 1.0,
                color: '#ffffff',
                tier: tier,
                isSparkle: true
            });
        }
    }
}

/**
 * Update and draw cash reward particles
 */
export function drawCashRewardParticles() {
    for (let i = gameState.cashRewardParticles.length - 1; i >= 0; i--) {
        const p = gameState.cashRewardParticles[i];
        
        // Apply physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // Gentle gravity
        p.life -= 0.025;
        
        if (p.life <= 0) {
            gameState.cashRewardParticles.splice(i, 1);
            continue;
        }
        
        ctx.save();
        ctx.globalAlpha = p.life;
        
        if (p.isSparkle) {
            // Draw sparkle as a 4-pointed star
            ctx.fillStyle = p.color;
            const size = p.size * p.life;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - size);
            ctx.lineTo(p.x + size * 0.3, p.y);
            ctx.lineTo(p.x, p.y + size);
            ctx.lineTo(p.x - size * 0.3, p.y);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(p.x - size, p.y);
            ctx.lineTo(p.x, p.y + size * 0.3);
            ctx.lineTo(p.x + size, p.y);
            ctx.lineTo(p.x, p.y - size * 0.3);
            ctx.closePath();
            ctx.fill();
        } else {
            // Draw regular particle as circle
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
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
        });
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

// --- Jet Pack Effect ---
export function createJetPackEffect(targetObstacle, skillLevel) {
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

export function drawShotgunBlast() {
    if (!gameState.shotgunParticles || gameState.shotgunParticles.length === 0) return;

    ctx.fillStyle = 'orange';
    for (const particle of gameState.shotgunParticles) {
        ctx.fillRect(particle.x, particle.y, 5, 5);
    }
}

export function createPhoenixSparks(x, y) {
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        gameState.phoenixSparks.push({
            x: x + (Math.random() - 0.5) * 80, // Spawn across the top of the arch
            y: y + (Math.random() - 0.5) * 20,
            vx: Math.cos(angle) * speed * 0.5,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 4 + 2,
            life: 1.5, // Longer life for a nice trail
            gravity: 0.1,
            color: `rgba(255, ${190 + Math.floor(Math.random() * 65)}, 0, 0.9)`
        });
    }
}

export function drawPhoenixSparks() {
    for (let i = gameState.phoenixSparks.length - 1; i >= 0; i--) {
        const p = gameState.phoenixSparks[i];

        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        if (p.life <= 0) {
            gameState.phoenixSparks.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

export function createEchoSlamEffect() {
    const ringCount = 3;
    const ringSpacing = 50;
    const particlePerRing = 50;

    for (let i = 0; i < ringCount; i++) {
        const radius = (i + 1) * ringSpacing;
        for (let j = 0; j < particlePerRing; j++) {
            const angle = (j / particlePerRing) * Math.PI * 2;
            gameState.echoSlamParticles.push({
                x: STICK_FIGURE_FIXED_X + Math.cos(angle) * radius,
                y: GROUND_Y - STICK_FIGURE_TOTAL_HEIGHT / 2 + Math.sin(angle) * radius,
                life: 1,
                initialRadius: radius,
                angle: angle,
                speed: 1 + i * 0.5,
            });
        }
    }
}

export function createFireStomperEffect() {
    const particleCount = 100;
    const fireColors = [
        'rgba(255, 80, 0, 0.9)',
        'rgba(255, 165, 0, 1)',
        'rgba(255, 100, 0, 0.9)',
    ];

    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.random() * Math.PI * 2);
        const speed = (Math.random() * 5 + 3);
        gameState.groundPoundParticles.push({
            x: STICK_FIGURE_FIXED_X,
            y: GROUND_Y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 5 + 3,
            life: 1,
            gravity: 0,
            color: fireColors[Math.floor(Math.random() * fireColors.length)]
        });
    }
}

export function drawEchoSlamParticles() {
    for (let i = gameState.echoSlamParticles.length - 1; i >= 0; i--) {
        const p = gameState.echoSlamParticles[i];
        p.life -= 0.05;

        if (p.life <= 0) {
            gameState.echoSlamParticles.splice(i, 1);
        } else {
            const currentRadius = p.initialRadius + (1 - p.life) * 50;
            p.x = STICK_FIGURE_FIXED_X + Math.cos(p.angle) * currentRadius;
            p.y = GROUND_Y - STICK_FIGURE_TOTAL_HEIGHT / 2 + Math.sin(p.angle) * currentRadius;

            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
}

// ====================================
// SHOCKWAVE RING EFFECT
// ====================================
export function createShockwaveRing(x, y) {
    // Create multiple concentric rings that expand outward
    const ringCount = 3;
    for (let i = 0; i < ringCount; i++) {
        gameState.shockwaveRings.push({
            x: x,
            y: y,
            radius: 10 + i * 15, // Staggered start radii
            maxRadius: 300 + i * 50, // How far the ring expands
            life: 1.0,
            fadeSpeed: 0.015 + i * 0.005, // Outer rings fade faster
            expandSpeed: 8 + i * 2, // Outer rings expand faster
            color: i === 0 ? 'rgba(255, 200, 50, ' : i === 1 ? 'rgba(255, 150, 50, ' : 'rgba(255, 100, 50, ',
            lineWidth: 4 - i // Inner ring is thickest
        });
    }
    
    // Add some particle debris for extra impact
    const debrisCount = 20;
    for (let i = 0; i < debrisCount; i++) {
        const angle = (i / debrisCount) * Math.PI * 2;
        const speed = 3 + Math.random() * 4;
        gameState.groundPoundParticles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: -Math.abs(Math.sin(angle) * speed * 0.5), // Mostly horizontal with slight upward
            size: Math.random() * 3 + 2,
            life: 1,
            gravity: 0.15,
            color: `rgba(255, ${150 + Math.floor(Math.random() * 100)}, 50, 0.8)`
        });
    }
}

export function drawShockwaveRings() {
    for (let i = gameState.shockwaveRings.length - 1; i >= 0; i--) {
        const ring = gameState.shockwaveRings[i];
        
        // Expand the ring
        ring.radius += ring.expandSpeed;
        ring.life -= ring.fadeSpeed;
        
        if (ring.life <= 0 || ring.radius >= ring.maxRadius) {
            gameState.shockwaveRings.splice(i, 1);
        } else {
            ctx.save();
            ctx.globalAlpha = ring.life * 0.7;
            ctx.strokeStyle = ring.color + ring.life + ')';
            ctx.lineWidth = ring.lineWidth * ring.life; // Thin out as it fades
            ctx.beginPath();
            // Draw as a horizontal ellipse (compressed vertically for ground-level effect)
            ctx.ellipse(ring.x, ring.y, ring.radius, ring.radius * 0.3, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }
}