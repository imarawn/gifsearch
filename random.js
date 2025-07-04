async function fetchRandomEmotes() {
    const results = document.getElementById('results');
    results.innerHTML = '🔄 Loading...';

    const { data, error } = await supabase
        .from('random_emotes')
        .select('*')
        .eq('is_visible', true)
        .limit(40);

    results.innerHTML = '';
    if (error || !data?.length) {
        results.textContent = '⚠️ No emotes found.';
        return;
    }

    data.forEach(emote => {
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


        card.style.cursor = 'pointer';
        card.title = 'Click to copy slug';
        card.addEventListener('click', () => {
            const slugToCopy = `:${emote.search_slug}`;
            navigator.clipboard.writeText(slugToCopy).then(() => {
                card.style.outline = '2px solid var(--accent)';
                setTimeout(() => {
                    card.style.outline = 'none';
                }, 1000);
            });

            const saved = JSON.parse(localStorage.getItem('emoteHistory') || '[]');

            if (!saved.find(e => e.slug === emote.slug)) {
                saved.push({
                    slug: emote.slug,
                    search_slug: emote.search_slug,
                    url: emote.url,
                    timestamp: Date.now()
                });
                localStorage.setItem('emoteHistory', JSON.stringify(saved));
            }
        });


        results.appendChild(card);
    });
}
