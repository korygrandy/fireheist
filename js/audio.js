// =================================================================
// AUDIO FUNCTIONS
// =================================================================

import { EMOJI_MUSIC_MAP, DEFAULT_MUSIC_URL, ANIMATION_SOUND_MAP, THEME_AMBIENT_SOUND_MAP } from './constants.js';
import { soundToggleButton, disableSaveSettings } from "./dom-elements.js";
import { gameState } from './game-modules/state-manager.js';

const MUTE_STORAGE_KEY = 'fireHeistMuteSetting';

export let isMuted = false;
export let backgroundMusic = null;
export let ambientMusic = null;
export let currentAmbientTheme = null;
export const animationPlayers = {}; // Object to hold Tone.Player instances for animations

export const playerActionsBus = new Tone.Channel(-10).toDestination();
export const uiBus = new Tone.Channel(-10).toDestination();
export const musicBus = new Tone.Channel(-18).toDestination();
export const ambientBus = new Tone.Channel(0).toDestination();

function applyMuteState() {
    if (isMuted) {
        musicBus.volume.value = -Infinity;
        ambientBus.volume.value = -Infinity;
        playerActionsBus.volume.value = -Infinity;
        uiBus.volume.value = -Infinity;
        if (soundToggleButton) soundToggleButton.textContent = "🔊 Unmute";
    } else {
        musicBus.volume.value = -18;
        ambientBus.volume.value = 0;
        playerActionsBus.volume.value = -10;
        uiBus.volume.value = -10;

        // Ensure looping sounds resume if they were stopped by muting
        if (backgroundMusic && backgroundMusic.loaded && backgroundMusic.state !== 'started') {
            backgroundMusic.start();
        }
        if (ambientMusic && ambientMusic.loaded && ambientMusic.state !== 'started') {
            ambientMusic.start();
        }
        if (soundToggleButton) soundToggleButton.textContent = "🔇 Mute";
    }
}

