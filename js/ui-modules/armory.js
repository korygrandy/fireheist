import { armoryItemsContainer } from '../dom-elements.js';
import { getSkillUnlockProgress, checkSkillUnlockStatus } from './unlocks.js';
import { savePlayerStats } from './settings.js';
import state from '../game-modules/state.js';

// Define unlockable skills for the Armory
export const armorySkills = {
    firestorm: {
        name: 'Firestorm',
        description: 'Unleash a continuous barrage of fire, incinerating all obstacles.',
        emoji: '🌪️',
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
        unlockCondition: {
            type: 'consecutiveGroundPounds',
            count: 3,
            skillKey: 'fireSpinner'
        },
        unlockText: 'Destroy 3 obstacles in a row with Ground Pound'
    },
    fireDash: {
        name: 'Fire Dash',
        description: 'A quick burst of speed, leaving a trail of fire.',
        emoji: '💨',
        unlockCondition: {
            type: 'placeholder',
            skillKey: 'fireDash'
        },
        unlockText: 'Coming soon!'
    },
    fieryGroundPound: {
        name: 'Fiery Ground Pound',
        description: 'A powerful ground pound that creates a fiery explosion, incinerating all on-screen obstacles.',
        emoji: '💥',
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
        unlockCondition: {
            type: 'fieryGroundPoundCount',
            count: 50,
            skillKey: 'fireStomper'
        },
        unlockText: 'Destroy 50 obstacles with Fiery Ground Pound'
    }
    // Add more skills here as needed
};





export function handleArmorySkillSelection(skillKey) {
    state.playerStats.activeArmorySkill = skillKey;
    savePlayerStats();
    populateArmoryItems(); // Refresh UI
    console.log(`-> Armory: Skill '${skillKey}' selected.`);
}

export function handleArmorySkillDeselection() {
    state.playerStats.activeArmorySkill = null;
    savePlayerStats();
    populateArmoryItems(); // Refresh UI
    console.log("-> Armory: Active skill deselected.");
}

export function populateArmoryItems() {
    armoryItemsContainer.innerHTML = ''; // Clear existing items

    for (const skillKey in armorySkills) {
        const skill = armorySkills[skillKey];
        const isUnlocked = checkSkillUnlockStatus(skill.unlockCondition, state.playerStats);

        const skillCard = document.createElement('div');
        skillCard.className = `armory-item p-4 rounded-lg shadow-md text-center ${isUnlocked ? 'bg-white unlocked' : 'bg-gray-200 opacity-50 cursor-not-allowed'}`;
        let lockedMessage = '';
        if (!isUnlocked) {
            const progress = getSkillUnlockProgress(skill.unlockCondition, state.playerStats);
            if (progress.target > 0) {
                lockedMessage = `<p class="text-xs text-red-500 mt-2">Locked: ${skill.unlockText} (${progress.current}/${progress.target})</p>`;
            } else {
                lockedMessage = `<p class="text-xs text-red-500 mt-2">Locked: ${skill.unlockText}</p>`;
            }
        }

        skillCard.innerHTML = `
            <span class="text-4xl armory-item-icon ${isUnlocked ? 'unlocked' : ''}">${skill.emoji}</span>
            <h4 class="font-semibold text-gray-800 mt-2">${skill.name}</h4>
            <p class="text-sm text-gray-600">${skill.description}</p>
            ${lockedMessage}
            <div class="mt-3">
                ${isUnlocked && state.playerStats.activeArmorySkill !== skillKey ? 
                    `<button class="control-btn primary-btn text-sm py-1 px-2" data-action="select" data-skill-key="${skillKey}">Select</button>` : ''}
                ${isUnlocked && state.playerStats.activeArmorySkill === skillKey ? 
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

    for (const key in armorySkills) {
        const skill = armorySkills[key];
        if (checkSkillUnlockStatus(skill.unlockCondition, stats) && !stats.notifiedArmoryUnlocks.includes(key)) {
            displayArmoryUnlockNotification(skill.name);
            stats.notifiedArmoryUnlocks.push(key);
            stats.unlockedArmoryItems.push(key); // Add to unlocked items
            populateArmoryItems(); // Refresh the armory to show the unlocked item
            savePlayerStats();
            console.info(`-> ARMORY UNLOCK: '${skill.name}' unlocked! Condition met: ${skill.unlockText}`);
        }
    }
}
