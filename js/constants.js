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

// Accelerator Constants
export const ACCELERATOR_EMOJI_SIZE = '36px Impact';
export const ACCELERATOR_EMOJI = '🔥';
export const ACCELERATOR_BASE_SPEED_BOOST = 2.0; // 2x speed boost
export const ACCELERATOR_DURATION_MS = 2500; // Boost lasts 2.5 seconds
export const ENERGY_GAIN_ACCELERATOR = 25;

// Fire Mage Constants
export const FIRE_MAGE_ENERGY_COST = 60; // Cost to activate Fire Mage mode
export const FIRE_MAGE_DURATION_MS = 5000; // Fire Mage mode lasts 5 seconds
export const FIRE_MAGE_COOLDOWN_MS = 10000; // Cooldown of 10 seconds after mode ends
export const FIREBALL_CAST_ENERGY_COST = 10; // Cost per fireball while in Fire Mage mode
export const FIREBALL_VELOCITY_PX_MS = 0.8; // Fireball moves faster than obstacles
export const FIREBALL_SIZE = 20; // Size of the fireball for drawing and collision

// DECELERATOR Constants
export const DECELERATOR_BASE_SPEED_DEBUFF = 0.5; // 0.5x speed
export const DECELERATOR_DURATION_MS = 3000; // Debuff lasts 3 seconds

// Constant, faster velocity for obstacles and accelerators
export const OBSTACLE_BASE_VELOCITY_PX_MS = 0.5;

// CUSTOM EVENT PROXIMITY CONSTANTS
// Distance in visual duration steps where the object becomes "visible"
export const EVENT_PROXIMITY_VISUAL_STEPS = 5;
export const EVENT_POPUP_HEIGHT = 35; // Max height the object pops up (similar to stickFigureTotalHeight)

// SKILL LEVEL SETTINGS
export const ENERGY_SETTINGS = {
    DRAIN_RATE: 2.5, // Energy per second
    ENERGY_COSTS: {
        houdini: 15,
        firestorm: 80,
        default: 10,
    }
};

export const DIFFICULTY_SETTINGS = {
    'Rookie': { // Formerly Easy
        COLLISION_RANGE_X: 25,
        manualJumpHeight: 120,
        manualJumpDurationMs: 350,
        ACCELERATOR_FREQUENCY_PERCENT: 50, // More frequent
        energyRegenMultiplier: 2.0,
    },
    'Novice': { // Formerly Normal
        COLLISION_RANGE_X: 35,
        manualJumpHeight: 100,
        manualJumpDurationMs: 450,
        ACCELERATOR_FREQUENCY_PERCENT: 25, // Medium frequency
        energyRegenMultiplier: 1.0,
    },
    'Pro': { // Formerly Hard
        COLLISION_RANGE_X: 50,
        manualJumpHeight: 60,
        manualJumpDurationMs: 450,
        ACCELERATOR_FREQUENCY_PERCENT: 10, // Less frequent
        energyRegenMultiplier: 0.5,
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
    'cartoon-running': 'fx/cartoon-running.mp3',
    groundPound: 'fx/bomb.mp3'
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