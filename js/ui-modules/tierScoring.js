/**
 * Tier Scoring System
 * 
 * This module provides a centralized, modular system for skill tier management,
 * scoring algorithms, and UI styling. By separating tier logic from armory UI,
 * we enable:
 * - Reusability across other UI modules
 * - Easier maintenance and testing
 * - Scalability for future tier systems
 * - Consistent tier logic application
 * 
 * @module tierScoring
 */

// =================================================================
// TIER DEFINITIONS
// =================================================================

/**
 * Tier configuration including order, naming, and visual styling.
 * Order is significant - determines display precedence.
 */
export const TIER_DEFINITIONS = {
    BASIC: {
        order: 1,
        label: 'Basic',
        description: 'Core foundational skills',
        backgroundColor: '#3b82f6',  // Blue
        textColor: '#ffffff',
        scoreRange: { min: -1000, max: -994 }
    },
    COSMETIC: {
        order: 2,
        label: 'Cosmetic',
        description: 'Visual-only enhancements',
        backgroundColor: '#10b981',  // Teal/Green
        textColor: '#ffffff',
        scoreRange: { min: -500, max: -500 }
    },
    ENLISTED: {
        order: 3,
        label: 'Enlisted',
        description: 'Early-game achievements',
        backgroundColor: '#8b5cf6',  // Purple
        textColor: '#ffffff',
        scoreRange: { min: 1, max: 35 }
    },
    MASTER: {
        order: 4,
        label: 'Master',
        description: 'Mid-game achievements',
        backgroundColor: '#fbbf24',  // Gold
        textColor: '#000000',        // Dark text for visibility on gold
        scoreRange: { min: 40, max: 75 }
    },
    LEGENDARY: {
        order: 5,
        label: 'Legendary',
        description: 'End-game achievements',
        backgroundColor: '#f59e0b',  // Orange (REQUIRED)
        textColor: '#ffffff',
        scoreRange: { min: 80, max: 1015 }
    },
    LEGENDARY_PLUS: {
        order: 6,
        label: 'Legendary+',
        description: 'Ultra-grind achievements (1000+ obstacles)',
        backgroundColor: '#dc2626',  // Dark Red (ultra-premium)
        textColor: '#ffffff',
        scoreRange: { min: 1016, max: 2000 }
    },
    ERROR: {
        order: 99,
        label: 'Error',
        description: 'Unclassified (indicates issue)',
        backgroundColor: '#ef4444',  // Red
        textColor: '#ffffff',
        scoreRange: { min: 999999, max: 999999 }
    }
};

// =================================================================
// SKILL CLASSIFICATION
// =================================================================

/**
 * Core skills that every player receives immediately.
 * Sorted by energy cost for display.
 * @type {string[]}
 */
const BASIC_SKILLS = [
    'jump',           // 0 energy
    'backflip',       // 0 energy
    'frontflip',      // 0 energy
    'corkscrewSpin',  // 0 energy
    'fireball',       // 10 energy
    'groundPound',    // 20 energy
    'hurdle'          // 0 energy
];

/**
 * Cosmetic skills that provide no gameplay advantage.
 * @type {string[]}
 */
const COSMETIC_SKILLS = [
    'cartoonScramble',
    'bigHeadMode'
];

// =================================================================
// ACHIEVEMENT DIFFICULTY SCORING
// =================================================================

/**
 * Maps achievement types to base difficulty scores.
 * Lower values = easier (appear first in Enlisted tier)
 * Higher values = harder (appear later in Legendary tier)
 * 
 * Ordering reflects general difficulty progression:
 * 1. Time-based (just survive) - easier
 * 2. Single-session cumulative (requires focus) - medium
 * 3. Multi-session cumulative (requires persistence) - harder
 * 4. Skill-based (requires mastery) - hardest
 */
export const ACHIEVEMENT_TYPE_SCORES = {
    daysSurvived: 1,                      // Tier 3: Just play many games
    consecutiveGroundPounds: 5,           // Tier 3: Requires skill
    incinerateCount: 10,                  // Tier 3-4: Single session focus
    totalIncinerateCount: 15,             // Tier 4: Multi-session cumulative
    flawlessHurdles: 20,                  // Tier 3: Precision required
    consecutiveFlawlessHurdles: 25,       // Tier 4: Consistency required
    fireMageIncinerateCount: 30,          // Tier 4: Specific skill usage
    groundPoundKills: 35,                 // Tier 4: Kill type tracking
    fireballRollKills: 40,                // Tier 5: Kill type tracking
    fieryGroundPoundCount: 45             // Tier 5: Specific skill usage
};

// =================================================================
// TIER ASSIGNMENT LOGIC
// =================================================================

