import { themes } from '../theme.js';
import { personas } from '../personas.js';
import { ARMORY_ITEMS } from '../unlocks.js';
import { parseData, parseEventData, prepareRaceData } from '../utils.js';

const SMOKE_HISTORY_KEY = 'fireHeistSmokeTestRuns';

function createResult(name, area, status, message, durationMs = 0) {
    return { name, area, status, message, durationMs };
}

function runCheck(name, area, checkFn) {
    const startedAt = performance.now();
    try {
        const message = checkFn() || 'OK';
        return createResult(name, area, 'pass', message, Math.round(performance.now() - startedAt));
    } catch (error) {
        return createResult(name, area, 'fail', error.message || String(error), Math.round(performance.now() - startedAt));
    }
}

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

export function getSmokeTestHistory() {
    try {
        return JSON.parse(localStorage.getItem(SMOKE_HISTORY_KEY)) || [];
    } catch (error) {
        console.warn('-> Smoke Tests: Failed to read history. Resetting.', error);
        localStorage.removeItem(SMOKE_HISTORY_KEY);
        return [];
    }
}

export function clearSmokeTestHistory() {
    localStorage.removeItem(SMOKE_HISTORY_KEY);
}

export function saveSmokeTestRun(run) {
    const history = getSmokeTestHistory();
    history.unshift(run);
    localStorage.setItem(SMOKE_HISTORY_KEY, JSON.stringify(history.slice(0, 25)));
}

export function getUncleSamDatasetSummary() {
    const persona = personas.uncleSam;
    if (!persona) return null;

    const milestones = parseData(persona.milestones.join('\n')) || {};
    const firstDate = Object.keys(milestones)[0];
    const events = parseEventData(persona.events.join('\n'), firstDate) || {};
    const eventList = Object.values(events).flat();

    return {
        milestoneCount: Object.keys(milestones).length,
        firstDate,
        lastDate: Object.keys(milestones).at(-1),
        firstValue: Object.values(milestones)[0] || 0,
        finalValue: Object.values(milestones).at(-1) || 0,
        acceleratorCount: eventList.filter(event => event.type === 'ACCELERATOR').length,
        deceleratorCount: eventList.filter(event => event.type === 'DECELERATOR').length,
        milestones,
        events: eventList
    };
}

export function runSmokeTests() {
    const startedAt = performance.now();
    const results = [];

    results.push(runCheck('America 250 theme registered', 'theme', () => {
        assert(themes.america250, 'Theme key america250 is missing.');
        assert(themes.america250.name.includes('250th America'), 'Theme display name does not include 250th America.');
        assert(Array.isArray(themes.america250.obstacleEmojis) && themes.america250.obstacleEmojis.length >= 4, 'Theme needs at least four obstacle emojis.');
        assert(Array.isArray(themes.america250.acceleratorEmojis) && themes.america250.acceleratorEmojis.length >= 2, 'Theme needs accelerator emojis.');
        return `${themes.america250.obstacleEmojis.length} obstacles, ${themes.america250.acceleratorEmojis.length} accelerators`;
    }));

    results.push(runCheck('Uncle Sam persona registered', 'persona', () => {
        const persona = personas.uncleSam;
        assert(persona, 'Persona key uncleSam is missing.');
        assert(persona.theme === 'america250', 'Uncle Sam must use america250 theme.');
        assert(persona.music === 'fx/america-250-theme.mp3', 'Uncle Sam music should point to the America 250 placeholder track.');
        return `${persona.name} uses ${persona.theme}`;
    }));

    results.push(runCheck('Uncle Sam milestones parse', 'data', () => {
        const summary = getUncleSamDatasetSummary();
        assert(summary, 'Could not build Uncle Sam dataset summary.');
        assert(summary.milestoneCount >= 8, 'Expected at least eight milestones.');
        assert(summary.finalValue >= 250000, 'Final milestone should reach at least 250,000.');
        return `${summary.milestoneCount} milestones through ${summary.lastDate}`;
    }));

    results.push(runCheck('Uncle Sam events parse', 'data', () => {
        const summary = getUncleSamDatasetSummary();
        assert(summary.acceleratorCount > 0, 'Expected accelerator events.');
        assert(summary.deceleratorCount > 0, 'Expected decelerator events.');
        return `${summary.acceleratorCount} accelerators, ${summary.deceleratorCount} decelerators`;
    }));

    results.push(runCheck('Race segments prepare', 'data', () => {
        const summary = getUncleSamDatasetSummary();
        const segments = prepareRaceData(summary.milestones);
        assert(Array.isArray(segments) && segments.length === summary.milestoneCount, 'Race segment count does not match milestone count.');
        return `${segments.length} race segments ready`;
    }));

    results.push(runCheck('Theme pack unlock metadata exists', 'armory', () => {
        const item = ARMORY_ITEMS.america250Theme;
        assert(item, 'america250Theme unlock item is missing.');
        assert(item.themeKey === 'america250', 'Theme pack must point to america250.');
        assert(item.personaKey === 'uncleSam', 'Theme pack must point to uncleSam.');
        return item.unlockText;
    }));

    results.push(runCheck('QA dashboard DOM present', 'dashboard', () => {
        assert(document.getElementById('qaDashboardContainer'), 'qaDashboardContainer is missing.');
        assert(document.getElementById('qaRunSmokeTestsBtn'), 'Run Smoke Tests button is missing.');
        assert(document.getElementById('qaSmokeResultsBody'), 'Smoke results body is missing.');
        return 'Dashboard containers found';
    }));

    results.push(runCheck('Canvas initialized', 'canvas', () => {
        const canvas = document.getElementById('gameCanvas');
        assert(canvas && canvas.width > 0 && canvas.height > 0, 'Canvas is missing or has no dimensions.');
        return `${canvas.width}x${canvas.height}`;
    }));

    const passed = results.filter(result => result.status === 'pass').length;
    const failed = results.length - passed;
    const run = {
        id: `smoke-${Date.now()}`,
        scenario: 'America 250 functional smoke',
        timestamp: new Date().toISOString(),
        durationMs: Math.round(performance.now() - startedAt),
        passed,
        failed,
        total: results.length,
        status: failed === 0 ? 'pass' : 'fail',
        results
    };

    saveSmokeTestRun(run);
    return run;
}
