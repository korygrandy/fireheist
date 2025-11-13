// =================================================================
// CONSTANTS
// =================================================================

export const MS_PER_DAY = 1000 * 60 * 60 * 24;
export const CHART_Y_STEP_SIZE = 100000;

// Visual Segment Duration Constants
export const MIN_VISUAL_DURATION_MS = 2000;
export const MAX_VISUAL_DURATION_MS = 10000;
export const VICTORY_DISPLAY_TIME = 3000; // 3 seconds to display victory message

export const MAX_HURDLE_HEIGHT = 120;
export const HURDLE_FIXED_START_DISTANCE = 800 - 150 - 30; // Position where the hurdle appears

export const GROUND_Y = 400 - 10;
export const STICK_FIGURE_TOTAL_HEIGHT = 25;
export const JUMP_HEIGHT_RATIO = 1.5;
export const STICK_FIGURE_FIXED_X = 150;

export const FADE_DURATION = 350;
export const COLLISION_DURATION_MS = 1000;

// Auto Jump Constants (for milestones)
export const AUTO_JUMP_START_PROGRESS = 0.70;
export const AUTO_JUMP_DURATION = 0.25;
export const OBSTACLE_SAFE_ZONE_PROGRESS = 0.50;

// Cash Bag Animation Constants
export const CASH_BAG_ANIMATION_DURATION = 1500;
export const CASH_BAG_EMOJI = '💰';
export const CASH_BAG_FONT_SIZE = '28px Arial';
export const COUNTER_TARGET_Y = 30;
export const COUNTER_TARGET_X = 40;

// Obstacle Constants
export const OBSTACLE_EMOJI_SIZE = '32px Arial';
export const OBSTACLE_EMOJI_Y_OFFSET = -10;
export const OBSTACLE_SPAWN_X = 800 + 150;
export const OBSTACLE_WIDTH = 32;
export const OBSTACLE_HEIGHT = 32;
export const OBSTACLE_BASE_VELOCITY_PX_MS = 0.2;

// Event Constants
export const EVENT_PROXIMITY_VISUAL_STEPS = 2;
export const EVENT_POPUP_HEIGHT = 50;

// Accelerator Constants
export const ACCELERATOR_EMOJI_SIZE = '36px Impact';
export const ACCELERATOR_EMOJI = '🔥';
export const ACCELERATOR_BASE_SPEED_BOOST = 2.0; // 2x speed boost
export const ACCELERATOR_DURATION_MS = 2500; // Boost lasts 2.5 seconds
export const ENERGY_GAIN_ACCELERATOR = 25;

// Decelerator Constants
export const DECELERATOR_BASE_SPEED_DEBUFF = 0.5; // 0.5x speed debuff
export const DECELERATOR_DURATION_MS = 2500; // Debuff lasts 2.5 seconds

// Fire Mage Constants
export const FIRE_MAGE_ENERGY_COST = 60; // Cost to activate Fire Mage mode
export const FIRE_MAGE_DURATION_MS = 5000; // Fire Mage mode lasts 5 seconds
export const FIRE_MAGE_COOLDOWN_MS = 10000; // Cooldown of 10 seconds after mode ends
export const FIREBALL_CAST_ENERGY_COST = 10; // Cost per fireball while in Fire Mage mode
export const FIREBALL_VELOCITY_PX_MS = 0.8; // Fireball moves faster than obstacles
export const FIREBALL_SIZE = 20; // Size of the fireball for drawing and collision

// Mage Spinner Constants
export const MAGE_SPINNER_ENERGY_COST = 80; // Higher cost for a powerful skill
export const MAGE_SPINNER_DURATION_MS = 7000; // Lasts 7 seconds
export const MAGE_SPINNER_COOLDOWN_MS = 15000; // 15 seconds cooldown
export const MAGE_SPINNER_FIREBALL_INTERVAL_MS = 500; // Shoots a fireball every 0.5 seconds
export const MAGE_SPINNER_FIREBALL_COUNT = 14; // 14 fireballs over the duration

// Fiery Houdini Constants
export const FIERY_HOUDINI_ENERGY_COST = 60;
export const FIERY_HOUDINI_DURATION_MS = 800;
export const FIERY_HOUDINI_COOLDOWN_MS = 12000; // 12 seconds cooldown
export const FIERY_HOUDINI_RANGE = 300; // The range of the destructive poof in pixels
export const BLINK_STRIKE_DURATION_MS = 300;
export const JETSTREAM_DASH_DURATION_MS = 5000;
export const ECHO_SLAM_DURATION_MS = 600;
export const FIREBALL_ROLL_DURATION_MS = 8000;

