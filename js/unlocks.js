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
        tier: 'Adept',
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
    blinkStrike: {
        name: 'Blink Strike',
        description: 'Instantly teleport through the next obstacle, shattering it on arrival. A high-precision tool for the agile.',
        emoji: '💨',
        tier: 'Adept',
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
        tier: 'Adept',
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
        tier: 'Adept',
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
        case 'flawlessRun':
            return stats.flawlessRuns && stats.flawlessRuns[condition.difficulty];
        case 'consecutiveGroundPounds':
            return stats.consecutiveGroundPounds >= condition.count;
        // Add other unlock conditions here
        default:
            return false;
    }
}