export const personaUnlocks = {
    savvySamu: { // Ninja
        description: 'Achieve a flawless run on Novice difficulty',
        condition: {
            type: 'flawlessRun',
            difficulty: 'Novice'
        }
    },
    fireMage: { // Placeholder for a new persona
        description: 'Incinerate 100 obstacles',
        condition: {
            type: 'incinerateCount',
            count: 100
        }
    }
};

export const ARMORY_ITEMS = {
    firestorm: {
        name: 'Firestorm',
        description: 'Unleash a continuous barrage of fire, incinerating all obstacles.',
        emoji: '🌪️',
        tier: 'Legendary',
        unlockCondition: {
            type: 'incinerateCount',
            count: 100,
            skillKey: 'firestorm'
        },
        unlockText: 'Incinerate 100 obstacles'
    },
    fireSpinner: {
        name: 'Fire Spinner',
        description: 'A fiery spinning jump that incinerates obstacles.',
        emoji: '🔥',
        tier: 'Enlisted',
        unlockCondition: {
            type: 'consecutiveGroundPounds',
            count: 3,
            skillKey: 'fireSpinner'
        },
        unlockText: 'Destroy 3 obstacles in a row with Ground Pound'
    },
    fieryGroundPound: {
        name: 'Fiery Ground Pound',
        description: 'A powerful ground pound that creates a fiery explosion, incinerating all on-screen obstacles.',
        emoji: '💥',
        tier: 'Master',
        unlockCondition: {
            type: 'consecutiveGroundPounds',
            count: 2,
            skillKey: 'fieryGroundPound'
        },
        unlockText: 'Destroy 10 obstacles in a row with Ground Pound'
    },
    fireStomper: {
        name: 'Fire Stomper',
        description: 'A massive stomp that flips all on-screen obstacles upside down before turning them to rubble.',
        emoji: '👣',
        tier: 'Master',
        unlockCondition: {
            type: 'fieryGroundPoundCount',
            count: 50,
            skillKey: 'fireStomper'
        },
        unlockText: 'Destroy 50 obstacles with Fiery Ground Pound'
    },
    fieryHoudini: {
        name: 'Fiery Houdini',
        description: 'Teleport with a burst of fire, incinerating nearby obstacles.',
        imageLocked: 'images/fiery-houdini-locked.png',
        imageUnlocked: 'images/fiery-houdini-unlocked.png',
        tier: 'Master',
        unlockCondition: {
            type: 'incinerateCount',
            count: 50,
            skillKey: 'fieryHoudini'
        },
        unlockText: 'Incinerate 50 obstacles'
    },
    mageSpinner: {
        name: 'Mage Spinner',
        description: 'Automatically cast a volley of fireballs at nearby obstacles.',
        emoji: '🌀',
        tier: 'Master',
        unlockCondition: {
            type: 'incinerateCount',
            count: 150,
            skillKey: 'mageSpinner'
        },
        unlockText: 'Incinerate 150 obstacles'
    },
    blinkStrike: {
        name: 'Blink Strike',
        description: 'Instantly teleport through the next obstacle, shattering it on arrival. A high-precision tool for the agile.',
        emoji: '💨',
        tier: 'Enlisted',
        unlockCondition: {
            type: 'placeholder',
            skillKey: 'blinkStrike'
        },
        unlockText: 'Unlock condition not yet determined.'
    },
    jetstreamDash: {
        name: 'Jetstream Dash',
        description: 'Propel forward in a sustained, invincible dash. Perfect for navigating dense obstacle fields when a jump won\'t cut it.',
        emoji: '🌊',
        tier: 'Enlisted',
        unlockCondition: {
            type: 'placeholder',
            skillKey: 'jetstreamDash'
        },
        unlockText: 'Unlock condition not yet determined.'
    },
    echoSlam: {
        name: 'Echo Slam',
        description: 'Slam the ground with such force that it sends a secondary, weaker shockwave forward, clearing staggered obstacles.',
        emoji: '💥',
        tier: 'Enlisted',
        unlockCondition: {
            type: 'placeholder',
            skillKey: 'echoSlam'
        },
        unlockText: 'Unlock condition not yet determined.'
    },
    fireballRoll: {
        name: 'Fireball Roll',
        description: 'Transform into a rolling fireball of accelerating power. Incinerate the next obstacle in your path, leaving only a trail of ash.',
        imageLocked: 'images/fireball-roll-locked.png',
        imageUnlocked: 'images/fireball-roll-unlocked.png',
        tier: 'Master',
        unlockCondition: {
            type: 'placeholder',
            skillKey: 'fireballRoll'
        },
        unlockText: 'Unlock condition not yet determined.'
    },
    shotgunBlast: {
        name: 'Shotgun Blast',
        description: 'Unleash a cone of fire particles, destroying nearby obstacles.',
        imageLocked: 'images/shotgun-locked.png',
        imageUnlocked: 'images/shotgun-unlocked.png',
        tier: 'Enlisted',
        unlockCondition: {
            type: 'placeholder',
            skillKey: 'shotgunBlast'
        },
        unlockText: 'Unlock condition to be determined.'
    },
    molotovCocktail: {
        name: 'Molotov Cocktail',
        description: 'Hurl a fiery projectile that smashes and ignites obstacles on impact.',
        imageLocked: 'images/molatov-cocktail-locked.png',
        imageUnlocked: 'images/molatov-cocktail-unlocked.png',
        tier: 'Enlisted',
        unlockCondition: {
            type: 'placeholder',
            skillKey: 'molotovCocktail'
        },
        unlockText: 'Unlock condition to be determined.'
    },
    sixShooterPistol: {
        name: 'Six Shooter Pistol',
        description: 'A rapid-fire pistol with 6 shots per clip, incinerating obstacles on impact with fiery bullets.',
        imageLocked: 'images/six-shooter-locked.png',
        imageUnlocked: 'images/six-shooter-unlocked.png',
        tier: 'Epic',
        unlockCondition: {
            type: 'fireMageIncinerateCount',
            count: 50,
            skillKey: 'sixShooterPistol'
        },
        unlockText: 'Incinerate 50 obstacles using Fire Mage'
    },
    fireAxe: {
        name: 'Fire Axe',
        description: 'A flaming axe that chops down obstacles. Upgrades allow it to be thrown for a short distance.',
        emoji: '🪓',
        tier: 'Grunt',
        unlockCondition: {
            type: 'placeholder',
            skillKey: 'fireAxe'
        },
        unlockText: 'Unlock condition to be determined.'
    },
    tarzanSwing: {
        name: 'Tarzan Swing',
        description: 'Swing from a rope to clear obstacles and gain momentum.',
        emoji: '🐒',
        tier: 'Enlisted',
        unlockCondition: {
            type: 'placeholder',
            skillKey: 'tarzanSwing'
        },
        unlockText: 'Unlock condition to be determined.'
    },
    bigHeadMode: {
        name: 'Big Head Mode',
        description: 'Your head is now 2x bigger. A purely cosmetic change for bragging rights.',
        emoji: '🤯',
        tier: 'Legendary',
        unlockCondition: {
            type: 'daysSurvived',
            count: 100000,
            skillKey: 'bigHeadMode'
        },
        unlockText: 'Survive a total of 100,000 days'
    },
    reaperDrone: {
        name: 'Reaper Drone',
        description: 'A drone that fires a missile at the first obstacle in its path.',
        imageLocked: 'images/reaper-drone.svg',
        imageUnlocked: 'images/reaper-drone.svg',
        tier: 'Legendary',
        unlockCondition: {
            type: 'totalIncinerateCount',
            count: 10000,
            skillKey: 'reaperDrone'
        },
        unlockText: 'Incinerate 10,000 total obstacles'
    }
};