export function loadMuteSetting() {
    if (disableSaveSettings.checked) {
        isMuted = false;
    } else {
        const savedMuteSetting = localStorage.getItem(MUTE_STORAGE_KEY);
        isMuted = savedMuteSetting === 'true';
    }
    applyMuteState();
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
    }).connect(playerActionsBus),
    new Tone.Player({ url: './fx/bomb.mp3' }).connect(playerActionsBus),
    new Tone.Player({ url: './fx/shatter.mp3' }).connect(playerActionsBus)
];
collisionSounds.forEach(sound => {
    if (sound instanceof Tone.Player) {
        sound.volume.value = -10;
    }
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

export const jingleBellsSound = new Tone.Player({
    url: './fx/jingle-bells.mp3',
    volume: -10,
    onload: () => console.log("-> AUDIO: Jingle bells sound loaded."),
    onerror: (e) => console.error("-> AUDIO: Error loading jingle bells sound:", e)
}).connect(uiBus);
jingleBellsSound.mute = isMuted;

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
    return gameStartSound.loaded;
}

const CRITICAL_UI_SOUNDS = [
    'beep', 'armory-tab', 'hof-tab', 'keypress', 'submit-chime',
    'skill-unlock', 'final-skill-unlock', 'select-sound', 'unselect-sound',
    'upgrade-skill', 'vault-upgrade', 'start-daily-challenge', 'ignited-flame', 'skill-achieved',
    'reaper-drone-collision'
];

export function preloadCriticalUISounds() {
    const loadingPromises = [];
    for (const soundName of CRITICAL_UI_SOUNDS) {
        if (ANIMATION_SOUND_MAP[soundName]) {
            const url = ANIMATION_SOUND_MAP[soundName];
            const player = new Tone.Player({
                url: `./${url}`,
                volume: -10,
                onload: () => console.log(`-> AUDIO: Critical UI sound '${soundName}' loaded.`),
                onerror: (e) => console.error(`-> AUDIO: Error loading '${soundName}':`, e)
            }).connect(uiBus); // Connect UI sounds to the uiBus
            player.mute = isMuted;
            animationPlayers[soundName] = player;
            loadingPromises.push(player.loaded);
        }
    }
    return Promise.all(loadingPromises);
}

export function preloadAnimationSounds() {
    const loadingPromises = [];
    for (const animationName in ANIMATION_SOUND_MAP) {
        // Skip sounds that were already loaded as critical UI sounds
        if (animationPlayers[animationName]) {
            continue;
        }
        const url = ANIMATION_SOUND_MAP[animationName];
        const player = new Tone.Player({
            url: `./${url}`,
            volume: -10,
            onload: () => console.log(`-> AUDIO: ${animationName} sound loaded.`),
            onerror: (e) => console.error(`-> AUDIO: Error loading ${animationName} sound:`, e)
        }).connect(playerActionsBus);
        player.mute = isMuted;
        animationPlayers[animationName] = player;
        loadingPromises.push(player.loaded);
    }
    return Promise.all(loadingPromises);
}

export function preloadSecondaryAudio() {
    console.log("-> AUDIO: Starting to preload secondary audio assets...");
    const secondaryPromises = [
        preloadAnimationSounds(), // This will now load only non-critical sounds
        winnerSound.loaded,
        loserSound.loaded,
        ...collisionSounds.map(sound => sound instanceof Tone.Player ? sound.loaded : Promise.resolve())
    ];

    return Promise.all(secondaryPromises).then(() => {
        console.log("-> AUDIO: All secondary audio assets preloaded successfully.");
    }).catch(error => {
        console.error("-> AUDIO.ERROR: Failed to preload secondary audio assets:", error);
        throw error;
    });
}

export function preloadCriticalAudio() {
    console.log("-> AUDIO: Starting to preload critical audio assets...");
    const criticalAudioPromises = [
        gameStartSound.loaded,
        pauseGameSound.loaded,
        quackSound.loaded,
        powerUpSound.loaded,
        preloadCriticalUISounds() // Load essential UI sounds
    ];

    // Preload the default theme's ambient sound
    const defaultAmbientUrl = THEME_AMBIENT_SOUND_MAP['grass'];
    if (defaultAmbientUrl) {
        const ambientLoadPromise = new Promise((resolve, reject) => {
            currentAmbientTheme = 'grass'; // Set the current theme
            ambientMusic = new Tone.Player({
                url: defaultAmbientUrl,
                loop: true,
                volume: -25,
                onload: resolve,
                onerror: reject
            }).connect(ambientBus);
        });
        criticalAudioPromises.push(ambientLoadPromise);
    }

    return Promise.all(criticalAudioPromises).then(() => {
        console.log("-> AUDIO: All critical audio assets preloaded successfully.");
    }).catch(error => {
        console.error("-> AUDIO.ERROR: Failed to preload critical audio assets:", error);
        throw error;
    });
}


export function playAnimationSound(animationName) {
    const player = animationPlayers[animationName];
    if (player && player.state === 'stopped') {
        player.start();
    }
}

export function playGameStartSound() {
    if (gameStartSound.state === 'stopped') {
        gameStartSound.start();
    }
}

export function playPauseGameSound() {
    if (pauseGameSound.state === 'stopped') {
        pauseGameSound.start();
    }
}

export function playWinnerSound() {
    if (backgroundMusic) { backgroundMusic.volume.value = -Infinity; }
    if (winnerSound.state === 'stopped') {
        winnerSound.start();
    }
}

export function playLoserSound() {
    if (backgroundMusic) { backgroundMusic.volume.value = -Infinity; }
    if (loserSound.state === 'stopped') {
        loserSound.start();
    }
}

export function initializeMusicPlayer(musicUrl = DEFAULT_MUSIC_URL) {
    // Ensure Tone audio context is running
    if (Tone.context.state !== 'running') {
        Tone.start();
    }
    
    // If a music player instance already exists, stop and dispose of it first.
    if (backgroundMusic) {
        backgroundMusic.stop().dispose();
    }

    // Note: Don't stop Tone.Transport as it affects ambient music playback
    // Just clear scheduled events to prevent overlaps
    Tone.Transport.cancel();

    backgroundMusic = new Tone.Player({
        url: musicUrl,
        loop: true,
        volume: isMuted ? -Infinity : -12,
        onload: () => {
            console.log(`-> AUDIO.SUCCESS: Background music loaded from '${musicUrl}'.`);
            if (!isMuted && backgroundMusic && backgroundMusic.loaded && backgroundMusic.state !== 'started') {
                backgroundMusic.start();
                console.log(`-> initializeMusicPlayer: Started background music.`);
            }
        },
        onerror: (e) => console.error(`-> AUDIO.ERROR: Error loading background music from '${musicUrl}':`, e)
    }).connect(musicBus);
    
    // Ensure transport is running for ambient sounds and background music
    if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
    }
}

