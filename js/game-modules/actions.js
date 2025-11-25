import { createHoudiniPoof, createFieryHoudiniPoof, createJetPackEffect, createGroundPoundEffect, createShatterEffect } from './drawing/effects.js';
import { STICK_FIGURE_FIXED_X, GROUND_Y, ENERGY_SETTINGS, FIRE_MAGE_DURATION_MS, FIREBALL_VELOCITY_PX_MS, FIREBALL_SIZE, MAGE_SPINNER_DURATION_MS, MAGE_SPINNER_FIREBALL_INTERVAL_MS, MAGE_SPINNER_FIREBALL_COUNT, STICK_FIGURE_TOTAL_HEIGHT, OBSTACLE_EMOJI_Y_OFFSET, OBSTACLE_HEIGHT, FIERY_HOUDINI_DURATION_MS, FIERY_HOUDINI_COOLDOWN_MS, FIERY_HOUDINI_RANGE, BLINK_STRIKE_DURATION_MS, JETSTREAM_DASH_DURATION_MS, ECHO_SLAM_DURATION_MS, FIREBALL_ROLL_DURATION_MS, OBSTACLE_WIDTH, JUMP_DURATIONS } from '../constants.js';
import { playAnimationSound } from '../audio.js';
import { consumeEnergy, getSkillModifiedValue, initiateJump, addIncineratingObstacle, setCurrentObstacle, incrementObstaclesIncinerated, incrementConsecutiveIncinerations, setScreenFlash } from './state-manager.js';
import { fieryGroundPoundUpgradeEffects, fireSpinnerUpgradeEffects, fieryHoudiniUpgradeEffects, firestormUpgradeEffects } from './skill-upgrades.js';
import { fieryHoudiniSkill } from './skills/fieryHoudini.js';
import { fireSpinnerSkill } from './skills/fireSpinner.js';
import { firestormSkill } from './skills/firestorm.js';
import { fieryGroundPoundSkill } from './skills/fieryGroundPound.js';
import { fireMageSkill } from './skills/fireMage.js';
import { mageSpinnerSkill } from './skills/mageSpinner.js';
import { fireballRollSkill } from './skills/fireballRoll.js';
import { shotgunSkill } from './skills/shotgun.js';
import { molotovSkill } from './skills/molotov.js';
import { sixShooterPistolSkill } from './skills/sixShooterPistol.js';
import { fireAxeSkill } from './skills/fireAxe.js';
import { tarzanSkill } from './skills/tarzan.js';
import { reaperDroneSkill } from './skills/reaperDrone.js';
import { echoSlamSkill } from './skills/echoSlam.js';
import { fireStomperSkill } from './skills/fireStomper.js';
import { specialMoveSkill } from './skills/specialMove.js';
import { blinkStrikeSkill } from './skills/blinkStrike.js';
import { jetstreamDashSkill } from './skills/jetstreamDash.js';
import { fireballSkill } from './skills/fireball.js';

const skillActionMap = {
    firestorm: (state) => firestormSkill.activate(state),
    fireSpinner: (state) => fireSpinnerSkill.activate(state),
    fieryGroundPound: (state) => fieryGroundPoundSkill.activate(state),
    fireStomper: (state) => fireStomperSkill.activate(state),
    mageSpinner: (state) => mageSpinnerSkill.activate(state),
    fieryHoudini: (state) => fieryHoudiniSkill.activate(state),
    blinkStrike: (state) => blinkStrikeSkill.activate(state),
    jetstreamDash: (state) => jetstreamDashSkill.activate(state),
    echoSlam: (state) => echoSlamSkill.activate(state),
    fireballRoll: (state) => fireballRollSkill.activate(state),
    shotgunBlast: (state) => shotgunSkill.activate(state),
    molotovCocktail: (state) => molotovSkill.activate(state),
    sixShooterPistol: (state) => sixShooterPistolSkill.activate(state),
    fireAxe: (state) => fireAxeSkill.activate(state),
    tarzanSwing: (state) => tarzanSkill.activate(state),
    reaperDrone: (state) => reaperDroneSkill.activate(state),
};

