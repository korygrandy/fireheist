// =================================================================
// UTILITY FUNCTIONS
// =================================================================

import { MS_PER_DAY, CHART_Y_STEP_SIZE, MIN_VISUAL_DURATION_MS, MAX_VISUAL_DURATION_MS, MAX_HURDLE_HEIGHT } from './constants.js';
export function parseData(dataString) {
    const milestones = {};
    const lines = dataString.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let valid = true;
    lines.forEach(line => {
        const parts = line.split(':');
        if (parts.length < 2) { valid = false; return; }
        const datePart = parts[0].trim();
        const valuePart = parts.slice(1).join(':').trim().replace(/[^0-9]/g, '');
        const date = new Date(datePart);
        const value = parseInt(valuePart, 10);
        if (isNaN(date.getTime()) || isNaN(value)) { valid = false; return; }
        milestones[datePart] = value;
    });
    if (!valid) return null;
    const sortedDates = Object.keys(milestones).sort((a, b) => new Date(a) - new Date(b));
    const sortedMilestones = {};
    sortedDates.forEach(date => { sortedMilestones[date] = milestones[date]; });
    return sortedMilestones;
}

export function parseEventData(eventDataString, firstMilestoneDate) {
    const events = {};
    const lines = eventDataString.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let valid = true;

    const firstDate = new Date(firstMilestoneDate);

    lines.forEach((line, index) => {
        const parts = line.split(':').map(p => p.trim());

        // Validation 1: Correct number of parts (Date: Emoji : Type)
        if (parts.length < 3) {
            console.error(`Event Data Validation Error (Line ${index + 1}): Must have 3 parts (Date: Emoji : Type). Line: ${line}`);
            valid = false;
            return;
        }

        const datePart = parts[0];
        const emojiPart = parts[1];
        const typePart = parts[2].toUpperCase();

        // Validation 2: Date is valid and after the first milestone
        const date = new Date(datePart);
        if (isNaN(date.getTime())) {
            console.error(`Event Data Validation Error (Line ${index + 1}): Invalid Date format: ${datePart}`);
            valid = false;
            return;
        }
        if (date <= firstDate) {
             console.error(`Event Data Validation Error (Line ${index + 1}): Event date must be AFTER the first milestone date (${firstMilestoneDate}). Date: ${datePart}`);
             valid = false;
             return;
        }

        // Validation 3: Emoji is not empty
        if (emojiPart.length === 0) {
            console.error(`Event Data Validation Error (Line ${index + 1}): Emoji cannot be empty.`);
            valid = false;
            return;
        }

        // Validation 4: Type is valid
        if (typePart !== 'ACCELERATOR' && typePart !== 'DECELERATOR') {
            console.error(`Event Data Validation Error (Line ${index + 1}): Type must be ACCELERATOR or DECELERATOR. Found: ${typePart}`);
            valid = false;
            return;
        }

        // Calculate Days Since Start (for in-game activation)
        const daysSinceStart = Math.round((date - firstDate) / MS_PER_DAY);

        if (!events[datePart]) {
            events[datePart] = [];
        }

        events[datePart].push({
            date: datePart,
            emoji: emojiPart,
            type: typePart,
            daysSinceStart: daysSinceStart,
            wasTriggered: false
        });
    });

    if (!valid) return null;
    console.log("-> parseEventData: Custom Events parsed and validated successfully.");
    return events;
}

