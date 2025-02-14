// Helper Function: Fetches emoticon data by slug
async function fetchEmoteData(slug) {
    try {
        const resultsDiv = document.getElementById('results');
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        resultsDiv.innerHTML = '';
        resultsDiv.appendChild(spinner);
        const response = await fetch(`https://emote.highwebmedia.com/autocomplete?slug=${slug}`);
        if (!response.ok) {
            console.error(`Failed to fetch slug: ${slug}, Status: ${response.status}`);
            return null;
        }
        const data = await response.json();
        return data.emoticons
    } catch (error) {
        console.error(`Error fetching ${slug}:`, error);
        return null;
    }
}

// Helper Function: Displays a single emote
function displayEmote(emote, parentElement) {
    const emoteBox = document.createElement('div');
    emoteBox.className = 'emote-box';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';

    const img = document.createElement('img');
    img.src = emote.url;
    img.alt = emote.slug;
    img.onclick = () => copyToClipboard(`:${emote.slug}`, emote);

    imageContainer.appendChild(img);

    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'details-container';

    const label = document.createElement('div');
    label.textContent = `:${emote.slug}`;
    label.className = 'emote-name';

    const dimensionsButton = document.createElement('button');
    dimensionsButton.classList = 'button';
    dimensionsButton.textContent = 'View Fullsize';
    dimensionsButton.onclick = () => openModal(emote.url);

    const shareButton = document.createElement('button');
    shareButton.className = 'share-button tinybutton button';
    shareButton.title = `Share :${emote.slug}`;
    shareButton.onclick = () => share('true', emote.slug, emote.url);

    const visiblebutton = document.createElement('button');
    visiblebutton.className = 'visible-button tinybutton button';
    visiblebutton.title = `Toggle visibility of :${emote.slug}`;
    visiblebutton.onclick = () => {
        img.src = img.src === emote.url ? "https://static-pub.highwebmedia.com/uploads/avatar/2023/08/09/22/55/5c168a79c10e42d53bbfb3918d822a7d022e4bf9.jpg" : emote.url
    }

    const similarbutton = document.createElement('button');
    similarbutton.className = 'search-button tinybutton button';
    similarbutton.title = `Search for similar emotes`;
    similarbutton.onclick = () => {
        const gifCode = `${emote.slug}`;
        const searchInput = document.getElementById('manual-slug-input');
        searchInput.value = gifCode;
        fetchManualSlug();
    }

    const favoriteButton = document.createElement('button');
    favoriteButton.className = 'favorite-button';
    favoriteButton.title = 'Toggle Favorite';
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const isFavorited = favorites.some(favorite => favorite.slug === emote.slug);
    favoriteButton.textContent = isFavorited ? '★' : '☆';
    favoriteButton.onclick = () => {
        toggleFavorite(emote);
        const updatedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const isNowFavorited = updatedFavorites.some(favorite => favorite.slug === emote.slug);
        favoriteButton.textContent = isNowFavorited ? '★' : '☆';
    };

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    buttonContainer.append(dimensionsButton, shareButton, similarbutton);

    detailsContainer.append(label, buttonContainer);
    emoteBox.append(imageContainer, detailsContainer, visiblebutton, favoriteButton);
    parentElement.appendChild(emoteBox);

    img.onload = () => {
        dimensionsButton.textContent = `${img.naturalWidth}x${img.naturalHeight}`;
        if (img.naturalWidth > 250 || img.naturalHeight > 80) {
            emoteBox.style.backgroundColor = '#eb0c0c'; // Highlight oversized emotes
        }
    };

    requestAnimationFrame(() => {
        emoteBox.classList.add('visible'); // Add 'visible' class to start transition
    });
}

// Function: Show Favorites
async function showFavorites() {
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

    const sortedFavorites = favorites.sort((a, b) => a.slug.localeCompare(b.slug));

    sortedFavorites.forEach(emote => {
        displayEmote(emote, desktopFavorites);
    });
}

// Function: Load and Fetch Emoticons from File
async function loadAndFetchEmoticons() {
    const fileInput = document.getElementById('file-input');
    const resultsDiv = document.getElementById('results');
    fileInput.click();

    fileInput.onchange = async () => {
        if (fileInput.files.length === 0) {
            alert('No file selected.');
            return;
        }

        const file = fileInput.files[0];
        const text = await file.text();
        const slugs = text.split('\n').map(slug => slug.trim()).filter(slug => slug !== '');

        if (slugs.length === 0) {
            alert('The file is empty or contains invalid data.');
            return;
        }

        resultsDiv.innerHTML = '';
        for (const slug of slugs) {
            const emote = await fetchEmoteData(slug);
            if (emote) {
                displayEmote(emote, resultsDiv);
            }
            await new Promise(resolve => setTimeout(resolve, 50)); // Prevents rate-limiting
        }
    }
}

// Function: Manual Slug Search
async function fetchManualSlug() {
    const manualInput = document.getElementById('manual-slug-input');
    const resultsDiv = document.getElementById('results');
    const slug = manualInput.value.trim();

    if (!slug) {
        resultsDiv.innerHTML = '';
        return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    const emote = await fetchEmoteData(slug);
    if (emote) {
        resultsDiv.innerHTML = '';
        emote.forEach(emote => {
            displayEmote(emote, resultsDiv);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const manualInput = document.getElementById('manual-slug-input');
    manualInput.oninput = debounce(fetchManualSlug, 300);
});