export function playAmbientSound(themeName) {
    console.log(`-> playAmbientSound: Called with themeName: '${themeName}'.`);

    // If the correct sound is already loaded and ready, just play it.
    if (currentAmbientTheme === themeName && ambientMusic && ambientMusic.loaded && ambientMusic.state !== 'started') {
        if (!isMuted) {
            ambientMusic.start();
            console.log(`-> playAmbientSound: Starting preloaded ambient sound for '${themeName}'.`);
        }
        return;
    }

    // If the requested theme is already playing, do nothing.
    if (currentAmbientTheme === themeName && ambientMusic && ambientMusic.state === 'started') {
        console.log(`-> playAmbientSound: Ambient sound for '${themeName}' is already playing.`);
        return;
    }

    // If a different sound is playing, or no sound, dispose of the old one.
    if (ambientMusic) {
        if (ambientMusic.state === 'started') {
            ambientMusic.stop();
        }
        ambientMusic.dispose();
    }

    const ambientUrl = THEME_AMBIENT_SOUND_MAP[themeName];
    currentAmbientTheme = themeName; // Set the new theme

    if (ambientUrl) {
        ambientMusic = new Tone.Player({
            url: ambientUrl,
            loop: true,
            volume: -25,
            onload: () => {
                console.log(`-> AUDIO.SUCCESS: Ambient sound for '${themeName}' loaded.`);
                if (!isMuted && ambientMusic && ambientMusic.loaded) {
                    // Schedule the start slightly in the future to avoid scheduling conflicts
                    ambientMusic.start(Tone.now() + 0.1);
                    console.log(`-> playAmbientSound: Started newly loaded ambient sound for '${themeName}'.`);
                }
            },
            onerror: (e) => console.error(`-> AUDIO.ERROR: Error loading ambient sound for '${themeName}':`, e)
        }).connect(ambientBus);
    } else {
        ambientMusic = null;
        currentAmbientTheme = null;
        console.log(`-> playAmbientSound: No ambient sound defined for theme '${themeName}'.`);
    }
}

let lastChaChingTime = 0;
const CHA_CHING_COOLDOWN_MS = 100; // Minimum 100ms between cha-ching sounds

export function playChaChing() {
    const currentTime = performance.now();
    
    // Debounce: skip if called too rapidly
    if (currentTime - lastChaChingTime < CHA_CHING_COOLDOWN_MS) {
        return;
    }
    lastChaChingTime = currentTime;
    
    const now = Tone.now() + 0.01; // Small offset to avoid timing conflicts
    chaChingSynth.triggerAttackRelease(4000, "16n", now);
    chaChingSynth.triggerAttackRelease(5000, "16n", now + 0.05);
}

export function playCollisionSound() {
    const sound = collisionSounds[Math.floor(Math.random() * collisionSounds.length)];
    if (sound instanceof Tone.NoiseSynth) {
        sound.triggerAttackRelease("8n", Tone.now() + 0.01);
    } else if (sound instanceof Tone.Player && sound.state === 'stopped') {
        sound.start();
    }
}

let lastDebuffTime = 0;
const DEBUFF_COOLDOWN_MS = 100;

export function playDebuffSound() {
    const currentTime = performance.now();
    if (currentTime - lastDebuffTime < DEBUFF_COOLDOWN_MS) {
        return;
    }
    lastDebuffTime = currentTime;
    
    debuffSynth.triggerAttackRelease("C2", "8n", Tone.now() + 0.01);
}

// =================================================================
// PHASE 2C: TIER-BASED CASH REWARD AUDIO
// =================================================================
// Plays distinct audio cues when earning cash with skill multipliers

