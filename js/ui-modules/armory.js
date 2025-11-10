import { armoryItemsContainer } from '../dom-elements.js';
import { getSkillUnlockProgress, checkSkillUnlockStatus, ARMORY_ITEMS } from '../unlocks.js';
import { savePlayerStats } from './settings.js';
import { gameState, setActiveArmorySkill } from '../game-modules/state-manager.js';

export function handleArmorySkillSelection(skillKey) {
    setActiveArmorySkill(skillKey);
    savePlayerStats();
    populateArmoryItems(); // Refresh UI
    console.log(`-> Armory: Skill '${skillKey}' selected.`);
}

export function handleArmorySkillDeselection() {
    setActiveArmorySkill(null);
    savePlayerStats();
    populateArmoryItems(); // Refresh UI
    console.log("-> Armory: Active skill deselected.");
}

export function populateArmoryItems() {
    armoryItemsContainer.innerHTML = ''; // Clear existing items

    for (const skillKey in ARMORY_ITEMS) {
        const skill = ARMORY_ITEMS[skillKey];
        const isUnlocked = checkSkillUnlockStatus(skill.unlockCondition, gameState.playerStats);

        const skillCard = document.createElement('div');
        skillCard.className = `armory-item p-4 rounded-lg shadow-md text-center ${isUnlocked ? 'bg-white unlocked' : 'bg-gray-200 opacity-50 cursor-not-allowed'}`;
        let lockedMessage = '';
        if (!isUnlocked) {
            const progress = getSkillUnlockProgress(skill.unlockCondition, gameState.playerStats);
            if (progress.target > 0) {
                lockedMessage = `<p class="text-xs text-red-500 mt-2">Locked: ${skill.unlockText || skill.description}</p>`;
            } else {
                lockedMessage = `<p class="text-xs text-red-500 mt-2">Locked: ${skill.unlockText || skill.description}</p>`;
            }
        }

        skillCard.innerHTML = `
            <span class="text-4xl armory-item-icon ${isUnlocked ? 'unlocked' : ''}">${skill.emoji || '❓'}</span>
            <h4 class="font-semibold text-gray-800 mt-2">${skill.name}</h4>
            <p class="text-sm text-gray-600">${skill.description}</p>
            ${lockedMessage}
            <div class="mt-3">
                ${isUnlocked && gameState.playerStats.activeArmorySkill !== skillKey ? 
                    `<button class="control-btn primary-btn text-sm py-1 px-2" data-action="select" data-skill-key="${skillKey}">Select</button>` : ''}
                ${isUnlocked && gameState.playerStats.activeArmorySkill === skillKey ? 
                    `<button class="control-btn secondary-btn text-sm py-1 px-2" data-action="unselect">Unselect</button>` : ''}
            </div>
        `;
        armoryItemsContainer.appendChild(skillCard);
    }
}

export function displayArmoryUnlockNotification(skillName) {
    const notificationElement = document.getElementById('unlock-notification');
    if (notificationElement) {
        notificationElement.textContent = `🛡️ New Armory Skill Unlocked: ${skillName}!`;
        notificationElement.classList.remove('hidden');
        setTimeout(() => {
            notificationElement.classList.add('hidden');
        }, 5000); // Hide after 5 seconds
    }
}

export function checkForArmoryUnlocks(stats) {
    if (!stats.notifiedArmoryUnlocks) {
        stats.notifiedArmoryUnlocks = [];
    }

    for (const key in ARMORY_ITEMS) {
        const skill = ARMORY_ITEMS[key];
        if (checkSkillUnlockStatus(skill.unlockCondition, stats) && !stats.notifiedArmoryUnlocks.includes(key)) {
            displayArmoryUnlockNotification(skill.name);
            stats.notifiedArmoryUnlocks.push(key);
            stats.unlockedArmoryItems.push(key); // Add to unlocked items
            populateArmoryItems(); // Refresh the armory to show the unlocked item
            savePlayerStats();
            console.info(`-> ARMORY UNLOCK: '${skill.name}' unlocked! Condition met: ${skill.unlockText || skill.description}`);
        }
    }
}
