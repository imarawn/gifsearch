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
        const emoteBox = createEmoteBox(emote);
        desktopFavorites.appendChild(emoteBox);
    });
}

function displayNoFavoritesMessage(container) {
    const noFavoritesMessage = document.createElement('p');
    noFavoritesMessage.textContent = 'No favorites added yet.';
    noFavoritesMessage.className = 'no-favorites-message';
    container.appendChild(noFavoritesMessage);
}

function createEmoteBox(emote) {
    const emoteBox = document.createElement('div');
    emoteBox.className = 'emote-box';

    const imgContainer = createImgContainer(emote, emoteBox);
    const detailsContainer = createDetailsContainer(emote);
    const removeButton = createRemoveButton(emote);
    const visiblebutton = createVisibilityButton(emote, emoteBox, imgContainer.querySelector('img'));
    const buttonContainer = createButtonContainer(emote);

    emoteBox.append(imgContainer, removeButton, detailsContainer, visiblebutton, buttonContainer);
    return emoteBox;
}

function createImgContainer(emote, emoteBox) {
    const imgContainer = document.createElement('div');
    imgContainer.className = 'img-container';

    const img = document.createElement('img');
    img.src = emote.url;
    img.alt = emote.slug || 'Favorite Emote';
    img.loading = 'lazy';

    img.onload = () => checkEmoteSize(img, emoteBox);
    img.addEventListener('click', () => {
        const gifCode = `:${emote.slug}`;
        console.log(`Copied: ${gifCode}`);
        copyToClipboard(gifCode, emote);
    });

    imgContainer.appendChild(img);
    return imgContainer;
}

function createDetailsContainer(emote) {
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'details-container';

    const label = document.createElement('div');
    label.textContent = `:${emote.slug}`;
    label.className = 'emote-name';

    const dimensions = document.createElement('div');
    dimensions.className = 'dimensions';

    detailsContainer.append(label, dimensions);
    return detailsContainer;
}

function createVisibilityButton(emote, emoteBox, img) {
    const visiblebutton = document.createElement('button');
    visiblebutton.className = 'visible-button tinybutton button';
    visiblebutton.title = `Toggle visibility of :${emote.slug}`;
    visiblebutton.onclick = () => {
        img.src = img.src === emote.url
            ? 'https://media1.tenor.com/m/Qu21iBRCvNkAAAAC/finger-shake-babu.gif'
            : emote.url;
        checkEmoteSize(img, emoteBox);
    };
    return visiblebutton;
}

function createButtonContainer(emote) {
    const dimensions = document.createElement('div');
    dimensions.className = 'dimensions';

    const sharebutton = document.createElement('button');
    sharebutton.className = 'share-button tinybutton button';
    sharebutton.title = `Share :${emote.slug}`;
    sharebutton.onclick = () => {
        share('true', emote.slug, emote.url);
    }

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.append(dimensions, sharebutton);
    return buttonContainer;
}

function createRemoveButton(emote) {
    const removeButton = document.createElement('button');
    removeButton.className = 'favorite-button';
    removeButton.textContent = '★';
    removeButton.addEventListener('click', () => {
        removeFromFavorites(emote);
    });
    return removeButton;
}

function checkEmoteSize(img, emoteBox) {
    if (img.naturalWidth > 250 || img.naturalHeight > 80) {
        emoteBox.style.backgroundColor = '#eb0c0c';
        emoteBox.style.border = '1px solid #ff0000';
    } else {
        emoteBox.style.backgroundColor = '#e5793a';
        emoteBox.style.border = '1px solid #e5793a';
    }
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
