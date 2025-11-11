
import { checkCollision } from '../js/game-modules/collision.js';
import { gameState, setCurrentObstacle } from '../js/game-modules/state-manager.js';
import { startHurdle, startGroundPound, startFirestorm, startMoonwalk } from '../js/game-modules/actions.js';
import { STICK_FIGURE_FIXED_X, GROUND_Y, STICK_FIGURE_TOTAL_HEIGHT, OBSTACLE_HEIGHT, OBSTACLE_EMOJI_Y_OFFSET } from '../js/constants.js';

describe('Regression Test Suite', () => {
    beforeEach(() => {
        // Reset game state before each test
        gameState.jumpState.isJumping = false;
        gameState.isFirestormActive = false;
        gameState.isInvincible = false;
        gameState.currentObstacle = null;
        gameState.playerStats.skillLevels = {};
    });

    // Phase 1: Core Gameplay Integrity
    describe('Phase 1: Core Gameplay Integrity', () => {
        test('Test Case 1.1: Standard Collision', () => {
            // Setup: Place an obstacle right in front of the player
            setCurrentObstacle({ x: STICK_FIGURE_FIXED_X, y: GROUND_Y, emoji: '🔥' });
            const runnerY = GROUND_Y - STICK_FIGURE_TOTAL_HEIGHT;
            const angleRad = 0;

            // Action: Check for collision without any skills active
            const result = checkCollision(runnerY, angleRad);

            // Assertion: A collision should be detected
            expect(result).toBe(true);
        });

        test('Test Case 1.2: Unmodified Skills - Hurdle', () => {
            // Setup: Place an obstacle and initiate a hurdle
            setCurrentObstacle({ x: STICK_FIGURE_FIXED_X, y: GROUND_Y, emoji: '🔥' });
            startHurdle(gameState);
            const runnerY = GROUND_Y - STICK_FIGURE_TOTAL_HEIGHT - 100; // Simulate being in the air
            const angleRad = 0;

            // Action: Check for collision during a hurdle
            const result = checkCollision(runnerY, angleRad);

            // Assertion: No collision should be detected as the player is jumping
            expect(result).toBe(false);
        });

        test('Test Case 1.2: Unmodified Skills - Ground Pound', () => {
            // Setup: Place an obstacle and initiate a ground pound
            setCurrentObstacle({ x: STICK_FIGURE_FIXED_X, y: GROUND_Y, emoji: '🔥' });
            startGroundPound(gameState);
            gameState.jumpState.progress = 0.6; // Simulate being on the way down
            const runnerY = GROUND_Y - STICK_FIGURE_TOTAL_HEIGHT;
            const angleRad = 0;

            // Action: Check for collision during a ground pound
            const result = checkCollision(runnerY, angleRad);

            // Assertion: No collision should be detected, and the obstacle should be destroyed
            expect(result).toBe(false);
            expect(gameState.currentObstacle).toBeNull();
        });

        test('Test Case 1.3: Base Level of Modified Skills - Firestorm', () => {
            // Setup: Place an obstacle and activate level 1 Firestorm
            setCurrentObstacle({ x: STICK_FIGURE_FIXED_X, y: GROUND_Y, emoji: '🔥' });
            gameState.playerStats.skillLevels.firestorm = 1;
            startFirestorm(gameState);
            const runnerY = GROUND_Y - STICK_FIGURE_TOTAL_HEIGHT;
            const angleRad = 0;

            // Action: Check for collision with Firestorm active
            const result = checkCollision(runnerY, angleRad);

            // Assertion: No collision should be detected, and the obstacle should be incinerated
            expect(result).toBe(false);
            expect(gameState.currentObstacle).toBeNull();
        });

        test('Test Case 1.3: Base Level of Modified Skills - Moonwalk', () => {
            // Setup: Activate level 1 Moonwalk
            gameState.playerStats.skillLevels.moonwalk = 1;
            startMoonwalk(gameState);

            // Assertion: Moonwalk at level 1 should not grant invincibility or energy
            expect(gameState.isInvincible).toBe(false);
        });
    });
});
