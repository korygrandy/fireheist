// =================================================================
// THEME LOGIC
// =================================================================

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
        obstacleEmojis: ['🌳', '🍄', '🪵', '🌲']
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
        obstacleEmojis: ['🏔️', '🌲', '🪨']
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
        obstacleEmojis: ['-1', '🚧', '🚗', '🚲']
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
        obstacleEmojis: ['🏔️', '🌲', '🥶', '⛄']
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
        obstacleEmojis: ['🌵', '🏜️', '🐍', '🦂']
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
        obstacleEmojis: ['🌋', '🔥', '💣', '💥']
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
        obstacleEmojis: ['☄️', '🪐', '🛰️', '👽']
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
        obstacleEmojis: ['🦉', '🦇', '👻']
    }
};

export let currentTheme = themes.grass; // Default theme

export function setTheme(themeName) {
    if (themes[themeName]) {
        currentTheme = themes[themeName];
        console.log(`-> setTheme: Theme changed to ${themeName}`);
    } else {
        console.error(`-> setTheme: Unknown theme '${themeName}'.`);
    }
}