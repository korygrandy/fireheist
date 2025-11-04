// =================================================================
// AUDIO FUNCTIONS
// =================================================================

import { EMOJI_MUSIC_MAP, DEFAULT_MUSIC_URL } from './constants.js';
import { soundToggleButton, disableSaveSettings } from "./dom-elements.js";

export let isMuted = false;
export let backgroundMusic = null;

const MUTE_STORAGE_KEY = 'fireHeistMuteSetting';

export function loadMuteSetting() {
    if (disableSaveSettings.checked) {
        isMuted = false; // Default to unmuted when settings are disabled
    } else {
        const savedMuteSetting = localStorage.getItem(MUTE_STORAGE_KEY);
        isMuted = savedMuteSetting === 'true'; // Default to unmuted if no setting is found
    }

    // Apply the loaded setting
    if (isMuted) {
        if (backgroundMusic) { backgroundMusic.volume.value = -Infinity; }
        chaChingSynth.mute = true;
        collisionSynth.mute = true;
        debuffSynth.mute = true;
        quackSound.mute = true;
        powerUpSound.mute = true;
        winnerSound.mute = true;
        loserSound.mute = true;
        gameStartSound.mute = true;
        if (soundToggleButton) soundToggleButton.textContent = "🔊 Unmute";
    } else {
        chaChingSynth.mute = false;
        collisionSynth.mute = false;
        debuffSynth.mute = false;
        quackSound.mute = false;
        powerUpSound.mute = false;
        winnerSound.mute = false;
        loserSound.mute = false;
        gameStartSound.mute = false;
        if (backgroundMusic) { backgroundMusic.volume.value = -18; }
        if (soundToggleButton) soundToggleButton.textContent = "🔇 Mute";
    }
    console.log(`-> loadMuteSetting: Mute setting loaded. isMuted: ${isMuted}`);
}

export const chaChingSynth = new Tone.MetalSynth({
    frequency: 200, envelope: { attack: 0.001, decay: 0.2, release: 0.1 },
    harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
}).toDestination();
chaChingSynth.mute = isMuted;

export const collisionSynth = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }
}).toDestination();
collisionSynth.volume.value = -10;
collisionSynth.mute = isMuted;

export const debuffSynth = new Tone.MembraneSynth({
    envelope: { attack: 0.005, decay: 0.4, sustain: 0.01, release: 0.5 },
    octaves: 10, pitchDecay: 0.1
}).toDestination();
debuffSynth.volume.value = -10;
debuffSynth.mute = isMuted;

export const quackSound = new Tone.Player({
    url: './fx/quack.mp3',
    volume: -10,
    onload: () => console.log("-> AUDIO: Quack sound loaded."),
    onerror: (e) => console.error("-> AUDIO: Error loading quack sound:", e)
}).toDestination();
quackSound.mute = isMuted;

export const powerUpSound = new Tone.Player({
    url: './fx/power-up.mp3',
    volume: -10,
    onload: () => console.log("-> AUDIO: Power-up sound loaded."),
    onerror: (e) => console.error("-> AUDIO: Error loading power-up sound:", e)
}).toDestination();
powerUpSound.mute = isMuted;

export const winnerSound = new Tone.Player({
    url: './fx/winner.mp3',
    volume: -5,
    onload: () => console.log("-> AUDIO: Winner sound loaded."),
    onerror: (e) => console.error("-> AUDIO: Error loading winner sound:", e)
}).toDestination();

export const loserSound = new Tone.Player({
    url: './fx/loser.mp3',
    volume: -5,
    onload: () => console.log("-> AUDIO: Loser sound loaded."),
    onerror: (e) => console.error("-> AUDIO: Error loading loser sound:", e)
}).toDestination();

export const gameStartSound = new Tone.Player({
    url: './fx/game-start.mp3',
    volume: -10,
    onload: () => console.log("-> AUDIO: Game start sound loaded."),
    onerror: (e) => console.error("-> AUDIO: Error loading game start sound:", e)
}).toDestination();

export function preloadEndgameSounds() {
    winnerSound.buffer;
    loserSound.buffer;
}

export function playWinnerSound() {
    if (isMuted) return;
    if (winnerSound.state === 'stopped') winnerSound.start();
}

export function playLoserSound() {
    if (isMuted) return;
    if (loserSound.state === 'stopped') loserSound.start();
}

export function playGameStartSound() {
    if (isMuted) return;
    if (gameStartSound.state === 'stopped') gameStartSound.start();
}

let backgroundMusicUrl = DEFAULT_MUSIC_URL;

export function setBackgroundMusicUrl(url) {
    backgroundMusicUrl = url || DEFAULT_MUSIC_URL;
    console.log(`-> setBackgroundMusicUrl: Music URL set to ${backgroundMusicUrl}`);
}

export function initializeMusicPlayer() {
    if (backgroundMusic && backgroundMusic.state !== "stopped") {
        backgroundMusic.stop();
        backgroundMusic.dispose();
    }
    backgroundMusic = new Tone.Player({
        url: backgroundMusicUrl,
        loop: true,
        volume: -10,
        autostart: false,
        onload: () => console.log(`-> AUDIO: Background music loaded from ${backgroundMusicUrl}`),
        onerror: (e) => console.error("-> AUDIO: Error loading background music:", e)
    }).toDestination();
}

export function playChaChing() {
    if (isMuted) { return; }
    chaChingSynth.triggerAttackRelease(4000, "16n", Tone.now());
    chaChingSynth.triggerAttackRelease(5000, "16n", Tone.now() + 0.05);
}

export function playCollisionSound() {
    if (isMuted) { return; }
    collisionSynth.triggerAttackRelease("8n");
}

export function playDebuffSound() {
    if (isMuted) { return; }
    debuffSynth.triggerAttackRelease("C2", "8n", Tone.now());
}

export function playQuackSound() {
    if (isMuted) { return; }
    if (quackSound.state === 'stopped') {
        quackSound.start();
    }
}

export function playPowerUpSound() {
    if (isMuted) { return; }
    if (powerUpSound.state === 'stopped') {
        powerUpSound.start();
    }
}

export function toggleSound(soundToggleButton) {
    if (Tone.context.state !== 'running') { Tone.start(); }
    isMuted = !isMuted;

    // Save the new setting to localStorage only if saving is enabled
    if (!disableSaveSettings.checked) {
        localStorage.setItem(MUTE_STORAGE_KEY, isMuted);
    }

    if (isMuted) {
        if (backgroundMusic) { backgroundMusic.volume.value = -Infinity; }
        chaChingSynth.mute = true;
        collisionSynth.mute = true;
        debuffSynth.mute = true;
        quackSound.mute = true;
        powerUpSound.mute = true;
        winnerSound.mute = true;
        loserSound.mute = true;
        gameStartSound.mute = true;
        soundToggleButton.textContent = "🔊 Unmute";
    } else {
        chaChingSynth.mute = false;
        collisionSynth.mute = false;
        debuffSynth.mute = false;
        quackSound.mute = false;
        powerUpSound.mute = false;
        winnerSound.mute = false;
        loserSound.mute = false;
        gameStartSound.mute = false;
        if (backgroundMusic) {
            backgroundMusic.volume.value = -18;
            if (backgroundMusic.state === 'stopped') {
                backgroundMusic.start();
            }
        }
        soundToggleButton.textContent = "🔇 Mute";
    }
    console.log(`-> toggleSound: Mute toggled. isMuted: ${isMuted}`);
}