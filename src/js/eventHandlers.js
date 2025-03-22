// eventHandlers.js

function loadDarkMode() {
    const currentMode = localStorage.getItem('dark-mode');
    if (currentMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
}

function setupManualSlugInput() {
    const manualInput = document.getElementById('manual-slug-input');
    if (manualInput) {
        manualInput.oninput = debounce(fetchManualSlug, 1000);
    }
}

async function initializePage() {
    const gifSlug = getUrlParams().get('gifSlug');
    const unique = getUrlParams().get('unique');
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (gifSlug) {
        const manualInput = document.getElementById('manual-slug-input');
        manualInput.value = gifSlug;
        await fetchManualSlug();
    }
    if (unique === 'true') {
        const emotedUrl = await getEmoteURL(gifSlug);
        const img = new Image();
        img.src = emotedUrl;
        img.onload = () => {
            openModal(emotedUrl);
        };
        img.onerror = () => {
            console.error('Image failed to load:', emotedUrl);
        };
    }
    removeParams();
}

function setupTranslation() {
    translate();
    document.getElementById('language-selector').value = getBrowserLanguage();
}

function initializePageContent() {
    if (!window.location.search || new URLSearchParams(window.location.search).toString() === '') {
        renderPredefinedGifs();
    }
    updateFavoritesCounter();
    showFavorites();
    renderHistory();

    const manualSlugInput = document.getElementById('manual-slug-input');
    const debouncedFetch = debounce(fetchManualSlug, 300);
    manualSlugInput?.addEventListener('input', debouncedFetch);
}

function setupFavoritesHover() {
    favorites.addEventListener('mouseenter', adjustWidthOnHover);
    favorites.addEventListener('mouseleave', () => {
        window.innerWidth <= 768
            ? favorites.style.width = '290px'
            : favorites.style.width = '120px';
    });
}

function setupFavoriteButtonClick() {
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('favorite-button') || event.target.classList.contains('favorite-button-mobile')) {
            const parentDiv = event.target.closest('div');
            if (parentDiv.id === 'favorite-emotes') {
                alert('Button in div1 clicked!');
            } else if (parentDiv.id === 'results') {
                console.log('Button in div2 clicked!');
            }
        }
    });
}
