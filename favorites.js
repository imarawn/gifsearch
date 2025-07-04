async function renderFavoritesView() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '📦 Loading Favorites...';

    const secret = localStorage.getItem('emote_secret')?.trim();
    const username = localStorage.getItem('emote_username')?.trim();
    const password = localStorage.getItem('emote_password')?.trim();

    let remoteFavorites = [];
    let localFavorites = JSON.parse(localStorage.getItem('emoteFavorites') || '[]');

    if (secret && username && password) {
        const username_hash = await getUserHash(username, password);

        const { data, error } = await supabase
            .from('user_favorites')
            .select('slug, url')
            .eq('username_hash', username_hash)
            .eq('secret_key', secret)

        if (error) {
            console.error('❌ Failed to fetch remote favorites:', error);
        } else {
            remoteFavorites = data || [];
        }
    }

    const allFavorites = [...remoteFavorites, ...localFavorites];

    if (!allFavorites.length) {
        resultsDiv.textContent = '🕳️ No Favorites saved.';
        return;
    }

    resultsDiv.innerHTML = '';

    allFavorites.forEach(emote => {
        const card = document.createElement('div');
        card.className = 'emote-card';

        const img = document.createElement('img');
        img.src = emote.url;
        card.appendChild(img);

        img.onload = () => {
            const width = img.naturalWidth;
            const height = img.naturalHeight;

            card.style.backgroundColor = (width > 250 || height > 80)
                ? '#330000'
                : '#002200';
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