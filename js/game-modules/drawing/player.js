import { canvas, ctx } from '../../dom-elements.js';
import { STICK_FIGURE_TOTAL_HEIGHT, COLLISION_DURATION_MS, ACCELERATOR_DURATION_MS } from '../../constants.js';
import { currentTheme } from '../../theme.js';
import { gameState } from '../state-manager.js';
import { createSwooshParticle, createDiveParticle, createCorkscrewParticle, createHoverParticle, createScrambleDust, createMoonwalkSparkle, createFlipTrailParticle } from './effects.js';

export function drawStickFigure(x, y, jumpState, angleRad) {
    if (gameState.playerIsInvisible) {
        ctx.restore(); // Ensure any previous transforms are restored
        return; // Don't draw the player if invisible
    }``

    if (gameState.isColliding) {
        console.log(`[DEBUG] Drawing player in collision state.
          isColliding: ${gameState.isColliding},
          collisionDuration: ${gameState.collisionDuration},
          globalAlpha: ${ctx.globalAlpha},
          x: ${x}, y: ${y}`);
    }

    // Determine the base color based on the theme
    const baseColor = (currentTheme.name === '🌑 Outer Space') ? '#555555' : 'black';

    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-angleRad);

    let headY = -STICK_FIGURE_TOTAL_HEIGHT;
    let bodyY = 0;

    const isFading = gameState.collisionDuration > 0;
    const fadeProgress = isFading ? gameState.collisionDuration / COLLISION_DURATION_MS : 0;

    const legOpacity = 1;

    let legColor = baseColor; // Use the dynamic base color for legs
    if (gameState.isColliding) {
        const R = Math.round(255 * fadeProgress);
        legColor = `rgb(${R}, 0, 0)`;
    } else if (gameState.isAccelerating) {
        const accelerationFadeProgress = gameState.accelerationDuration > 0 ? gameState.accelerationDuration / ACCELERATOR_DURATION_MS : 0;
        const G = Math.round(255 * accelerationFadeProgress);
        legColor = `rgb(0, ${G}, 0)`; // Fades from green to black
    }

    let legMovementX1, legMovementY1, legMovementX2, legMovementY2;
    let armMovementX1, armMovementY1, armMovementX2, armMovementY2;
    let animationRotation = 0;

    // Default running animation
    const runSpeed = 0.25;
    const tRun = gameState.frameCount * runSpeed;
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
        animationRotation = gameState.frameCount * 0.5;
        legMovementX1 = 10; legMovementY1 = bodyY + 5;
        legMovementX2 = -10; legMovementY2 = bodyY + 5;
        armMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    } else if (jumpState.isDive) {
        // Create a linear wind trail
        if (gameState.frameCount % 2 === 0) {
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
        if (gameState.frameCount % 2 === 0) {
            createCorkscrewParticle(x, y, headScaleX, bodyScaleX);
        }

        // --- Draw Head ---
        ctx.save();
        ctx.scale(headScaleX, 1);
            ctx.font = '28px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(gameState.stickFigureEmoji, 0, headY);        ctx.restore();

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
        const t = gameState.frameCount * 0.4;
        legMovementX1 = 15 * Math.sin(t); legMovementY1 = bodyY + 5;
        legMovementX2 = -15 * Math.sin(t); legMovementY2 = bodyY + 5;
        armMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    } else if (jumpState.isPhaseDash) { // Enhanced to Fire Dash
        // Create a trail of fire particles
        for (let i = 0; i < 2; i++) {
            const color = Math.random() > 0.3 ? 'rgba(255, 80, 0, 0.7)' : 'rgba(255, 180, 0, 0.7)'; // Orange/Yellow
            gameState.fireTrail.push({
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
        const hoverHeight = -25 - 5 * Math.sin(gameState.frameCount * 0.1); // Gentle bobbing motion
        ctx.translate(0, hoverHeight);

        // Create downward propulsion particles
        if (gameState.frameCount % 3 === 0) {
            createHoverParticle(x, y + bodyY);
        }

        const t = gameState.frameCount * 0.2;
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
        if (gameState.frameCount % 2 === 0) {
            createScrambleDust(x, y + 10); // y+10 to be at ground level
        }

        const t = gameState.frameCount * 1.5;
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
        if (gameState.frameCount % 2 === 0) { // Generate particles every other frame
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

        if (gameState.frameCount % 2 === 0) {
            createFlipTrailParticle(x, y, animationRotation);
        }

        legMovementX1 = 10; legMovementY1 = bodyY + 5;
        legMovementX2 = -10; legMovementY2 = bodyY + 5;
        armMovementX1 = 10; armMovementY1 = headY + 15;
        armMovementX2 = -10; armMovementY2 = headY + 15;
    } else if (jumpState.isFrontflip) {
        const t = (500 - jumpState.frontflipDuration) / 500;
        animationRotation = t * Math.PI * 2;

        if (gameState.frameCount % 2 === 0) {
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
    } else if (jumpState.isFieryHoudini) {
        const duration = 800;
        const t = (duration - jumpState.fieryHoudiniDuration) / duration;

        if (jumpState.fieryHoudiniPhase === 'disappearing') {
            ctx.restore();
            return;
        } else { // Reappearing phase
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
        if (gameState.frameCount % 2 === 0) {
            const color = Math.random() > 0.3 ? 'rgba(255, 80, 0, 0.7)' : 'rgba(100, 100, 100, 0.5)'; // Orange/Grey
            gameState.fireTrail.push({ // Re-using fireTrail for smoke/embers
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
    } else if (gameState.isFireMageActive) {
        // Add a fiery glow and embers for Fire Mage
        ctx.shadowColor = 'red';
        ctx.shadowBlur = 25;
        if (gameState.frameCount % 2 === 0) {
            createPlayerEmbers(y);
        }
    } else if (gameState.isMageSpinnerActive) {
        // Add a fiery glow and embers for Mage Spinner
        ctx.shadowColor = 'orange';
        ctx.shadowBlur = 20;
        if (gameState.frameCount % 3 === 0) {
            createPlayerEmbers(y);
        }
    } else if (jumpState.isFireballRolling) {
        // Draw player as a rolling fireball
        ctx.shadowColor = 'orange';
        ctx.shadowBlur = 25;

        // Add flaking embers
        if (gameState.frameCount % 2 === 0) {
            createPlayerEmbers(y);
        }

        ctx.save();
        ctx.translate(0, -STICK_FIGURE_TOTAL_HEIGHT / 2); // Center the fireball vertically
        ctx.rotate(gameState.frameCount * 0.02); // Rolling animation (even slower spin)

        ctx.beginPath();
        ctx.arc(0, 0, STICK_FIGURE_TOTAL_HEIGHT / 1.5, 0, Math.PI * 2); // Fiery ball
        ctx.fillStyle = `rgba(255, ${100 + Math.floor(Math.random() * 100)}, 0, 0.9)`;
        ctx.fill();

        ctx.strokeStyle = `rgba(255, ${150 + Math.floor(Math.random() * 100)}, 0, 1)`;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();

        // Prevent default drawing
        ctx.restore(); // from the main translate/rotate
        return;
    }

    // Reset shadow properties if they were set by a special move
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    ctx.save();
    ctx.rotate(animationRotation);

    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(gameState.stickFigureEmoji, 0, headY);

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

    

    export function drawFireShield(x, y) {

        const shieldRadius = 40 + 5 * Math.sin(gameState.frameCount * 0.2); // Pulsating radius

        const shieldOpacity = 0.5 + 0.2 * Math.sin(gameState.frameCount * 0.2); // Pulsating opacity

    

        ctx.beginPath();

        ctx.arc(x, y - STICK_FIGURE_TOTAL_HEIGHT / 2, shieldRadius, 0, Math.PI * 2);

        ctx.fillStyle = `rgba(255, 165, 0, ${shieldOpacity})`;

        ctx.fill();

    }

    