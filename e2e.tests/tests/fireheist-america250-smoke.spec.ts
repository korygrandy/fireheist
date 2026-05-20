import { expect, type Page, test } from '@playwright/test';

async function openReadyApp(page: Page) {
  await page.goto('/?qa=1');
  await expect(page.locator('#preloader-start-button')).toBeVisible({ timeout: 30_000 });
  await page.locator('#preloader-start-button').click();
  await expect(page.locator('#preloader-overlay')).toBeHidden({ timeout: 10_000 });
}

test.describe('250th America functional smoke', () => {
  test('loads dashboard smoke checks and records a passing run', async ({ page }) => {
    await openReadyApp(page);

    await expect(page.locator('#gameCanvas')).toBeVisible();
    await expect(page.locator('#qaDashboardContainer')).toBeVisible();

    await page.locator('#qaRunSmokeTestsBtn').click();

    await expect(page.locator('#qaSmokeResultsBody tr')).toHaveCount(8);
    await expect(page.locator('#qaSmokeSummary')).toContainText('PASS');

    const history = await page.evaluate(() => JSON.parse(localStorage.getItem('fireHeistSmokeTestRuns') || '[]'));
    expect(history.length).toBeGreaterThan(0);
    expect(history[0].scenario).toBe('America 250 functional smoke');
    expect(history[0].failed).toBe(0);
  });

  test('selects Uncle Sam and applies 250th America theme data', async ({ page }) => {
    await openReadyApp(page);

    await page.locator('#personaSelector').selectOption('uncleSam');

    await expect(page.locator('#themeSelector')).toHaveValue('america250');
    await expect(page.locator('#dataInput')).toHaveValue(/07\/04\/2026: 250000/);
    await expect(page.locator('#eventDataInput')).toHaveValue(/07\/04\/2026: .*ACCELERATOR/);

    const state = await page.evaluate(async () => {
      const { gameState } = await import('/js/game-modules/state-manager.js');
      return {
        selectedPersona: gameState.selectedPersona,
        selectedTheme: gameState.selectedTheme,
        activeSkill: gameState.playerStats.activeArmorySkill,
        segmentCount: gameState.raceSegments.length,
        eventCount: Object.values(gameState.customEvents || {}).flat().length
      };
    });

    expect(state.selectedPersona).toBe('uncleSam');
    expect(state.selectedTheme).toBe('america250');
    expect(state.activeSkill).toBe('fireMage');
    expect(state.segmentCount).toBeGreaterThanOrEqual(8);
    expect(state.eventCount).toBeGreaterThan(0);
  });

  test('starts the America 250 canvas without going blank', async ({ page }) => {
    await openReadyApp(page);
    await page.locator('#personaSelector').selectOption('uncleSam');
    await page.locator('#startButton').click();
    await page.waitForTimeout(1500);

    const canvasStats = await page.evaluate(async () => {
      const { gameState } = await import('/js/game-modules/state-manager.js');
      const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
      const context = canvas.getContext('2d');
      if (!context) return { nonBlankPixels: 0, selectedTheme: gameState.selectedTheme, running: false };
      const image = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let nonBlankPixels = 0;
      for (let index = 0; index < image.length; index += 4 * 80) {
        if (image[index] !== 0 || image[index + 1] !== 0 || image[index + 2] !== 0 || image[index + 3] !== 0) {
          nonBlankPixels++;
        }
      }
      return {
        nonBlankPixels,
        selectedTheme: gameState.selectedTheme,
        running: gameState.gameRunning,
        fireworks: gameState.environmentalEffects.america250Fireworks.length,
        confetti: gameState.environmentalEffects.america250Confetti.length
      };
    });

    expect(canvasStats.selectedTheme).toBe('america250');
    expect(canvasStats.running).toBe(true);
    expect(canvasStats.nonBlankPixels).toBeGreaterThan(0);
    expect(canvasStats.fireworks).toBeGreaterThan(0);
    expect(canvasStats.confetti).toBeGreaterThan(0);
  });
});
