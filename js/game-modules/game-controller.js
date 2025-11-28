import { header, controlPanel, mainElement, startButton, canvas } from '../dom-elements.js';
import {
    DEFAULT_MUSIC_URL,
    EMOJI_MUSIC_MAP,
    THEME_MUSIC_MAP,
    SIX_SHOOTER_AMMO_CAPACITY
} from '../constants.js';
import {
    isMuted,
    backgroundMusic,
    chaChingSynth,
    debuffSynth,
    initializeMusicPlayer,
    playPauseGameSound,
    ambientBus,
} from '../audio.js';
import { applySkillLevelSettings } from '../ui-modules/input-handlers.js';
import { showResultsScreen, hideResultsScreen } from '../ui-modules/results.js';
import { updateControlPanelState, exitFullScreenIfActive, showSandboxControls } from '../ui-modules/ui-helpers.js';
import { personas } from '../personas.js';
import {
    setPaused,
    gameState,
    setGameRunning,
    setAccumulatedCash,
    clearActiveCashBags,
    clearFloatingBonusTexts,
    clearCashRewardParticles,
    resetSkillUsageStats,
    clearFireTrail,
    clearIncineratingObstacles,
    clearVanishingObstacles,
    clearHoudiniParticles,
    clearGroundPoundParticles,
    clearFlipTrail,
    clearMoonwalkParticles,
    clearHoverParticles,
    clearScrambleParticles,
    clearDiveParticles,
    clearSwooshParticles,
    clearCorkscrewTrail,
    clearShatteredObstacles,
    clearIgnitedObstacles,
    clearActiveFireballs,
    resetJumpState,
    resetManualJumpOverride,
    setFirestormActive,
    setFirestormEndTime,
    setFirestormDrainingEnergy,
    setFirestormDrainEndTime,
    setFireSpinnerDrainingEnergy,
    setFireSpinnerDrainEndTime,
    setMageSpinnerActive,
    setMageSpinnerEndTime,
    setMageSpinnerOnCooldown,
    setMageSpinnerFireballTimer,
    setPlayerEnergy,
    setCurrentObstacle,
    setColliding,
    setCollisionDuration,
    setCurrentAccelerator,
    setAccelerating,
    setAccelerationDuration,
    setDecelerating,
    setDecelerationDuration,
    setGameSpeedMultiplier,
    setFireSpinnerOnCooldown,
    setFireMageActive,
    setFireMageEndTime,
    setFireMageOnCooldown,
    resetStreaks,
    setOnScreenCustomEvent,
    setDaysElapsedTotal,
    setVictory,
    setGameOverSequence,
    setGameOverSequenceStartTime,
    setLastTime,
    setBackgroundOffset,
    setSegmentProgress,
    setObstaclesIncinerated,
    setSixShooterAmmo,
    setCurrentThemeAnchorImage,
    resetTarzanState
} from './state-manager.js';
import { initializeClouds, generateGrassBlades } from './drawing/world.js';
import * as drawing from './drawing.js';
import { displayDailyChallenge, displayDailyChallengeCompletedScreen } from '../ui-modules/daily-challenge-ui.js';
import { markDailyChallengeAsPlayed, updateDailyChallengeWinStreak } from '../daily-challenge.js';
import { animate } from './lifecycle.js';
import { updateArmoryCashDisplay } from '../ui-modules/armory.js';
import { loadThemeAnchorImage } from './assets.js';
import { fireMageSkill } from './skills/fireMage.js';
import { mageSpinnerSkill } from './skills/mageSpinner.js';
import { fieryHoudiniSkill } from './skills/fieryHoudini.js';
import { fireSpinnerSkill } from './skills/fireSpinner.js';

export function togglePauseGame() {
    if (!gameState.gameRunning) return;
    setPaused(!gameState.isPaused);
    playPauseGameSound();
    const startButton = document.getElementById('startButton');
    if (gameState.isPaused) {
        Tone.Transport.pause();
        ambientBus.volume.value = -Infinity; // Mute ambient sound
        startButton.textContent = "Unpause";
        console.log("-> GAME PAUSED");
    } else {
        Tone.Transport.start();
        if (!isMuted) {
            ambientBus.volume.value = 0; // Restore ambient sound
        }
        startButton.textContent = "Pause";
        console.log("-> GAME RESUMED");
        gameState.lastTime = performance.now();
    }
    updateControlPanelState(gameState.gameRunning, gameState.isPaused);
    drawing.draw();
}