export function handleSpecialMove(gameState) {
    const activeSkill = gameState.playerStats.activeArmorySkill;
    if (activeSkill && skillActionMap[activeSkill]) {
        skillActionMap[activeSkill](gameState);
    } else {
        // Default action if no skill is selected or if the skill is not in the map
        if (gameState.isFireMageActive) {
            castFireball(gameState);
        } else {
            fireMageSkill.activate(gameState);
            if (gameState.isFireMageActive) { // Check if activation was successful before casting
                castFireball(gameState);
            }
        }
    }
}



// Define upgrade effects for Fire Spinner






export function castFireball(state) {
    if (!state.gameRunning || state.isPaused || !state.isFireMageActive) return;
    if (!consumeEnergy(state, 'fireballCast', fireballSkill.config.energyCost)) return;

    // Correctly calculate player's current Y position based on the ground angle
    const currentSegment = state.raceSegments[Math.min(state.currentSegmentIndex, state.raceSegments.length - 1)];
    const groundAngleRad = currentSegment.angleRad;
    const playerGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(groundAngleRad);
    const playerHeight = STICK_FIGURE_FIXED_X / 2; // Approximate center of the player

    const fireball = {
        x: STICK_FIGURE_FIXED_X + 20, // Start slightly ahead of the player
        y: playerGroundY - playerHeight, // Spawn from the player's vertical center
        size: FIREBALL_SIZE,
        velocity: FIREBALL_VELOCITY_PX_MS,
        spawnTime: Date.now()
    };
    state.activeFireballs.push(fireball);
    state.playerStats.fireMageIncinerations++; // Increment Fire Mage incinerations
    playAnimationSound('fireball');
    console.log("-> castFireball: Fireball launched!");
}





export function castMageSpinnerFireball(state, targetObstacle) {
    if (!state.gameRunning || state.isPaused || !targetObstacle) return;

    // Calculate player's current Y position (approximate center)
    const currentSegment = state.raceSegments[Math.min(state.currentSegmentIndex, state.raceSegments.length - 1)];
    const groundAngleRad = currentSegment.angleRad;
    const playerGroundY = GROUND_Y - STICK_FIGURE_FIXED_X * Math.tan(groundAngleRad);
    const playerCenterY = playerGroundY - (STICK_FIGURE_TOTAL_HEIGHT / 2);

    // Fireball starts from player's X, slightly above player's center
    const startX = STICK_FIGURE_FIXED_X + 10;
    const startY = playerCenterY - 10; // Slightly above player center

    // Calculate target Y for the fireball (top of the obstacle)
    const obstacleTopY = GROUND_Y - targetObstacle.x * Math.tan(groundAngleRad) + OBSTACLE_EMOJI_Y_OFFSET - OBSTACLE_HEIGHT;

    // Calculate velocity components to hit the obstacle
    const distanceX = targetObstacle.x - startX;
    const distanceY = obstacleTopY - startY;

    // Using a fixed horizontal velocity, calculate vertical velocity
    const velocityX = FIREBALL_VELOCITY_PX_MS * 1.5; // Slightly faster than regular fireballs
    const duration = distanceX / velocityX; // Time to reach obstacle horizontally
    const velocityY = distanceY / duration; // Required vertical velocity

    const fireball = {
        x: startX,
        y: startY,
        size: FIREBALL_SIZE,
        velocityX: velocityX,
        velocityY: velocityY,
        spawnTime: Date.now(),
        isMageSpinnerFireball: true // Mark this fireball as from Mage Spinner
    };
    state.activeFireballs.push(fireball);
    playAnimationSound('fireball');
    console.log("-> castMageSpinnerFireball: Fireball launched at obstacle!");
}

export function startManualJump(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    initiateJump(state, state.manualJumpDurationMs, 'manualJump');
    console.log("-> startManualJump: Manual jump initiated.");
}

export function startHurdle(state) {
    if (!state.gameRunning || state.jumpState.isJumping || state.isPaused) return;
    state.jumpState.isHurdle = true;
    state.jumpState.hurdleDuration = JUMP_DURATIONS.hurdle;
    initiateJump(state, JUMP_DURATIONS.hurdle, 'hurdle');
    console.log("-> startHurdle: Hurdle initiated.");
}
    

    

    

    

    

        

    

    

    

        

    