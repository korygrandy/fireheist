// =================================================================
// THEME MANAGEMENT
// =================================================================

import { generateGrassBlades } from './game-modules/drawing.js';

export const themes = {
    grass: {
        name: 'Grassy Knoll',
        sky: '#87CEEB',

        ground:'#228B22',
        roadLines: null,
        curb: null,
        grassBlades: '#32CD32',
        hurdle: { fill: '#A0522D', stroke: '#8B4513' }
    },
    city: {
        name: '🏢 Urban Jungle',
        sky: '#4682B4',
        ground: '#696969',
        roadLines: '#FFFFFF',
        curb: '#A9A9A9',
        grassBlades: null,
        hurdle: { fill: '#808080', stroke: '#000000' }
    },
    desert: {
        name: '🌵 Desert Dunes',
        sky: '#F0E68C',
        ground: '#D2B48C',
        roadLines: null,
        curb: null,
        grassBlades: null,
        hurdle: { fill: '#8B4513', stroke: '#A0522D' }
    },
    night: {
        name: '🌃 Night Ride',
        sky: '#000033',
        ground: '#1A1A1A',
        roadLines: '#FFFF00',
        curb: '#444444',
        grassBlades: null,
        hurdle: { fill: '#555555', stroke: '#FFFFFF' }
    },
    mtBrown: {
        name: '🗻 Mt. Brown',
        sky: '#A9A9A9',
        ground: '#8B4513',
        roadLines: null,
        curb: null,
        grassBlades: '#228B22',
        hurdle: { fill: '#D2691E', stroke: '#A0522D' }
    },
    islandVolcano: {
        name: '🌋 Island Volcano',
        sky: '#FF4500',
        ground: '#363636',
        roadLines: null,
        curb: null,
        grassBlades: '#FFD700', // Lava flow
        hurdle: { fill: '#A52A2A', stroke: '#000000' }
    },
    whiteSnowpeaks: {
        name: '⛰️ White Snowpeaks',
        sky: '#ADD8E6',
        ground: '#FFFFFF',
        roadLines: null,
        curb: null,
        grassBlades: '#F0FFFF',
        hurdle: { fill: '#C0C0C0', stroke: '#808080' }
    },
    outerspace: {
        name: '🌑 Outerspace',
        sky: '#000020',
        ground: '#808080',
        roadLines: null,
        curb: null,
        grassBlades: '#C0C0C0',
        hurdle: { fill: '#A9A9A9', stroke: '#FFFFFF' }
    }
};

export let currentTheme = themes.grass;

export function setTheme(themeName) {
    if (themes[themeName]) {
        currentTheme = themes[themeName];
        generateGrassBlades(0); // Regenerate grass for the new theme
        console.log(`-> setTheme: Theme changed to ${themeName}`);
    } else {
        console.error(`Theme "${themeName}" not found.`);
    }
}
