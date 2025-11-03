// =================================================================
// AUDIO FUNCTIONS
// =================================================================

import { EMOJI_MUSIC_MAP, DEFAULT_MUSIC_URL } from './constants.js';

export let isMuted = false;
export let backgroundMusic = null;

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

export function initializeMusicPlayer(stickFigureEmoji) {
    if (backgroundMusic) {
        if (backgroundMusic.state === 'started') { backgroundMusic.stop(); }
        backgroundMusic.dispose();
    }
    const cleanEmoji = stickFigureEmoji.replace(/\uFE0F/g, '');
    const musicUrl = EMOJI_MUSIC_MAP[cleanEmoji] || DEFAULT_MUSIC_URL;

    backgroundMusic = new Tone.Player({
        url: musicUrl,
        loop: true,
        volume: isMuted ? -Infinity : -18
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

export function toggleSound(soundToggleButton) {
    if (Tone.context.state !== 'running') { Tone.start(); }
    isMuted = !isMuted;

    if (isMuted) {
        if (backgroundMusic) { backgroundMusic.volume.value = -Infinity; }
        chaChingSynth.mute = true;
        collisionSynth.mute = true;
        debuffSynth.mute = true;
        soundToggleButton.textContent = "🔊 Unmute";
    } else {
        chaChingSynth.mute = false;
        collisionSynth.mute = false;
        debuffSynth.mute = false;
        if (backgroundMusic) { backgroundMusic.volume.value = -18; }
        // Only start background music if game is running and it's not already started
        // This logic will be handled in game.js when starting the game
        soundToggleButton.textContent = "🔇 Mute";
    }
}