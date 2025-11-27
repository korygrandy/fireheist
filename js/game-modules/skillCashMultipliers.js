/**
 * Skill-Based Cash Multiplier System (Phase 2C)
 * 
 * Applies tier-based cash multipliers to reward players for using difficult skills.
 * Harder skills earn more cash per milestone crossed.
 * 
 * Multiplier Tiers:
 * - BASIC (0.5x): Fire Axe, Hover, etc. - Entry-level cash generation
 * - ENLISTED (1.0x-1.2x): Mid-tier skills - Balanced progression
 * - MASTER (1.5x-1.8x): Advanced skills - Premium rewards
 * - LEGENDARY (2.5x): Elite skills - Elite earnings
 * 
 * @module skillCashMultipliers
 */

import { ARMORY_ITEMS } from '../unlocks.js';
import { getDifficultyScore, assignSkillTier } from '../ui-modules/tierScoring.js';

/**
 * Tier-based multiplier ranges for cash generation
 * Maps tier names to cash earning multipliers
 */
export const TIER_CASH_MULTIPLIERS = {
    'BASIC': 0.5,        // Basic skills earn 50% of base cash
    'COSMETIC': 1.0,     // Cosmetic skills earn normal cash (no benefit)
    'ENLISTED': 1.1,     // Enlisted skills earn 110% of base
    'MASTER': 1.5,       // Master skills earn 150% of base
    'LEGENDARY': 2.5,    // Legendary skills earn 250% of base
    'ERROR': 1.0         // Fallback to normal if tier unknown
};

/**
 * Get the cash multiplier for the currently active skill
 * 
 * @param {Object} gameState - The current game state
 * @returns {number} Multiplier (0.5 to 2.5)
 */
export function getActiveSkillMultiplier(gameState) {
    const activeSkill = gameState.playerStats?.activeArmorySkill;
    if (!activeSkill) {
        return 1.0; // No skill selected = no multiplier
    }

    const skillKey = activeSkill;
    const skillData = ARMORY_ITEMS[skillKey];
    
    if (!skillData) {
        console.warn(`[skillCashMultipliers] Skill ${skillKey} not found in ARMORY_ITEMS`);
        return 1.0;
    }

    const tier = assignSkillTier(skillData, skillKey);
    const multiplier = TIER_CASH_MULTIPLIERS[tier] || 1.0;
    
    return multiplier;
}

/**
 * Apply cash multiplier to a reward amount
 * Also tracks usage stats for the results screen (Phase 2C)
 * 
 * @param {number} baseReward - The base cash reward amount
 * @param {Object} gameState - The current game state
 * @param {boolean} trackStats - Whether to track stats (default: true)
 * @returns {Object} Object containing {baseReward, multiplier, finalReward, tier}
 */
export function applyCashMultiplier(baseReward, gameState, trackStats = true) {
    const multiplier = getActiveSkillMultiplier(gameState);
    const tier = getActiveSkillTier(gameState);
    const finalReward = Math.floor(baseReward * multiplier);
    
    // Phase 2C: Track skill usage stats
    if (trackStats && gameState.skillUsageStats) {
        const stats = gameState.skillUsageStats;
        stats.cashByTier[tier] = (stats.cashByTier[tier] || 0) + finalReward;
        stats.usageCount[tier] = (stats.usageCount[tier] || 0) + 1;
        stats.totalMultipliedCash += finalReward;
        stats.totalBaseCash += baseReward;
    }
    
    return {
        baseReward,
        multiplier,
        finalReward,
        multiplierBonus: finalReward - baseReward,
        tier
    };
}

/**
 * Get the tier of the currently active skill
 * Used for visual feedback (color, particle effects)
 * 
 * @param {Object} gameState - The current game state
 * @returns {string} Tier name (BASIC, ENLISTED, MASTER, LEGENDARY, etc.)
 */