export function resetGameState() {
    gameState.showDailyChallengeCompletedOverlay = false;
    gameState.leaderboardInitials.isActive = false;
    gameState.leaderboardInitials.submitted = false;
    gameState.cheatsUsed = false; // Reset cheat tracking for new game
    console.log("-> RESET GAME: Initiated.");
    setGameRunning(false);
    setPaused(false);
    gameState.currentSegmentIndex = 0;
    setSegmentProgress(0);
    setLastTime(0);
    setBackgroundOffset(0);
    gameState.frameCount = 0; 
    setAccumulatedCash(0);
    gameState.customGameIncinerationCount = 0; // Reset custom game incineration counter

    // Reset theme anchor state
    gameState.themeAnchor = {
        image: null,
        opacity: 0,
        fadingIn: false,
        fadeStartTime: 0,
        fadeDuration: 2000
    };
    setCurrentThemeAnchorImage(null); // Explicitly clear the loaded image
    loadThemeAnchorImage(gameState.selectedTheme);

    clearActiveCashBags();
    clearFloatingBonusTexts();
    clearCashRewardParticles();
    resetSkillUsageStats();
    clearFireTrail();
    clearIncineratingObstacles();
    clearVanishingObstacles();
    clearHoudiniParticles();
    clearGroundPoundParticles();
    clearFlipTrail();
    clearMoonwalkParticles();
    clearHoverParticles();
    clearScrambleParticles();
    clearDiveParticles();
    clearSwooshParticles();
    clearCorkscrewTrail();
    clearShatteredObstacles();
    clearIgnitedObstacles();
    clearActiveFireballs();

    resetJumpState();
    resetManualJumpOverride();
    resetTarzanState();
    
    // Reset Reaper Drone state
    gameState.reaperDroneState = {
        isActive: false,
        spawnTime: 0,
        hasFired: false,
        missileState: {
            isActive: false,
            x: 0,
            y: 0,
            startX: 0,
            startY: 0,
            targetObstacleX: 0,
            targetObstacleY: 0,
            velocity: 6,
            progress: 0,
            duration: 300,
            startTime: 0,
            trailParticles: [],
            fadeStartTime: 0
        },
        fadingOut: false,
        droneOpacity: 1.0,
        targetSearchStartTime: 0,
        targetSearchTimeoutMs: 500,
        hasAttemptedFire: false,
        failureReason: null
    };
    
    setSixShooterAmmo(SIX_SHOOTER_AMMO_CAPACITY);
    gameState.molotovCocktailsRemaining = 3;

    setFirestormActive(false);
    setFirestormEndTime(0);
    setFirestormDrainingEnergy(false);
    setFirestormDrainEndTime(0);
    setFireSpinnerDrainingEnergy(false);
    setFireSpinnerDrainEndTime(0);
    fireSpinnerSkill.reset(gameState);
    setMageSpinnerActive(false);
    setMageSpinnerEndTime(0);
    setMageSpinnerOnCooldown(false);
    setMageSpinnerFireballTimer(0);
    gameState.mageSpinnerFireballsSpawned = 0; 
    setPlayerEnergy(gameState.maxPlayerEnergy);
    setCurrentObstacle(null);
    setColliding(false);
    setCollisionDuration(0);
    setCurrentAccelerator(null);
    setAccelerating(false);
    setAccelerationDuration(0);
    setDecelerating(false);
    setDecelerationDuration(0);
    setGameSpeedMultiplier(gameState.intendedSpeedMultiplier);
    gameState.intendedSpeedMultiplier = 1.0; // Reset to default
    setFireSpinnerOnCooldown(false);
    setFireMageActive(false);
    setFireMageEndTime(0);
    setFireMageOnCooldown(false);

    switch (gameState.currentSkillLevel) {
        case 'Pro':
            gameState.fireballsRemaining = 3;
            break;
        case 'Novice':
            gameState.fireballsRemaining = 7;
            break;
        case 'Rookie':
            gameState.fireballsRemaining = 10;
            break;
        default:
            gameState.fireballsRemaining = 10;
    }
    
    resetStreaks();
    gameState.skillCooldowns = {};

    gameState.activeCustomEvents = Object.values(gameState.customEvents).flat().map(event => ({
        ...event, wasTriggered: false, isActive: false, wasSpawned: false
    })).sort((a, b) => a.daysSinceStart - b.daysSinceStart);
    setOnScreenCustomEvent(null);

    gameState.raceSegments.forEach(segment => {
        if (segment.isMilestone) {
            segment.animationState = 'idle';
            segment.animationProgress = 0;
        }
    });

    gameState.hitsCounter = 0;
    gameState.playerStats.totalInGameIncinerations = 0;
    setDaysElapsedTotal(0);
    gameState.daysAccumulatedAtSegmentStart = 0;
    setVictory(false);
    setGameOverSequence(false);
    setGameOverSequenceStartTime(0);

    loadThemeAnchorImage(gameState.selectedTheme);

    Tone.Transport.stop();
    Tone.Transport.cancel();

    initializeClouds();
    generateGrassBlades(0);

    hideResultsScreen();
    updateControlPanelState(false, false);

    setAccumulatedCash(0);
    gameState.displayCash = 0; // Explicitly reset the display value
    drawing.draw(); // Force a redraw to show the reset state immediately

    console.log("-> RESET GAME: Complete.");
}

