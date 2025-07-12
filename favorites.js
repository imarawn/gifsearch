async function renderFavoritesView(selectedList = '', pickerDiv = 'userGifs') {
    cleanupFavoritesView()
    const resultsDiv = document.getElementById('results');
    const userGifDiv = document.getElementById(pickerDiv);
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
    const excludedLists = JSON.parse(localStorage.getItem('emote_exclude_lists') || '[]');

    const filteredFavorites = allFavorites.filter(f => {
        return !excludedLists.includes(f.list || '');
    });

    if (!allFavorites.length) {
        resultsDiv.textContent = '🕳️ No Favorites saved.';
        return;
    }

    const lists = [...new Set(allFavorites.map(f => f.list || ''))].sort();
    localStorage.setItem('emoteAvailableLists', JSON.stringify(lists));

    resultsDiv.innerHTML = '';

    const filterContainer = document.createElement('div');
    filterContainer.id = 'favorites-filter-container';

    const listFilter = document.createElement('select');
    listFilter.id = 'listFilter';
    listFilter.className = 'dropdown';

    listFilter.innerHTML = `
    <option value="">🔍 Show All Lists</option>
    <option value="__NO_LIST__">📂 (No List)</option>
    ${lists
        .filter(list => list !== '')
        .map(list => `<option value="${list}">${list}</option>`)
        .join('')}
`;

    listFilter.value = selectedList;
    filterContainer.appendChild(listFilter);
    userGifDiv.appendChild(filterContainer);

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
        renderFavoritesView();
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
        const selectedList = listFilter?.value;
        renderFavoritesView(selectedList);
    };

    const renderFilteredEmotes = () => {
        const selectedList = listFilter.value;
        let filtered;

        if (selectedList === '__NO_LIST__') {
            filtered = allFavorites.filter(f => !f.list || f.list.trim() === '');
        } else if (selectedList) {
            filtered = allFavorites.filter(f => (f.list || '') === selectedList);
        } else {
            filtered = filteredFavorites;
        }


        filtered.sort((a, b) => {
            if (!a.list) return 1;
            if (!b.list) return -1;
            return a.list.localeCompare(b.list);
        });

        document.querySelectorAll('.emote-card').forEach(e => e.remove());

        if (!filtered.length) {
            resultsDiv.innerHTML += '<div>🕳️ No Favorites found for this list.</div>';
            return;
        }

        filtered.forEach(emote => {
            emoteCard(emote, resultsDiv, {
                isFavoriteView: true,
                editableList: true,
                onRemove: removeFavorite,
                onUpdateList: updateList
            });
        });
    };

    listFilter.addEventListener('change', renderFilteredEmotes);
    renderFilteredEmotes();
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
