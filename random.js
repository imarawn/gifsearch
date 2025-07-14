async function fetchRandomEmotes(count = 40) {
    cleanupFavoritesView();
    const results = document.getElementById('results');
    results.innerHTML = '🔄 Loading...';

    // 🔘 Add toggle only once
    if (!document.getElementById('toggle-nsfw')) {
        const toggleWrapper = document.createElement('div');
        toggleWrapper.style.marginBottom = '1rem';

        toggleWrapper.innerHTML = `
            <label style="cursor:pointer;">
                <input type="checkbox" id="toggle-nsfw" style="margin-left: 1rem" />
                Show NSFW Emotes
            </label>
        `;

        results.parentElement?.insertBefore(toggleWrapper, results);

        // Optional: Reload on toggle change
        document.getElementById('toggle-nsfw').addEventListener('change', () => {
            fetchRandomEmotes(count);
        });
    }

    const showNSFW = document.getElementById('toggle-nsfw')?.checked;
    const tableName = showNSFW ? 'random_emotes_nsfw' : 'random_emotes';

    const { data, error } = await supabase
        .from(tableName)
        .select('*')
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


document.getElementById('toggle-nsfw')?.addEventListener('change', () => {
    fetchRandomEmotes();
});