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
        }, results, {
            isHistoryView: true
        });
    });
}
