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
