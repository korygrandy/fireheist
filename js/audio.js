// =================================================================
// AUDIO FUNCTIONS
// =================================================================

import { EMOJI_MUSIC_MAP, DEFAULT_MUSIC_URL, ANIMATION_SOUND_MAP, THEME_AMBIENT_SOUND_MAP } from './constants.js';
import { soundToggleButton, disableSaveSettings } from "./dom-elements.js";

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
        if (ambientMusic) { ambientMusic.mute = true; }
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
    'upgrade-skill', 'vault-upgrade', 'start-daily-challenge', 'ignited-flame'
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
        currentAmbientTheme = 'grass'; // Set the current theme
        ambientMusic = new Tone.Player({
            url: defaultAmbientUrl,
            loop: true,
            volume: -25
        }).connect(ambientBus);
        criticalAudioPromises.push(ambientMusic.loaded);
    }

    return Promise.all(criticalAudioPromises).then(() => {
        console.log("-> AUDIO: All critical audio assets preloaded successfully.");
    }).catch(error => {
        console.error("-> AUDIO.ERROR: Failed to preload critical audio assets:", error);
        throw error;
    });
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
    // Stop the transport and cancel any scheduled events to prevent overlaps
    Tone.Transport.stop();
    Tone.Transport.cancel();

    if (backgroundMusic) {
        if (backgroundMusic.state === 'started') { backgroundMusic.stop(); }
        backgroundMusic.dispose();
    }

    backgroundMusic = new Tone.Player({
        url: musicUrl,
        loop: true,
        volume: isMuted ? -Infinity : -12
    }).connect(musicBus);
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
                if (!isMuted) {
                    ambientMusic.start();
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
        if (ambientMusic) { ambientMusic.mute = true; }
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
        if (ambientMusic) {
            ambientMusic.mute = false;
            if (ambientMusic.state === 'stopped') {
                ambientMusic.start();
            }
        }
        ambientBus.volume.value = 0; // Restore bus volume to 0 dB
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
    