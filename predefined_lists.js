async function renderUserGifs(table_name) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    try {
        const { data: gifs, error } = await supabase
            .from(table_name)
            .select('slug, url');

        if (error) {
            console.error('Error fetching GIFs:', error);
            resultsDiv.innerHTML = '<p>Error fetching GIFs. Please try again later.</p>';
            return;
        }

        if (!gifs || gifs.length === 0) {
            resultsDiv.innerHTML = '<p>No GIFs found for this user.</p>';
            return;
        }

        gifs.forEach(emote => {
            const card = document.createElement('div');
            card.className = 'emote-card';

            const img = document.createElement('img');
            img.src = emote.url;
            card.appendChild(img);

            img.onload = () => {
                const width = img.naturalWidth;
                const height = img.naturalHeight;

                if (width > 250 || height > 80) {
                    card.style.backgroundColor = '#330000'; // large
                } else {
                    card.style.backgroundColor = '#003300'; // normal
                }
            };

            const slug = document.createElement('div');
            slug.className = 'emote-slug';
            slug.textContent = `:${emote.slug}`;
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

            // ✅ Click-to-copy logic
            card.style.cursor = 'pointer';
            card.title = 'Click to copy slug';
            card.addEventListener('click', () => {
                const slugToCopy = `:${emote.slug}`;
                navigator.clipboard.writeText(slugToCopy).then(() => {
                    card.style.outline = '2px solid var(--accent)';
                    setTimeout(() => {
                        card.style.outline = 'none';
                    }, 1000);
                });

                // ✅ Store to localStorage
                const saved = JSON.parse(localStorage.getItem('emoteHistory') || '[]');
                if (!saved.find(e => e.slug === emote.slug)) {
                    saved.push({
                        slug: emote.slug,
                        search_slug: emote.slug,
                        url: emote.url,
                        timestamp: Date.now()
                    });
                    localStorage.setItem('emoteHistory', JSON.stringify(saved));
                }
            });

            resultsDiv.appendChild(card);
        });
    } catch (err) {
        console.error('Unexpected error fetching GIFs:', err);
        resultsDiv.innerHTML = '<p>An unexpected error occurred. Please try again later.</p>';
    }
}