export function startGame() {
    if (gameState.raceSegments.length < 2) {
        console.error("-> START GAME FAILED: Insufficient milestones.");
        return;
    }
    if (gameState.gameRunning) return;

    console.log("-> START GAME: Initiating game start sequence.");

    resetGameState();
    
    gameState.miniGameBonus = 0; // Reset the bonus for the new run

    setGameRunning(true);
    drawing.setInitialLoad(false);
    applySkillLevelSettings(gameState.currentSkillLevel);
    setGameSpeedMultiplier(gameState.intendedSpeedMultiplier);

    // Disable data tab if a persona is chosen, re-enable it otherwise
    const dataTabButton = document.querySelector('button[data-tab="data"]');
    if (dataTabButton) {
        if (gameState.selectedPersona !== 'custom') {
            dataTabButton.disabled = true;
            dataTabButton.classList.add('disabled-tab');
        } else {
            dataTabButton.disabled = false;
            dataTabButton.classList.remove('disabled-tab');
        }
    }

    let musicUrl = DEFAULT_MUSIC_URL;
    const cleanEmoji = gameState.stickFigureEmoji.replace(/\uFE0F/g, '');
    const isDefaultEmoji = cleanEmoji === '🦹‍♂️';

    if (gameState.isDailyChallengeActive && gameState.selectedTheme && THEME_MUSIC_MAP[gameState.selectedTheme]) {
        // 1. Daily Challenge music has top priority, overriding everything else.
        musicUrl = THEME_MUSIC_MAP[gameState.selectedTheme];
    } else if (gameState.selectedPersona && gameState.selectedPersona !== 'custom' && personas[gameState.selectedPersona] && personas[gameState.selectedPersona].music) {
        // 2. Persona-specific music (when not in a daily challenge)
        musicUrl = personas[gameState.selectedPersona].music;
    } else if (isDefaultEmoji && gameState.selectedTheme && THEME_MUSIC_MAP[gameState.selectedTheme]) {
        // 3. Theme-specific music for the default emoji in sandbox mode
        musicUrl = THEME_MUSIC_MAP[gameState.selectedTheme];
    } else if (EMOJI_MUSIC_MAP[cleanEmoji]) {
        // 4. Emoji-specific music for any non-default emoji (in sandbox mode)
        musicUrl = EMOJI_MUSIC_MAP[cleanEmoji];
    }
    // 5. Fallback to DEFAULT_MUSIC_URL is handled by the initial declaration

    initializeMusicPlayer(musicUrl);

    if (Tone.context.state !== 'running') {
        Tone.start();
    }
    if (!isMuted) {
        chaChingSynth.mute = false;
        debuffSynth.mute = false;
        Tone.loaded().then(() => {
            backgroundMusic.sync().start(0);
            Tone.Transport.start();
        });
    }

    updateControlPanelState(true, false);

    const mobileBreakpoint = 768;
    if (window.innerWidth < mobileBreakpoint) {
        document.getElementById('gameCanvas').scrollIntoView({behavior: 'smooth', block: 'start'});
    }

    if (document.fullscreenElement) {
        document.body.classList.add('game-active-fullscreen');
        header.classList.add('hidden');
        controlPanel.classList.add('hidden');
        // Keep actionButtons visible for player controls during fullscreen
        mainElement.classList.remove('grid', 'lg:grid-cols-3', 'gap-8');
        document.body.style.backgroundColor = '#000';
    }

    setPlayerEnergy(gameState.maxPlayerEnergy); // Ensure energy starts at max
    requestAnimationFrame(animate);
    gameCanvas.focus(); // Set focus to the canvas when the game starts
    console.log("-> START GAME: Animation loop started.");
}

