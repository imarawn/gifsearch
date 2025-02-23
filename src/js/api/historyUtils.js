function addToHistory(gifOrSlug, isGif = true) {
    const history = JSON.parse(localStorage.getItem('history')) || [];
    let historyEntry;

    if (isGif) {
        const gifWithId = {...gifOrSlug,};
        historyEntry = {type: 'gif', gif: gifWithId };
    } else {
        historyEntry = { type: 'slug', slug: gifOrSlug };
    }
    history.unshift(historyEntry);

    if (history.length > 100) {
        history.pop();
    }
    localStorage.setItem('history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const historyDiv = document.getElementById('history').querySelector('.history-content');
    const history = JSON.parse(localStorage.getItem('history')) || [];

    historyDiv.innerHTML = '';
    history.forEach((entry) => {
        if (entry.type === 'gif') {
            const emoteBox = document.createElement('div');
            emoteBox.className = 'emote-box';

            const displaySlug = entry.gif.slug;

            emoteBox.setAttribute('title', `:${displaySlug}`);
            emoteBox.innerHTML = `
                <img src="${entry.gif.url}" alt="${displaySlug}">
                <div class="emote-name">:${displaySlug}</div>
            `;
            emoteBox.addEventListener('click', () => {
                copyToClipboard(`:${displaySlug}`, entry.gif);
            });

            historyDiv.appendChild(emoteBox);

        } else if (entry.type === 'slug') {
            const slugBox = document.createElement('div');
            slugBox.classList = 'slug-box emote-box';
            slugBox.innerHTML = '';
            slugBox.textContent = `${entry.slug}`;
            slugBox.setAttribute('title', `:${entry.slug}`);

            slugBox.addEventListener('click', () => {
                navigator.clipboard.writeText(entry.slug);
                const manualInput = document.getElementById('manual-slug-input');
                manualInput.value = entry.slug;
            });

            historyDiv.appendChild(slugBox);
        }
    });
}

function deleteHistory() {
    const historyDiv = document.getElementById('history')?.querySelector('.history-content');

    if (!historyDiv) {
        return;
    }
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