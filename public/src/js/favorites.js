/*async function showFavorites() {
    const desktopFavorites = document.getElementById('favorite-emotes');
    desktopFavorites.innerHTML = '';

    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
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
}*/

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
