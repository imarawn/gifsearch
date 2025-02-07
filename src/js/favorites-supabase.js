async function showFavorites() {
    // Select both desktop and mobile favorites containers
    const desktopFavorites = document.getElementById('favorite-emotes');

    // Clear existing content
    desktopFavorites.innerHTML = '';

    // Retrieve favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // Check if there are no favorites
    if (favorites.length === 0) {
        const noFavoritesMessage = document.createElement('p');
        noFavoritesMessage.textContent = 'No favorites added yet.';
        noFavoritesMessage.className = 'no-favorites-message';

        desktopFavorites.appendChild(noFavoritesMessage);
        return;
    }

    // Sort favorites alphabetically by slug
    const sortedFavorites = favorites.sort((a, b) => a.slug.localeCompare(b.slug));

    // Create and display each favorite item
    sortedFavorites.forEach(emote => {
        const emoteBox = document.createElement('div');
        emoteBox.className = 'emote-box';

        const imgContainer = document.createElement('div');
        imgContainer.className = 'img-container';

        const img = document.createElement('img');
        img.src = emote.url;
        img.alt = emote.slug || 'Favorite Emote';
        img.loading = 'lazy';

        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'details-container';

        const label = document.createElement('div');
        label.textContent = `:${emote.slug}`;
        label.className = 'emote-name';

        const dimensions = document.createElement('div');
        dimensions.className = 'dimensions';

        // Highlight oversized emotes and set dimensions
        img.onload = () => {
            dimensions.textContent = `${img.naturalWidth}x${img.naturalHeight}`;
            if (img.naturalWidth > 250 || img.naturalHeight > 80) {
                emoteBox.style.backgroundColor = '#eb0c0c'; // Highlight oversized emotes
                emoteBox.style.border = '2px solid #ff0000'; // Optional: Add a border for emphasis
            }
        };

        // Add event listener to copy emote slug on click
        img.addEventListener('click', () => {
            const gifCode = `:${emote.slug}`;
            console.log(`Copied: ${gifCode}`);
            copyToClipboard(gifCode, emote);
        });

        // Create remove button
        const removeButton = document.createElement('button');
        removeButton.className = 'favorite-button';
        removeButton.textContent = '★';

        // Add event listener to remove the favorite
        removeButton.addEventListener('click', () => {
            removeFromFavorites(emote);
        });

        // Assemble the emote box
        imgContainer.appendChild(img);
        detailsContainer.append(label, dimensions);
        emoteBox.append(imgContainer, removeButton, detailsContainer);

        // Append the original emote box to the desktop container
        desktopFavorites.appendChild(emoteBox);
    });
}

function addToFavorites(emoteUrl) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Get existing favorites

    const isAlreadyFavorited = favorites.some(favorite => favorite.slug === emoteUrl.slug);
    if (isAlreadyFavorited) {

        return; // Exit the function if already in favorites
    }

    favorites.push(emoteUrl); // Add the new favorite URL
    localStorage.setItem('favorites', JSON.stringify(favorites)); // Save to local storage
    syncSingleFavorite(emoteUrl); // Sync the new favorite with Supabase
    updateFavoritesCounter(); // Update the favorites counter
    showFavorites(); // Display favorites when the page loads
}

function removeFromFavorites(object) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Get existing favorites
    const updatedFavorites = favorites.filter((favorite) => favorite.url !== object.url); // Remove the selected emote by slug
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites)); // Save updated favorites to localStorage
    updateFavoritesCounter(); // Update the favorites counter
    showFavorites(); // Refresh the favorites list
    removeSingleFavorite(object); // Remove the favorite from Supabase
}

function openmobilefavorites() {
    const favoritesSection = document.getElementById('favorites');
    favoritesSection.classList.toggle('mobile-favorites-open'); 
    const overlay = document.getElementById('favorites-overlay');
    overlay.classList.toggle('open');
}

function downloadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    if (favorites.length === 0) {
        alert('No favorites to download.');
        return;
    }

    const favoriteUrls = favorites.map(favorite => favorite.slug);

    const blob = new Blob([favoriteUrls.join('\n')], { type: 'text/plain' });

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'favorites.txt';
    document.body.appendChild(a);

    a.click();
    document.body.removeChild(a);
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