/**
 * Determines which tier a skill belongs to based on its properties.
 * This is the core logic for tier assignment.
 * 
 * @param {Object} skill - The skill object from ARMORY_ITEMS
 * @param {string} skillKey - The key of the skill
 * @returns {string} - Tier key (BASIC, COSMETIC, ENLISTED, MASTER, LEGENDARY, ERROR)
 */
export function assignSkillTier(skill, skillKey) {
    // Check if it's a Basic skill
    if (BASIC_SKILLS.includes(skillKey)) {
        return 'BASIC';
    }

    // Check if it's a Cosmetic skill
    if (COSMETIC_SKILLS.includes(skillKey)) {
        return 'COSMETIC';
    }

    // Verify unlock condition exists
    if (!skill.unlockCondition || skill.unlockCondition.type === 'placeholder') {
        return 'ERROR';
    }

    // Use explicit tier if defined, otherwise return ERROR
    if (skill.tier === 'Enlisted') return 'ENLISTED';
    if (skill.tier === 'Master') return 'MASTER';
    if (skill.tier === 'Legendary') return 'LEGENDARY';
    if (skill.tier === 'LegendaryPlus') return 'LEGENDARY_PLUS';

    // Unknown tier
    return 'ERROR';
}

// =================================================================
// DIFFICULTY SCORING (Primary Sort Algorithm)
// =================================================================

/**
 * Calculates a difficulty score for a skill.
 * Lower scores = appears first in Armory
 * Higher scores = appears later in Armory
 * 
 * Scoring is tiered:
 * - BASIC: -1000 to -994 (sorted by energy cost)
 * - COSMETIC: -500 (fixed position)
 * - ENLISTED: 1-35 (sorted by achievement type then threshold)
 * - MASTER: 40-75 (sorted by achievement type then threshold)
 * - LEGENDARY: 80-1015 (sorted by achievement type then threshold)
 * - ERROR: 999999 (isolated at end to flag issues)
 * 
 * @param {Object} skill - The skill object from ARMORY_ITEMS
 * @param {string} skillKey - The key of the skill
 * @returns {number} - Difficulty score for sorting
 * 
 * @example
 * getDifficultyScore(fireballSkill, 'fireball')  // Returns -990 (Basic, 10 energy cost)
 * getDifficultyScore(hoverSkill, 'hover')        // Returns 11 (Enlisted, incinerate type)
 * getDifficultyScore(jetPackSkill, 'jetPack')    // Returns 55 (Master, flawless hurdles)
 */
export function getDifficultyScore(skill, skillKey) {
    const tier = assignSkillTier(skill, skillKey);

    // BASIC TIER: Sort by energy cost
    if (tier === 'BASIC') {
        const energyCost = skill.energyCost || 0;
        return TIER_DEFINITIONS.BASIC.scoreRange.min + energyCost;
    }

    // COSMETIC TIER: Fixed position
    if (tier === 'COSMETIC') {
        return TIER_DEFINITIONS.COSMETIC.scoreRange.min;
    }

    // ERROR TIER: Flag unclassified skills
    if (tier === 'ERROR') {
        console.warn(`⚠️ Tier Scoring: Skill '${skillKey}' could not be classified into any tier`);
        return TIER_DEFINITIONS.ERROR.scoreRange.min;
    }

    // ACHIEVEMENT TIERS (Enlisted, Master, Legendary)
    // Calculate score within tier range
    const tierInfo = TIER_DEFINITIONS[tier];
    const { type, count } = skill.unlockCondition;

    // Get base score for achievement type
    let baseScore = ACHIEVEMENT_TYPE_SCORES[type] || 100;

    // Factor in the count threshold
    // Higher counts generally = harder within same type
    if (count) {
        baseScore += Math.floor(count / 10);
    }

    // Map score to tier range
    const tierRange = tierInfo.scoreRange.max - tierInfo.scoreRange.min;
    const normalizedScore = Math.min(baseScore, tierRange);
    const finalScore = tierInfo.scoreRange.min + normalizedScore;

    return finalScore;
}

// =================================================================
// TIER COLOR MAPPING
// =================================================================

/**
 * Gets the color configuration for a skill's tier.
 * Used to render the tier label with appropriate styling.
 * 
 * @param {Object} skill - The skill object from ARMORY_ITEMS
 * @param {string} skillKey - The key of the skill
 * @returns {Object} - Color config { backgroundColor, textColor }
 */
export function getTierColors(skill, skillKey) {
    const tier = assignSkillTier(skill, skillKey);
    const tierInfo = TIER_DEFINITIONS[tier];

    return {
        backgroundColor: tierInfo.backgroundColor,
        textColor: tierInfo.textColor,
        tier: tierInfo.label
    };
}

