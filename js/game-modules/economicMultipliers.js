/**
 * Economic Multiplier System
 * 
 * Applies unlock difficulty-based cost multipliers to skill upgrades.
 * Hard-to-unlock skills have expensive upgrade paths (prestige).
 * Easy-to-unlock skills have cheap upgrade paths (accessibility).
 * 
 * Formula: multiplier = (difficultyScore / 500) + 1.0, clamped to 0.25x-3.0x
 */

import { getDifficultyScore, assignSkillTier } from '../ui-modules/tierScoring.js';
import { ARMORY_ITEMS } from '../unlocks.js';

// ============================================================================
// TIER UPGRADE CONFIGURATIONS
// ============================================================================

/**
 * Base upgrade cost per tier
 * Used as foundation for all upgrade cost calculations
 */
export const TIER_BASE_UPGRADE_COSTS = {
    'BASIC': 50000,        // $50K base (cheap tier)
    'COSMETIC': 0,         // No upgrades (cosmetic only)
    'ENLISTED': 300000,    // $300K base (mid-tier)
    'MASTER': 1000000,     // $1M base (hard tier)
    'LEGENDARY': 1500000   // $1.5M base (premium tier)
};

/**
 * Upgrade progression per tier
 * Defines max levels and cost multipliers for each level
 */
export const TIER_UPGRADE_PROGRESSIONS = {
    'BASIC': {
        maxLevel: 3,
        costMultipliers: [0, 1, 3]              // L1: free, L2: 1x, L3: 3x
    },
    'COSMETIC': {
        maxLevel: 1,
        costMultipliers: [0]                    // L1: free only
    },
    'ENLISTED': {
        maxLevel: 4,
        costMultipliers: [0, 1, 2.5, 5]        // Graduated progression
    },
    'MASTER': {
        maxLevel: 4,
        costMultipliers: [0, 1, 3, 6]          // Steeper costs
    },
    'LEGENDARY': {
        maxLevel: 5,
        costMultipliers: [0, 1, 3, 6, 10]      // Premium pricing
    }
};

// ============================================================================
// MULTIPLIER CALCULATION
// ============================================================================

/**
 * Calculate difficulty-based cost multiplier for a skill
 * 
 * Formula: (difficultyScore / 500) + 1.0
 * Clamped to 0.25x (easiest) to 3.0x (hardest)
 * 
 * @param {string} skillKey - Skill identifier
 * @returns {number} Multiplier (0.25 to 3.0)
 */
export function getUpgradeCostMultiplier(skillKey) {
    const skillData = ARMORY_ITEMS[skillKey];
    if (!skillData) {
        console.warn(`[economicMultipliers] Skill ${skillKey} not found in ARMORY_ITEMS`);
        return 1.0;
    }
    
    // Get difficulty score from tierScoring system
    const difficultyScore = getDifficultyScore(skillData, skillKey);
    
    // Base formula: scale difficulty relative to 500-point range
    let multiplier = (difficultyScore / 500) + 1.0;
    
    // Clamp to reasonable bounds
    multiplier = Math.max(0.25, Math.min(3.0, multiplier));
    
    return multiplier;
}

/**
 * Calculate actual upgrade cost after applying multiplier
 * 
 * @param {string} skillKey - Skill identifier
 * @param {number} level - Target upgrade level (0 = unlock, 1 = L2, etc.)
 * @returns {object} Object with tier, multiplier, and calculation details
 */
export function calculateUpgradeCost(skillKey, level) {
    const skillData = ARMORY_ITEMS[skillKey];
    if (!skillData) {
        return null;
    }
    
    const tier = assignSkillTier(skillData, skillKey);
    if (!tier || tier === 'ERROR') {
        console.warn(`[economicMultipliers] Could not assign tier for ${skillKey}`);
        return null;
    }
    
    // Get difficulty multiplier
    const difficultyMultiplier = getUpgradeCostMultiplier(skillKey);
    
    return { 
        tier, 
        difficultyMultiplier: parseFloat(difficultyMultiplier.toFixed(2)),
        level 
    };
}

