import { DIFFICULTY_SETTINGS } from '../constants.js';

export const HIGH_SCORE_KEY = 'fireHeistHighScores';
export const PLAYER_STATS_KEY = 'fireHeistPlayerStats'; // New constant
export const GRASS_ANIMATION_INTERVAL_MS = 200; // Update grass blades every 200ms

const state = {
    activeCustomEvents: [],
    gameRunning: false,
    isPaused: false,
    currentSegmentIndex: 0,
    segmentProgress: 0,
    lastTime: 0,
    backgroundOffset: 0,
    frameCount: 0,
    accumulatedCash: 0,
    daysCounter: null,
    gameSpeedMultiplier: 1.0,
    COLLISION_RANGE_X: DIFFICULTY_SETTINGS.Rookie.COLLISION_RANGE_X,
    manualJumpDurationMs: DIFFICULTY_SETTINGS.Rookie.manualJumpDurationMs,
    manualJumpHeight: DIFFICULTY_SETTINGS.Rookie.manualJumpHeight,
    acceleratorFrequencyPercent: DIFFICULTY_SETTINGS.Rookie.ACCELERATOR_FREQUENCY_PERCENT,
    energyRegenMultiplier: DIFFICULTY_SETTINGS.Rookie.energyRegenMultiplier,
    passiveDrainRate: DIFFICULTY_SETTINGS.Rookie.passiveDrainRate,
    jumpState: {
        isJumping: false, progress: 0,
        isHurdle: false, hurdleDuration: 0,
        isSpecialMove: false, specialMoveDuration: 0,
        isDive: false, diveDuration: 0,
        isCorkscrewSpin: false, corkscrewSpinDuration: 0,
        isScissorKick: false, scissorKickDuration: 0,
        isPhaseDash: false, phaseDashDuration: 0,
        isHover: false, hoverDuration: 0,
        isGroundPound: false,
        groundPoundDuration: 0,
        isFieryGroundPound: false,
        fieryGroundPoundDuration: 0,
        isFireStomper: false,
        fireStomperDuration: 0,
        groundPoundEffectTriggered: false, // To ensure effect only triggers once per ground pound
        isCartoonScramble: false, cartoonScrambleDuration: 0,
        isMoonwalking: false, moonwalkDuration: 0,
        isShockwave: false, shockwaveDuration: 0,
        isBackflip: false, backflipDuration: 0,
        isFrontflip: false, frontflipDuration: 0,
        isHoudini: false, houdiniDuration: 0, houdiniPhase: 'disappearing',
        isFieryHoudini: false, fieryHoudiniDuration: 0, fieryHoudiniPhase: 'disappearing'
    },
    fireSpinnerCooldown: 30000, // 30 seconds
    isFireSpinnerOnCooldown: false,
    fireSpinnerLastActivationTime: 0,
    isFireMageActive: false, // Is Fire Mage mode currently active?
    fireMageEndTime: 0, // When the Fire Mage mode will end
    isFireMageOnCooldown: false, // Is Fire Mage on cooldown?
    fireMageLastActivationTime: 0, // When Fire Mage was last activated
    isMageSpinnerActive: false, // Is Mage Spinner mode currently active?
    mageSpinnerEndTime: 0, // When the Mage Spinner mode will end
    isMageSpinnerOnCooldown: false, // Is Mage Spinner on cooldown?
    mageSpinnerLastActivationTime: 0, // When Mage Spinner was last activated
    mageSpinnerFireballTimer: 0, // Timer for spawning fireballs
    mageSpinnerFireballsSpawned: 0, // Counter for fireballs spawned

    // Fiery Houdini State
    isFieryHoudiniActive: false,
    fieryHoudiniEndTime: 0,
    isFieryHoudiniOnCooldown: false,
    fieryHoudiniLastActivationTime: 0,

    activeFireballs: [], // Array to track on-screen fireballs
    vanishingObstacles: [], // Array for obstacles that "poof" on hit
    meteorParticles: [],
    currentObstacle: null,
    isColliding: false,
    collisionDuration: 0,
    currentAccelerator: null,
    isAccelerating: false,
    accelerationDuration: 0,
    isDecelerating: false,
    decelerationDuration: 0,
    onScreenCustomEvent: null,
    isVictory: false,
    isGameOverSequence: false,
    gameOverSequenceStartTime: 0,
    screenFlash: { opacity: 0, duration: 0, startTime: 0 },
    turboBoost: { active: false, frame: 0, lastFrameTime: 0 },
    stickFigureBurst: { active: false, duration: 200, startTime: 0, progress: 0, maxOffset: 150 },
    grassAnimationState: { blades: [], lastUpdateTime: 0 },
    clouds: [],
    activeCashBags: [],
    fireTrail: [],
    incineratingObstacles: [],
    houdiniParticles: [],
    fieryHoudiniParticles: [],
    groundPoundParticles: [],
    flippingObstacles: [],
    flipTrail: [],
    moonwalkParticles: [],
    hoverParticles: [],
    scrambleParticles: [],
    diveParticles: [],
    swooshParticles: [],
    flipTrail: [],
    corkscrewTrail: [],
    shatteredObstacles: [],
    isFirestormActive: false,
    firestormEndTime: 0,
    firestormParticles: [],
    playerEmberParticles: [],
    ignitedObstacles: [],
    MAX_FIRESTORM_PARTICLES: 50,
    MAX_EMBER_PARTICLES: 100,
    playerEnergy: DIFFICULTY_SETTINGS.Rookie.maxPlayerEnergy,
    maxPlayerEnergy: DIFFICULTY_SETTINGS.Rookie.maxPlayerEnergy,
    isFirestormDrainingEnergy: false,
    firestormDrainEndTime: 0,
    isFireSpinnerDrainingEnergy: false,
    fireSpinnerDrainEndTime: 0,
    playerStats: { // New player stats object
        flawlessRuns: {}, // e.g., { 'Novice': true, 'Pro': false }
        obstaclesIncinerated: 0,
        notifiedArmoryUnlocks: [], // To track shown notifications
        unlockedArmoryItems: [], // New: To store keys of unlocked armory items
        activeArmorySkill: null, // New: To store the key of the currently active armory skill
        consecutiveGroundPounds: 0, // New: To track consecutive ground pounds for an achievement
        totalGroundPoundCollisions: 0,
        consecutiveIncinerations: 0
    }
};

export default state;
