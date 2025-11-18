// js/game-modules/skills/sixShooterPistol.js

import { gameState, setSixShooterAmmo, setSixShooterReloading } from '../state-manager.js';
import { playAnimationSound } from '../../audio.js';

const SIX_SHOOTER_AMMO_CAPACITY = 6;
const SIX_SHOOTER_RELOAD_TIME_MS = 1500;

function activate(state) {
    if (state.sixShooterAmmo > 0 && !state.isSixShooterReloading) {
        console.log("-> Six Shooter: Firing shot. Ammo left:", state.sixShooterAmmo - 1);
        // This is where we will add bullet creation logic later.
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
    // Logic for updating bullet positions will go here.
}

function draw(ctx, state) {
    // Logic for drawing bullets will go here.
}

export const sixShooterPistolSkill = {
    name: 'Six Shooter Pistol',
    activate,
    update,
    draw
};
