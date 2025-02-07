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
        openLoginModal();
        console.error('User is not logged in:', error?.message || '');
        return;
    }

    console.log('Authenticated user:', user.id);

    const { data: supabaseFavorites, error: fetchError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);

    if (fetchError) {
        console.error('Error fetching favorites from Supabase:', fetchError);
        return;
    }

    const favoritesToAdd = localFavorites
        .filter(localFav => !supabaseFavorites.some(supabaseFav => supabaseFav.slug === localFav.slug))
        .map(fav => ({
            name: fav.name || 'Unknown',
            slug: fav.slug,
            url: fav.url,
            user_id: user.id,
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
    loadFavoritesFromSupabase();
}

async function loadFavoritesFromSupabase() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.error('User not authenticated:', error?.message || '');
        return;
    }

    console.log('Loading favorites for user:', user.id);

    const { data: favorites, error: fetchError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);

    if (fetchError) {
        console.error('Error fetching favorites from Supabase:', fetchError);
        return;
    }

    console.log('Fetched favorites from Supabase:', favorites);
    localStorage.setItem('favorites', JSON.stringify(favorites));
    showFavorites();
}

async function syncSingleFavorite(favorite) {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        console.error('User not authenticated:', error?.message || '');
        return;
    }

    console.log('Syncing favorite:', favorite);

    const { data: supabaseFavorite, error: fetchError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('slug', favorite.slug);

    if (fetchError) {
        console.error('Error fetching favorite from Supabase:', fetchError);
        return;
    }

    if (!supabaseFavorite) {
        const { error: insertError } = await supabase
            .from('favorites')
            .insert({
                name: favorite.name || 'Unknown',
                slug: favorite.slug,
                url: favorite.url,
                user_id: user.id,
            });

        if (insertError) {
            console.error('Error adding favorite to Supabase:', insertError);
            return;
        }

        console.log('Favorite synchronized successfully:', favorite);
    }
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