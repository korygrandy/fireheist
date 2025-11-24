import { DIFFICULTY_SETTINGS, SIX_SHOOTER_AMMO_CAPACITY } from '../constants.js';

export const HIGH_SCORE_KEY = 'fireHeistHighScores';
export const PLAYER_STATS_KEY = 'fireHeistPlayerStats'; // New constant
export const GRASS_ANIMATION_INTERVAL_MS = 200; // Update grass blades every 200ms

const state = {
    daysElapsedTotal: 0,
    hitsCounter: 0,
    activeCustomEvents: [],
    gameRunning: false,
    isPaused: false,
    currentSegmentIndex: 0,
    segmentProgress: 0,
    lastTime: 0,
    backgroundOffset: 0,
    frameCount: 0,
    accumulatedCash: 0,
    displayCash: 0,
    daysCounter: null,
    gameSpeedMultiplier: 1.0,
    COLLISION_RANGE_X: DIFFICULTY_SETTINGS.Rookie.COLLISION_RANGE_X,
    manualJumpDurationMs: DIFFICULTY_SETTINGS.Rookie.manualJumpDurationMs,
    manualJumpHeight: DIFFICULTY_SETTINGS.Rookie.manualJumpHeight,
    obstacleFrequencyPercent: DIFFICULTY_SETTINGS.Rookie.OBSTACLE_FREQUENCY_PERCENT,
    userObstacleFrequencyPercent: DIFFICULTY_SETTINGS.Rookie.OBSTACLE_FREQUENCY_PERCENT,
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
        isFieryHoudini: false, fieryHoudiniDuration: 0, fieryHoudiniPhase: 'disappearing',
        isBlinkStrike: false, blinkStrikeDuration: 0,
        isJetstreamDashing: false, jetstreamDashDuration: 0,
        isEchoSlam: false, echoSlamDuration: 0, echoSlamSecondaryTriggered: false,
        isFireballRolling: false, fireballRollDuration: 0
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

    // New Special Move States
    playerIsInvisible: false, // For Blink Strike
    stickFigureFixedX: 150, // Override for player X position (e.g., for Blink Strike teleport)
    stickFigureY: undefined, // Override for player Y position
    jetstreamDashDrainEndTime: 0, // For Jetstream Dash energy drain
    fireballRollDrainEndTime: 0, // For Fireball Roll energy drain

    // Fire Axe State
    fireAxeState: {
        isActive: false,
        swingProgress: 0,
        isThrown: false,
        x: 0,
        y: 0,
        hasHit: false,
    },

    // Tarzan State
    tarzanState: {
        isActive: false,
        isSwinging: false,
        isAttached: false,
        ropeLength: 150,
        angle: 0,
        angularVelocity: 0,
        anchorX: 0,
        anchorY: 0,
        swingDirection: 1,
        playerReleaseTime: 0,
        cooldownEndTime: 0,
        hasSwungForward: false,
        swingStartTime: 0,
    },

    reaperDroneState: {
        isActive: false,
        cooldownEndTime: 0
    },

    // Six Shooter Pistol State
    sixShooterAmmo: SIX_SHOOTER_AMMO_CAPACITY,
    isSixShooterReloading: false,
    currentThemeAnchorImage: null,
    themeAnchor: {
        image: null,
        opacity: 0,
        fadingIn: false,
        fadeStartTime: 0,
        fadeDuration: 2000 // 2 seconds to fade in
    },
    
    // Game progression
    gameRunning: false,

    // Six Shooter Pistol Bullets
    activeSixShooterBullets: [],

    activeFireballs: [], // Array to track on-screen fireballs
    vanishingObstacles: [], // Array for obstacles that "poof" on hit
    meteorParticles: [],
    currentObstacle: null,
    isColliding: false,
    collisionDuration: 0,
    isInvincible: false,
    invincibilityEndTime: 0,
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
    manualJumpHeight: DIFFICULTY_SETTINGS.Rookie.manualJumpHeight,
    manualJumpDurationMs: DIFFICULTY_SETTINGS.Rookie.manualJumpDurationMs,
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
    jetstreamParticles: [],
    flipTrail: [],
    corkscrewTrail: [],
    shatteredObstacles: [],
    ashParticles: [],
    shotgunParticles: [],
    molotovCocktails: [],
    phoenixSparks: [],
    activeImpactSparks: [],
    fireWall: {
        letterParticles: [],
        smokeParticles: [],
        sparks: []
    },
    isFirestormActive: false,
    isFireShieldActive: false,
    isShotgunBlastActive: false,
    fireShieldEndTime: 0,
    firestormEndTime: 0,
    firestormParticles: [],
    firestormLightningFlashes: [],
    playerEmberParticles: [],
    fireballRollParticles: [],
    ignitedObstacles: [],
    MAX_FIRESTORM_PARTICLES: 50,
    MAX_EMBER_PARTICLES: 100,
    selectedTheme: 'grass', // Add this line
    environmentalEffects: {
        raindrops: [],
        rocks: [],
        headlights: [],
        fogPatches: [],
        snowflakes: [],
        windGusts: [],
        kickedUpSnow: [],
        heatHaze: [],
        tumbleweeds: [],
        sandGrains: [],
        tornadoes: [],
        asteroids: [],
        shootingStars: [],
        nebulaClouds: [],
        shootingStarBursts: [],
        shootingStarTrails: [],
        nebulaCloudState: { active: false, startTime: 0, opacity: 0 },
        fireflies: [],
        moonGlow: { active: false, opacity: 0, rays: [] },
        volcanoSmoke: [],
        embers: [],
        ash: [],
        steamVents: [],
        heatShimmer: { active: false, waveY: 0 },
        cityscape: { buildings: [] },
        headlightFadeState: {
            opacity: 0.6 + Math.random() * 0.4,
            fadeDirection: Math.random() > 0.5 ? 1 : -1,
            fadeSpeed: Math.random() * 0.0005 + 0.0001
        }
    },
    playerEnergy: DIFFICULTY_SETTINGS.Rookie.maxPlayerEnergy,
    maxPlayerEnergy: DIFFICULTY_SETTINGS.Rookie.maxPlayerEnergy,
    isFirestormDrainingEnergy: false,
    firestormDrainEndTime: 0,
    isFireSpinnerDrainingEnergy: false,
    fireSpinnerDrainEndTime: 0,
    leaderboardInitials: {
        initials: ['A', 'A', 'A'],
        selectedIndex: 0,
        isActive: false,
        submitted: false
    },
    playerStats: { // New player stats object
        fireMageIncinerations: 0, // New: To track incinerations specifically by Fire Mage for Six Shooter Pistol unlock
        skillLevels: {}, // e.g., { 'firestorm': 1, 'shotgun': 2 }
        flawlessRuns: {}, // e.g., { 'Novice': true, 'Pro': false }
        obstaclesIncinerated: 0,
        notifiedArmoryUnlocks: [], // To track shown notifications
        unlockedArmoryItems: [], // New: To store keys of unlocked armory items
        activeArmorySkill: null, // New: To store the key of the currently active armory skill
        consecutiveGroundPounds: 0, // New: To track consecutive ground pounds for an achievement
        totalGroundPoundCollisions: 0,
        consecutiveIncinerations: 0,
        totalInGameIncinerations: 0,
        hasSeenNewArmoryIndicator: false // New: To track if the user has seen the new armory indicator
    },

    // Mini-Game: Blow That Dough
    isMiniGameActive: false,
    miniGameType: null,
    miniGameTimer: 0,
    miniGameCashToInvest: 0,
    miniGameScore: 0,
    currentInvestment: null,
    investmentOpportunities: [],
    miniGameResultsDisplayed: false,
    miniGameBonus: 0,
    gamepad: null,
    showDailyChallengeCompletedOverlay: false,
    isBonusGameComplete: false,
    bonusGameHaul: 0,
};

export default state;
