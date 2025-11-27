import { chartContainer, tableContainer, tableBody, skillBonusContainer, skillBonusSummary, skillBonusTableBody } from '../dom-elements.js';
import { drawChart, generateSummaryTable } from '../utils.js';
import { gameState } from '../game-modules/state-manager.js';

// Phase 2C: Tier display configuration
const TIER_DISPLAY_CONFIG = {
    LEGENDARY: { emoji: '🔥', color: '#ef4444', multiplier: '2.5x', bgClass: 'bg-orange-50' },
    MASTER: { emoji: '⭐', color: '#f59e0b', multiplier: '1.5x', bgClass: 'bg-yellow-50' },
    ENLISTED: { emoji: '💜', color: '#8b5cf6', multiplier: '1.1x', bgClass: 'bg-purple-50' },
    COSMETIC: { emoji: '💚', color: '#10b981', multiplier: '1.0x', bgClass: 'bg-green-50' },
    BASIC: { emoji: '⚪', color: '#6b7280', multiplier: '0.5x', bgClass: 'bg-gray-50' }
};

export function showResultsScreen(financialMilestones, raceSegments) {
    if (!financialMilestones || Object.keys(financialMilestones).length === 0 || !raceSegments || raceSegments.length === 0) {
        console.error("-> showResultsScreen: Called with invalid or empty data. Aborting render.");
        return;
    }
    chartContainer.style.display = 'block';
    tableContainer.style.display = 'block';
    drawChart(financialMilestones, document.getElementById('milestoneChart').getContext('2d'));
    generateSummaryTable(raceSegments, tableBody);
    
    // Phase 2C: Show skill bonus breakdown if there's data
    showSkillBonusSummary();
}

export function hideResultsScreen() {
    chartContainer.style.display = 'none';
    tableContainer.style.display = 'none';
    skillBonusContainer.style.display = 'none';
}

/**
 * Phase 2C: Display skill usage stats with tier breakdown
 */
function showSkillBonusSummary() {
    const stats = gameState.skillUsageStats;
    
    // Check if there's any skill usage data to show
    const totalUses = Object.values(stats.usageCount).reduce((a, b) => a + b, 0);
    if (totalUses === 0) {
        skillBonusContainer.style.display = 'none';
        return;
    }
    
    skillBonusContainer.style.display = 'block';
    
    // Calculate bonus earned (difference between multiplied and base cash)
    const bonusEarned = stats.totalMultipliedCash - stats.totalBaseCash;
    const bonusPercent = stats.totalBaseCash > 0 
        ? Math.round((bonusEarned / stats.totalBaseCash) * 100) 
        : 0;
    
    // Populate summary header
    skillBonusSummary.innerHTML = `
        <div class="flex flex-wrap justify-center gap-4 text-sm">
            <div class="bg-green-100 px-4 py-2 rounded-lg">
                <span class="font-medium">Total Skill Cash:</span> 
                <span class="text-green-700 font-bold">$${stats.totalMultipliedCash.toLocaleString()}</span>
            </div>
            <div class="bg-blue-100 px-4 py-2 rounded-lg">
                <span class="font-medium">Bonus Earned:</span> 
                <span class="text-blue-700 font-bold">+$${bonusEarned.toLocaleString()} (${bonusPercent > 0 ? '+' : ''}${bonusPercent}%)</span>
            </div>
        </div>
    `;
    
    // Populate tier breakdown table
    skillBonusTableBody.innerHTML = '';
    
    // Display tiers in order from highest to lowest
    const tierOrder = ['LEGENDARY', 'MASTER', 'ENLISTED', 'COSMETIC', 'BASIC'];
    
    for (const tier of tierOrder) {
        const uses = stats.usageCount[tier] || 0;
        const cash = stats.cashByTier[tier] || 0;
        
        // Skip tiers with no usage
        if (uses === 0) continue;
        
        const config = TIER_DISPLAY_CONFIG[tier];
        const row = document.createElement('tr');
        row.className = config.bgClass;
        
        row.innerHTML = `
            <td class="px-4 py-3 text-left">
                <span class="text-lg mr-2">${config.emoji}</span>
                <span class="font-medium" style="color: ${config.color}">${tier}</span>
            </td>
            <td class="px-4 py-3 text-center">
                <span class="font-mono font-bold" style="color: ${config.color}">${config.multiplier}</span>
            </td>
            <td class="px-4 py-3 text-center font-medium">
                ${uses}
            </td>
            <td class="px-4 py-3 text-right font-bold" style="color: ${config.color}">
                $${cash.toLocaleString()}
            </td>
        `;
        
        skillBonusTableBody.appendChild(row);
    }
}
