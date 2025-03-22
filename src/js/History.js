import { renderHistory } from './UI.js';

export function addToHistory(gifOrSlug, isGif = true) {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    let historyEntry = isGif ? { type: 'gif', gif: gifOrSlug , url: ''} : { type: 'slug', slug: gifOrSlug };

    history.unshift(historyEntry);
    if (history.length > 100) history.pop();

    localStorage.setItem('history', JSON.stringify(history));
    renderHistory();
}

export function deleteHistory() {
    const historyDiv = document.getElementById('history')?.querySelector('.history-content');
    if (!historyDiv) return;

    historyDiv.classList.add('shrink');
    historyDiv.addEventListener('transitionend', function handleShrink(event) {
        if (event.propertyName === 'transform') {
            historyDiv.removeEventListener('transitionend', handleShrink);
            localStorage.removeItem('history');
            historyDiv.classList.remove('shrink');
            renderHistory();
        }
    });
}
