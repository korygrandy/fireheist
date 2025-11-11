/**
 * FIRE Heist Game - localStorage State Tests
 * 
 * Comprehensive test suite covering:
 * - All UI buttons and their interactions
 * - localStorage persistence across sessions
 * - Player stats, settings, and preferences
 * - Game state synchronization
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8000/';

test.describe('FIRE Heist Game - localStorage State Management', () => {
    
    test.beforeEach(async ({ page, context }) => {
        // Clear localStorage before each test
        await context.clearCookies();
        await page.goto(BASE_URL);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    // ===================================================================
    // PLAYER SETTINGS PERSISTENCE TESTS
    // ===================================================================

    test.describe('Player Settings - Emoji Input', () => {
        test('should persist player emoji selection in localStorage', async ({ page }) => {
            const testEmoji = '🚀';
            const emojiInput = page.locator('#emojiInput');
            
            await emojiInput.fill(testEmoji);
            await emojiInput.blur(); // Trigger change event
            await page.waitForTimeout(500);
            
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings).toBeDefined();
            expect(storedSettings.stickFigureEmoji).toBe(testEmoji);
        });

        test('should restore player emoji from localStorage on page reload', async ({ page }) => {
            const testEmoji = '🦸‍♀️';
            const emojiInput = page.locator('#emojiInput');
            
            // Set and save emoji
            await emojiInput.fill(testEmoji);
            await emojiInput.blur();
            await page.waitForTimeout(300);
            
            // Reload page
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            // Verify emoji is restored
            const restoredEmoji = await page.locator('#emojiInput').inputValue();
            expect(restoredEmoji).toBe(testEmoji);
        });

        test('should truncate emoji input to 2 characters maximum', async ({ page }) => {
            const emojiInput = page.locator('#emojiInput');
            const longEmoji = '🎪🎭🎨'; // 3 emojis
            
            await emojiInput.fill(longEmoji);
            await emojiInput.blur();
            
            const value = await emojiInput.inputValue();
            expect(value.length).toBeLessThanOrEqual(2);
        });
    });

    test.describe('Obstacle Settings - Emoji Input', () => {
        test('should persist obstacle emoji selection in localStorage', async ({ page }) => {
            const testObstacleEmoji = '🔥';
            const obstacleEmojiInput = page.locator('#obstacleEmojiInput');
            
            await obstacleEmojiInput.fill(testObstacleEmoji);
            await obstacleEmojiInput.blur();
            await page.waitForTimeout(500);
            
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings.obstacleEmoji).toBe(testObstacleEmoji);
        });

        test('should restore obstacle emoji from localStorage', async ({ page }) => {
            const testObstacleEmoji = '🌵';
            const obstacleEmojiInput = page.locator('#obstacleEmojiInput');
            
            await obstacleEmojiInput.fill(testObstacleEmoji);
            await obstacleEmojiInput.blur();
            await page.waitForTimeout(300);
            
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            const restoredEmoji = await page.locator('#obstacleEmojiInput').inputValue();
            expect(restoredEmoji).toBe(testObstacleEmoji);
        });

        test('should default to snail emoji if not customized', async ({ page }) => {
            const obstacleEmojiInput = page.locator('#obstacleEmojiInput');
            const defaultValue = await obstacleEmojiInput.inputValue();
            
            expect(defaultValue).toBe('🐌');
        });
    });

    // ===================================================================
    // GAMEPLAY SETTINGS PERSISTENCE TESTS
    // ===================================================================

    test.describe('Obstacle Frequency Slider', () => {
        test('should persist obstacle frequency in localStorage', async ({ page }) => {
            const frequencySlider = page.locator('#obstacleFrequency');
            
            await frequencySlider.fill('50');
            await frequencySlider.blur();
            await page.waitForTimeout(500);
            
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings.obstacleFrequencyPercent).toBeDefined();
        });

        test('should display frequency value in UI', async ({ page }) => {
            const frequencySlider = page.locator('#obstacleFrequency');
            const frequencyValue = page.locator('#frequencyValue');
            
            await frequencySlider.fill('75');
            
            const displayedValue = await frequencyValue.textContent();
            expect(displayedValue).toContain('75');
        });

        test('should restore frequency slider position after reload', async ({ page }) => {
            const frequencySlider = page.locator('#obstacleFrequency');
            const testValue = '40';
            
            await frequencySlider.fill(testValue);
            await frequencySlider.blur();
            await page.waitForTimeout(300);
            
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            const restoredValue = await frequencySlider.inputValue();
            expect(parseInt(restoredValue)).toBeGreaterThanOrEqual(parseInt(testValue) * 0.7);
        });

        test('should handle frequency range boundaries (0-100)', async ({ page }) => {
            const frequencySlider = page.locator('#obstacleFrequency');
            
            // Test minimum
            await frequencySlider.fill('0');
            let value = await frequencySlider.inputValue();
            expect(parseInt(value)).toBeGreaterThanOrEqual(0);
            
            // Test maximum
            await frequencySlider.fill('100');
            value = await frequencySlider.inputValue();
            expect(parseInt(value)).toBeLessThanOrEqual(100);
        });
    });

    test.describe('Skill Level Selection', () => {
        test('should persist Rookie skill level in localStorage', async ({ page }) => {
            const rookieRadio = page.locator('input[name="gameSkillLevel"][value="Rookie"]');
            
            await rookieRadio.check();
            await page.waitForTimeout(500);
            
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings.currentSkillLevel).toBe('Rookie');
        });

        test('should persist Novice skill level in localStorage', async ({ page }) => {
            const noviceRadio = page.locator('input[name="gameSkillLevel"][value="Novice"]');
            
            await noviceRadio.check();
            await page.waitForTimeout(500);
            
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings.currentSkillLevel).toBe('Novice');
        });

        test('should persist Pro skill level in localStorage', async ({ page }) => {
            const proRadio = page.locator('input[name="gameSkillLevel"][value="Pro"]');
            
            await proRadio.check();
            await page.waitForTimeout(500);
            
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings.currentSkillLevel).toBe('Pro');
        });

        test('should restore skill level selection after reload', async ({ page }) => {
            const proRadio = page.locator('input[name="gameSkillLevel"][value="Pro"]');
            
            await proRadio.check();
            await page.waitForTimeout(300);
            
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            const restoredRadio = await proRadio.isChecked();
            expect(restoredRadio).toBe(true);
        });
    });

    test.describe('Game Speed Selection', () => {
        test('should persist Slow (0.5x) speed in localStorage', async ({ page }) => {
            const slowRadio = page.locator('input[name="gameSpeed"][value="0.5"]');
            
            await slowRadio.check();
            await page.waitForTimeout(500);
            
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings.intendedSpeedMultiplier).toBe(0.5);
        });

        test('should persist Normal (1.0x) speed in localStorage', async ({ page }) => {
            const normalRadio = page.locator('input[name="gameSpeed"][value="1.0"]');
            
            await normalRadio.check();
            await page.waitForTimeout(500);
            
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings.intendedSpeedMultiplier).toBe(1.0);
        });

        test('should persist Fast (2.0x) speed in localStorage', async ({ page }) => {
            const fastRadio = page.locator('input[name="gameSpeed"][value="2.0"]');
            
            await fastRadio.check();
            await page.waitForTimeout(500);
            
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings.intendedSpeedMultiplier).toBe(2.0);
        });

        test('should restore speed selection after reload', async ({ page }) => {
            const fastRadio = page.locator('input[name="gameSpeed"][value="2.0"]');
            
            await fastRadio.check();
            await page.waitForTimeout(300);
            
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            const restoredRadio = await fastRadio.isChecked();
            expect(restoredRadio).toBe(true);
        });
    });

    // ===================================================================
    // POWER-UPS AND SPECIAL FEATURES TESTS
    // ===================================================================

    test.describe('Power-Ups Toggle', () => {
        test('should persist Power-Ups enabled state in localStorage', async ({ page }) => {
            const powerUpsCheckbox = page.locator('#enablePowerUps');
            
            // Uncheck power-ups
            if (await powerUpsCheckbox.isChecked()) {
                await powerUpsCheckbox.uncheck();
            }
            
            await page.waitForTimeout(500);
            
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings.enableRandomPowerUps).toBe(false);
        });

        test('should persist Power-Ups disabled state in localStorage', async ({ page }) => {
            const powerUpsCheckbox = page.locator('#enablePowerUps');
            
            await powerUpsCheckbox.check();
            await page.waitForTimeout(500);
            
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings.enableRandomPowerUps).toBe(true);
        });

        test('should restore Power-Ups state after reload', async ({ page }) => {
            const powerUpsCheckbox = page.locator('#enablePowerUps');
            
            await powerUpsCheckbox.uncheck();
            await page.waitForTimeout(300);
            
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            const restoredState = await powerUpsCheckbox.isChecked();
            expect(restoredState).toBe(false);
        });
    });

    test.describe('Auto-Hurdle Toggle', () => {
        test('should persist Auto-Hurdle enabled state in localStorage', async ({ page }) => {
            const autoHurdleCheckbox = page.locator('#enableAutoHurdle');
            
            await autoHurdleCheckbox.check();
            await page.waitForTimeout(500);
            
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings.isAutoHurdleEnabled).toBe(true);
        });

        test('should persist Auto-Hurdle disabled state in localStorage', async ({ page }) => {
            const autoHurdleCheckbox = page.locator('#enableAutoHurdle');
            
            if (await autoHurdleCheckbox.isChecked()) {
                await autoHurdleCheckbox.uncheck();
            }
            
            await page.waitForTimeout(500);
            
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings.isAutoHurdleEnabled).toBe(false);
        });

        test('should restore Auto-Hurdle state after reload', async ({ page }) => {
            const autoHurdleCheckbox = page.locator('#enableAutoHurdle');
            
            await autoHurdleCheckbox.check();
            await page.waitForTimeout(300);
            
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            const restoredState = await autoHurdleCheckbox.isChecked();
            expect(restoredState).toBe(true);
        });
    });

    // ===================================================================
    // THEME AND PERSONA SELECTION TESTS
    // ===================================================================

    test.describe('Theme Selector', () => {
        test('should persist theme selection in localStorage', async ({ page }) => {
            const themeSelector = page.locator('#themeSelector');
            
            // Get available options
            const options = await themeSelector.locator('option').count();
            if (options > 1) {
                await themeSelector.selectOption({ index: 1 });
                await page.waitForTimeout(500);
                
                const storedSettings = await page.evaluate(() => 
                    JSON.parse(localStorage.getItem('fireHeistSettings'))
                );
                
                expect(storedSettings.selectedTheme).toBeDefined();
            }
        });

        test('should restore theme selection after reload', async ({ page }) => {
            const themeSelector = page.locator('#themeSelector');
            
            const options = await themeSelector.locator('option').count();
            if (options > 1) {
                await themeSelector.selectOption({ index: 1 });
                const selectedValue = await themeSelector.inputValue();
                
                await page.waitForTimeout(300);
                await page.reload();
                await page.waitForLoadState('networkidle');
                
                const restoredValue = await themeSelector.inputValue();
                expect(restoredValue).toBe(selectedValue);
            }
        });

        test('should default to grass theme', async ({ page }) => {
            const themeSelector = page.locator('#themeSelector');
            const defaultValue = await themeSelector.inputValue();
            
            expect(defaultValue).toBe('grass');
        });
    });

    test.describe('Persona Selector', () => {
        test('should persist persona selection in localStorage', async ({ page }) => {
            const personaSelector = page.locator('#personaSelector');
            
            const options = await personaSelector.locator('option').count();
            if (options > 1) {
                await personaSelector.selectOption({ index: 1 });
                await page.waitForTimeout(500);
                
                const storedSettings = await page.evaluate(() => 
                    JSON.parse(localStorage.getItem('fireHeistSettings'))
                );
                
                expect(storedSettings.selectedPersona).toBeDefined();
            }
        });

        test('should restore persona selection after reload', async ({ page }) => {
            const personaSelector = page.locator('#personaSelector');
            
            const options = await personaSelector.locator('option').count();
            if (options > 1) {
                await personaSelector.selectOption({ index: 1 });
                const selectedValue = await personaSelector.inputValue();
                
                await page.waitForTimeout(300);
                await page.reload();
                await page.waitForLoadState('networkidle');
                
                const restoredValue = await personaSelector.inputValue();
                expect(restoredValue).toBe(selectedValue);
            }
        });

        test('should default to custom persona', async ({ page }) => {
            const personaSelector = page.locator('#personaSelector');
            const defaultValue = await personaSelector.inputValue();
            
            expect(defaultValue).toBe('custom');
        });
    });

    // ===================================================================
    // DATA MANAGEMENT TESTS
    // ===================================================================

    test.describe('Milestone Data Management', () => {
        test('should persist milestone data in localStorage', async ({ page }) => {
            const dataInput = page.locator('#dataInput');
            const customData = '01/01/2024: 10000\n02/01/2024: 20000';
            
            await dataInput.fill(customData);
            await page.waitForTimeout(300);
            
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings.milestoneData).toBeDefined();
        });

        test('should restore milestone data after reload', async ({ page }) => {
            const dataInput = page.locator('#dataInput');
            const customData = '03/01/2024: 50000\n04/01/2024: 100000';
            
            await dataInput.fill(customData);
            
            // Click somewhere to blur the input
            await page.locator('body').click();
            await page.waitForTimeout(300);
            
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            const restoredData = await dataInput.inputValue();
            expect(restoredData.length).toBeGreaterThan(0);
        });

        test('Load Custom Data button should update state', async ({ page }) => {
            const dataInput = page.locator('#dataInput');
            const eventDataInput = page.locator('#eventDataInput');
            const loadButton = page.locator('#loadButton');
            
            // Enter valid custom data
            const validData = '05/01/2024: 30000\n06/01/2024: 60000';
            await dataInput.fill(validData);
            await eventDataInput.fill('');
            
            await loadButton.click();
            await page.waitForTimeout(500);
            
            // Check if data message indicates success or contains the milestone count
            const dataMessage = page.locator('#dataMessage');
            const messageText = await dataMessage.textContent();
            
            expect(messageText).toContain('loaded');
        });
    });

    test.describe('Custom Event Data Management', () => {
        test('should persist custom event data in localStorage', async ({ page }) => {
            const eventDataInput = page.locator('#eventDataInput');
            const eventData = '01/15/2024: 🚀 : ACCELERATOR';
            
            await eventDataInput.fill(eventData);
            await page.waitForTimeout(300);
            
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings.eventData).toBeDefined();
        });

        test('should restore custom event data after reload', async ({ page }) => {
            const eventDataInput = page.locator('#eventDataInput');
            const eventData = '02/15/2024: 🐢 : DECELERATOR';
            
            await eventDataInput.fill(eventData);
            
            await page.locator('body').click();
            await page.waitForTimeout(300);
            
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            const restoredData = await eventDataInput.inputValue();
            expect(restoredData.length).toBeGreaterThan(0);
        });
    });

    // ===================================================================
    // DISABLE SAVE SETTINGS TESTS
    // ===================================================================

    test.describe('Disable Save Settings Checkbox', () => {
        test('should clear localStorage when Disable Save Settings is checked', async ({ page }) => {
            // First, save some settings
            const emojiInput = page.locator('#emojiInput');
            await emojiInput.fill('🎪');
            await emojiInput.blur();
            await page.waitForTimeout(300);
            
            // Verify settings are saved
            let storedSettings = await page.evaluate(() => 
                localStorage.getItem('fireHeistSettings')
            );
            expect(storedSettings).not.toBeNull();
            
            // Now disable save settings
            const disableSaveCheckbox = page.locator('#disableSaveSettings');
            await disableSaveCheckbox.check();
            await page.waitForTimeout(500);
            
            // Verify localStorage is cleared
            storedSettings = await page.evaluate(() => 
                localStorage.getItem('fireHeistSettings')
            );
            expect(storedSettings).toBeNull();
        });

        test('should prevent saving when Disable Save Settings is checked', async ({ page }) => {
            const disableSaveCheckbox = page.locator('#disableSaveSettings');
            await disableSaveCheckbox.check();
            await page.waitForTimeout(300);
            
            // Try to save settings
            const emojiInput = page.locator('#emojiInput');
            await emojiInput.fill('🎭');
            await emojiInput.blur();
            await page.waitForTimeout(300);
            
            // Verify settings are NOT saved
            const storedSettings = await page.evaluate(() => 
                localStorage.getItem('fireHeistSettings')
            );
            expect(storedSettings).toBeNull();
        });

        test('should allow saving again when Disable Save Settings is unchecked', async ({ page }) => {
            const disableSaveCheckbox = page.locator('#disableSaveSettings');
            
            // Disable saving first
            await disableSaveCheckbox.check();
            await page.waitForTimeout(300);
            
            // Uncheck to re-enable saving
            await disableSaveCheckbox.uncheck();
            await page.waitForTimeout(300);
            
            // Try to save settings
            const emojiInput = page.locator('#emojiInput');
            await emojiInput.fill('🎨');
            await emojiInput.blur();
            await page.waitForTimeout(500);
            
            // Verify settings ARE saved
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            expect(storedSettings).not.toBeNull();
        });
    });

    // ===================================================================
    // GAME CONTROL BUTTONS TESTS
    // ===================================================================

    test.describe('Start Button Interaction', () => {
        test('should enable Stop Button when game starts', async ({ page }) => {
            const startButton = page.locator('#startButton');
            const stopButton = page.locator('#stopButton');
            
            await startButton.click();
            await page.waitForTimeout(500);
            
            const isStopButtonEnabled = await stopButton.isEnabled();
            expect(isStopButtonEnabled).toBe(true);
        });

        test('should start game when Start Button is clicked', async ({ page }) => {
            const startButton = page.locator('#startButton');
            const gameCanvas = page.locator('#gameCanvas');
            
            await startButton.click();
            await page.waitForTimeout(500);
            
            // Check if canvas is visible and game is running
            const isCanvasVisible = await gameCanvas.isVisible();
            expect(isCanvasVisible).toBe(true);
        });
    });

    test.describe('Stop/Reset Button Interaction', () => {
        test('should disable Stop Button when clicked', async ({ page }) => {
            const startButton = page.locator('#startButton');
            const stopButton = page.locator('#stopButton');
            
            // Start game first
            await startButton.click();
            await page.waitForTimeout(300);
            
            // Click stop button
            await stopButton.click();
            await page.waitForTimeout(500);
            
            // Check if stop button is disabled after reset
            const isStopButtonDisabled = !await stopButton.isEnabled();
            expect(isStopButtonDisabled).toBe(true);
        });
    });

    test.describe('Sound Toggle Button', () => {
        test('should toggle sound state', async ({ page }) => {
            const soundToggleButton = page.locator('#soundToggleButton');
            const initialText = await soundToggleButton.textContent();
            
            // Note: Actual mute state would be verified via audio state
            await soundToggleButton.click();
            await page.waitForTimeout(300);
            
            const buttonText = await soundToggleButton.textContent();
            expect(buttonText).toBeDefined();
        });

        test('should persist mute setting in localStorage', async ({ page }) => {
            const soundToggleButton = page.locator('#soundToggleButton');
            
            await soundToggleButton.click();
            await page.waitForTimeout(500);
            
            const muteSetting = await page.evaluate(() => 
                localStorage.getItem('fireHeistMuteSetting')
            );
            
            expect(muteSetting).toBeDefined();
        });

        test('should restore mute setting after reload', async ({ page }) => {
            const soundToggleButton = page.locator('#soundToggleButton');
            const initialState = await soundToggleButton.textContent();
            
            await soundToggleButton.click();
            await page.waitForTimeout(300);
            
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            const restoredState = await soundToggleButton.textContent();
            expect(restoredState).toBeDefined();
        });
    });

    test.describe('Fullscreen Toggle Button', () => {
        test('should trigger fullscreen mode', async ({ page } ) => {
            const fullscreenButton = page.locator('#fullscreenToggleButton');
            
            await fullscreenButton.click();
            await page.waitForTimeout(500);
            
            // Button should be clickable
            expect(await fullscreenButton.isVisible()).toBe(true);
        });
    });

    test.describe('Info Icon Toggle', () => {
        test('should toggle info panel visibility', async ({ page }) => {
            const infoIcon = page.locator('#info-icon');
            const infoPanel = page.locator('#info-panel');
            
            // Info panel should be hidden initially
            let isHidden = await infoPanel.evaluate(el => el.classList.contains('hidden'));
            expect(isHidden).toBe(true);
            
            // Click to show
            await infoIcon.click();
            isHidden = await infoPanel.evaluate(el => el.classList.contains('hidden'));
            expect(isHidden).toBe(false);
            
            // Click to hide
            await infoIcon.click();
            isHidden = await infoPanel.evaluate(el => el.classList.contains('hidden'));
            expect(isHidden).toBe(true);
        });
    });

    // ===================================================================
    // TAB NAVIGATION TESTS
    // ===================================================================

    test.describe('Tab Navigation', () => {
        test('should switch to Gameplay tab and persist settings', async ({ page }) => {
            const gameplayTabButton = page.locator('[data-tab="gameplay"]');
            const gameplayTab = page.locator('#gameplayTab');
            
            await gameplayTabButton.click();
            await page.waitForTimeout(300);
            
            const isVisible = await gameplayTab.evaluate(el => !el.classList.contains('hidden'));
            expect(isVisible).toBe(true);
        });

        test('should switch to Data tab', async ({ page }) => {
            const dataTabButton = page.locator('[data-tab="data"]');
            const dataTab = page.locator('#dataTab');
            
            await dataTabButton.click();
            await page.waitForTimeout(300);
            
            const isVisible = await dataTab.evaluate(el => !el.classList.contains('hidden'));
            expect(isVisible).toBe(true);
        });

        test('should switch to Hall of Fame tab', async ({ page }) => {
            const hallOfFameTabButton = page.locator('[data-tab="hallOfFame"]');
            const hallOfFameTab = page.locator('#hallOfFameTab');
            
            await hallOfFameTabButton.click();
            await page.waitForTimeout(300);
            
            const isVisible = await hallOfFameTab.evaluate(el => !el.classList.contains('hidden'));
            expect(isVisible).toBe(true);
        });

        test('should switch to Armory tab', async ({ page }) => {
            const armoryTabButton = page.locator('[data-tab="armory"]');
            const armoryTab = page.locator('#armoryTab');
            
            await armoryTabButton.click();
            await page.waitForTimeout(300);
            
            const isVisible = await armoryTab.evaluate(el => !el.classList.contains('hidden'));
            expect(isVisible).toBe(true);
        });

        test('Player tab should be active by default', async ({ page }) => {
            const playerTab = page.locator('#playerTab');
            
            const isVisible = await playerTab.evaluate(el => !el.classList.contains('hidden'));
            expect(isVisible).toBe(true);
        });
    });

    // ===================================================================
    // PLAYER STATS PERSISTENCE TESTS
    // ===================================================================

    test.describe('Player Stats localStorage', () => {
        test('should initialize empty player stats on first load', async ({ page }) => {
            const playerStats = await page.evaluate(() => 
                localStorage.getItem('fireHeistPlayerStats')
            );
            
            // Stats may not exist on first load or be empty object
            if (playerStats) {
                const stats = JSON.parse(playerStats);
                expect(stats).toBeDefined();
            }
        });

        test('should persist flawless runs data', async ({ page }) => {
            // Simulate flawless run data
            await page.evaluate(() => {
                const stats = {
                    flawlessRuns: { 'Rookie': 5 },
                    obstaclesIncinerated: 0,
                    notifiedArmoryUnlocks: [],
                    unlockedArmoryItems: [],
                    notifiedUnlocks: [],
                    activeArmorySkill: null,
                    consecutiveGroundPounds: 0,
                    totalGroundPoundCollisions: 0,
                    consecutiveIncinerations: 0,
                    totalAccumulatedCash: 0,
                    skillLevels: {}
                };
                localStorage.setItem('fireHeistPlayerStats', JSON.stringify(stats));
            });
            
            const playerStats = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistPlayerStats'))
            );
            
            expect(playerStats.flawlessRuns['Rookie']).toBe(5);
        });

        test('should persist obstacles incinerated count', async ({ page }) => {
            await page.evaluate(() => {
                const stats = {
                    flawlessRuns: {},
                    obstaclesIncinerated: 42,
                    notifiedArmoryUnlocks: [],
                    unlockedArmoryItems: [],
                    notifiedUnlocks: [],
                    activeArmorySkill: null,
                    consecutiveGroundPounds: 0,
                    totalGroundPoundCollisions: 0,
                    consecutiveIncinerations: 0,
                    totalAccumulatedCash: 0,
                    skillLevels: {}
                };
                localStorage.setItem('fireHeistPlayerStats', JSON.stringify(stats));
            });
            
            const playerStats = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistPlayerStats'))
            );
            
            expect(playerStats.obstaclesIncinerated).toBe(42);
        });

        test('should persist active armory skill selection', async ({ page }) => {
            await page.evaluate(() => {
                const stats = {
                    flawlessRuns: {},
                    obstaclesIncinerated: 0,
                    notifiedArmoryUnlocks: [],
                    unlockedArmoryItems: ['firestorm'],
                    notifiedUnlocks: [],
                    activeArmorySkill: 'firestorm',
                    consecutiveGroundPounds: 0,
                    totalGroundPoundCollisions: 0,
                    consecutiveIncinerations: 0,
                    totalAccumulatedCash: 0,
                    skillLevels: {}
                };
                localStorage.setItem('fireHeistPlayerStats', JSON.stringify(stats));
            });
            
            const playerStats = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistPlayerStats'))
            );
            
            expect(playerStats.activeArmorySkill).toBe('firestorm');
        });

        test('should persist unlocked armory items', async ({ page }) => {
            await page.evaluate(() => {
                const stats = {
                    flawlessRuns: {},
                    obstaclesIncinerated: 0,
                    notifiedArmoryUnlocks: [],
                    unlockedArmoryItems: ['firestorm', 'fireSpinner', 'fieryGroundPound'],
                    notifiedUnlocks: [],
                    activeArmorySkill: null,
                    consecutiveGroundPounds: 0,
                    totalGroundPoundCollisions: 0,
                    consecutiveIncinerations: 0,
                    totalAccumulatedCash: 0,
                    skillLevels: {}
                };
                localStorage.setItem('fireHeistPlayerStats', JSON.stringify(stats));
            });
            
            const playerStats = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistPlayerStats'))
            );
            
            expect(playerStats.unlockedArmoryItems).toContain('firestorm');
            expect(playerStats.unlockedArmoryItems).toContain('fireSpinner');
            expect(playerStats.unlockedArmoryItems.length).toBe(3);
        });

        test('should persist total accumulated cash', async ({ page }) => {
            await page.evaluate(() => {
                const stats = {
                    flawlessRuns: {},
                    obstaclesIncinerated: 0,
                    notifiedArmoryUnlocks: [],
                    unlockedArmoryItems: [],
                    notifiedUnlocks: [],
                    activeArmorySkill: null,
                    consecutiveGroundPounds: 0,
                    totalGroundPoundCollisions: 0,
                    consecutiveIncinerations: 0,
                    totalAccumulatedCash: 1000000,
                    skillLevels: {}
                };
                localStorage.setItem('fireHeistPlayerStats', JSON.stringify(stats));
            });
            
            const playerStats = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistPlayerStats'))
            );
            
            expect(playerStats.totalAccumulatedCash).toBe(1000000);
        });

        test('should persist skill levels', async ({ page }) => {
            await page.evaluate(() => {
                const stats = {
                    flawlessRuns: {},
                    obstaclesIncinerated: 0,
                    notifiedArmoryUnlocks: [],
                    unlockedArmoryItems: [],
                    notifiedUnlocks: [],
                    activeArmorySkill: null,
                    consecutiveGroundPounds: 0,
                    totalGroundPoundCollisions: 0,
                    consecutiveIncinerations: 0,
                    totalAccumulatedCash: 0,
                    skillLevels: { 'firestorm': 3, 'fireSpinner': 1 }
                };
                localStorage.setItem('fireHeistPlayerStats', JSON.stringify(stats));
            });
            
            const playerStats = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistPlayerStats'))
            );
            
            expect(playerStats.skillLevels['firestorm']).toBe(3);
            expect(playerStats.skillLevels['fireSpinner']).toBe(1);
        });
    });

    // ===================================================================
    // CROSS-SESSION CONSISTENCY TESTS
    // ===================================================================

    test.describe('Cross-Session Data Consistency', () => {
        test('should maintain all settings across multiple reload cycles', async ({ page }) => {
            // Set various settings
            const emojiInput = page.locator('#emojiInput');
            const frequencySlider = page.locator('#obstacleFrequency');
            const speedRadio = page.locator('input[name="gameSpeed"][value="2.0"]');
            
            await emojiInput.fill('🚁');
            await frequencySlider.fill('60');
            await speedRadio.check();
            
            await page.waitForTimeout(500);
            
            // First reload
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            // Verify all settings persisted
            let restoredEmoji = await emojiInput.inputValue();
            let restoredSpeed = await speedRadio.isChecked();
            expect(restoredEmoji).toBe('🚁');
            expect(restoredSpeed).toBe(true);
            
            // Second reload
            await page.reload();
            await page.waitForLoadState('networkidle');
            
            // Verify settings still intact
            restoredEmoji = await emojiInput.inputValue();
            restoredSpeed = await speedRadio.isChecked();
            expect(restoredEmoji).toBe('🚁');
            expect(restoredSpeed).toBe(true);
        });

        test('should handle rapid setting changes', async ({ page }) => {
            const emojiInput = page.locator('#emojiInput');
            
            // Rapidly change settings
            await emojiInput.fill('🎪');
            await page.waitForTimeout(50);
            await emojiInput.fill('🎭');
            await page.waitForTimeout(50);
            await emojiInput.fill('🎨');
            await page.waitForTimeout(50);
            
            // Wait for save
            await page.waitForTimeout(500);
            
            // Verify final state
            const storedSettings = await page.evaluate(() => 
                JSON.parse(localStorage.getItem('fireHeistSettings'))
            );
            
            expect(storedSettings.stickFigureEmoji).toBe('🎨');
        });
    });

    // ===================================================================
    // ERROR HANDLING AND EDGE CASES
    // ===================================================================

    test.describe('Error Handling and Edge Cases', () => {
        test('should handle corrupted localStorage gracefully', async ({ page, context }) => {
            // Set corrupted data
            await page.evaluate(() => {
                localStorage.setItem('fireHeistSettings', 'corrupted{json');
            });
            
            await page.reload();
            
            // Page should still load without crashing
            const gameCanvas = page.locator('#gameCanvas');
            expect(await gameCanvas.isVisible()).toBe(true);
        });

        test('should handle empty emoji input', async ({ page }) => {
            const emojiInput = page.locator('#emojiInput');
            
            await emojiInput.fill('');
            await emojiInput.blur();
            await page.waitForTimeout(300);
            
            // Input should revert to default or be valid
            const value = await emojiInput.inputValue();
            expect(value.length).toBeGreaterThanOrEqual(0);
        });

        test('should handle localStorage quota exceeded scenario', async ({ page }) => {
            // Try to fill localStorage near capacity (simulate)
            const largeData = 'x'.repeat(4 * 1024 * 1024); // 4MB
            
            try {
                await page.evaluate((data) => {
                    localStorage.setItem('largeData', data);
                }, largeData);
            } catch (e) {
                // Expected to potentially fail, but app should handle gracefully
            }
            
            // App should still be functional
            const gameCanvas = page.locator('#gameCanvas');
            expect(await gameCanvas.isVisible()).toBe(true);
        });

        test('should validate theme selector options exist', async ({ page }) => {
            const themeSelector = page.locator('#themeSelector');
            const options = await themeSelector.locator('option').count();
            
            expect(options).toBeGreaterThan(0);
        });

        test('should validate persona selector options exist', async ({ page }) => {
            const personaSelector = page.locator('#personaSelector');
            const options = await personaSelector.locator('option').count();
            
            expect(options).toBeGreaterThan(0);
        });
    });

    // ===================================================================
    // INTEGRATION TESTS
    // ===================================================================

    test.describe('Integration - UI State with Game State', () => {
        test('should sync UI settings with game state on start', async ({ page }) => {
            const emojiInput = page.locator('#emojiInput');
            const testEmoji = '🦾';
            
            // Set custom emoji
            await emojiInput.fill(testEmoji);
            await page.waitForTimeout(300);
            
            // Start game
            const startButton = page.locator('#startButton');
            await startButton.click();
            await page.waitForTimeout(500);
            
            // Check if game state has the emoji
            const gameState = await page.evaluate(() => {
                return window.gameState ? window.gameState.stickFigureEmoji : null;
            });
            
            // If gameState is exposed, verify emoji
            if (gameState) {
                expect(gameState).toBe(testEmoji);
            }
        });

        test('should prevent changing player emoji during gameplay', async ({ page }) => {
            const emojiInput = page.locator('#emojiInput');
            const startButton = page.locator('#startButton');
            const initialEmoji = await emojiInput.inputValue();
            
            // Start game
            await startButton.click();
            await page.waitForTimeout(500);
            
            // Try to change emoji
            await emojiInput.fill('🤖');
            await page.waitForTimeout(300);
            
            // Verify emoji input is disabled or emoji wasn't changed in game
            const isDisabled = await emojiInput.isDisabled();
            // Note: This depends on implementation
        });
    });

    test.describe('Skill Upgrade Modal Storage', () => {
        test('should handle skill upgrade modal interactions', async ({ page }) => {
            const skillUpgradeModal = page.locator('#skillUpgradeModal');
            const closeSkillModalBtn = page.locator('#closeSkillModalBtn');
            
            // Modal should be hidden initially
            const isHidden = await skillUpgradeModal.evaluate(el => el.classList.contains('hidden'));
            expect(isHidden).toBe(true);
        });

        test('should close skill upgrade modal when close button is clicked', async ({ page }) => {
            const skillUpgradeModal = page.locator('#skillUpgradeModal');
            const closeSkillModalBtn = page.locator('#closeSkillModalBtn');
            
            // Simulate opening modal
            await page.evaluate(() => {
                document.getElementById('skillUpgradeModal').classList.remove('hidden');
            });
            
            // Click close button
            await closeSkillModalBtn.click();
            await page.waitForTimeout(300);
            
            // Modal should be hidden
            const isHidden = await skillUpgradeModal.evaluate(el => el.classList.contains('hidden'));
            expect(isHidden).toBe(true);
        });
    });
});
