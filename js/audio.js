// =================================================================
// AUDIO FUNCTIONS
// =================================================================

import { EMOJI_MUSIC_MAP, DEFAULT_MUSIC_URL, ANIMATION_SOUND_MAP } from './constants.js';
import { soundToggleButton, disableSaveSettings } from "./dom-elements.js";

export let isMuted = false;
export let backgroundMusic = null;
export const animationPlayers = {}; // Object to hold Tone.Player instances for animations

export const playerActionsBus = new Tone.Channel(-10).toDestination();
export const uiBus = new Tone.Channel(-10).toDestination();
export const musicBus = new Tone.Channel(-18).toDestination();
export const ambientBus = new Tone.Channel(-25).toDestination();

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
        collisionSounds.forEach(sound => sound.mute = true);
        debuffSynth.mute = true;
        quackSound.mute = true;
        powerUpSound.mute = true;
        winnerSound.mute = true;
        loserSound.mute = true;
        gameStartSound.mute = true;
        pauseGameSound.mute = true;
        for (const key in animationPlayers) {
            animationPlayers[key].mute = true;
        }
        if (soundToggleButton) soundToggleButton.textContent = "🔊 Unmute";
    } else {
        chaChingSynth.mute = false;
        collisionSounds.forEach(sound => sound.mute = false);
        debuffSynth.mute = false;
        quackSound.mute = false;
        powerUpSound.mute = false;
        winnerSound.mute = false;
        loserSound.mute = false;
        gameStartSound.mute = false;
        pauseGameSound.mute = false;
        for (const key in animationPlayers) {
            animationPlayers[key].mute = false;
        }
        if (backgroundMusic) { backgroundMusic.volume.value = -18; }
        if (soundToggleButton) soundToggleButton.textContent = "🔇 Mute";
    }
    console.log(`-> loadMuteSetting: Mute setting loaded. isMuted: ${isMuted}`);
}

export const chaChingSynth = new Tone.MetalSynth({
    frequency: 200, envelope: { attack: 0.001, decay: 0.2, release: 0.1 },
    harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
}).connect(uiBus);
chaChingSynth.mute = isMuted;

