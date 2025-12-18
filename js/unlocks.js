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
    "jump": {
        "name": "Jump",
        "description": "A basic vertical jump to clear obstacles and navigate the environment.",
        "emoji": "🏃‍♀️",
        "tier": "Basic",
        "unlockCondition": {
            "type": "always",
            "skillKey": "jump"
        },
        "unlockText": "Core skill - always available",
        "hiddenFromArmory": true
    },
    "backflip": {
        "name": "Backflip",
        "description": "Execute a backward flip to evade obstacles with style.",
        "emoji": "🤸🏻‍♂️",
        "tier": "Basic",
        "unlockCondition": {
            "type": "always",
            "skillKey": "backflip"
        },
        "unlockText": "Core skill - always available"
    },
    "frontflip": {
        "name": "Frontflip",
        "description": "Execute a forward flip to clear obstacles with precision.",
        "emoji": "🤸🏾‍♂️",
        "tier": "Basic",
        "unlockCondition": {
            "type": "always",
            "skillKey": "frontflip"
        },
        "unlockText": "Core skill - always available"
    },
    "corkscrewSpin": {
        "name": "Corkscrew Spin",
        "description": "Spin in a corkscrew motion to navigate through tight gaps.",
        "emoji": "🌀",
        "tier": "Basic",
        "unlockCondition": {
            "type": "always",
            "skillKey": "corkscrewSpin"
        },
        "unlockText": "Core skill - always available"
    },
    "fireball": {
        "name": "Fireball",
        "description": "Hurl a fireball forward to incinerate obstacles in your path.",
        "emoji": "🔥",
        "tier": "Basic",
        "unlockCondition": {
            "type": "always",
            "skillKey": "fireball"
        },
        "unlockText": "Core skill - always available"
    },
    "groundPound": {
        "name": "Ground Pound",
        "description": "Slam the ground with force to destroy nearby obstacles.",
        "emoji": "💥",
        "tier": "Basic",
        "unlockCondition": {
            "type": "always",
            "skillKey": "groundPound"
        },
        "unlockText": "Core skill - always available"
    },
    "hurdle": {
        "name": "Hurdle",
        "description": "Jump over obstacles with precision and control.",
        "emoji": "🏃",
        "tier": "Basic",
        "unlockCondition": {
            "type": "always",
            "skillKey": "hurdle"
        },
        "unlockText": "Core skill - always available"
    },
    "dive": {
        "name": "Dive",
        "description": "Dive forward to evade obstacles and maintain momentum.",
        "emoji": "🏊",
        "tier": "Enlisted",
        "unlockCondition": {
            "type": "daysSurvived",
            "count": 25,
            "skillKey": "dive"
        },
        "unlockText": "Survive 25 days"
    },
    "cartoonScramble": {
        "name": "Cartoon Scramble",
        "description": "Transform into a cartoon-style version of yourself with distorted physics and exaggerated movement.",
        "emoji": "𖡎",
        "tier": "Cosmetic",
        "unlockCondition": {
            "type": "always",
            "skillKey": "cartoonScramble"
        },
        "unlockText": "Cosmetic enhancement - always available"
    },
    "jetPack": {
        "name": "Jet Pack",
        "description": "Boost over obstacles with a powerful jet pack.",
        "emoji": "🚀",
        "tier": "Master",
        "unlockCondition": {
            "type": "flawlessHurdles",
            "count": 50,
            "skillKey": "jetPack"
        },
        "unlockText": "Achieve 50 flawless hurdles"
    },
    "firestorm": {
        "name": "Firestorm",
        "description": "Unleash a continuous barrage of fire, incinerating all obstacles.",
        "emoji": "🌪️",
        "tier": "Master",
        "unlockCondition": {
            "type": "incinerateCount",
            "count": 100,
            "skillKey": "firestorm"
        },
        "unlockText": "Incinerate 100 obstacles"
    },
    "fireSpinner": {
        "name": "Fire Spinner",
        "description": "A fiery spinning jump that incinerates obstacles.",
        "emoji": "🔥",
        "tier": "Enlisted",
        "unlockCondition": {
            "type": "incinerateCount",
            "count": 75,
            "skillKey": "fireSpinner"
        },
        "unlockText": "Incinerate 75 obstacles"
    },
    "fieryGroundPound": {
        "name": "Fiery Ground Pound",
        "description": "A powerful ground pound that creates a fiery explosion, incinerating all on-screen obstacles.",
        "emoji": "💥",
        "tier": "Master",
        "unlockCondition": {
            "type": "consecutiveGroundPounds",
            "count": 10,
            "skillKey": "fieryGroundPound"
        },
        "unlockText": "Destroy 10 obstacles in a row with Ground Pound"
    },
    "fireStomper": {
        "name": "Fire Stomper",
        "description": "A massive stomp that flips all on-screen obstacles upside down before turning them to rubble.",
        "emoji": "👣",
        "tier": "Legendary",
        "unlockCondition": {
            "type": "fieryGroundPoundCount",
            "count": 50,
            "skillKey": "fireStomper"
        },
        "unlockText": "Destroy 50 obstacles with Fiery Ground Pound"
    },
    "fieryHoudini": {
        "name": "Fiery Houdini",
        "description": "Teleport with a burst of fire, incinerating nearby obstacles.",
        "imageLocked": "images/fiery-houdini-locked.png",
        "imageUnlocked": "images/fiery-houdini-unlocked.png",
        "tier": "Master",
        "grantsInvincibility": true,
        "unlockCondition": {
            "type": "incinerateCount",
            "count": 50,
            "skillKey": "fieryHoudini"
        },
        "unlockText": "Incinerate 50 obstacles"
    },
    "mageSpinner": {
        "name": "Mage Spinner",
        "description": "Automatically cast a volley of fireballs at nearby obstacles.",
        "emoji": "🌀",
        "tier": "Master",
        "unlockCondition": {
            "type": "incinerateCount",
            "count": 150,
            "skillKey": "mageSpinner"
        },
        "unlockText": "Incinerate 150 obstacles"
    },
    "blinkStrike": {
        "name": "Blink Strike",
        "description": "Instantly teleport through the next obstacle, shattering it on arrival. A high-precision tool for the agile.",
        "emoji": "💨",
        "tier": "Master",
        "unlockCondition": {
            "type": "consecutiveFlawlessHurdles",
            "count": 25,
            "skillKey": "blinkStrike"
        },
        "unlockText": "Achieve 25 consecutive flawless hurdles"
    },
    "jetstreamDash": {
        "name": "Jetstream Dash",
        "description": "Propel forward in a sustained, invincible dash. Perfect for navigating dense obstacle fields when a jump won't cut it.",
        "emoji": "🌊",
        "tier": "Legendary",
        "grantsInvincibility": true,
        "unlockCondition": {
            "type": "fireballRollKills",
            "count": 50,
            "skillKey": "jetstreamDash"
        },
        "unlockText": "Destroy 50 obstacles with Fireball Roll"
    },
    "echoSlam": {
        "name": "Echo Slam",
        "description": "Slam the ground with such force that it sends a secondary, weaker shockwave forward, clearing staggered obstacles.",
        "emoji": "💥",
        "tier": "Legendary",
        "unlockCondition": {
            "type": "groundPoundKills",
            "count": 100,
            "skillKey": "echoSlam"
        },
        "unlockText": "Destroy 100 obstacles with Ground Pound"
    },
    "fireballRoll": {
        "name": "Fireball Roll",
        "description": "Transform into a rolling fireball of accelerating power. Incinerate the next obstacle in your path, leaving only a trail of ash.",
        "imageLocked": "images/fireball-roll-locked.png",
        "imageUnlocked": "images/fireball-roll-unlocked.png",
        "tier": "Master",
        "grantsInvincibility": true,
        "unlockCondition": {
            "type": "incinerateCount",
            "count": 100,
            "skillKey": "fireballRoll"
        },
        "unlockText": "Incinerate 100 obstacles"
    },
    "shotgunBlast": {
        "name": "Shotgun Blast",
        "description": "Unleash a cone of fire particles, destroying nearby obstacles.",
        "imageLocked": "images/shotgun-locked.png",
        "imageUnlocked": "images/shotgun-unlocked.png",
        "tier": "Master",
        "unlockCondition": {
            "type": "totalIncinerateCount",
            "count": 150,
            "skillKey": "shotgunBlast"
        },
        "unlockText": "Incinerate 150 total obstacles"
    },
    "molotovCocktail": {
        "name": "Molotov Cocktail",
        "description": "Hurl a fiery projectile that smashes and ignites obstacles on impact.",
        "imageLocked": "images/molatov-cocktail-locked.png",
        "imageUnlocked": "images/molatov-cocktail-unlocked.png",
        "tier": "Master",
        "unlockCondition": {
            "type": "totalIncinerateCount",
            "count": 200,
            "skillKey": "molotovCocktail"
        },
        "unlockText": "Incinerate 200 total obstacles"
    },
    "sixShooterPistol": {
        "name": "Six Shooter Pistol",
        "description": "A rapid-fire pistol with 6 shots per clip, incinerating obstacles on impact with fiery bullets.",
        "emoji": "🔫",
        "imageLocked": "images/six-shooter-locked.png",
        "imageUnlocked": "images/six-shooter-unlocked.png",
        "tier": "Legendary",
        "unlockCondition": {
            "type": "incinerateCount",
            "count": 150,
            "skillKey": "sixShooterPistol"
        },
        "unlockText": "Incinerate 150 obstacles"
    },
    "fireAxe": {
        "name": "Fire Axe",
        "description": "A flaming axe that chops down obstacles. Upgrades allow it to be thrown for a short distance.",
        "emoji": "🪓",
        "tier": "Master",
        "unlockCondition": {
            "type": "daysSurvived",
            "count": 150,
            "skillKey": "fireAxe"
        },
        "unlockText": "Survive 150 days"
    },
    "tarzanSwing": {
        "name": "Tarzan Swing",
        "description": "Swing from a rope to clear obstacles and gain momentum.",
        "emoji": "🐒",
        "tier": "Legendary",
        "grantsInvincibility": true,
        "unlockCondition": {
            "type": "daysSurvived",
            "count": 300,
            "skillKey": "tarzanSwing"
        },
        "unlockText": "Survive 300 days"
    },
    "bigHeadMode": {
        "name": "Big Head Mode",
        "description": "Your head is now 2x bigger. A purely cosmetic change for bragging rights.",
        "emoji": "🤯",
        "tier": "Cosmetic",
        "unlockCondition": {
            "type": "daysSurvived",
            "count": 500,
            "skillKey": "bigHeadMode"
        },
        "unlockText": "Survive a total of 500 days"
    },
    "christmasTheme": {
        "name": "Christmas Theme Pack",
        "description": "Unlock the festive Christmas theme with Jolly Nick persona, Christmas emojis, holiday particle effects, and special audio.",
        "emoji": "🎄",
        "tier": "Legendary",
        "unlockCondition": {
            "type": "daysSurvived",
            "count": 200,
            "skillKey": "christmasTheme"
        },
        "unlockText": "Survive 200 consecutive days",
        "themeKey": "christmas",
        "personaKey": "jollyNick",
        "hiddenFromArmory": true
    },
    "reaperDrone": {
        "name": "Reaper Drone",
        "description": "A drone that fires a missile at the first obstacle in its path.",
        "imageLocked": "images/reaper-drone.svg",
        "imageUnlocked": "images/reaper-drone.svg",
        "tier": "LegendaryPlus",
        "unlockCondition": {
            "type": "totalIncinerateCount",
            "count": 1000,
            "skillKey": "reaperDrone"
        },
        "unlockText": "Incinerate 1,000 total obstacles"
    },
    "fireMage": {
        "name": "Fire Mage",
        "description": "Transform into a Fire Mage, gaining enhanced pyromantic abilities.",
        "emoji": "🧙",
        "tier": "Master",
        "unlockCondition": {
            "type": "incinerateCount",
            "count": 50,
            "skillKey": "fireMage"
        },
        "unlockText": "Incinerate 50 obstacles"
    },
    "phaseDash": {
        "name": "Phase Dash",
        "description": "Dash forward while phasing through obstacles invincibly.",
        "emoji": "⚡",
        "tier": "Master",
        "grantsInvincibility": true,
        "unlockCondition": {
            "type": "incinerateCount",
            "count": 30,
            "skillKey": "phaseDash"
        },
        "unlockText": "Incinerate 30 obstacles"
    },
    "houdini": {
        "name": "Houdini",
        "description": "Teleport away from danger in a flash.",
        "emoji": "🎩",
        "tier": "Master",
        "grantsInvincibility": true,
        "unlockCondition": {
            "type": "incinerateCount",
            "count": 25,
            "skillKey": "houdini"
        },
        "unlockText": "Incinerate 25 obstacles"
    },
    "hover": {
        "name": "Hover",
        "description": "Hover above obstacles to evade danger.",
        "emoji": "⬆️",
        "tier": "Enlisted",
        "unlockCondition": {
            "type": "incinerateCount",
            "count": 15,
            "skillKey": "hover"
        },
        "unlockText": "Incinerate 15 obstacles"
    },
    "hoverPack": {
        "name": "Hover Pack",
        "description": "A jetpowered pack for sustained flight.",
        "emoji": "🔋",
        "tier": "Enlisted",
        "unlockCondition": {
            "type": "daysSurvived",
            "count": 20,
            "skillKey": "hoverPack"
        },
        "unlockText": "Survive 20 days"
    },
    "shockwave": {
        "name": "Shockwave",
        "description": "Generate a powerful shockwave that repels obstacles.",
        "emoji": "〰️",
        "tier": "Master",
        "unlockCondition": {
            "type": "consecutiveGroundPounds",
            "count": 5,
            "skillKey": "shockwave"
        },
        "unlockText": "Land 5 consecutive Ground Pounds"
    },
    "moonwalk": {
        "name": "Moonwalk",
        "description": "Glide backward with style and grace. Higher skill levels grant energy restoration and invincibility.",
        "emoji": "🚶‍♂️",
        "tier": "Enlisted",
        "unlockCondition": {
            "type": "daysSurvived",
            "count": 50,
            "skillKey": "moonwalk"
        },
        "unlockText": "Survive 50 days"
    },
    "scissorKick": {
        "name": "Scissor Kick",
        "description": "Execute a scissor kick to slice through obstacles.",
        "emoji": "✂️",
        "tier": "Enlisted",
        "unlockCondition": {
            "type": "groundPoundKills",
            "count": 10,
            "skillKey": "scissorKick"
        },
        "unlockText": "Destroy 10 obstacles with Ground Pound"
    },
    "giftBombToss": {
        "name": "Gift Bomb Toss",
        "description": "Throw wrapped gift boxes that bounce and explode on impact, destroying nearby obstacles.",
        "emoji": "🎁",
        "tier": "Enlisted",
        "unlockCondition": {
            "type": "personaActive",
            "personaKey": "jollyNick",
            "skillKey": "giftBombToss"
        },
        "unlockText": "Available with Jolly Nick persona"
    }
};

