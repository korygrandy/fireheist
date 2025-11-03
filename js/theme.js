// =================================================================
// THEME LOGIC
// =================================================================

export const themes = {
    'grass': {
        name: 'Grassy Knolls (Default)',
        sky: '#87CEEB',
        ground: '#1c7d3c',
        grassBlades: '#229944',
        roadLines: null,
        hurdle: {
            fill: 'white',
            stroke: '#cccccc'
        }
    },
    'mountains': {
        name: 'Mt. Brown',
        sky: '#D2B48C',
        ground: '#8B4513',
        grassBlades: '#A0522D',
        roadLines: null,
        hurdle: {
            fill: '#654321',
            stroke: '#D2B48C'
        }
    },
    'snow': {
        name: 'White Snowpeaks',
        sky: '#ADD8E6',
        ground: '#FFFFFF',
        grassBlades: '#D3D3D3',
        roadLines: null,
        hurdle: {
            fill: '#A9A9A9',
            stroke: '#FFFFFF'
        }
    },
    'volcano': {
        name: 'Island Volcano',
        sky: 'royalblue',
        ground: '#FF4500',
        grassBlades: '#FFFF00',
        roadLines: null,
        hurdle: {
            fill: 'white',
            stroke: 'white'
        }
    },
    'roadway': {
        name: 'City Roadway',
        sky: '#696969',
        ground: '#36454F',
        grassBlades: null,
        roadLines: '#FFFF00', // Yellow Stripes
        hurdle: {
            fill: '#808080',
            stroke: '#FFFF00'
        }
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