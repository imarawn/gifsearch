function renderFavoritesView() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '📦 Lade Favoriten...';

    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    resultsDiv.innerHTML = '';

    if (!favorites.length) {
        resultsDiv.textContent = '🕳️ Keine Favoriten gespeichert.';
        return;
    }

    favorites.forEach(emote => {
        const card = document.createElement('div');
        card.className = 'emote-card';

        const img = document.createElement('img');
        img.src = emote.url;
        card.appendChild(img);

        img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;

            if (width > 250 || height > 80) {
                card.style.backgroundColor = '#004444'; // large
            } else {
                card.style.backgroundColor = '#002200'; // normal
            }
        };

        const slug = document.createElement('div');
        slug.className = 'emote-slug';
        slug.textContent = `:${emote.slug}`;
        card.appendChild(slug);

        card.style.cursor = 'pointer';
        card.title = 'Click to copy slug';
        card.addEventListener('click', () => {
            const textToCopy = `:${emote.slug}`;
            navigator.clipboard.writeText(textToCopy).then(() => {
                card.style.outline = '2px solid var(--accent)';
                setTimeout(() => {
                    card.style.outline = 'none';
                }, 1000);
            });
        });

        resultsDiv.appendChild(card);
    });
}
