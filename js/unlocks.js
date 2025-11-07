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