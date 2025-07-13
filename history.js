function showHistory() {
    cleanupFavoritesView()
    const results = document.getElementById('results');
    results.innerHTML = '📜 Loading history...';

    const history = JSON.parse(localStorage.getItem('emoteHistory') || '[]').reverse();
    results.innerHTML = '';

    if (!history.length) {
        results.textContent = '🕳 No emotes in history yet.';
        return;
    }

    history.forEach(emote => {
        emoteCard({
            ...emote,
            slug: emote.search_slug
        }, results, {
            isHistoryView: true
        });
    });
}
