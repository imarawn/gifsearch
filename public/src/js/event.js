// Load dark mode on page load
document.addEventListener('DOMContentLoaded', () => {
    const currentMode = localStorage.getItem('dark-mode');
    if (currentMode === 'enabled') {
        document.body.classList.add('dark-mode');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const manualInput = document.getElementById('manual-slug-input');
    manualInput.oninput = debounce(fetchManualSlug, 1000);
});

// Close the modal when the close button is clicked
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    modalImage.src = ''; // Clear the image source
});

// Close the modal when clicking outside the image
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        modalImage.src = '';
    }
});

document.addEventListener('DOMContentLoaded', async () => {
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
});

// Initial Call: Die Browsersprache ermitteln und anwenden
document.addEventListener('DOMContentLoaded', () => {
    translate()
    document.getElementById('language-selector').value = getBrowserLanguage();
});

/**
 * Set up event listeners and initialize the page.
 */
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.search || new URLSearchParams(window.location.search).toString() === '') {
        renderPredefinedGifs();
    }

    // Update favorites counter
    updateFavoritesCounter();
    showFavorites();
    renderHistory();
    const manualSlugInput = document.getElementById('manual-slug-input');
    const debouncedFetch = debounce(fetchManualSlug, 300);
    manualSlugInput?.addEventListener('input', debouncedFetch);

});

favorites.addEventListener('mouseenter', adjustWidthOnHover); // Trigger when hover starts
favorites.addEventListener('mouseleave', () => {
    window.innerWidth <= 768 ?  favorites.style.width = '290px' : favorites.style.width = '120px'; // Or any default width you want
});

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('favorite-button') || event.target.classList.contains('favorite-button-mobile')) {
        const parentDiv = event.target.closest('div'); // Find the closest parent div
        if (parentDiv.id === 'favorite-emotes') {
            alert('Button in div1 clicked!');
        } else if (parentDiv.id === 'results') {
            console.log('Button in div2 clicked!');
        }
    }
});

