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
            { cost: 100000, description: "Energy drain is reduced by 10%." }, // -> Level 2
            { cost: 250000, description: "Energy drain is reduced by 20%." }, // -> Level 3
            { cost: 500000, description: "Duration is increased by 1 second." }, // -> Level 4
            { cost: 1000000, description: "Also incinerates nearby obstacles upon activation." } // -> Level 5
        ]
    },
    fieryGroundPound: {
        name: 'Fiery Ground Pound',
        maxLevel: 5,
        levels: [
            { cost: 0, description: "Default: A powerful slam that incinerates all obstacles on screen." }, // Level 1
            { cost: 120000, description: "Slightly larger impact radius." }, // -> Level 2
            { cost: 300000, description: "Energy cost is reduced by 10." }, // -> Level 3
            { cost: 600000, description: "Significantly larger impact radius." }, // -> Level 4
            { cost: 1200000, description: "Leaves a trail of fire that destroys the next obstacle." } // -> Level 5
        ]
    },
    moonwalk: {
        name: 'Moonwalk',
        maxLevel: 3,
        levels: [
            { cost: 0, description: "Default: A stylish backwards slide." }, // Level 1
            { cost: 50000, description: "Gain a small amount of energy on use." }, // -> Level 2
            { cost: 150000, description: "Become briefly invincible at the start of the move." } // -> Level 3
        ]
    },
    firestorm: {
        name: 'Firestorm',
        maxLevel: 5,
        levels: [
            { cost: 0, description: "Default: A powerful continuous fire attack that rapidly drains energy." }, // Level 1
            { cost: 150000, description: "Energy drain is reduced by 15%." }, // -> Level 2
            { cost: 400000, description: "Duration is increased by 2 seconds." }, // -> Level 3
            { cost: 800000, description: "Wider area of effect." }, // -> Level 4
            { cost: 1500000, description: "Periodically spawns a protective fire shield." } // -> Level 5
        ]
    },
    fireStomper: {
        name: 'Fire Stomper',
        maxLevel: 3,
        levels: [
            { cost: 0, description: "Default: A powerful stomp that flips and crumbles obstacles." }, // Level 1
            { cost: 80000, description: "Increased stun duration on enemies." }, // -> Level 2
            { cost: 200000, description: "Also grants a temporary speed boost." } // -> Level 3
        ]
    },
    fieryHoudini: {
        name: 'Fiery Houdini',
        maxLevel: 4,
        levels: [
            { cost: 0, description: "Default: Teleport forward, incinerating nearby obstacles." }, // Level 1
            { cost: 180000, description: "Increased teleport distance." }, // -> Level 2
            { cost: 450000, description: "Reduced energy cost." }, // -> Level 3
            { cost: 900000, description: "Brief invincibility after reappearing." } // -> Level 4
        ]
    },
    // NOTE: Add other skills here as they become upgradeable
};