export const ENERGY_SETTINGS = {
    REGEN_RATE: 0.1, // Energy points per frame
    HOVER_DRAIN_RATE: 5, // Energy points per second for hover
    ENERGY_COSTS: {
        default: 10,
        specialMove: 20,
        dive: 15,
        corkscrewSpin: 15,
        scissorKick: 15,
        phaseDash: 25,
        hover: 5, // Lower cost, but drains over time
        groundPound: 20,
        fieryGroundPound: 40,
        fireStomper: 35,
        cartoonScramble: 30,
        moonwalk: 10,
        shockwave: 25,
        backflip: 10,
        frontflip: 10,
        houdini: 30,
        meteorStrike: 50,
        firestorm: 0, // No initial cost, drains over time
        fireMage: 25,
        fireballCast: 10,
        fireSpinner: 0, // No initial cost, drains over time
        mageSpinner: MAGE_SPINNER_ENERGY_COST,
        fieryHoudini: FIERY_HOUDINI_ENERGY_COST,
        blinkStrike: 40,
        jetstreamDash: 0, // Drains over time
        echoSlam: 30,
        fireballRoll: 0 // Drains over time
    }
};

export const DIFFICULTY_SETTINGS = {
    'Rookie': { // Formerly Easy
        COLLISION_RANGE_X: 25,
        manualJumpHeight: 120,
        manualJumpDurationMs: 350,
        ACCELERATOR_FREQUENCY_PERCENT: 50, // More frequent
        energyRegenMultiplier: 2.0,
        maxPlayerEnergy: 200,
        passiveDrainRate: 1.0 // Slower drain
    },
    'Novice': { // Formerly Normal
        COLLISION_RANGE_X: 35,
        manualJumpHeight: 100,
        manualJumpDurationMs: 450,
        ACCELERATOR_FREQUENCY_PERCENT: 25, // Medium frequency
        energyRegenMultiplier: 1.0,
        maxPlayerEnergy: 100,
        passiveDrainRate: 2.0 // Medium drain
    },
    'Pro': { // Formerly Hard
        COLLISION_RANGE_X: 50,
        manualJumpHeight: 60,
        manualJumpDurationMs: 450,
        ACCELERATOR_FREQUENCY_PERCENT: 10, // Less frequent
        energyRegenMultiplier: 0.5,
        maxPlayerEnergy: 50,
        passiveDrainRate: 4.0 // Faster drain
    }
};

export const NUM_CLOUDS = 5;
export const CLOUD_SPEED_FACTOR = 0.05;

// MUSIC CONSTANTS & MAPPING
export const DEFAULT_MUSIC_URL = "fx/funk.mp3";
export const EMOJI_MUSIC_MAP = {
    '🧟': 'fx/zombie.mp3',
    '🥷': 'fx/ninja.mp3',
    '🦁': 'fx/lion.mp3',
    '💃': 'fx/ballerina.mp3',
    '🐶': 'fx/dog.mp3',
    '🚀': 'fx/rocket.mp3',
    '👽': 'fx/alien.mp3',
};

export const THEME_MUSIC_MAP = {
    'default': 'fx/funk.mp3',
    'dark': 'fx/ufo-hover.mp3',
    'light': 'fx/power-up.mp3',
    'forest': 'fx/quack.mp3',
    'desert': 'fx/lion.mp3',
    'ocean': 'fx/dog.mp3',
    'space': 'fx/alien.mp3',
    'city': 'fx/rocket.mp3',
    'volcano': 'fx/firestorm.mp3',
    'snow': 'fx/shatter.mp3',
};


export const suggestedEmojiList = ['🧟', '🥷', '🦁', '💃', '🐶', '🚀','👽'];

export const ANIMATION_SOUND_MAP = {
    manualJump: 'fx/default-hurdle.mp3',
    hurdle: 'fx/default-hurdle.mp3',
    meteorStrike: 'fx/meteor-strike.mp3',
    moonwalk: 'fx/moonwalk.mp3',
    firestorm: 'fx/firestorm.mp3',
    fireball: 'fx/fireball.mp3',
    incinerate: 'fx/incinerate.mp3',
    shatter: 'fx/shatter.mp3',
    houdini: 'fx/houdini.mp3',
    fieryHoudini: 'fx/fiery-houdini.mp3',
    'cartoon-running': 'fx/cartoon-running.mp3',
    groundPound: 'fx/bomb.mp3',
    blinkStrike: 'fx/houdini.mp3',
    jetstreamDash: 'fx/firestorm.mp3',
    echoSlam: 'fx/bomb.mp3',
    fireballRoll: 'fx/fireball.mp3'
    // Other animations will be added here
};

export const defaultDataString = `12/15/2000: 0
01/01/2001: 5000
01/01/2011: 100000
07/01/2011: 125000
01/01/2018: 500000
01/02/2018: 505000
01/01/2020: 750000
01/01/2023: 1000000
01/01/2024: 1250000`;

export const defaultEventDataString = `06/01/2002: 📉 : DECELERATOR
11/01/2015: 📈 : ACCELERATOR
03/15/2022: 🎁 : ACCELERATOR`;