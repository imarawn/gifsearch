async function renderUserGifs(table_name) {
    cleanupFavoritesView()
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    try {
        const { data: gifs, error } = await supabase
            .from(table_name)
            .select('slug, url');

        if (error) {
            console.error('Error fetching GIFs:', error);
            resultsDiv.innerHTML = '<p>Error fetching GIFs. Please try again later.</p>';
            return;
        }

        if (!gifs || gifs.length === 0) {
            resultsDiv.innerHTML = '<p>No GIFs found for this user.</p>';
            return;
        }

        gifs.forEach(emote => {
                emoteCard(emote, resultsDiv);
            });
    } catch (err) {
        console.error('Unexpected error fetching GIFs:', err);
        resultsDiv.innerHTML = '<p>An unexpected error occurred. Please try again later.</p>';
    }
}
