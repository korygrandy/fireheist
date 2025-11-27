// Strategy Guide Module - 90s Gaming Magazine Style!
// "The Complete Unauthorized Guide to Financial Freedom!"

let guideData = null;
let isGuideOpen = false;

/**
 * Load the strategy guide data from JSON
 */
async function loadGuideData() {
    if (guideData) return guideData;
    
    try {
        const response = await fetch('./js/data/strategy-guide.json');
        guideData = await response.json();
        console.log("-> Strategy Guide: Data loaded successfully!");
        return guideData;
    } catch (error) {
        console.error("-> Strategy Guide: Failed to load data:", error);
        return null;
    }
}

/**
 * Close the strategy guide
 */
export function closeStrategyGuide() {
    const container = document.getElementById('strategyGuideContainer');
    const toggleLink = document.getElementById('strategyGuideToggle');
    
    if (!container) return;
    
    container.classList.add('hidden');
    container.innerHTML = '';
    isGuideOpen = false;
    if (toggleLink) toggleLink.textContent = '📖 Official Strategy Guide';
}

/**
 * Toggle the strategy guide visibility
 */
export async function toggleStrategyGuide() {
    const container = document.getElementById('strategyGuideContainer');
    const toggleLink = document.getElementById('strategyGuideToggle');
    
    if (!container) {
        console.error("-> Strategy Guide: Container not found!");
        return;
    }
    
    if (isGuideOpen) {
        // Close the guide
        closeStrategyGuide();
    } else {
        // Open the guide
        await renderStrategyGuide();
        container.classList.remove('hidden');
        isGuideOpen = true;
        if (toggleLink) toggleLink.textContent = '📕 Close Strategy Guide';
        
        // Smooth scroll to the guide
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Render the complete strategy guide
 */
async function renderStrategyGuide() {
    const container = document.getElementById('strategyGuideContainer');
    if (!container) return;
    
    const data = await loadGuideData();
    if (!data) {
        container.innerHTML = '<p class="text-center text-red-500 p-8">Failed to load Strategy Guide. Please try again!</p>';
        return;
    }
    
    container.innerHTML = `
        ${renderFloatingCloseButton()}
        ${renderCover(data.meta)}
        ${renderTableOfContents(data.tableOfContents)}
        ${renderChapters(data.chapters)}
        ${renderBackCover()}
    `;
    
    // Initialize accordion behavior and close button
    initAccordions();
    initCloseButton();
}

/**
 * Render floating close button
 */
function renderFloatingCloseButton() {
    return `
        <button id="strategyGuideCloseBtn" class="strategy-guide-close-btn" title="Close Strategy Guide">
            ✕
        </button>
    `;
}

/**
 * Initialize close button event listener
 */
function initCloseButton() {
    const closeBtn = document.getElementById('strategyGuideCloseBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeStrategyGuide);
    }
}

/**
 * Render the cover page
 */
function renderCover(meta) {
    return `
        <div class="guide-cover">
            <div class="guide-cover-badge">OFFICIAL</div>
            <div class="guide-cover-title">${meta.title}</div>
            <div class="guide-cover-subtitle">${meta.subtitle}</div>
            <div class="guide-cover-decoration">
                <span>🎮</span>
                <span>💰</span>
                <span>🔥</span>
                <span>⭐</span>
                <span>🏆</span>
            </div>
            <div class="guide-cover-edition">${meta.edition}</div>
            <div class="guide-cover-quote">${meta.coverQuote}</div>
            <div class="guide-cover-publisher">${meta.publisher} © ${meta.year}</div>
        </div>
    `;
}

/**
 * Render table of contents
 */
function renderTableOfContents(toc) {
    const entries = toc.map(item => `
        <div class="toc-entry" data-chapter="${item.id}">
            <span class="toc-title">${item.title}</span>
            <span class="toc-dots"></span>
            <span class="toc-page">pg. ${item.page}</span>
        </div>
    `).join('');
    
    return `
        <div class="guide-toc">
            <h2 class="toc-header">📑 TABLE OF CONTENTS</h2>
            <div class="toc-entries">${entries}</div>
            <div class="toc-footer">
                <span>🎮 Quick Tip: Click any chapter to jump directly to it! 🎮</span>
            </div>
        </div>
    `;
}

/**
 * Render all chapters
 */
function renderChapters(chapters) {
    return Object.entries(chapters).map(([id, chapter]) => 
        renderChapter(id, chapter)
    ).join('');
}

/**
 * Render a single chapter
 */
function renderChapter(id, chapter) {
    const contentHtml = chapter.content.map(item => renderContentItem(item)).join('');
    
    return `
        <div class="guide-chapter" id="chapter-${id}">
            <div class="chapter-header" data-accordion="${id}">
                <div class="chapter-icon">${chapter.icon}</div>
                <div class="chapter-title-group">
                    <h2 class="chapter-title">${chapter.title}</h2>
                    <p class="chapter-subtitle">${chapter.subtitle}</p>
                </div>
                <div class="chapter-toggle">▼</div>
            </div>
            <div class="chapter-content" id="content-${id}">
                ${contentHtml}
                <div class="chapter-footer">
                    <span>— End of Chapter —</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render individual content items
 */
function renderContentItem(item) {
    switch (item.type) {
        case 'intro':
            return `<p class="guide-intro">${formatText(item.text)}</p>`;
            
        case 'section':
            return `
                <div class="guide-section">
                    <h3 class="section-title">${item.title}</h3>
                    <p class="section-text">${formatText(item.text)}</p>
                </div>
            `;
            
        case 'callout':
            return renderCallout(item);
            
        case 'skill':
            return renderSkill(item);
            
        case 'tier':
            return renderTier(item);
            
        case 'unlock':
            return renderUnlock(item);
            
        case 'tip':
            return renderTip(item);
            
        case 'secret':
            return renderSecret(item);
            
        case 'persona':
            return renderPersona(item);
            
        default:
            return `<p>${item.text || ''}</p>`;
    }
}

/**
 * Render callout boxes
 */
function renderCallout(item) {
    const styleClass = {
        'protip': 'callout-protip',
        'warning': 'callout-warning',
        'secret': 'callout-secret'
    }[item.style] || 'callout-protip';
    
    return `
        <div class="guide-callout ${styleClass}">
            <div class="callout-title">${item.title}</div>
            <div class="callout-text">${formatText(item.text)}</div>
        </div>
    `;
}

/**
 * Render skill cards
 */
function renderSkill(item) {
    return `
        <div class="guide-skill-card">
            <div class="skill-header">
                <span class="skill-emoji">${item.emoji}</span>
                <span class="skill-name">${item.name}</span>
                ${item.rating ? `<span class="skill-rating">${item.rating}</span>` : ''}
            </div>
            <div class="skill-body">
                ${item.keys ? `<div class="skill-keys">🎮 <strong>Controls:</strong> ${item.keys}</div>` : ''}
                <div class="skill-energy">⚡ <strong>Energy:</strong> ${item.energy}</div>
                <p class="skill-description">${formatText(item.description)}</p>
                ${item.unlockHint ? `<div class="skill-unlock-hint">🔓 <em>${item.unlockHint}</em></div>` : ''}
            </div>
        </div>
    `;
}

/**
 * Render tier cards
 */
function renderTier(item) {
    const colorClass = `tier-${item.color}`;
    return `
        <div class="guide-tier-card ${colorClass}">
            <div class="tier-header">
                <span class="tier-name">${item.name}</span>
                <span class="tier-multiplier">${item.multiplier} Cash!</span>
            </div>
            <p class="tier-description">${formatText(item.description)}</p>
            <div class="tier-examples">
                <strong>Examples:</strong> ${item.examples}
            </div>
        </div>
    `;
}

/**
 * Render unlock entries
 */
function renderUnlock(item) {
    return `
        <div class="guide-unlock-entry">
            <div class="unlock-header">
                <span class="unlock-skill">${item.skill}</span>
                <span class="unlock-tier tier-badge-${item.tier.toLowerCase()}">${item.tier}</span>
                <span class="unlock-difficulty">${item.difficulty}</span>
            </div>
            <p class="unlock-hint">${item.hint}</p>
        </div>
    `;
}

/**
 * Render tips
 */
function renderTip(item) {
    return `
        <div class="guide-tip">
            <div class="tip-title">💡 ${item.title}</div>
            <p class="tip-text">${formatText(item.text)}</p>
        </div>
    `;
}

/**
 * Render secrets
 */
function renderSecret(item) {
    return `
        <div class="guide-secret">
            <div class="secret-header">
                <span class="secret-icon">🔮</span>
                <span class="secret-name">${item.name}</span>
                <span class="secret-discovered">${item.discovered}</span>
            </div>
            <p class="secret-hint">${formatText(item.hint)}</p>
        </div>
    `;
}

/**
 * Render persona cards
 */
function renderPersona(item) {
    return `
        <div class="guide-persona-card">
            <div class="persona-header">
                <span class="persona-emoji">${item.emoji}</span>
                <span class="persona-name">${item.name}</span>
                <span class="persona-difficulty">${item.difficulty}</span>
            </div>
            <p class="persona-hint">🔓 ${item.hint}</p>
            <p class="persona-special">✨ ${item.special}</p>
        </div>
    `;
}

/**
 * Render back cover
 */
function renderBackCover() {
    return `
        <div class="guide-back-cover">
            <div class="back-cover-logo">🔥 FIRE HEIST 🔥</div>
            <div class="back-cover-tagline">"Heist Your Way to Financial Independence!"</div>
            <div class="back-cover-features">
                <span>✓ Complete Skill Guide</span>
                <span>✓ All Unlock Secrets</span>
                <span>✓ Pro Tips & Combos</span>
                <span>✓ Hidden Easter Eggs</span>
            </div>
            <div class="back-cover-barcode">
                <div class="barcode-lines"></div>
                <span>ISBN 0-00000-FIRE-H</span>
            </div>
            <div class="back-cover-price">$19.99 USA / $24.99 CAN</div>
        </div>
    `;
}

/**
 * Format text with markdown-like syntax
 */
function formatText(text) {
    if (!text) return '';
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');
}

/**
 * Initialize accordion behavior for chapters
 */
function initAccordions() {
    const headers = document.querySelectorAll('.chapter-header[data-accordion]');
    
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const id = header.dataset.accordion;
            const content = document.getElementById(`content-${id}`);
            const toggle = header.querySelector('.chapter-toggle');
            
            if (content.classList.contains('collapsed')) {
                content.classList.remove('collapsed');
                toggle.textContent = '▼';
            } else {
                content.classList.add('collapsed');
                toggle.textContent = '▶';
            }
        });
    });
    
    // Make TOC entries clickable
    const tocEntries = document.querySelectorAll('.toc-entry');
    tocEntries.forEach(entry => {
        entry.addEventListener('click', () => {
            const chapterId = entry.dataset.chapter;
            const chapter = document.getElementById(`chapter-${chapterId}`);
            if (chapter) {
                // Expand the chapter if collapsed
                const content = chapter.querySelector('.chapter-content');
                const toggle = chapter.querySelector('.chapter-toggle');
                if (content && content.classList.contains('collapsed')) {
                    content.classList.remove('collapsed');
                    toggle.textContent = '▼';
                }
                // Scroll to chapter
                chapter.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

/**
 * Initialize the strategy guide system
 */
export function initStrategyGuide() {
    const toggleLink = document.getElementById('strategyGuideToggle');
    
    if (toggleLink) {
        toggleLink.addEventListener('click', (e) => {
            e.preventDefault();
            toggleStrategyGuide();
        });
        console.log("-> Strategy Guide: Initialized!");
    }
}
