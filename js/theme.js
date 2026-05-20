// =================================================================
// THEME LOGIC
// =================================================================

import { playAmbientSound } from './audio.js';
import { setSelectedTheme as setGlobalSelectedTheme } from './game-modules/state-manager.js';

export const themes = {
    'grass': {
        name: '🌻 Grassy Knolls',
        sky: '#87CEEB',
        ground: '#1c7d3c',
        grassBlades: '#229944',
        roadLines: null,
        hurdle: {
            fill: 'white',
            stroke: '#cccccc'
        },
        obstacleEmojis: ['🌳', '🍄', '🪵', '🌲'],
        anchorImage: 'images/sun-anchor.png'
    },
    'mountains': {
        name: '⛰️ Mt. Brown',
        sky: '#D2B48C',
        ground: '#8B4513',
        grassBlades: '#A0522D',
        roadLines: null,
        hurdle: {
            fill: '#654321',
            stroke: '#D2B48C'
        },
        obstacleEmojis: ['🏔️', '🌲', '🪨'],
        anchorImage: 'images/mountain-anchor.png'
    },
    'roadway': {
        name: '🌃 City Night',
        sky: '#A9B7C6',
        ground: '#36454F',
        grassBlades: null,
        roadLines: '#FFFF00', // Yellow Stripes
        curb: '#000000', // Black curb
        hurdle: {
            fill: '#808080',
            stroke: '#FFFF00'
        },
        obstacleEmojis: ['-1', '🚧', '🚗', '🚲'],
        anchorImage: 'images/skyline-anchor.png'
    },
    'snow': {
        name: '🗻 White Snowpeaks',
        sky: '#ADD8E6',
        ground: '#FFFFFF',
        grassBlades: '#D3D3D3',
        roadLines: null,
        hurdle: {
            fill: '#A9A9A9',
            stroke: '#FFFFFF'
        },
        obstacleEmojis: ['🏔️', '🌲', '🥶', '⛄'],
        anchorImage: 'images/igloo-anchor.png'
    },
    'desert': {
        name: '🏜️ Desert Dunes',
        sky: '#F0E68C',
        ground: '#C2B280',
        grassBlades: '#8B8000',
        roadLines: null,
        hurdle: {
            fill: '#556B2F',
            stroke: '#F0E68C'
        },
        obstacleEmojis: ['🌵', '🏜️', '🐍', '🦂'],
        anchorImage: 'images/pyramid-anchor.png'
    },
    'volcano': {
        name: '🌋 Island Volcano',
        sky: 'royalblue',
        ground: '#FF4500',
        grassBlades: '#FFFF00',
        roadLines: null,
        hurdle: {
            fill: 'white',
            stroke: 'white'
        },
        obstacleEmojis: ['🌋', '🔥', '💣', '💥'],
        anchorImage: 'images/volcano-anchor.png'
    },
    'outerspace': {
        name: '🌑 Outer Space',
        sky: '#000000',
        ground: '#2C003E',
        grassBlades: '#9E7BB5',
        roadLines: null,
        curb: null,
        hurdle: {
            fill: '#A020F0',
            stroke: '#FFFFFF'
        },
        obstacleEmojis: ['☄️', '🪐', '🛰️', '👽'],
        anchorImage: 'images/spaceship-anchor.png'
    },
    'night': {
        name: '🌙 Deep Night',
        sky: '#1A1A2E',
        ground: '#0F0F1A',
        grassBlades: '#33334D',
        roadLines: null,
        hurdle: {
            fill: '#4A4A6A',
            stroke: '#BBBBBB'
        },
        obstacleEmojis: ['🦉', '🦇', '👻'],
        anchorImage: 'images/moon-anchor.png'
    },
    'christmas': {
        name: '🎄 Festive Christmas',
        sky: '#1a3a52',
        ground: '#F0F8FF',
        grassBlades: '#E8F5FF',
        roadLines: null,
        hurdle: {
            fill: '#C41E3A',
            stroke: '#FFD700'
        },
        obstacleEmojis: ['🎁', '❄️', '⛄', '🔔'],
        anchorImage: 'images/christmas-anchor.png'
    },
    'america250': {
        name: '🇺🇸 250th America',
        sky: '#102a63',
        ground: '#f8fafc',
        grassBlades: '#c1121f',
        roadLines: '#1d4ed8',
        curb: '#c1121f',
        hurdle: {
            fill: '#ffffff',
            stroke: '#c1121f'
        },
        obstacleEmojis: ['🎆', '🎇', '🥁', '🗽', '⭐', '🔔', '🎺'],
        acceleratorEmojis: ['🇺🇸', '⭐', '🚀', '🎆'],
        anchorImage: 'images/america-250-anchor.svg'
    }
};

export const finalMilestoneAnchors = {
    'grass': 'phoenix',
    'mountains': 'phoenix',
    'roadway': 'phoenix',
    'snow': 'phoenix',
    'desert': 'phoenix',
    'volcano': 'phoenix',
    'outerspace': 'phoenix',
    'night': 'phoenix',
    'christmas': 'image',
    'america250': 'america250'
};

export let currentTheme = themes.grass; // Default theme

export function setTheme(themeName) {
    if (themes[themeName]) {
        currentTheme = themes[themeName];
        setGlobalSelectedTheme(themeName); // Update global state with the theme NAME
        console.log(`-> setTheme: About to call playAmbientSound for '${themeName}'.`);
        playAmbientSound(themeName);
        console.log(`-> setTheme: Theme changed to ${themeName}`);
    } else {
        console.error(`-> setTheme: Unknown theme '${themeName}'.`);
    }
}