// =================================================================
// TIER HTML GENERATION
// =================================================================

/**
 * Generates HTML for tier label badge to be displayed on skill cards.
 * 
 * @param {Object} skill - The skill object from ARMORY_ITEMS
 * @param {string} skillKey - The key of the skill
 * @returns {string} - HTML string for tier badge
 */
export function generateTierBadgeHtml(skill, skillKey) {
    const colors = getTierColors(skill, skillKey);

    const badgeHtml = `
        <div class="tier-tab" style="background-color: ${colors.backgroundColor}; color: ${colors.textColor};">
            ${colors.tier}
        </div>
    `;

    return badgeHtml;
}

// =================================================================
// VALIDATION & DIAGNOSTICS
// =================================================================

/**
 * Validates tier system configuration.
 * Returns diagnostic information about tier assignments.
 * 
 * @param {Object} allSkills - ARMORY_ITEMS object with all skills
 * @returns {Object} - Validation results with tier distribution
 */
export function validateTierSystem(allSkills) {
    const results = {
        totalSkills: Object.keys(allSkills).length,
        tierDistribution: {},
        unclassified: [],
        errors: []
    };

    // Initialize tier counts
    Object.keys(TIER_DEFINITIONS).forEach(tier => {
        results.tierDistribution[tier] = 0;
    });

    // Classify each skill
    for (const [skillKey, skill] of Object.entries(allSkills)) {
        const tier = assignSkillTier(skill, skillKey);
        results.tierDistribution[tier]++;

        if (tier === 'ERROR') {
            results.unclassified.push(skillKey);
            results.errors.push(`Skill '${skillKey}' could not be assigned to a tier`);
        }
    }

    // Expected distribution (for validation)
    // Note: Total is 34 skills (Reaper Drone added to LEGENDARY_PLUS)
    results.expected = {
        BASIC: 7,
        COSMETIC: 2,
        ENLISTED: 5,
        MASTER: 13,
        LEGENDARY: 5,
        LEGENDARY_PLUS: 1,
        ERROR: 0
    };

    // Check for mismatches
    Object.keys(results.expected).forEach(tier => {
        if (results.tierDistribution[tier] !== results.expected[tier]) {
            results.errors.push(
                `Tier '${tier}': Expected ${results.expected[tier]}, got ${results.tierDistribution[tier]}`
            );
        }
    });

    return results;
}

/**
 * Gets detailed diagnostic information for troubleshooting.
 * 
 * @param {Object} allSkills - ARMORY_ITEMS object with all skills
 * @returns {Object} - Detailed diagnostic data
 */
export function getDiagnostics(allSkills) {
    const diagnostics = {
        tierDefinitions: TIER_DEFINITIONS,
        achievementTypeScores: ACHIEVEMENT_TYPE_SCORES,
        skillClassifications: {},
        scoreDistribution: {}
    };

    // Classify and score all skills
    for (const [skillKey, skill] of Object.entries(allSkills)) {
        const tier = assignSkillTier(skill, skillKey);
        const score = getDifficultyScore(skill, skillKey);

        diagnostics.skillClassifications[skillKey] = {
            tier,
            score,
            tierLabel: TIER_DEFINITIONS[tier]?.label || 'Unknown',
            tierRange: TIER_DEFINITIONS[tier]?.scoreRange
        };

        // Group by tier for score distribution analysis
        if (!diagnostics.scoreDistribution[tier]) {
            diagnostics.scoreDistribution[tier] = [];
        }
        diagnostics.scoreDistribution[tier].push({
            skillKey,
            score,
            unlockCondition: skill.unlockCondition
        });
    }

    return diagnostics;
}

// =================================================================
// EXPORT SUMMARY
// =================================================================

/**
 * Public API for tier system:
 * 
 * Core Functions:
 * - assignSkillTier(skill, skillKey) → 'BASIC' | 'COSMETIC' | 'ENLISTED' | 'MASTER' | 'LEGENDARY' | 'ERROR'
 * - getDifficultyScore(skill, skillKey) → number (for sorting)
 * - getTierColors(skill, skillKey) → { backgroundColor, textColor, tier }
 * - generateTierBadgeHtml(skill, skillKey) → string
 * 
 * Validation Functions:
 * - validateTierSystem(allSkills) → { totalSkills, tierDistribution, unclassified, errors }
 * - getDiagnostics(allSkills) → detailed diagnostic data
 * 
 * Configuration:
 * - TIER_DEFINITIONS - Define all tiers, colors, and ranges
 * - ACHIEVEMENT_TYPE_SCORES - Define achievement difficulty mapping
 */
