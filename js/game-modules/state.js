import { DIFFICULTY_SETTINGS } from '../constants.js';

export const HIGH_SCORE_KEY = 'fireHeistHighScores';
export const GRASS_ANIMATION_INTERVAL_MS = 100; // 10fps

const state = {
    gameRunning: false,
    isPaused: false,
    grassAnimationState: {
        blades: [],
        lastUpdateTime: 0
    },
    clouds: [],
    currentSegmentIndex: 0,
    segmentProgress: 0,
    lastTime: 0,
    backgroundOffset: 0,
    frameCount: 0,
    accumulatedCash: 0, // Initialized in startGame/resetGameState
    activeCashBags: [],
    manualJumpOverride: { isActive: false, startTime: 0, duration: 0 }, // duration will be state.manualJumpDurationMs
    jumpState: {
        isJumping: false, progress: 0, headScaleX: 1, bodyScaleX: 1, isHurdle: false, hurdleDuration: 0, isSpecialMove: false, specialMoveDuration: 0,
        isPowerStomp: false, powerStompDuration: 0, isDive: false, diveDuration: 0, isCorkscrewSpin: false, corkscrewSpinDuration: 0,
        isSpinningTop: false, spinningTopDuration: 0,
        isScissorKick: false, scissorKickDuration: 0, isPhaseDash: false, phaseDashDuration: 0, isHover: false, hoverDuration: 0,
        isGroundPound: false, groundPoundDuration: 0, isCartoonScramble: false, cartoonScrambleDuration: 0, isMoonwalking: false, moonwalkDuration: 0,
        isShockwave: false, shockwaveDuration: 0, isBackflip: false, backflipDuration: 0, isFrontflip: false, frontflipDuration: 0,
        isHoudini: false, houdiniDuration: 0, houdiniPhase: 'disappearing'
    },
    currentObstacle: null,
    isColliding: false,
    collisionDuration: 0,
    currentAccelerator: null,
    isAccelerating: false,
    accelerationDuration: 0,
    isDecelerating: false,
    decelerationDuration: 0,
    gameSpeedMultiplier: 1.0, // Initialized in startGame
    activeCustomEvents: [], // Initialized in startGame/resetGameState
    onScreenCustomEvent: null,
    hitsCounter: 0,
    daysElapsedTotal: 0,
    daysAccumulatedAtSegmentStart: 0,
    isVictory: false,
    isGameOverSequence: false,
    gameOverSequenceStartTime: 0,
    screenFlash: { opacity: 0, duration: 0, startTime: 0 },
    stickFigureBurst: { active: false, startTime: 0, progress: 0, duration: 500, maxOffset: 20 }, // Example values
    turboBoost: { frame: 0, lastFrameTime: 0 },
    daysCounter: null, // Initialized in animate
    manualJumpHeight: DIFFICULTY_SETTINGS.Rookie.manualJumpHeight, // Default, set by skill level
    manualJumpDurationMs: 350, // Default, can be overridden by skill level
    COLLISION_RANGE_X: DIFFICULTY_SETTINGS.Rookie.COLLISION_RANGE_X, // Default, set by skill level
    acceleratorFrequencyPercent: DIFFICULTY_SETTINGS.Rookie.ACCELERATOR_FREQUENCY_PERCENT // Default, set by skill level
};

export default state;