function showHistory() {
    const results = document.getElementById('results');
    results.innerHTML = '📜 Loading history...';

    let history = JSON.parse(localStorage.getItem('emoteHistory') || '[]').reverse();

    results.innerHTML = '';

    if (!history.length) {
        results.textContent = '🕳 No emotes in history yet.';
        return;
    }

    history.forEach((emote, index) => {
        const card = document.createElement('div');
        card.className = 'emote-card';

        const img = document.createElement('img');
        img.src = emote.url;
        card.appendChild(img);

        img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;

            if (width > 250 || height > 80) {
                card.style.backgroundColor = '#330000'; // große Emotes
            } else {
                card.style.backgroundColor = '#003300';
            }
        };

        const slug = document.createElement('div');
        slug.className = 'emote-slug';
        slug.textContent = `:${emote.search_slug}`;
        card.appendChild(slug);

        const favBtn = document.createElement('button');
        favBtn.textContent = isFavorited(emote) ? '⭐' : '☆'; // ✅ required!
        favBtn.style.position = 'absolute';
        favBtn.style.top = '0.5rem';
        favBtn.style.right = '0.5rem';
        favBtn.style.background = 'transparent';
        favBtn.style.border = 'none';
        favBtn.style.fontSize = '1.5rem';
        favBtn.style.cursor = 'pointer';
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            handleFavorite(emote, favBtn);
        });
        card.appendChild(favBtn);

        // 🗑️ Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.style.marginTop = '0.5rem';
        deleteBtn.style.background = 'transparent';
        deleteBtn.style.border = 'none';
        deleteBtn.style.color = 'var(--accent)';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.title = 'Remove from history';

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // prevent triggering copy event if inside card

            // Remove from DOM
            card.remove();

            // Remove from localStorage
            const fullHistory = JSON.parse(localStorage.getItem('emoteHistory') || '[]');
            const filtered = fullHistory.filter(h => h.slug !== emote.slug);
            localStorage.setItem('emoteHistory', JSON.stringify(filtered));
        });

        card.appendChild(deleteBtn);
        results.appendChild(card);
    });
}
