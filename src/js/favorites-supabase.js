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
    updateFavoritesCounter(); // Update the favorites counter
    showFavorites(); // Display favorites when the page loads
}

function removeFromFavorites(object) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Get existing favorites
    const updatedFavorites = favorites.filter((favorite) => favorite.url !== object.url); // Remove the selected emote by slug
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites)); // Save updated favorites to localStorage
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

async function syncFavorites() {
    const localFavorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // ✅ Get the authenticated user
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        openLoginModal();
        console.error('User is not logged in:', error?.message || '');
        return;
    }

    console.log('Authenticated user:', user.id);

    // ✅ Fetch existing favorites from Supabase for this user
    const { data: supabaseFavorites, error: fetchError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id);

    if (fetchError) {
        console.error('Error fetching favorites from Supabase:', fetchError);
        return;
    }

    console.log('Supabase Favorites:', supabaseFavorites);

    // ✅ Find missing favorites to add
    const favoritesToAdd = localFavorites
        .filter(localFav => !supabaseFavorites.some(supabaseFav => supabaseFav.slug === localFav.slug))
        .map(fav => ({
            name: fav.name || 'Unknown', // ✅ Ensure the "name" field is not null
            slug: fav.slug,
            url: fav.url,
            user_id: user.id, // ✅ Use authenticated user_id
        }));

    // ✅ Insert missing favorites
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
}
