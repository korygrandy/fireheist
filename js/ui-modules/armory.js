import { armoryItemsContainer, skillUpgradeModal, skillModalTitle, skillModalContent, closeSkillModalBtn, totalCashDisplay } from '../dom-elements.js';
import { getSkillUnlockProgress, checkSkillUnlockStatus, ARMORY_ITEMS } from '../unlocks.js';
import { allSkills } from '../game-modules/skills/all-skills.js';
import { fireAxeSkill } from '../game-modules/skills/fireAxe.js';
import { tarzanSkill } from '../game-modules/skills/tarzan.js';
import { savePlayerStats } from './settings.js';
import { gameState, setActiveArmorySkill, setPlayerSkillLevel, setTotalAccumulatedCash, setScreenFlash } from '../game-modules/state-manager.js';
import { SKILL_UPGRADE_PATHS } from '../game-modules/skill-upgrades.js';
import { playAnimationSound } from '../audio.js';

// =================================================================
// ARMORY UI MANAGEMENT
// =================================================================

/**
 * Updates the total cash display in the Armory tab.
 */
export function updateArmoryCashDisplay() {
    if (totalCashDisplay) {
        const cash = gameState.playerStats?.totalAccumulatedCash || 0;
        totalCashDisplay.textContent = `$${cash.toLocaleString()}`;
    }
}

/**
 * Handles the selection of an armory skill.
 * @param {string} skillKey - The key of the skill to select.
 */
export function handleArmorySkillSelection(skillKey) {
    setActiveArmorySkill(skillKey);
    savePlayerStats();
    populateArmoryItems(); // Re-render to show active skill
    playAnimationSound('select-sound'); // Play select sound on selection
    console.log(`-> Armory: Skill '${ARMORY_ITEMS[skillKey].name}' selected.`);
}

/**
 * Handles the deselection of the active armory skill.
 */
export function handleArmorySkillDeselection() {
    setActiveArmorySkill(null);
    savePlayerStats();
    populateArmoryItems(); // Re-render to show no active skill
    playAnimationSound('unselect-sound'); // Play unselect sound
    console.log(`-> Armory: Active skill unselected.`);
}

/**
 * Populates the armory items container with skill cards.
 * This function is responsible for rendering each skill, its unlock status,
 * current level, and available actions (select, unselect, upgrade).
 */
export function populateArmoryItems() {
    if (!gameState.playerStats) {
        console.error("populateArmoryItems called before playerStats was initialized. Aborting.");
        return;
    }
    armoryItemsContainer.innerHTML = ''; // Clear existing items

    if (totalCashDisplay) {
        const cash = gameState.playerStats?.totalAccumulatedCash || 0;
        totalCashDisplay.textContent = `$${cash.toLocaleString()}`;
    }

    for (const skillKey in ARMORY_ITEMS) {
        const skill = ARMORY_ITEMS[skillKey];
        const isUnlocked = checkSkillUnlockStatus(skill.unlockCondition, gameState.playerStats);
        const currentLevel = gameState.playerStats.skillLevels[skillKey] || 1; // Default to level 1 if not set
        const upgradePath = SKILL_UPGRADE_PATHS[skillKey];

        const skillCard = document.createElement('div');
        const tierClass = skill.tier ? `tier-${skill.tier.toLowerCase()}` : 'tier-Grunt';
        skillCard.className = `armory-item p-4 rounded-lg shadow-md text-center ${isUnlocked ? 'bg-white unlocked' : 'bg-gray-200 opacity-50 cursor-not-allowed'} ${tierClass}`;

        let tierLabel = '';
        if (skill.tier) {
            tierLabel = `<p class="text-xs font-bold tier-label tier-label-${skill.tier.toLowerCase()}">${skill.tier} Tier</p>`;
        }

        let lockedMessage = '';
        if (!isUnlocked) {
            const progress = getSkillUnlockProgress(skill.unlockCondition, gameState.playerStats);
            if (progress.target > 0) {
                lockedMessage = `<p class="text-xs text-red-500 mt-2">Locked: ${skill.unlockText || skill.description} (${progress.current}/${progress.target})</p>`;
            } else {
                lockedMessage = `<p class="text-xs text-red-500 mt-2">Locked: ${skill.unlockText || skill.description}</p>`;
            }
        }

        let upgradeButton = '';
        if (isUnlocked && upgradePath) {
            const nextLevel = currentLevel + 1;
            if (nextLevel <= upgradePath.maxLevel) {
                const cost = upgradePath.levels[nextLevel - 1].cost;
                upgradeButton = `<button class="control-btn primary-btn text-sm py-1 px-2 mt-2" data-action="open-upgrade-modal" data-skill-key="${skillKey}">Upgrade ($${cost.toLocaleString()})</button>`;
            } else {
                upgradeButton = `<p class="text-xs text-green-600 mt-2">MAX LEVEL</p>`;
            }
        }

        let iconHTML;
        if (skill.imageLocked && skill.imageUnlocked) {
            const imageSrc = isUnlocked ? skill.imageUnlocked : skill.imageLocked;
            iconHTML = `<img src="${imageSrc}" alt="${skill.name}" class="w-12 h-12 mx-auto armory-item-icon ${isUnlocked ? 'unlocked' : ''}">`;
        } else {
            iconHTML = `<span class="text-4xl armory-item-icon ${isUnlocked ? 'unlocked' : ''}">${skill.emoji || '❓'}</span>`;
        }

        skillCard.innerHTML = `
            ${tierLabel}
            ${iconHTML}
            <h4 class="font-semibold text-gray-800 mt-2">${skill.name} (Level ${currentLevel})</h4>
            <p class="text-sm text-gray-600">${skill.description}</p>
            ${lockedMessage}
            <div class="mt-3">
                ${isUnlocked && gameState.playerStats.activeArmorySkill !== skillKey ? 
                    `<button class="control-btn primary-btn text-sm py-1 px-2" data-action="select" data-skill-key="${skillKey}">Select</button>` : ''}
                ${isUnlocked && gameState.playerStats.activeArmorySkill === skillKey ? 
                    `<button class="control-btn secondary-btn text-sm py-1 px-2" data-action="unselect">Unselect</button>` : ''}
                ${upgradeButton}
            </div>
        `;
        armoryItemsContainer.appendChild(skillCard);
    }

    // Add event listeners for dynamically created buttons
    armoryItemsContainer.querySelectorAll('button[data-action="select"]').forEach(button => {
        button.addEventListener('click', (event) => {
            handleArmorySkillSelection(event.target.dataset.skillKey);
        });
    });
    armoryItemsContainer.querySelectorAll('button[data-action="unselect"]').forEach(button => {
        button.addEventListener('click', handleArmorySkillDeselection);
    });
    armoryItemsContainer.querySelectorAll('button[data-action="open-upgrade-modal"]').forEach(button => {
        button.addEventListener('click', (event) => {
            playAnimationSound('upgrade-skill');
            openSkillUpgradeModal(event.target.dataset.skillKey);
        });
    });
}

