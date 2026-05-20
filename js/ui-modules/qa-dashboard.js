import { runSmokeTests, getSmokeTestHistory, clearSmokeTestHistory, getUncleSamDatasetSummary } from './smoke-tests.js';

let historyChart = null;
let progressionChart = null;

function formatDateTime(value) {
    if (!value) return 'Never';
    return new Date(value).toLocaleString();
}

function renderSummary(history) {
    const latest = history[0];
    const container = document.getElementById('qaSmokeSummary');
    if (!container) return;

    const passRate = latest ? Math.round((latest.passed / latest.total) * 100) : 0;
    const statusClass = latest?.status === 'pass' ? 'bg-green-100 text-green-700' : latest ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600';

    container.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-sm">
            <div class="p-3 rounded-lg ${statusClass}">
                <div class="font-bold text-lg">${latest ? latest.status.toUpperCase() : 'IDLE'}</div>
                <div>Overall</div>
            </div>
            <div class="p-3 rounded-lg bg-blue-50 text-blue-700">
                <div class="font-bold text-lg">${passRate}%</div>
                <div>Latest Pass Rate</div>
            </div>
            <div class="p-3 rounded-lg bg-green-50 text-green-700">
                <div class="font-bold text-lg">${latest?.passed || 0}</div>
                <div>Passed</div>
            </div>
            <div class="p-3 rounded-lg bg-red-50 text-red-700">
                <div class="font-bold text-lg">${latest?.failed || 0}</div>
                <div>Failed</div>
            </div>
            <div class="p-3 rounded-lg bg-gray-50 text-gray-700">
                <div class="font-bold text-lg">${latest?.durationMs || 0}ms</div>
                <div>Duration</div>
            </div>
        </div>
        <p class="text-xs text-gray-500 mt-3 text-center">Latest run: ${formatDateTime(latest?.timestamp)}</p>
    `;
}

function renderResultsTable(history) {
    const body = document.getElementById('qaSmokeResultsBody');
    if (!body) return;

    const latest = history[0];
    if (!latest) {
        body.innerHTML = '<tr><td colspan="5" class="px-4 py-3 text-center text-gray-500">No smoke test runs yet.</td></tr>';
        return;
    }

    body.innerHTML = latest.results.map(result => {
        const statusClass = result.status === 'pass' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50';
        return `
            <tr class="${statusClass}">
                <td class="px-4 py-3 font-semibold">${result.status.toUpperCase()}</td>
                <td class="px-4 py-3">${result.area}</td>
                <td class="px-4 py-3">${result.name}</td>
                <td class="px-4 py-3">${result.message}</td>
                <td class="px-4 py-3 text-right">${result.durationMs}ms</td>
            </tr>
        `;
    }).join('');
}

function renderHistoryChart(history) {
    const canvas = document.getElementById('qaSmokeHistoryChart');
    if (!canvas || typeof Chart === 'undefined') return;

    const recent = history.slice(0, 10).reverse();
    if (historyChart) historyChart.destroy();

    historyChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: recent.map(run => new Date(run.timestamp).toLocaleTimeString()),
            datasets: [
                {
                    label: 'Pass Rate %',
                    data: recent.map(run => Math.round((run.passed / run.total) * 100)),
                    borderColor: '#1d4ed8',
                    backgroundColor: 'rgba(29,78,216,0.15)',
                    tension: 0.25,
                    yAxisID: 'y'
                },
                {
                    label: 'Failures',
                    data: recent.map(run => run.failed),
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220,38,38,0.15)',
                    tension: 0.25,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { min: 0, max: 100, position: 'left' },
                y1: { min: 0, position: 'right', grid: { drawOnChartArea: false } }
            }
        }
    });
}

function renderDatasetPanel() {
    const summary = getUncleSamDatasetSummary();
    const container = document.getElementById('qaDatasetSummary');
    const canvas = document.getElementById('qaDatasetProgressionChart');
    if (!container || !summary) return;

    container.innerHTML = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-center">
            <div class="bg-blue-50 text-blue-700 rounded-lg p-3"><strong>${summary.milestoneCount}</strong><br>Milestones</div>
            <div class="bg-red-50 text-red-700 rounded-lg p-3"><strong>$${summary.finalValue.toLocaleString()}</strong><br>Final Value</div>
            <div class="bg-green-50 text-green-700 rounded-lg p-3"><strong>${summary.acceleratorCount}</strong><br>Accelerators</div>
            <div class="bg-yellow-50 text-yellow-700 rounded-lg p-3"><strong>${summary.deceleratorCount}</strong><br>Decelerators</div>
        </div>
        <p class="text-xs text-gray-500 mt-3 text-center">${summary.firstDate} to ${summary.lastDate}</p>
    `;

    if (!canvas || typeof Chart === 'undefined') return;
    if (progressionChart) progressionChart.destroy();

    progressionChart = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: Object.keys(summary.milestones),
            datasets: [{
                label: 'Uncle Sam Milestones',
                data: Object.values(summary.milestones),
                borderColor: '#c1121f',
                backgroundColor: 'rgba(29,78,216,0.15)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    ticks: { callback: value => `$${Number(value).toLocaleString()}` }
                }
            }
        }
    });
}

export function renderQADashboard() {
    const history = getSmokeTestHistory();
    renderSummary(history);
    renderResultsTable(history);
    renderHistoryChart(history);
    renderDatasetPanel();
}

function exportHistory() {
    const history = getSmokeTestHistory();
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fireheist-smoke-history-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

export function initQADashboard() {
    const container = document.getElementById('qaDashboardContainer');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const shouldShow = params.get('qa') === '1' || localStorage.getItem('fireHeistShowQADashboard') === 'true';
    if (!shouldShow) return;

    container.classList.remove('hidden');

    document.getElementById('qaRunSmokeTestsBtn')?.addEventListener('click', () => {
        runSmokeTests();
        renderQADashboard();
    });

    document.getElementById('qaClearSmokeHistoryBtn')?.addEventListener('click', () => {
        clearSmokeTestHistory();
        renderQADashboard();
    });

    document.getElementById('qaExportSmokeHistoryBtn')?.addEventListener('click', exportHistory);

    renderQADashboard();
}
