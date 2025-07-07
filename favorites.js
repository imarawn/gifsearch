async function renderFavoritesView() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '📦 Loading Favorites...';

    const secret = localStorage.getItem('emote_secret')?.trim();
    const username = localStorage.getItem('emote_username')?.trim();
    const password = localStorage.getItem('emote_password')?.trim();

    let remoteFavorites = [];
    let localFavorites = JSON.parse(localStorage.getItem('emoteFavorites') || '[]');

    let usingRemote = false;
    let username_hash = null;

    if (secret && username && password) {
        usingRemote = true;
        username_hash = await getUserHash(username, password);

        const { data, error } = await supabase
            .from('user_favorites')
            .select('slug, url, list')
            .eq('username_hash', username_hash)
            .eq('secret_key', secret);

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

    const removeFavorite = async (emote) => {
        if (usingRemote && username_hash) {
            await supabase
                .from('user_favorites')
                .delete()
                .eq('slug', emote.slug)
                .eq('username_hash', username_hash)
                .eq('secret_key', secret);
        } else {
            const updated = localFavorites.filter(e => e.slug !== emote.slug);
            localStorage.setItem('emoteFavorites', JSON.stringify(updated));
        }
    };

    const updateList = async (emote, newList) => {
        if (usingRemote && username_hash) {
            await supabase
                .from('user_favorites')
                .update({ list: newList })
                .eq('slug', emote.slug)
                .eq('username_hash', username_hash)
                .eq('secret_key', secret);
        } else {
            const index = localFavorites.findIndex(e => e.slug === emote.slug);
            if (index !== -1) {
                localFavorites[index].list = newList;
                localStorage.setItem('emoteFavorites', JSON.stringify(localFavorites));
            }
        }
    };

    allFavorites.forEach(emote => {
        emoteCard(emote, resultsDiv, {
            isFavoriteView: true,
            editableList: true,
            onRemove: removeFavorite,
            onUpdateList: updateList
        });
    });
}

function saveToFavorites(emote) {
    showListModal(emote, async (list) => {
        const finalEmote = { ...emote, list };
        const secret = localStorage.getItem('emote_secret')?.trim();
        const username = localStorage.getItem('emote_username')?.trim();
        const password = localStorage.getItem('emote_password')?.trim();

        if (secret && username && password) {
            const username_hash = await getUserHash(username, password);
            await supabase.from('user_favorites').insert({
                slug: finalEmote.slug,
                url: finalEmote.url,
                list: finalEmote.list,
                secret_key: secret,
                username_hash: username_hash
            });
        } else {
            const current = JSON.parse(localStorage.getItem('emoteFavorites') || '[]');
            const exists = current.find(e => e.slug === finalEmote.slug);
            if (!exists) {
                localStorage.setItem('emoteFavorites', JSON.stringify([...current, finalEmote]));
            }
        }

    });
}