let notificationQueue = [];
let isNotificationVisible = false;

/**
 * Displays a notification when a new armory skill is unlocked.
 * @param {string} skillKey - The key of the unlocked skill.
 */
export function displayArmoryUnlockNotification(skillKey) {
    notificationQueue.push(skillKey);
    if (!isNotificationVisible) {
        processNotificationQueue();
    }
}

/**
 * Processes the notification queue and displays the next notification.
 */
function processNotificationQueue() {
    if (notificationQueue.length === 0) {
        isNotificationVisible = false;
        return;
    }

    isNotificationVisible = true;
    const skillKey = notificationQueue.shift();
    const notificationElement = document.getElementById('unlock-notification');

    if (notificationElement) {
        const skill = ARMORY_ITEMS[skillKey];
        let iconHTML = '';
        if (skill.imageUnlocked) {
            iconHTML = `<img src="${skill.imageUnlocked}" alt="${skill.name}" class="inline-block w-6 h-6 mr-2 align-middle notification-skill-icon">`;
        } else {
            const skillEmoji = skill.emoji || allSkills[skillKey]?.config?.emoji || '🛡️'; // Fallback to generic shield
            iconHTML = `<span class="inline-block mr-2 align-middle text-xl notification-skill-icon">${skillEmoji}</span>`;
        }
        notificationElement.innerHTML = `${iconHTML} New Armory Skill Unlocked: ${skill.name}!`;
        notificationElement.classList.remove('hidden');
        playAnimationSound('skill-achieved');

        setTimeout(() => {
            notificationElement.classList.add('hidden');
            // Wait a moment before showing the next notification
            setTimeout(processNotificationQueue, 500);
        }, 5000); // Hide after 5 seconds
    }
}

/**
 * Checks for newly unlocked armory skills and displays notifications.
 * @param {object} stats - The player's current stats.
 */
export function checkForArmoryUnlocks(stats) {
    if (!stats.notifiedArmoryUnlocks) {
        stats.notifiedArmoryUnlocks = [];
    }
    if (!stats.unlockedArmoryItems) {
        stats.unlockedArmoryItems = [];
    }
    if (!stats.skillLevels) {
        stats.skillLevels = {}; // Initialize skill levels if not present
    }

    for (const key in ARMORY_ITEMS) {
        const skill = ARMORY_ITEMS[key];
        if (checkSkillUnlockStatus(skill.unlockCondition, stats) && !stats.notifiedArmoryUnlocks.includes(key)) {
            displayArmoryUnlockNotification(key);
            setScreenFlash(0.8, 200, performance.now(), 'gold'); // Gold flash for new skill
            stats.notifiedArmoryUnlocks.push(key);
            stats.unlockedArmoryItems.push(key); // Add to unlocked items
            stats.skillLevels[key] = 1; // Initialize skill to level 1 upon unlock
            populateArmoryItems(); // Refresh the armory to show the unlocked item
            savePlayerStats();
            console.info(`-> ARMORY UNLOCK: '${skill.name}' unlocked! Condition met: ${skill.unlockText || skill.description}`);
        }
    }
}

