import { header, controlPanel, mainElement } from '../dom-elements.js';
import {
    DEFAULT_MUSIC_URL,
    EMOJI_MUSIC_MAP,
    THEME_MUSIC_MAP
} from '../constants.js';
import {
    isMuted,
    backgroundMusic,
    chaChingSynth,
    debuffSynth,
    initializeMusicPlayer,
    playPauseGameSound,
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
    setSegmentProgress
} from './state-manager.js';
import { initializeClouds, generateGrassBlades } from './drawing/world.js';
import * as drawing from './drawing.js';
import { displayDailyChallenge, displayDailyChallengeCompletedScreen } from '../ui-modules/daily-challenge-ui.js';
import { markDailyChallengeAsPlayed, updateDailyChallengeWinStreak } from '../daily-challenge.js';
import { animate } from './lifecycle.js';

export function togglePauseGame() {
    if (!gameState.gameRunning) return;
    setPaused(!gameState.isPaused);
    playPauseGameSound();
    const startButton = document.getElementById('startButton');
    if (gameState.isPaused) {
        Tone.Transport.pause();
        startButton.textContent = "Unpause";
        console.log("-> GAME PAUSED");
    } else {
        Tone.Transport.start();
        startButton.textContent = "Pause";
        console.log("-> GAME RESUMED");
        gameState.lastTime = performance.now();
    }
    updateControlPanelState(gameState.gameRunning, gameState.isPaused);
    drawing.draw();
}

export function resetGameState() {
    console.log("-> RESET GAME: Initiated.");
    setGameRunning(false);
    setPaused(false);
    gameState.currentSegmentIndex = 0;
    setSegmentProgress(0);
    setLastTime(0);
    setBackgroundOffset(0);
    gameState.frameCount = 0; 
    setAccumulatedCash(0);

    clearActiveCashBags();
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

    setFirestormActive(false);
    setFirestormEndTime(0);
    setFirestormDrainingEnergy(false);
    setFirestormDrainEndTime(0);
    setFireSpinnerDrainingEnergy(false);
    setFireSpinnerDrainEndTime(0);
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
    setFireSpinnerOnCooldown(false);
    setFireMageActive(false);
    setFireMageEndTime(0);
    setFireMageOnCooldown(false);
    resetStreaks();

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
    setDaysElapsedTotal(0);
    gameState.daysAccumulatedAtSegmentStart = 0;
    setVictory(false);
    setGameOverSequence(false);
    setGameOverSequenceStartTime(0);

    Tone.Transport.stop();
    Tone.Transport.cancel();

    initializeClouds();
    generateGrassBlades(0);

    hideResultsScreen();
    updateControlPanelState(false, false);

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

    setGameRunning(true);
    drawing.setInitialLoad(false);
    applySkillLevelSettings(gameState.currentSkillLevel);
    setGameSpeedMultiplier(gameState.intendedSpeedMultiplier);

    let musicUrl = DEFAULT_MUSIC_URL;
    if (gameState.selectedPersona && gameState.selectedPersona !== 'custom' && personas[gameState.selectedPersona]) {
        musicUrl = personas[gameState.selectedPersona].music;
    } else if (gameState.currentTheme && THEME_MUSIC_MAP[gameState.currentTheme]) {
        musicUrl = THEME_MUSIC_MAP[gameState.currentTheme];
    } else {
        const cleanEmoji = gameState.stickFigureEmoji.replace(/\uFE0F/g, '');
        musicUrl = EMOJI_MUSIC_MAP[cleanEmoji] || DEFAULT_MUSIC_URL;
    }
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
        document.getElementById('actionButtons').classList.add('hidden');
        mainElement.classList.remove('grid', 'lg:grid-cols-3', 'gap-8');
        document.body.style.backgroundColor = '#000';
    }

    requestAnimationFrame(animate);
    console.log("-> START GAME: Animation loop started.");
}

export function stopGame(shouldReset = true) {
    if (!shouldReset && !gameState.gameRunning && !gameState.isGameOverSequence) return;

    console.log("-> STOP GAME: Game execution halted.");
    setGameRunning(false);
    setPaused(false);

    header.classList.remove('hidden');
    controlPanel.classList.remove('hidden');
    document.getElementById('actionButtons').classList.remove('hidden');
    mainElement.classList.add('grid', 'lg:grid-cols-3', 'gap-8');
    document.body.style.backgroundColor = ''; 
    document.body.classList.remove('game-active-fullscreen'); 
    exitFullScreenIfActive(); 

    Tone.Transport.stop();

    if (gameState.isDailyChallengeActive) {
        if (shouldReset) {
            console.log("-> STOP GAME: Resetting Daily Challenge.");
            resetGameState();
            displayDailyChallenge(); 
            showSandboxControls(); 
            gameState.isDailyChallengeActive = false; 
        } else {
            console.log("-> STOP GAME: Daily Challenge ended, displaying results.");
            const newWinStreak = updateDailyChallengeWinStreak(gameState.isVictory);
            const stats = {
                days: Math.round(gameState.daysElapsedTotal),
                hits: gameState.hitsCounter
            };
            const results = {...stats, winStreak: newWinStreak};

            markDailyChallengeAsPlayed(stats, newWinStreak);
            displayDailyChallengeCompletedScreen(results);

            showSandboxControls();
            gameState.isDailyChallengeActive = false; 
            document.getElementById('startButton').textContent = "Start the Heist!";
            const stopButton = document.getElementById('stopButton');
            if (stopButton) {
                stopButton.disabled = false;
            }
        }
    } else if (shouldReset) {
        drawing.setInitialLoad(true);
        resetGameState();
        drawing.draw();
    } else {
        showResultsScreen(gameState.financialMilestones, gameState.raceSegments);
        updateControlPanelState(false, false);
        document.getElementById('startButton').textContent = "Restart Heist!";
        console.log("-> STOP GAME: Game ended, displaying results.");
    }
}

export function handleExitOrReset() {
    if (document.fullscreenElement) {
        exitFullScreenIfActive();
    } else {
        stopGame(true);
    }
}
