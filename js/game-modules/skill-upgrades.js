/**
 * Skill Upgrade Data
 * 
 * This file defines the upgrade paths for all unlockable skills in the Armory.
 * Each skill has multiple levels, with each level providing a specific enhancement
 * and having an associated cost.
 */

export const SKILL_UPGRADE_PATHS = {
    fireSpinner: {
        name: 'Fire Spinner',
        maxLevel: 5,
        levels: [
            { cost: 0, description: "Default: A fiery vortex that drains energy over time." }, // Level 1 (initial unlock)
            { cost: 540000, description: "Energy drain is reduced by 10%." }, // -> Level 2
            { cost: 1350000, description: "Energy drain is reduced by 20%." }, // -> Level 3
            { cost: 2700000, description: "Duration is increased by 1 second." }, // -> Level 4
            { cost: 5400000, description: "Also incinerates nearby obstacles upon activation." } // -> Level 5
        ]
    },
    fieryGroundPound: {
        name: 'Fiery Ground Pound',
        maxLevel: 5,
        levels: [
            { cost: 0, description: "Default: A powerful slam that incinerates all obstacles on screen." }, // Level 1
            { cost: 648000, description: "Slightly larger impact radius." }, // -> Level 2
            { cost: 1620000, description: "Energy cost is reduced by 10." }, // -> Level 3
            { cost: 3240000, description: "Significantly larger impact radius." }, // -> Level 4
            { cost: 6480000, description: "Leaves a trail of fire that destroys the next obstacle." } // -> Level 5
        ]
    },
    moonwalk: {
        name: 'Moonwalk',
        maxLevel: 3,
        levels: [
            { cost: 0, description: "Default: A stylish backwards slide." }, // Level 1
            { cost: 270000, description: "Gain a small amount of energy on use." }, // -> Level 2
            { cost: 810000, description: "Become briefly invincible at the start of the move." } // -> Level 3
        ]
    },
    firestorm: {
        name: 'Firestorm',
        maxLevel: 5,
        levels: [
            { cost: 0, description: "Default: A powerful continuous fire attack that rapidly drains energy." }, // Level 1
            { cost: 810000, description: "Energy drain is reduced by 15%." }, // -> Level 2
            { cost: 2160000, description: "Duration is increased by 2 seconds." }, // -> Level 3
            { cost: 4320000, description: "Wider area of effect." }, // -> Level 4
            { cost: 8100000, description: "Periodically spawns a protective fire shield." } // -> Level 5
        ]
    },
    fireStomper: {
        name: 'Fire Stomper',
        maxLevel: 3,
        levels: [
            { cost: 0, description: "Default: A powerful stomp that flips and crumbles obstacles." }, // Level 1
            { cost: 432000, description: "Increased stun duration on enemies." }, // -> Level 2
            { cost: 1080000, description: "Also grants a temporary speed boost." } // -> Level 3
        ]
    },
    fieryHoudini: {
        name: 'Fiery Houdini',
        maxLevel: 4,
        levels: [
            { cost: 0, description: "Default: Teleport forward, incinerating nearby obstacles." }, // Level 1
            { cost: 972000, description: "Increased teleport distance." }, // -> Level 2
            { cost: 2430000, description: "Reduced energy cost." }, // -> Level 3
            { cost: 4860000, description: "Brief invincibility after reappearing." } // -> Level 4
        ]
    },
    jetPack: {
        name: 'Jet Pack',
        maxLevel: 3,
        levels: [
            { cost: 0, description: "Default: Launches a rocket to destroy the current obstacle." }, // Level 1
            { cost: 1350000, description: "Rocket destroys the target obstacle and one other." },    // -> Level 2
            { cost: 4050000, description: "Rocket destroys all on-screen obstacles." }             // -> Level 3
        ]
    },
    fireAxe: {
        name: 'Fire Axe',
        maxLevel: 3,
        levels: [
            { cost: 0, description: "Default: A flaming axe that chops down obstacles." }, // Level 1
            { cost: 50000, description: "Throw the axe a short distance to hit obstacles." }, // -> Level 2
            { cost: 150000, description: "Increased throw distance." } // -> Level 3
        ]
    },
    // NOTE: Add other skills here as they become upgradeable
};

// Define upgrade effects for Fire Spinner
export const fireSpinnerUpgradeEffects = [
    { level: 2, type: 'percentage', value: 0.10 }, // 10% energy drain reduction
    { level: 3, type: 'percentage', value: 0.20 }, // 20% energy drain reduction
    { level: 4, type: 'additive', value: 1000 }, // 1 second duration increase (in ms)
    { level: 5, type: 'special', value: 'incinerate' } // Special effect: incinerate nearby obstacles
];

// Define upgrade effects for Fiery Ground Pound
export const fieryGroundPoundUpgradeEffects = [
    { level: 2, type: 'additive', value: 0 }, // Placeholder for radius increase (handled visually)
    { level: 3, type: 'additive', value: -10 }, // Energy cost reduced by 10
    { level: 4, type: 'additive', value: 0 }, // Placeholder for radius increase (handled visually)
    { level: 5, type: 'special', value: 'fireTrail' } // Special effect: leaves a fire trail
];

export const fieryHoudiniUpgradeEffects = [
    { level: 2, type: 'additive', value: 50 },    // Increased teleport distance
    { level: 3, type: 'additive', value: -15 },   // Reduced energy cost
    { level: 4, type: 'special', value: 'invincibility' } // Brief invincibility after reappearing
];

export const firestormUpgradeEffects = [
    { level: 2, type: 'percentage', value: 0.15 }, // 15% energy drain reduction
    { level: 3, type: 'additive', value: 2000 },   // 2 seconds duration increase
    { level: 4, type: 'special', value: 'widerArea' }, // Wider area of effect
    { level: 5, type: 'special', value: 'fireShield' } // Periodically spawns a protective fire shield
];