// =================================================================
// SKILL UPGRADE MODAL MANAGEMENT
// =================================================================

let currentSkillKeyForModal = null; // To keep track of which skill is being upgraded

/**
 * Opens the skill upgrade modal and populates it with data for the given skill.
 * @param {string} skillKey - The key of the skill to display in the modal.
 */
export function openSkillUpgradeModal(skillKey) {
    currentSkillKeyForModal = skillKey;
    const skill = ARMORY_ITEMS[skillKey];
    const upgradePath = SKILL_UPGRADE_PATHS[skillKey];
    const currentLevel = gameState.playerStats.skillLevels[skillKey] || 1;

    if (!skill || !upgradePath) {
        console.error(`-> Skill Upgrade: No data found for skill key: ${skillKey}`);
        return;
    }

    skillModalTitle.textContent = `Upgrade ${skill.name}`;

    let contentHTML = `
        <p class="text-lg font-medium">Current Level: ${currentLevel}</p>
        <p class="text-md text-gray-700">${upgradePath.levels[currentLevel - 1].description}</p>
    `;

    const nextLevel = currentLevel + 1;
    if (nextLevel <= upgradePath.maxLevel) {
        const nextLevelData = upgradePath.levels[nextLevel - 1];
        const canAfford = gameState.playerStats.totalAccumulatedCash >= nextLevelData.cost;
        contentHTML += `
            <div class="border-t border-gray-200 pt-4 mt-4">
                <p class="text-lg font-medium">Next Level: ${nextLevel}</p>
                <p class="text-md text-gray-700">${nextLevelData.description}</p>
                <p class="text-lg font-bold mt-2 ${canAfford ? 'text-green-600' : 'text-red-600'}">Cost: $${nextLevelData.cost.toLocaleString()}</p>
                <button id="upgradeSkillBtn" class="control-btn primary-btn w-full mt-4 ${canAfford ? '' : 'opacity-50 cursor-not-allowed'}" ${canAfford ? '' : 'disabled'}>Upgrade</button>
            </div>
        `;
    } else {
        contentHTML += `
            <div class="border-t border-gray-200 pt-4 mt-4">
                <p class="text-lg font-medium text-green-600">MAX LEVEL REACHED!</p>
                <p class="text-md text-gray-700">All upgrades for ${skill.name} have been purchased.</p>
            </div>
        `;
    }

    skillModalContent.innerHTML = contentHTML;
    skillUpgradeModal.classList.remove('hidden');

    // Add event listener for the upgrade button if it exists
    const upgradeSkillBtn = document.getElementById('upgradeSkillBtn');
    if (upgradeSkillBtn) {
        upgradeSkillBtn.addEventListener('click', handleUpgradeSkill);
    }
}

/**
 * Closes the skill upgrade modal.
 */
export function closeSkillUpgradeModal() {
    playAnimationSound('beep');
    skillUpgradeModal.classList.add('hidden');
    currentSkillKeyForModal = null;
    populateArmoryItems(); // Refresh armory to show updated levels/buttons
}

/**
 * Handles the logic for upgrading a skill.
 * This function is called when the "Upgrade" button in the modal is clicked.
 */
function handleUpgradeSkill() {
    if (!currentSkillKeyForModal) return;

    const skillKey = currentSkillKeyForModal;
    const upgradePath = SKILL_UPGRADE_PATHS[skillKey];
    const currentLevel = gameState.playerStats.skillLevels[skillKey] || 1;
    const nextLevel = currentLevel + 1;

    if (nextLevel > upgradePath.maxLevel) {
        alert("Skill is already at max level!");
        return;
    }

    const nextLevelData = upgradePath.levels[nextLevel - 1];
    if (gameState.playerStats.totalAccumulatedCash < nextLevelData.cost) {
        alert("Not enough cash to upgrade this skill!");
        return;
    }

    // Deduct cost and update skill level
    setTotalAccumulatedCash(gameState.playerStats.totalAccumulatedCash - nextLevelData.cost);
    setPlayerSkillLevel(skillKey, nextLevel);
    savePlayerStats();

    // Play the appropriate sound effect
    if (nextLevel === upgradePath.maxLevel) {
        playAnimationSound('final-skill-unlock');
    } else {
        playAnimationSound('skill-unlock');
    }
    
    setScreenFlash(0.8, 200, performance.now(), 'orange'); // Orange flash for upgrade

    console.log(`-> Skill Upgrade: '${ARMORY_ITEMS[skillKey].name}' upgraded to Level ${nextLevel}. Remaining cash: $${gameState.playerStats.totalAccumulatedCash.toLocaleString()}`);

    // Refresh the modal content and armory display
    openSkillUpgradeModal(skillKey); // Re-open to show new level and next upgrade option
    // populateArmoryItems() is called by closeSkillUpgradeModal, which is called after this.
}

// Event listener for closing the modal
closeSkillModalBtn.addEventListener('click', closeSkillUpgradeModal);