/**
 * Validate the economic system
 * Checks for misalignments and logs diagnostics
 * 
 * @param {boolean} verbose - Log detailed diagnostics
 * @returns {object} Validation results
 */
export function validateEconomicSystem(verbose = false) {
    const results = {
        totalSkills: 0,
        skillsByTier: {},
        multipliers: {},
        warnings: [],
        errors: []
    };
    
    for (const [skillKey, skillData] of Object.entries(ARMORY_ITEMS)) {
        const tier = assignSkillTier(skillData, skillKey);
        const multiplier = getUpgradeCostMultiplier(skillKey);
        
        // Track by tier
        if (!results.skillsByTier[tier]) {
            results.skillsByTier[tier] = [];
        }
        results.skillsByTier[tier].push(skillKey);
        
        // Track multipliers
        if (!results.multipliers[tier]) {
            results.multipliers[tier] = [];
        }
        results.multipliers[tier].push(multiplier);
        
        results.totalSkills++;
        
        // Warnings for outliers
        if (multiplier < 0.4) {
            results.warnings.push(`${skillKey} has very low multiplier (${multiplier.toFixed(2)}x)`);
        }
        if (multiplier > 2.8) {
            results.warnings.push(`${skillKey} has very high multiplier (${multiplier.toFixed(2)}x)`);
        }
        
        if (verbose) {
            console.log(`[${tier}] ${skillKey}: ${multiplier.toFixed(2)}x`);
        }
    }
    
    return results;
}

/**
 * Get diagnostic info for a single skill
 * 
 * @param {string} skillKey - Skill identifier
 * @returns {object} Diagnostic data
 */
export function getSkillDiagnostics(skillKey) {
    const skillData = ARMORY_ITEMS[skillKey];
    if (!skillData) return null;
    
    const tier = assignSkillTier(skillData, skillKey);
    const difficultyScore = getDifficultyScore(skillData, skillKey);
    const multiplier = getUpgradeCostMultiplier(skillKey);
    
    return {
        skillKey,
        name: skillData.name,
        tier,
        difficultyScore,
        multiplier: multiplier.toFixed(2),
        unlockCondition: skillData.unlockCondition,
        unlockText: skillData.unlockText
    };
}

// ============================================================================
// DEBUG & TESTING
// ============================================================================

/**
 * Initialize economic multiplier system
 * Called from main.js during app initialization
 */
export function initializeEconomicMultipliers() {
    if (window.ECONOMIC_DEBUG) {
        console.log('[economicMultipliers] System initialized');
        const validation = validateEconomicSystem(true);
        console.log('[economicMultipliers] Validation:', validation);
    }
}

/**
 * Debug helper: Show all skills and their multipliers
 */
export function debugShowAllMultipliers() {
    console.group('[economicMultipliers] All Skill Multipliers');
    
    const tiers = ['BASIC', 'COSMETIC', 'ENLISTED', 'MASTER', 'LEGENDARY', 'LEGENDARY_PLUS'];
    
    for (const tier of tiers) {
        const tieredSkills = [];
        for (const [key, skill] of Object.entries(ARMORY_ITEMS)) {
            const skillTier = assignSkillTier(skill, key);
            if (skillTier === tier) {
                const mult = getUpgradeCostMultiplier(key);
                tieredSkills.push({
                    key,
                    name: skill.name,
                    multiplier: mult.toFixed(2)
                });
            }
        }
        
        console.group(`${tier} Tier (${tieredSkills.length} skills)`);
        tieredSkills.sort((a, b) => parseFloat(b.multiplier) - parseFloat(a.multiplier));
        tieredSkills.forEach(s => {
            console.log(`${s.name}: ${s.multiplier}x`);
        });
        console.groupEnd();
    }
    
    console.groupEnd();
}