export function prepareRaceData(milestones) {
    console.log("-> prepareRaceData: Starting data preparation.");
    const dates = Object.keys(milestones);
    const segments = [];
    const heightScaleFactor = 0.00007;
    const maxAngleRad = 0.3;

    if (dates.length < 2) return [];

    let maxTimeDiffMs = 1;
    let timeDiffsMs = [];

    // 1. Calculate all time differences and find the maximum (longest segment)
    for (let i = 1; i < dates.length; i++) {
        const timeDiff = new Date(dates[i]) - new Date(dates[i-1]);
        timeDiffsMs.push(timeDiff);
        if (timeDiff > maxTimeDiffMs) { maxTimeDiffMs = timeDiff; }
    }
    console.log(`-> prepareRaceData: Max Time Difference MS: ${maxTimeDiffMs}`);

    let previousSegmentDurationDays = 0; // Tracks the duration of the *previous* segment in days

    // Segment 0: Initial starting point
    segments.push({
        label: `$${milestones[dates[0]].toLocaleString()}`,
        dateLabel: dates[0],
        hurdleHeight: 10,
        segmentDurationMs: 0,
        durationDays: 0,
        durationDelta: 0, // No previous segment to compare
        milestoneValue: milestones[dates[0]],
        angleRad: 0,
        visualDurationMs: 0, // No duration for starting point
        isMilestone: false // Not a hurdle, just a starting point
    });

     // 2. Build segments with stable visual durations
    for (let i = 1; i < dates.length; i++) {
        const currentDate = new Date(dates[i]);
        const currentValue = milestones[dates[i]];
        const timeDiffMs = timeDiffsMs[i - 1]; // Use pre-calculated difference

        // Determine segment visual speed based on real-world duration
        const timeMultiplier = timeDiffMs / maxTimeDiffMs; // 0 to 1 ratio
        const visualDurationMs = MIN_VISUAL_DURATION_MS +
                                 (MAX_VISUAL_DURATION_MS - MIN_VISUAL_DURATION_MS) * timeMultiplier;

        // Hurdle Height
        let height = (currentValue - milestones[dates[i-1]]) * heightScaleFactor;
        if (height < 10) height = 10;
        if (height > MAX_HURDLE_HEIGHT) height = MAX_HURDLE_HEIGHT;

        // Duration and Pace
        const currentDurationDays = Math.round(timeDiffMs / MS_PER_DAY);
        const angleRad = (timeDiffMs / maxTimeDiffMs) * maxAngleRad;

        // **LOGIC CHANGE:** Calculate durationDelta based on previous segment's duration
        // A positive delta means the current segment took FEWER days (faster/better)
        // A negative delta means the current segment took MORE days (slower/worse)
        const durationDelta = previousSegmentDurationDays === 0
            ? 0 // No comparison for the first real segment
            : previousSegmentDurationDays - currentDurationDays;

        segments.push({
            label: `$${currentValue.toLocaleString()}`,
            dateLabel: dates[i],
            hurdleHeight: height,
            segmentDurationMs: timeDiffMs,
            durationDays: currentDurationDays,
            durationDelta: durationDelta, // Segment-to-segment comparison
            milestoneValue: currentValue,
            angleRad: angleRad,
            visualDurationMs: visualDurationMs, // Stored for use in animate()
            isMilestone: true, // This is an actual hurdle/milestone
            animationState: 'idle',
            animationProgress: 0
        });

        previousSegmentDurationDays = currentDurationDays; // Update for the next segment's comparison
    }
    console.log("-> prepareRaceData: Data segments created successfully with stable visual durations.", segments);
    return segments;
}

export function drawChart(financialMilestones, chartCtx) {
    const allDates = Object.keys(financialMilestones);
    const allValues = Object.values(financialMilestones);
    const maxValue = Math.max(...allValues, 0);
    const maxY = Math.ceil((maxValue + CHART_Y_STEP_SIZE) / CHART_Y_STEP_SIZE) * CHART_Y_STEP_SIZE;
    if (window.milestoneChart instanceof Chart) {
        window.milestoneChart.destroy();
    }
    window.milestoneChart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: allDates,
            datasets: [{
                label: 'Net Worth',
                data: allValues,
                borderColor: '#28a745',
                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                fill: true, tension: 0.4, pointRadius: 5, pointBackgroundColor: '#1a4f78'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Date Achieved' } },
                y: {
                    title: { display: true, text: 'Financial Value (USD)' },
                    min: 0, max: maxY,
                    ticks: {
                        stepSize: CHART_Y_STEP_SIZE,
                        callback: function(value) { return '$' + value.toLocaleString(); }
                    }
                }
            }
            ,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Haul Progress Over Time', font: { size: 16 } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) { label += ': '; }
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.raw);
                            return label;
                        }
                    }
                }
            }
        }
    });
}
export function generateSummaryTable(raceSegments, tableBody) {
    tableBody.innerHTML = '';
    for (let i = 1; i < raceSegments.length; i++) {
        const segment = raceSegments[i];
        const row = tableBody.insertRow();
        row.insertCell().textContent = segment.durationDays.toLocaleString();
        row.insertCell().textContent = segment.label;
    }
}