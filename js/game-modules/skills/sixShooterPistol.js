// js/game-modules/skills/sixShooterPistol.js

import { gameState, setSixShooterAmmo, setSixShooterReloading } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';
import { STICK_FIGURE_FIXED_X, GROUND_Y, STICK_FIGURE_TOTAL_HEIGHT } from '../../constants.js';
import { canvas } from '../../dom-elements.js';

const SIX_SHOOTER_AMMO_CAPACITY = 6;
const SIX_SHOOTER_RELOAD_TIME_MS = 1500;
const BULLET_VELOCITY_PX_MS = 0.8;
const BULLET_WIDTH = 10;
const BULLET_HEIGHT = 4;
const BULLET_COLOR = '#FF4500'; // Fiery orange-red

function activate(state) {
    if (state.sixShooterAmmo > 0 && !state.isSixShooterReloading) {
        console.log("-> Six Shooter: Firing shot. Ammo left:", state.sixShooterAmmo - 1);

        const currentSegment = state.raceSegments[Math.min(state.currentSegmentIndex, state.raceSegments.length - 1)];
        const groundAngleRad = currentSegment.angleRad;
        const playerGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(groundAngleRad);
        const playerCenterY = playerGroundY - (STICK_FIGURE_TOTAL_HEIGHT / 2) - 5;

        const bullet = {
            x: STICK_FIGURE_FIXED_X + 20,
            y: playerCenterY,
            width: BULLET_WIDTH,
            height: BULLET_HEIGHT,
            color: BULLET_COLOR,
            velocity: BULLET_VELOCITY_PX_MS,
            angle: groundAngleRad // Store the angle at the time of firing
        };
        state.activeSixShooterBullets.push(bullet);

        playAnimationSound('shotgun-blast'); // Placeholder sound
        setSixShooterAmmo(state.sixShooterAmmo - 1);

        if (state.sixShooterAmmo - 1 === 0) {
            console.log("-> Six Shooter: Ammo empty. Reloading...");
            setSixShooterReloading(true);
            setTimeout(() => {
                console.log("-> Six Shooter: Reload complete.");
                setSixShooterAmmo(SIX_SHOOTER_AMMO_CAPACITY);
                setSixShooterReloading(false);
            }, SIX_SHOOTER_RELOAD_TIME_MS);
            playAnimationSound('shotgun-reload'); // Placeholder sound
        }
    } else {
        console.log("-> Six Shooter: Cannot fire. Reloading or out of ammo.");
        // Optional: play an "empty clip" sound
    }
}

function update(state, dt) {
    // Update bullet positions
    for (let i = state.activeSixShooterBullets.length - 1; i >= 0; i--) {
        const bullet = state.activeSixShooterBullets[i];
        
        // Calculate movement based on angle, negating the Y component
        const dx = bullet.velocity * Math.cos(bullet.angle) * dt;
        const dy = -bullet.velocity * Math.sin(bullet.angle) * dt;

        bullet.x += dx;
        bullet.y += dy;

        // Remove bullets that go off-screen
        if (bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            state.activeSixShooterBullets.splice(i, 1);
        }
    }
}

function draw(ctx, state) {
    // Draw bullets
    state.activeSixShooterBullets.forEach(bullet => {
        ctx.save();
        // Translate and rotate the canvas to draw the bullet at the correct angle, negating the rotation angle
        ctx.translate(bullet.x, bullet.y);
        ctx.rotate(-bullet.angle);
        ctx.fillStyle = bullet.color;
        // Draw the rectangle centered on the new origin
        ctx.fillRect(-bullet.width / 2, -bullet.height / 2, bullet.width, bullet.height);
        ctx.restore();
    });
}

export const sixShooterPistolSkill = {
    name: 'Six Shooter Pistol',
    activate,
    update,
    draw
};
