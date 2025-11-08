import { chartContainer, tableContainer, tableBody } from '../dom-elements.js';
import { drawChart, generateSummaryTable } from '../utils.js';

export function showResultsScreen(financialMilestones, raceSegments) {
    if (!financialMilestones || Object.keys(financialMilestones).length === 0 || !raceSegments || raceSegments.length === 0) {
        console.error("-> showResultsScreen: Called with invalid or empty data. Aborting render.");
        return;
    }
    chartContainer.style.display = 'block';
    tableContainer.style.display = 'block';
    drawChart(financialMilestones, document.getElementById('milestoneChart').getContext('2d'));
    generateSummaryTable(raceSegments, tableBody);
}

export function hideResultsScreen() {
    chartContainer.style.display = 'none';
    tableContainer.style.display = 'none';
}
