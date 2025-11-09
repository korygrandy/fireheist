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
        unlockCondition: {
            type: 'incinerateCount',
            count: 100
        },
        unlockText: 'Incinerate 100 obstacles'
    },
    fireSpinner: {
        name: 'Fire Spinner',
        description: 'A fiery spinning jump that incinerates obstacles.',
        emoji: '🔥',
        unlockCondition: {
            type: 'consecutiveGroundPounds',
            count: 3
        },
        unlockText: 'Destroy 3 obstacles in a row with Ground Pound'
    },
    fieryGroundPound: {
        name: 'Fiery Ground Pound',
        description: 'A powerful ground pound that creates a fiery explosion, incinerating all on-screen obstacles.',
        emoji: '💥',
        unlockCondition: {
            type: 'consecutiveGroundPounds',
            count: 2
        },
        unlockText: 'Destroy 10 obstacles in a row with Ground Pound'
    },
    fireStomper: {
        name: 'Fire Stomper',
        description: 'A massive stomp that flips all on-screen obstacles upside down before turning them to rubble.',
        emoji: '👣',
        unlockCondition: {
            type: 'fieryGroundPoundCount',
            count: 50
        },
        unlockText: 'Destroy 50 obstacles with Fiery Ground Pound'
    },
    fieryHoudini: {
        name: 'Fiery Houdini',
        description: 'Teleport with a burst of fire, incinerating nearby obstacles.',
        emoji: '🔥💨',
        unlockCondition: {
            type: 'obstaclesIncinerated',
            count: 50
        },
        unlockText: 'Incinerate 50 obstacles'
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