export function getActiveSkillTier(gameState) {
    const activeSkill = gameState.playerStats?.activeArmorySkill;
    if (!activeSkill) {
        return 'BASIC'; // Default to basic if no skill
    }

    const skillKey = activeSkill;
    const skillData = ARMORY_ITEMS[skillKey];
    
    if (!skillData) {
        return 'ERROR';
    }

    return assignSkillTier(skillData, skillKey);
}

/**
 * Get color for the current multiplier tier (for visual feedback)
 * 
 * @param {Object} gameState - The current game state
 * @returns {Object} Color config {backgroundColor, textColor}
 */
export function getMultiplierTierColors(gameState) {
    const tier = getActiveSkillTier(gameState);
    
    const tierColors = {
        'BASIC': { bg: '#9ca3af', text: '#ffffff' },        // Grey
        'COSMETIC': { bg: '#10b981', text: '#ffffff' },     // Green
        'ENLISTED': { bg: '#8b5cf6', text: '#ffffff' },    // Purple
        'MASTER': { bg: '#fbbf24', text: '#000000' },      // Gold
        'LEGENDARY': { bg: '#f59e0b', text: '#ffffff' }    // Orange
    };
    
    const colors = tierColors[tier] || { bg: '#6b7280', text: '#ffffff' };
    
    return {
        backgroundColor: colors.bg,
        textColor: colors.text,
        tier
    };
}

/**
 * Format multiplier for display
 * 
 * @param {number} multiplier - The multiplier value
 * @returns {string} Formatted string like "1.5x" or "2.5x"
 */
export function formatMultiplier(multiplier) {
    return `${multiplier.toFixed(1)}x`;
}

/**
 * Get display text for the current skill's multiplier effect
 * 
 * @param {Object} gameState - The current game state
 * @returns {string} Display text like "Master Skill: 1.5x Cash"
 */
export function getMultiplierDisplayText(gameState) {
    const activeSkill = gameState.playerStats?.activeArmorySkill;
    if (!activeSkill) {
        return 'No Skill: 1.0x Cash';
    }

    const skillKey = activeSkill;
    const skillData = ARMORY_ITEMS[skillKey];
    
    if (!skillData) {
        return 'Unknown: 1.0x Cash';
    }

    const tier = assignSkillTier(skillData, skillKey);
    const multiplier = TIER_CASH_MULTIPLIERS[tier] || 1.0;
    
    return `${skillData.name} (${tier}): ${formatMultiplier(multiplier)} Cash`;
}

/**
 * Validate the multiplier system
 * 
 * @returns {Object} Validation results
 */
export function validateMultiplierSystem() {
    const results = {
        tiersConfigured: Object.keys(TIER_CASH_MULTIPLIERS).length,
        multipliers: { ...TIER_CASH_MULTIPLIERS },
        totalSkills: Object.keys(ARMORY_ITEMS).length,
        skillsByTier: {},
        warnings: []
    };

    // Count skills by tier
    for (const [skillKey, skillData] of Object.entries(ARMORY_ITEMS)) {
        const tier = assignSkillTier(skillData, skillKey);
        if (!results.skillsByTier[tier]) {
            results.skillsByTier[tier] = [];
        }
        results.skillsByTier[tier].push(skillKey);
    }

    // Check for anomalies
    if (TIER_CASH_MULTIPLIERS.BASIC >= TIER_CASH_MULTIPLIERS.LEGENDARY) {
        results.warnings.push('BASIC multiplier should be less than LEGENDARY');
    }

    return results;
}

/**
 * Debug helper: Log all skill multipliers
 */
export function debugLogAllMultipliers() {
    console.group('[skillCashMultipliers] All Skill Multipliers');
    
    for (const [skillKey, skillData] of Object.entries(ARMORY_ITEMS)) {
        const tier = assignSkillTier(skillData, skillKey);
        const multiplier = TIER_CASH_MULTIPLIERS[tier] || 1.0;
        console.log(`${skillData.name} (${tier}): ${formatMultiplier(multiplier)}`);
    }
    
    console.groupEnd();
}
