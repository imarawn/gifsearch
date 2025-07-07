const SUPABASE_URL = 'https://wocqopootglovmnhxcjw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY3FvcG9vdGdsb3Ztbmh4Y2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNTA4MjYsImV4cCI6MjA1MzYyNjgyNn0.YsKQxWGBhlB6qCVIoRok9DXUzYQTts6lx_lo8Ps8utU';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function isFavorited(emote) {
    const favs = JSON.parse(localStorage.getItem('emoteFavorites') || '[]');
    return favs.some(f => f.slug === emote.slug);
}

async function handleFavorite(emote, button) {
    const secret = localStorage.getItem('emote_secret')?.trim();
    const username = localStorage.getItem('emote_username')?.trim();
    const password = localStorage.getItem('emote_password')?.trim();

    const fallbackToLocal = () => {
        saveLocally(emote);
        button.textContent = '⭐';
    };

    if (secret && username && password && supabase) {
        try {
            const username_hash = await getUserHash(username, password);

            const { error } = await supabase.from('user_favorites').insert({
                slug: emote.slug,
                url: emote.url,
                username_hash,
                secret_key: secret
            });

            if (error) {
                console.error('❌ Error saving favorite to Supabase:', error);
                fallbackToLocal();
                return;
            }

            console.log('✅ Favorite saved to Supabase');
            button.textContent = '⭐'; // optional
        } catch (err) {
            console.error('❌ Supabase save error:', err);
            fallbackToLocal();
        }
    } else {
        fallbackToLocal();
    }
}

function saveLocally(emote) {
    const fav = {
        slug: emote.slug,
        url: emote.url,
        timestamp: Date.now(),
    };

    const saved = JSON.parse(localStorage.getItem('emoteFavorites') || '[]');
    if (!saved.find(e => e.slug === fav.slug)) {
        saved.push(fav);
        localStorage.setItem('emoteFavorites', JSON.stringify(saved));
        console.log('⭐ Favorite saved locally');
    }
}

async function searchAndDisplayEmotes(slug) {
    results.innerHTML = `🔄 Loading emotes for: <strong>${slug}</strong>`;

    try {
        const apiUrl = `https://wocqopootglovmnhxcjw.supabase.co/functions/v1/proxy-emotes?slug=${encodeURIComponent(slug)}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Proxy fetch failed: ${response.status}`);
        const data = await response.json();

        const emotes = data.emoticons || [];
        results.innerHTML = '';

        if (emotes.length === 0) {
            results.textContent = '❌ No emotes found.';
            return;
        }

        emotes.forEach(emote => {
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
    } catch (e) {
        console.error('❌ Error while fetching emotes:', e);
        results.textContent = '❌ Error loading emotes.';
    }
}

const input = document.getElementById('manual-slug-input2');
const results = document.getElementById('results');

let debounce;
input.addEventListener('input', () => {
    clearTimeout(debounce);
    const slug = input.value.trim();
    if (slug.length < 2) return;
    debounce = setTimeout(() => {
        searchAndDisplayEmotes(slug);
    }, 300);
});

async function autoMigrateEmotes({
                                     fromKey = 'favorites',
                                     toLocalKey = 'emoteFavorites'
                                 } = {}) {
    const oldData = JSON.parse(localStorage.getItem(fromKey) || '[]');
    const statusDiv = document.getElementById('transfer-status');
    if (!oldData.length) {
        statusDiv.textContent = '❌ No emotes to migrate.';
        return;
    }

    const username = document.getElementById('emote-username').value.trim();
    const password = document.getElementById('emote-password').value.trim();
    const secret = document.getElementById('emote-secret').value.trim();
    const username_hash = await getUserHash(username, password);

    if (!username || !password || !secret) {
        localStorage.setItem(toLocalKey, JSON.stringify(oldData));
        statusDiv.textContent = `✅ Migrated ${oldData.length} to local storage`;
        return;
    }

    if (username_hash && secret) {
        try {
            let inserted = 0;

            for (let i = 0; i < oldData.length; i++) {
                const emote = oldData[i];
                const { slug, url } = emote;

                statusDiv.textContent = `Uploading ${i + 1} / ${oldData.length}`;

                const { error } = await supabase.from('user_favorites').insert({
                    slug,
                    url,
                    username_hash,
                    secret_key: secret
                });

                if (error) {
                    console.warn(`⚠️ Error inserting ${slug}:`, error.message);
                    continue;
                }

                inserted++;
            }

            statusDiv.textContent = `✅ Uploaded ${inserted} emotes to Supabase`;
        } catch (e) {
            console.warn('⚠️ Supabase sync failed, fallback to localStorage', e.message);
            statusDiv.textContent = `❌ Failed: ${e.message}`;
        }
    } else {
        statusDiv.textContent = '⚠️ Missing credentials';
    }
}


function showListModal(emote, onConfirm) {
    const modal = document.getElementById('listModal');
    const input = document.getElementById('listInput');
    const cancel = document.getElementById('listCancel');
    const confirm = document.getElementById('listConfirm');

    input.value = emote.list || '';
    modal.style.display = 'flex';
    input.focus();

    const cleanup = () => {
        modal.style.display = 'none';
        confirm.onclick = null;
        cancel.onclick = null;
    };

    cancel.onclick = () => cleanup();

    confirm.onclick = () => {
        const list = input.value.trim() || 'Unsorted';
        onConfirm(list);
        cleanup();
    };
}

function openImageModal(url) {
    let modal = document.getElementById('zoomModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'zoomModal';
        modal.style.position = 'fixed';
        modal.style.top = 0;
        modal.style.left = 0;
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.background = 'rgba(0, 0, 0, 0.9)';
        modal.style.display = 'flex';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        modal.style.zIndex = 10000;
        modal.style.cursor = 'zoom-out';
        modal.addEventListener('click', () => modal.remove());

        const img = document.createElement('img');
        img.style.maxWidth = '90vw';
        img.style.maxHeight = '90vh';
        img.style.border = '2px solid white';
        img.style.borderRadius = '10px';
        modal.appendChild(img);

        document.body.appendChild(modal);
    }

    modal.querySelector('img').src = url;
    modal.style.display = 'flex';
}


