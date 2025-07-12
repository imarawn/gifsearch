async function fetchRandomEmotes(count = 100) {
    cleanupFavoritesView()
    const results = document.getElementById('results');
    results.innerHTML = '🔄 Loading...';

    const { data, error } = await supabase
        .from('random_emotes')
        .select('*')
        .eq('is_visible', true)
        .limit(count);

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