// Tier cash sound synth - brighter metallic sound for high-tier rewards
export const tierCashSynth = new Tone.MetalSynth({
    frequency: 300,
    envelope: { attack: 0.001, decay: 0.15, release: 0.08 },
    harmonicity: 6.5,
    modulationIndex: 40,
    resonance: 5000,
    octaves: 2
}).connect(uiBus);
tierCashSynth.volume.value = -12;
tierCashSynth.mute = isMuted;

let lastTierCashTime = 0;
const TIER_CASH_COOLDOWN_MS = 80; // Slightly faster than regular cha-ching

/**
 * Play tier-specific cash reward sound
 * Higher tiers get more elaborate sounds
 * 
 * @param {string} tier - BASIC, COSMETIC, ENLISTED, MASTER, or LEGENDARY
 */
export function playTierCashSound(tier) {
    const currentTime = performance.now();
    
    // Debounce: skip if called too rapidly
    if (currentTime - lastTierCashTime < TIER_CASH_COOLDOWN_MS) {
        return;
    }
    lastTierCashTime = currentTime;
    
    const now = Tone.now() + 0.01;
    
    switch (tier) {
        case 'LEGENDARY':
            // Triple ascending chime with sparkle - the jackpot sound!
            tierCashSynth.triggerAttackRelease(5500, "32n", now);
            tierCashSynth.triggerAttackRelease(6500, "32n", now + 0.04);
            tierCashSynth.triggerAttackRelease(7500, "32n", now + 0.08);
            tierCashSynth.triggerAttackRelease(8500, "64n", now + 0.12);
            break;
            
        case 'MASTER':
            // Double ascending chime - satisfying premium sound
            tierCashSynth.triggerAttackRelease(5000, "32n", now);
            tierCashSynth.triggerAttackRelease(6000, "32n", now + 0.05);
            tierCashSynth.triggerAttackRelease(7000, "64n", now + 0.10);
            break;
            
        case 'ENLISTED':
            // Single bright chime with harmonic
            tierCashSynth.triggerAttackRelease(4500, "16n", now);
            tierCashSynth.triggerAttackRelease(5500, "32n", now + 0.03);
            break;
            
        case 'COSMETIC':
            // Simple pleasant ding
            tierCashSynth.triggerAttackRelease(4000, "16n", now);
            break;
            
        case 'BASIC':
        default:
            // Basic subtle click - minimal audio for 0.5x multiplier
            tierCashSynth.triggerAttackRelease(3500, "32n", now);
            break;
    }
}

// =================================================================
// PHASE 1: SYNTHESIZED SKILL SOUNDS
// =================================================================
// Adds audio feedback to skills that were missing sounds

// Acrobatic synth - for flips, kicks, and athletic moves
const acrobaticSynth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.15, sustain: 0.05, release: 0.1 }
}).connect(playerActionsBus);
acrobaticSynth.volume.value = -14;

// Whoosh synth - for fast movement skills (dive, phase dash)
const whooshSynth = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.02, decay: 0.2, sustain: 0, release: 0.1 }
}).connect(playerActionsBus);
whooshSynth.volume.value = -16;

// Impact synth - for powerful skills (shockwave)
const impactSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 4,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 }
}).connect(playerActionsBus);
impactSynth.volume.value = -10;

// Hover synth - sustained hum for hover skill
const hoverSynth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.3 }
}).connect(playerActionsBus);
hoverSynth.volume.value = -18;

// Tech synth - for high-tech skills (reaper drone, phase dash)
const techSynth = new Tone.FMSynth({
    harmonicity: 3,
    modulationIndex: 10,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.2 },
    modulation: { type: 'square' },
    modulationEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.1 }
}).connect(playerActionsBus);
techSynth.volume.value = -14;

/**
 * Play backflip sound - quick upward pitch sweep
 */
export function playBackflipSound() {
    if (isMuted) return;
    const now = Tone.now();
    acrobaticSynth.triggerAttackRelease('C5', '16n', now);
    acrobaticSynth.triggerAttackRelease('E5', '32n', now + 0.05);
}

/**
 * Play frontflip sound - quick downward pitch sweep  
 */
export function playFrontflipSound() {
    if (isMuted) return;
    const now = Tone.now();
    acrobaticSynth.triggerAttackRelease('E5', '16n', now);
    acrobaticSynth.triggerAttackRelease('C5', '32n', now + 0.05);
}

