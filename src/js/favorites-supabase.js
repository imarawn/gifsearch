async function showFavorites() {
    const desktopFavorites = document.getElementById('favorite-emotes');
    desktopFavorites.innerHTML = '';

    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.length === 0) {
        displayNoFavoritesMessage(desktopFavorites);
        return;
    }

    const sortedFavorites = favorites.sort((a, b) => a.slug.localeCompare(b.slug));

    sortedFavorites.forEach(emote => {
        displayEmote(emote, desktopFavorites);
        const star = document.querySelector('.favorite-button');
        star.addEventListener('click', () => {
            addToFavorites(emote);
        });
    });
}

function displayNoFavoritesMessage(container) {
    const noFavoritesMessage = document.createElement('p');
    noFavoritesMessage.textContent = 'No favorites added yet.';
    noFavoritesMessage.className = 'no-favorites-message';
    container.appendChild(noFavoritesMessage);
}

async function renderUserGifs(table_name) {
    const resultsDiv = document.getElementById('results'); // The div where the GIFs will be displayed

    // Clear previous results
    resultsDiv.innerHTML = '';
    // Fetch the GIFs from the user_emoticons table for the authenticated user
    try {
        const { data: gifs, error } = await supabase
            .from(table_name)
            .select('slug, url') // Fetch the slug and URL of the GIFs

        if (error) {
            console.error('Error fetching GIFs:', error);
            resultsDiv.innerHTML = '<p>Error fetching GIFs. Please try again later.</p>';
            return;
        }

        // If GIFs exist, display them
        if (gifs && gifs.length > 0) {
            gifs.forEach((gif) => {
                displayEmote(gif, resultsDiv); // Use the existing displayEmote function
            });
        } else {
            resultsDiv.innerHTML = '<p>No GIFs found for this user.</p>';
        }
    } catch (err) {
        console.error('Unexpected error fetching GIFs:', err);
        resultsDiv.innerHTML = '<p>An unexpected error occurred. Please try again later.</p>';
    }
}

function toggleFavorite(emote) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // Check if the emote is already in favorites
    const isAlreadyFavorited = favorites.some(favorite => favorite.slug === emote.slug);

    if (isAlreadyFavorited) {
        // If it is, remove it
        const updatedFavorites = favorites.filter(favorite => favorite.slug !== emote.slug);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        removeSingleFavorite(emote);
    } else {
        // If it's not, add it
        favorites.push(emote);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        syncSingleFavorite(emote);
    }

    updateFavoritesCounter(); // Update the favorites counter
    showFavorites(); // Refresh the favorites list
}


function openmobilefavorites() {
    const favoritesSection = document.getElementById('favorites');
    favoritesSection.classList.toggle('mobile-favorites-open');
    const overlay = document.getElementById('favorites-overlay');
    overlay.classList.toggle('open');
}

function downloadFavorites() {
    // Retrieve the favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (favorites.length === 0) {
        alert('No favorites to download.');
        return;
    }

    // Extract the URLs from the favorites
    const favoriteUrls = favorites.map(favorite => favorite.slug);

    // Create a blob from the URLs
    const blob = new Blob([favoriteUrls.join('\n')], { type: 'text/plain' });

    // Create a download link
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'favorites.txt';
    document.body.appendChild(a);

    // Programmatically click the link to trigger the download
    a.click();

    // Remove the link from the document
    document.body.removeChild(a);
}

function deleteFavorites() {
    localStorage.removeItem('favorites');
    showFavorites();
}

async function syncSingleFavorite(favorite) {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.error('User not authenticated:', error?.message || '');
        return;
    }

    console.log('Syncing favorite:', favorite);

    // Use upsert to avoid checking first
    const { error: insertError } = await supabase
        .from('favorites')
        .upsert({
            user_id: user.id,
            slug: favorite.slug,
            url: favorite.url
        }, { onConflict: ['user_id', 'slug'] });

    if (insertError) {
        console.error('Error adding favorite to Supabase:', insertError);
        return;
    }

    console.log('Favorite synchronized successfully:', favorite);
}

async function removeSingleFavorite(favorite) {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.error('User not authenticated:', error?.message || '');
        return;
    }

    console.log('Removing favorite:', favorite);

    const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('slug', favorite.slug);

    if (deleteError) {
        console.error('Error deleting favorite from Supabase:', deleteError);
        return;
    }

    console.log('Favorite removed successfully:', favorite);
}

async function loadFavoritesFromSupabase() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.error('User not authenticated:', error?.message || '');
        return;
    }

    const { data: favorites, error: fetchError } = await supabase
        .from('favorites')
        .select('slug, url')
        .eq('user_id', user.id);

    if (fetchError) {
        console.error('Error fetching favorites from Supabase:', fetchError);
        return;
    }

    console.log('Fetched favorites from Supabase:', favorites);


    localStorage.setItem('favorites', JSON.stringify(favorites));
    console.log('Favorites loaded from Supabase:', favorites);
    console.log(localStorage.getItem('favorites'));
    showFavorites();
}

async function syncFavorites() {
    const localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        console.error('User not logged in:', error?.message || '');
        openLoginModal()
        return;
    }

    // Get existing favorites from Supabase
    const { data: supabaseFavorites, error: fetchError } = await supabase
        .from('favorites')
        .select('slug')
        .eq('user_id', user.id);

    if (fetchError) {
        console.error('Error fetching favorites from Supabase:', fetchError);
        return;
    }

    const existingSlugs = new Set(supabaseFavorites.map(fav => fav.slug));

    const favoritesToAdd = localFavorites
        .filter(localFav => !existingSlugs.has(localFav.slug))
        .map(fav => ({
            user_id: user.id,
            slug: fav.slug,
            url: fav.url,
        }));

    if (favoritesToAdd.length > 0) {
        const { error: insertError } = await supabase
            .from('favorites')
            .insert(favoritesToAdd);

        if (insertError) {
            console.error('Error adding favorites to Supabase:', insertError);
            return;
        }
    }

    console.log('Favorites synchronized successfully');
    localStorage.removeItem('favorites');
}