export const collisionSounds = [
    new Tone.NoiseSynth({
        noise: { type: 'pink' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination(),
    new Tone.Player({ url: './fx/bomb.mp3' }).toDestination(),
    new Tone.Player({ url: './fx/shatter.mp3' }).toDestination()
];
collisionSounds.forEach(sound => {
    if (sound instanceof Tone.Player) {
        sound.volume.value = -10;
    }
    sound.connect(playerActionsBus);
    sound.mute = isMuted;
});

export const debuffSynth = new Tone.MembraneSynth({
    envelope: { attack: 0.005, decay: 0.4, sustain: 0.01, release: 0.5 },
    octaves: 10, pitchDecay: 0.1
}).toDestination();
debuffSynth.volume.value = -10;
debuffSynth.connect(playerActionsBus);
debuffSynth.mute = isMuted;

export const quackSound = new Tone.Player({
    url: './fx/quack.mp3',
    volume: -10,
    onload: () => console.log("-> AUDIO: Quack sound loaded."),
    onerror: (e) => console.error("-> AUDIO: Error loading quack sound:", e)
}).connect(uiBus);
quackSound.mute = isMuted;

export const powerUpSound = new Tone.Player({
    url: './fx/power-up.mp3',
    volume: -10,
    onload: () => console.log("-> AUDIO: Power-up sound loaded."),
    onerror: (e) => console.error("-> AUDIO: Error loading power-up sound:", e)
}).connect(uiBus);
powerUpSound.mute = isMuted;

export const winnerSound = new Tone.Player({
    url: './fx/winner.mp3',
    volume: -5,
    onload: () => console.log("-> AUDIO: Winner sound loaded."),
    onerror: (e) => console.error("-> AUDIO: Error loading winner sound:", e)
}).connect(uiBus);
winnerSound.mute = isMuted;

export const loserSound = new Tone.Player({
    url: './fx/loser.mp3',
    volume: -10,
    onload: () => console.log("-> AUDIO: Loser sound loaded."),
    onerror: (e) => console.error("-> AUDIO: Error loading loser sound:", e)
}).connect(uiBus);
loserSound.mute = isMuted;

export const gameStartSound = new Tone.Player({
    url: './fx/game-start.mp3',
    volume: -10,
    onload: () => console.log("-> AUDIO: Game start sound loaded."),
    onerror: (e) => console.error("-> AUDIO: Error loading game start sound:", e)
}).connect(uiBus);
gameStartSound.mute = isMuted;

export const pauseGameSound = new Tone.Player({
    url: './fx/pause-game.mp3',
    volume: -10,
    onload: () => console.log("-> AUDIO: Pause game sound loaded."),
    onerror: (e) => console.error("-> AUDIO: Error loading pause game sound:", e)
}).connect(uiBus);
pauseGameSound.mute = isMuted;

export function preloadEndgameSounds() {
    winnerSound.buffer;
    loserSound.buffer;
}

export function preloadGameStartSound() {
    gameStartSound.buffer;
}

export function preloadAnimationSounds() {
    for (const animationName in ANIMATION_SOUND_MAP) {
        const url = ANIMATION_SOUND_MAP[animationName];
        animationPlayers[animationName] = new Tone.Player({
            url: `./${url}`,
            volume: -10,
            onload: () => console.log(`-> AUDIO: ${animationName} sound loaded.`),
            onerror: (e) => console.error(`-> AUDIO: Error loading ${animationName} sound:`, e)
        }).connect(playerActionsBus);
        animationPlayers[animationName].mute = isMuted;
        animationPlayers[animationName].buffer; // Preload the buffer
    }
}

export function playAnimationSound(animationName) {
    if (isMuted) { return; }
    const player = animationPlayers[animationName];
    if (player && player.state === 'stopped') {
        player.start();
    }
}

export function playGameStartSound() {
    if (isMuted) { return; }
    if (gameStartSound.state === 'stopped') {
        gameStartSound.start();
    }
}

export function playPauseGameSound() {
    if (isMuted) { return; }
    if (pauseGameSound.state === 'stopped') {
        pauseGameSound.start();
    }
}

export function playWinnerSound() {
    if (isMuted) { return; }
    if (backgroundMusic) { backgroundMusic.volume.value = -Infinity; }
    if (winnerSound.state === 'stopped') {
        winnerSound.start();
    }
}

export function playLoserSound() {
    if (isMuted) { return; }
    if (backgroundMusic) { backgroundMusic.volume.value = -Infinity; }
    if (loserSound.state === 'stopped') {
        loserSound.start();
    }
}

export function initializeMusicPlayer(musicUrl = DEFAULT_MUSIC_URL) {
    if (backgroundMusic) {
        if (backgroundMusic.state === 'started') { backgroundMusic.stop(); }
        backgroundMusic.dispose();
    }

    backgroundMusic = new Tone.Player({
        url: musicUrl,
        loop: true,
        volume: isMuted ? -Infinity : -18
    }).connect(musicBus);
}

export function playChaChing() {
    if (isMuted) { return; }
    chaChingSynth.triggerAttackRelease(4000, "16n", Tone.now());
    chaChingSynth.triggerAttackRelease(5000, "16n", Tone.now() + 0.05);
}

export function playCollisionSound() {
    if (isMuted) { return; }
    const sound = collisionSounds[Math.floor(Math.random() * collisionSounds.length)];
    if (sound instanceof Tone.NoiseSynth) {
        sound.triggerAttackRelease("8n");
    } else if (sound instanceof Tone.Player && sound.state === 'stopped') {
        sound.start();
    }
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
        collisionSounds.forEach(sound => sound.mute = true);
        debuffSynth.mute = true;
        quackSound.mute = true;
        powerUpSound.mute = true;
        winnerSound.mute = true;
        loserSound.mute = true;
        gameStartSound.mute = true;
        pauseGameSound.mute = true;
        for (const key in animationPlayers) {
            animationPlayers[key].mute = true;
        }
        soundToggleButton.textContent = "🔊 Unmute";
    } else {
        chaChingSynth.mute = false;
        collisionSounds.forEach(sound => sound.mute = false);
        debuffSynth.mute = false;
        quackSound.mute = false;
        powerUpSound.mute = false;
        winnerSound.mute = false;
        loserSound.mute = false;
        gameStartSound.mute = false;
        pauseGameSound.mute = false;
        for (const key in animationPlayers) {
            animationPlayers[key].mute = false;
        }
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