/**
 * Play dive sound - descending whoosh
 */
export function playDiveSound() {
    if (isMuted) return;
    whooshSynth.triggerAttackRelease('8n');
}

/**
 * Play hover sound - sustained hum
 */
export function playHoverSound() {
    if (isMuted) return;
    hoverSynth.triggerAttackRelease('A3', '4n');
}

/**
 * Play shockwave sound - powerful bass impact
 */
export function playShockwaveSound() {
    if (isMuted) return;
    const now = Tone.now();
    impactSynth.triggerAttackRelease('C1', '8n', now);
    impactSynth.triggerAttackRelease('G1', '16n', now + 0.1);
}

/**
 * Play scissor kick sound - sharp double hit
 */
export function playScissorKickSound() {
    if (isMuted) return;
    const now = Tone.now();
    acrobaticSynth.triggerAttackRelease('G4', '32n', now);
    acrobaticSynth.triggerAttackRelease('D5', '32n', now + 0.08);
}

/**
 * Play phase dash sound - tech whoosh with frequency sweep
 */
export function playPhaseDashSound() {
    if (isMuted) return;
    const now = Tone.now();
    techSynth.triggerAttackRelease('C4', '16n', now);
    whooshSynth.triggerAttackRelease('16n', now);
}

/**
 * Play reaper drone sound - tech activation beep
 */
export function playReaperDroneSound() {
    if (isMuted) return;
    const now = Tone.now();
    techSynth.triggerAttackRelease('E5', '32n', now);
    techSynth.triggerAttackRelease('G5', '32n', now + 0.05);
    techSynth.triggerAttackRelease('B5', '16n', now + 0.1);
}

/**
 * Play corkscrew spin sound - spiraling tone
 */
export function playCorkscrewSpinSound() {
    if (isMuted) return;
    const now = Tone.now();
    acrobaticSynth.triggerAttackRelease('D4', '32n', now);
    acrobaticSynth.triggerAttackRelease('F4', '32n', now + 0.04);
    acrobaticSynth.triggerAttackRelease('A4', '32n', now + 0.08);
    acrobaticSynth.triggerAttackRelease('D5', '32n', now + 0.12);
}

export function playQuackSound() {
    // Check if using Jolly Nick persona with Festive Christmas theme
    const isJollyNickChristmas = gameState && gameState.selectedPersona === 'jollyNick' && gameState.selectedTheme === 'christmas';
    
    const soundToPlay = isJollyNickChristmas ? jingleBellsSound : quackSound;
    
    if (soundToPlay.state === 'stopped') {
        soundToPlay.start();
    }
}

export function playPowerUpSound() {
    if (powerUpSound.state === 'stopped') {
        powerUpSound.start();
    }
}

export function toggleSound() {
    if (Tone.context.state !== 'running') { Tone.start(); }
    isMuted = !isMuted;

    if (!disableSaveSettings.checked) {
        localStorage.setItem(MUTE_STORAGE_KEY, isMuted);
    }

    applyMuteState();
    console.log(`-> toggleSound: Mute toggled via busses. isMuted: ${isMuted}`);
}
    
    // =================================================================
    // DEBUGGING FUNCTIONS
    // =================================================================
    
    window.muteThemeMusic = function() {
        musicBus.volume.value = -Infinity;
        console.log('-> DEBUG: Theme music muted.');
    };
    
    window.unmuteThemeMusic = function() {
        musicBus.volume.value = -18;
        console.log('-> DEBUG: Theme music unmuted.');
    };
    
    window.muteAmbient = function() {
        ambientBus.volume.value = -Infinity;
        console.log('-> DEBUG: Ambient sound muted.');
    };
    
    window.unmuteAmbient = function() {
        ambientBus.volume.value = 0;
        console.log('-> DEBUG: Ambient sound unmuted.');
    };
    
    window.muteSfx = function() {
        playerActionsBus.volume.value = -Infinity;
        uiBus.volume.value = -Infinity;
        console.log('-> DEBUG: All SFX muted.');
    };
    
    window.unmuteSfx = function() {
        playerActionsBus.volume.value = -10;
        uiBus.volume.value = -10;
        console.log('-> DEBUG: All SFX unmuted.');
    };
    