export function getSkillUnlockProgress(condition, stats) {
    if (!condition || !stats) return { current: 0, target: 0 };

    switch (condition.type) {
        case 'incinerateCount':
            return {
                current: stats.obstaclesIncinerated || 0,
                target: condition.count
            };
        case 'totalIncinerateCount':
            return {
                current: stats.totalObstaclesIncinerated || 0,
                target: condition.count
            };
        case 'flawlessRun':
            const isComplete = stats.flawlessRuns && stats.flawlessRuns[condition.difficulty];
            return {
                current: isComplete ? 1 : 0,
                target: 1
            };
        case 'consecutiveGroundPounds':
            return {
                current: stats.consecutiveGroundPounds || 0,
                target: condition.count
            };
        case 'fireMageIncinerateCount':
            return {
                current: stats.fireMageIncinerations || 0,
                target: condition.count
            };
        // Add other progress tracking here
        default:
            return { current: 0, target: 0 };
    }
}

export function checkSkillUnlockStatus(condition, stats) {
    if (!stats) return false; // No stats means nothing is unlocked

    // If the skill is already in the unlockedArmoryItems array, it's unlocked.
    if (stats.unlockedArmoryItems && stats.unlockedArmoryItems.includes(condition.skillKey)) {
        return true;
    }

    if (!condition || condition.type === 'placeholder') return false; // Placeholder conditions are always locked for now

    switch (condition.type) {
        case 'incinerateCount':
            return stats.obstaclesIncinerated >= condition.count;
        case 'totalIncinerateCount':
            return stats.totalObstaclesIncinerated >= condition.count;
        case 'flawlessRun':
            return stats.flawlessRuns && stats.flawlessRuns[condition.difficulty];
        case 'consecutiveGroundPounds':
            return stats.consecutiveGroundPounds >= condition.count;
        case 'fireMageIncinerateCount':
            return stats.fireMageIncinerations >= condition.count;
        // Add other unlock conditions here
        default:
            return false;
    }
}