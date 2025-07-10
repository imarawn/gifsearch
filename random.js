async function fetchRandomEmotes() {
    cleanupFavoritesView()
    const results = document.getElementById('results');
    results.innerHTML = '🔄 Loading...';

    const { data, error } = await supabase
        .from('random_emotes')
        .select('*')
        .eq('is_visible', true)
        .limit(100);

    results.innerHTML = '';
    if (error || !data?.length) {
        results.textContent = '⚠️ No emotes found.';
        return;
    }

    data.forEach(emote => {
        emoteCard(emote, results, {
            isFavorite: true,
            editableList: false,
        });
    });
}
