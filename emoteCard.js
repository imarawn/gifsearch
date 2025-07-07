function emoteCard(emote, targetElement, {
    onRemove,
    onUpdateList,
    editableList,
    isFavoriteView = false,
    isHistoryView = false,
} = {}) {
    const card = document.createElement('div');
    card.className = 'emote-card';

    // --- Favorite Button ---
    const favBtn = document.createElement('button');
    favBtn.className = 'fav-btn';
    favBtn.innerHTML = isFavorited(emote) ? '⭐' : '☆';
    favBtn.title = isFavoriteView ? 'Remove from Favorites' : 'Add to Favorites';

    favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isFavoriteView) {
            favBtn.classList.remove('active');
            card.remove();
            if (typeof onRemove === 'function') onRemove(emote);
        } else {
            if (!isFavorited(emote)) {
                showListModal(emote, async (list) => {
                    const finalEmote = {...emote, list};

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
                            username_hash
                        });
                    } else {
                        const current = JSON.parse(localStorage.getItem('emoteFavorites') || '[]');
                        const exists = current.find(e => e.slug === finalEmote.slug);
                        if (!exists) {
                            localStorage.setItem('emoteFavorites', JSON.stringify([...current, finalEmote]));
                        }
                    }

                    favBtn.textContent = '⭐';
                });
            }
        }
    });
    card.appendChild(favBtn);

    // --- Emote Image + Hover Zoom Button ---
    const imgWrapper = document.createElement('div');
    imgWrapper.style.position = 'relative';
    imgWrapper.className = 'img-wrapper';

    const img = document.createElement('img');
    img.src = emote.url;
    img.alt = emote.slug;
    imgWrapper.appendChild(img);

    const zoomBtn = document.createElement('button');
    zoomBtn.className = 'zoom-btn';
    zoomBtn.textContent = '🔍';
    zoomBtn.title = 'Zoom';
    zoomBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openImageModal(emote.url);
    });
    imgWrapper.appendChild(zoomBtn);

    card.appendChild(imgWrapper);

    img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        card.style.backgroundColor = (width > 250 || height > 80)
            ? '#330000' : '#002200';
    };

    // --- Slug ---
    const slug = document.createElement('div');
    slug.className = 'slug';
    slug.textContent = `:${emote.slug}`;
    card.appendChild(slug);

    // --- Editable List Input ---
    if (editableList) {
        const listInput = document.createElement('input');
        listInput.className = 'list';
        listInput.type = 'text';
        listInput.value = emote.list || 'Unsorted';
        listInput.placeholder = 'List';
        listInput.addEventListener('change', (e) => {
            const newList = e.target.value.trim();
            if (typeof onUpdateList === 'function') {
                onUpdateList(emote, newList);
            }
        });
        card.appendChild(listInput);
    }

    // --- Click to copy slug + add to history ---
    card.style.cursor = 'pointer';
    card.title = 'Click to copy slug';
    card.addEventListener('click', () => {
        const slugToCopy = `:${emote.slug}`;
        navigator.clipboard.writeText(slugToCopy).then(() => {
            card.classList.add('copied');
            setTimeout(() => card.classList.remove('copied'), 1000);
        });

        const history = JSON.parse(localStorage.getItem('emoteHistory') || '[]');
        const alreadyIn = history.some(e => e.slug === emote.slug);
        if (!alreadyIn) {
            history.push({
                slug: emote.slug,
                url: emote.url,
                search_slug: emote.search_slug || emote.slug,
                timestamp: Date.now()
            });
            localStorage.setItem('emoteHistory', JSON.stringify(history));
        }
    });

    if (isHistoryView) {
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.className = 'delete-btn';
        deleteBtn.title = 'Remove from history';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            card.remove();

            const fullHistory = JSON.parse(localStorage.getItem('emoteHistory') || '[]');
            const filtered = fullHistory.filter(h => h.slug !== emote.slug);
            localStorage.setItem('emoteHistory', JSON.stringify(filtered));
        });
        card.appendChild(deleteBtn);
    }


    targetElement.appendChild(card);
}
