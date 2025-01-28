function displayEmote(emote, parentElement) {
    const emoteBox = document.createElement('div'); // Create emote container
    emoteBox.className = 'emote-box';

    const img = document.createElement('img'); // Create image element
    img.src = emote.url;
    img.alt = emote.slug;

    const label = document.createElement('div'); // Create label for emote name
    label.textContent = `:${emote.slug}`;
    label.className = 'emote-name';

    const dimensionsButton = document.createElement('button'); // Create button for dimensions
    dimensionsButton.className = 'dimensions';
    dimensionsButton.textContent = 'View Fullsize';
    dimensionsButton.onclick = () => openModal(emote.url);

    const favoriteButton = document.createElement('button'); // Create "Favorite" button
    favoriteButton.className = 'favorite-button';
    favoriteButton.textContent = '☆';
    favoriteButton.onclick = () => {
        addToFavorites(emote);
        favoriteButton.textContent = '★';
    };

    const searchButton = document.createElement('button'); // Create "Search Slug" button
    searchButton.className = 'search-button';
    searchButton.textContent = '🔍'; // Search icon
    searchButton.title = `Search for :${emote.slug}`; // Tooltip for clarity
    searchButton.onclick = () => {
        const manualInput = document.getElementById('manual-slug-input'); // Input field for manual search
        manualInput.value = emote.slug; // Set the input value to the slug
        fetchManualSlug(); // Trigger a manual search
    };

    emoteBox.append(img, label, dimensionsButton, favoriteButton, searchButton);
    parentElement.appendChild(emoteBox);

    requestAnimationFrame(() => {
        emoteBox.classList.add('visible');
    });
}