export function getSkillUnlockProgress(condition, stats) {
    if (!condition || !stats) return { current: 0, target: 0 };

    switch (condition.type) {
        case 'always':
            return {
                current: 1,
                target: 1
            };
        case 'flawlessHurdles':
            return {
                current: stats.flawlessHurdles || 0,
                target: condition.count
            };
        case 'consecutiveFlawlessHurdles':
            return {
                current: stats.consecutiveFlawlessHurdles || 0,
                target: condition.count
            };
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
        case 'daysSurvived':
            return {
                current: stats.daysSurvived || 0,
                target: condition.count
            };
        case 'groundPoundKills':
            return {
                current: stats.groundPoundKills || 0,
                target: condition.count
            };
        case 'fireballRollKills':
            return {
                current: stats.fireballRollKills || 0,
                target: condition.count
            };
        case 'fieryGroundPoundCount':
            return {
                current: stats.fieryGroundPoundCount || 0,
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
        case 'always':
            return true;  // Always unlocked (core/cosmetic skills)
        case 'incinerateCount':
            return stats.obstaclesIncinerated >= condition.count;
        case 'totalIncinerateCount':
            return stats.totalObstaclesIncinerated >= condition.count;
        case 'flawlessRun':
            return stats.flawlessRuns && stats.flawlessRuns[condition.difficulty];
        case 'consecutiveGroundPounds':
            return stats.consecutiveGroundPounds >= condition.count;
        case 'consecutiveFlawlessHurdles':
            return stats.consecutiveFlawlessHurdles >= condition.count;
        case 'fireMageIncinerateCount':
            return stats.fireMageIncinerations >= condition.count;
        case 'daysSurvived':
            return stats.daysSurvived >= condition.count;
        case 'groundPoundKills':
            return stats.groundPoundKills >= condition.count;
        case 'fireballRollKills':
            return stats.fireballRollKills >= condition.count;
        case 'fieryGroundPoundCount':
            return stats.fieryGroundPoundCount >= condition.count;
        // Add other unlock conditions here
        default:
            return false;
    }
}