export function stopGame(shouldReset = true) {
    if (gameState.leaderboardInitials.isActive) {
        return;
    }
    if (!shouldReset && !gameState.gameRunning && !gameState.isGameOverSequence) return;

    const wasDailyChallengeCompletion = gameState.isDailyChallengeActive && !shouldReset;

    console.log("-> STOP GAME: Game execution halted.");
    setGameRunning(false);
    setPaused(false);

    // Disable the start button immediately to prevent accidental re-starts
    if (startButton) {
        startButton.disabled = true;
    }

    header.classList.remove('hidden');
    controlPanel.classList.remove('hidden');
    document.getElementById('actionButtons').classList.remove('hidden');
    mainElement.classList.add('grid', 'lg:grid-cols-3', 'gap-8');
    document.body.style.backgroundColor = ''; 
    document.body.classList.remove('game-active-fullscreen'); 
    exitFullScreenIfActive(); 

    // Re-enable data tab if custom persona is selected
    const dataTabButton = document.querySelector('button[data-tab="data"]');
    if (gameState.selectedPersona === 'custom' && dataTabButton) {
        dataTabButton.disabled = false;
        dataTabButton.classList.remove('disabled-tab');
    }

    if (backgroundMusic && backgroundMusic.state === 'started') {
        backgroundMusic.unsync();
    }
    Tone.Transport.stop();

    if (gameState.isDailyChallengeActive) {
        if (shouldReset) {
            console.log("-> STOP GAME: Resetting Daily Challenge.");
            resetGameState();
            showSandboxControls(); 
            gameState.isDailyChallengeActive = false; 
        } else {
            console.log("-> STOP GAME: Daily Challenge finished, cleaning up.");
            
            // Add the winnings from the daily challenge to the player's total stats
            if (gameState.accumulatedCash > 0 || gameState.miniGameBonus > 0) {
                const winnings = gameState.accumulatedCash + gameState.miniGameBonus;
                gameState.playerStats.totalAccumulatedCash += winnings;
                console.log(`-> STOP GAME: Added Daily Challenge winnings of $${winnings.toLocaleString()} to total cash.`);
                // savePlayerStats(); // The save is already called in leaderboard-initials.js
                updateArmoryCashDisplay(); // Explicitly update the UI
            }

            showSandboxControls();
            const infoPanel = document.getElementById('info-panel');
            if (infoPanel) {
                infoPanel.classList.add('hidden');
            }
            setGameOverSequence(false); // End the game over sequence
            gameState.isDailyChallengeActive = false; // Fully deactivate daily challenge mode
            
            document.getElementById('startButton').textContent = "Start the Heist!";
            const stopButton = document.getElementById('stopButton');
            if (stopButton) {
                stopButton.disabled = true;
            }
        }
    } else if (shouldReset) {
        const infoPanel = document.getElementById('info-panel');
        if (infoPanel) {
            infoPanel.classList.add('hidden');
        }
        drawing.setInitialLoad(true);
        resetGameState();
        drawing.draw();
    } else {
        // On successful run completion, add the main heist value and any mini-game bonus to the total
        // Only count cash for Persona-based games, NOT Custom Persona (to prevent exploit via custom milestones)
        if (gameState.isVictory && (gameState.accumulatedCash > 0 || gameState.miniGameBonus > 0) && gameState.selectedPersona !== 'custom') {
            const winnings = gameState.accumulatedCash + gameState.miniGameBonus;
            gameState.playerStats.totalAccumulatedCash += winnings;
            console.log(`-> STOP GAME: Added winnings of $${winnings.toLocaleString()} to total cash.`);
        } else if (gameState.selectedPersona === 'custom') {
            console.log(`-> STOP GAME: Custom Persona - winnings not added to Armory total (anti-exploit).`);
        }
        showResultsScreen(gameState.financialMilestones, gameState.raceSegments);
        updateControlPanelState(false, false);
        document.getElementById('startButton').textContent = "Restart Heist!";
        console.log("-> STOP GAME: Game ended, displaying results.");
    }

    // Re-enable start button and set focus after a short delay to allow UI to settle
    setTimeout(() => {
        if (startButton && !wasDailyChallengeCompletion) {
            startButton.disabled = false;
        }
        gameCanvas.focus(); // Ensure canvas has focus after game stops
    }, 500); // 500ms delay
}

export function handleExitOrReset() {
    if (document.fullscreenElement) {
        exitFullScreenIfActive();
    } else {
        stopGame(true);
    }
}
